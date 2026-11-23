import {
  VAULT,
  EXIT,
  LIMITS,
  BLOCKS,
  blocked,
  surrounds,
} from "./heist-sim.js";
const distance = (a, b) => Math.hypot(a.x - b.x, a.z - b.z);
const nearest = (s, items) =>
  items
    .slice()
    .sort((a, b) => distance(s.player, a) - distance(s.player, b))[0];
export const cash = (n) => "$" + Math.round(n).toLocaleString("en-US");
export const crewName = (actor) =>
  actor === 0 ? "YOU" : `ECHO ${String(actor).padStart(2, "0")}`;
export const escapeSeconds = (s) =>
  s.escapeDeadline === null
    ? null
    : Math.max(0, Math.ceil((s.escapeDeadline - s.total) / 60));
export function clearEscapeSegment(a, b) {
  return !BLOCKS.some((box) => {
    let enter = 0,
      exit = 1;
    for (const [axis, half] of [
      ["x", box.w / 2 + 0.42],
      ["z", box.d / 2 + 0.42],
    ]) {
      const delta = b[axis] - a[axis],
        lo = box[axis] - half,
        hi = box[axis] + half;
      if (Math.abs(delta) < 1e-12) {
        if (a[axis] <= lo || a[axis] >= hi) return false;
        continue;
      }
      const first = (lo - a[axis]) / delta,
        last = (hi - a[axis]) / delta;
      enter = Math.max(enter, Math.min(first, last));
      exit = Math.min(exit, Math.max(first, last));
      if (enter >= exit) return false;
    }
    return enter < exit;
  });
}
export function escapeRoute(start) {
  if (clearEscapeSegment(start, EXIT)) return [start, EXIT];
  // Tiny visibility graph around cover; route markings must not lead into crates.
  const nodes = [start, EXIT];
  for (const box of BLOCKS)
    for (const dx of [-1, 1])
      for (const dz of [-1, 1])
        nodes.push({
          x: box.x + dx * (box.w / 2 + 0.75),
          z: box.z + dz * (box.d / 2 + 0.75),
        });
  const costs = nodes.map(() => Infinity),
    previous = nodes.map(() => -1),
    seen = new Set();
  costs[0] = 0;
  for (let step = 0; step < nodes.length; step++) {
    let next = -1;
    for (let i = 0; i < nodes.length; i++)
      if (!seen.has(i) && (next === -1 || costs[i] < costs[next])) next = i;
    if (next === 1 || !Number.isFinite(costs[next])) break;
    seen.add(next);
    for (let i = 0; i < nodes.length; i++)
      if (!seen.has(i) && clearEscapeSegment(nodes[next], nodes[i])) {
        const cost = costs[next] + distance(nodes[next], nodes[i]);
        if (cost < costs[i]) {
          costs[i] = cost;
          previous[i] = next;
        }
      }
  }
  if (!Number.isFinite(costs[1])) return [start];
  const route = [];
  for (let at = 1; at !== -1; at = previous[at]) route.unshift(nodes[at]);
  return route;
}
export function heistRank(s) {
  if (s.outcome !== "escaped") return "No getaway";
  if (s.score >= 10000) return "Ten grand crew";
  if (s.stats.hits === 0) return "Clean getaway";
  return "Crew clear";
}
export function missionTarget(s) {
  if (s.done) return null;
  if (s.exitOpen)
    return {
      ...EXIT,
      label: "GETAWAY",
      detail:
        s.escapeDeadline === null
          ? "Run to the van"
          : `${escapeSeconds(s)}s · DASH TO THE VAN`,
      color: "#91ef8f",
    };
  if (s.cellsTaken < 3)
    return {
      ...nearest(
        s,
        s.cells.filter((c) => !c.taken),
      ),
      label: "KEYCARD",
      detail: `${3 - s.cellsTaken} more needed`,
      color: "#8df5f5",
    };
  if (s.phase === 0 || (s.phase === 1 && s.relays.every((r) => r.open))) {
    const bag = nearest(
      s,
      s.loot.filter((b) => !b.taken),
    );
    return bag
      ? { ...bag, label: cash(bag.value), detail: "CASH BAG", color: "#91ef8f" }
      : null;
  }
  const relay = nearest(
    s,
    s.relays.filter((r) => !r.open),
  );
  if (relay)
    return {
      ...relay,
      label: "BREAK RELAY",
      detail: "Sweep your crew link here",
      color: "#ff8caf",
    };
  const [a, b] = s.ghosts;
  if (a && b && !surrounds(VAULT, s.player, a, b)) {
    const candidates = [];
    for (const radius of [6, 10, 15])
      for (let i = 0; i < 32; i++) {
        const p = {
          x: VAULT.x + Math.cos((i * Math.PI) / 16) * radius,
          z: VAULT.z + Math.sin((i * Math.PI) / 16) * radius,
        };
        if (
          Math.abs(p.x) < LIMITS.x - 0.7 &&
          Math.abs(p.z) < LIMITS.z - 0.7 &&
          !blocked(p) &&
          surrounds(VAULT, p, a, b)
        )
          candidates.push(p);
      }
    const point = nearest(s, candidates);
    if (point)
      return {
        ...point,
        label: "MOVE HERE",
        detail: "Put the vault inside your triangle",
        color: "#ffd18e",
      };
  }
  return {
    ...VAULT,
    label: s.vaultCharge
      ? `CRACKING ${Math.round((s.vaultCharge / 36) * 100)}%`
      : "VAULT · $1,200",
    detail: "Keep the vault inside your triangle",
    color: "#ffd18e",
  };
}
export function drawRadar(canvas, s) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const w = canvas.width,
    h = canvas.height;
  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = "#131b20";
  ctx.fillRect(0, 0, w, h);
  const pos = (p) => ({
    x: 12 + ((p.x + 18) / 36) * (w - 24),
    y: 12 + ((p.z + 12) / 24) * (h - 24),
  });
  ctx.strokeStyle = "#415052";
  ctx.lineWidth = 1;
  for (const x of [-12, 0, 12]) {
    const p = pos({ x, z: 0 });
    ctx.beginPath();
    ctx.moveTo(p.x, 0);
    ctx.lineTo(p.x, h);
    ctx.stroke();
  }
  for (const z of [-8, 0, 8]) {
    const p = pos({ x: 0, z });
    ctx.beginPath();
    ctx.moveTo(0, p.y);
    ctx.lineTo(w, p.y);
    ctx.stroke();
  }
  function dot(p, color, r = 3) {
    const a = pos(p);
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(a.x, a.y, r, 0, Math.PI * 2);
    ctx.fill();
  }
  for (const bag of s.loot) if (!bag.taken) dot(bag, "#91ef8f", 2.5);
  for (const card of s.cells) if (!card.taken) dot(card, "#8df5f5", 2.5);
  for (const relay of s.relays) if (!relay.open) dot(relay, "#ff8caf", 4);
  dot(VAULT, s.vaultOpen ? "#91ef8f" : "#ffd18e", 4);
  dot(EXIT, s.exitOpen ? "#ffffff" : "#63826f", 4);
  if (s.escapeDeadline !== null && !s.done) {
    ctx.strokeStyle = "#91ef8f";
    ctx.lineWidth = 2;
    ctx.setLineDash([4, 3]);
    ctx.beginPath();
    escapeRoute(s.player).forEach((p, i) => {
      const a = pos(p);
      i ? ctx.lineTo(a.x, a.y) : ctx.moveTo(a.x, a.y);
    });
    ctx.stroke();
    ctx.setLineDash([]);
    for (const d of s.drones) if (d.pursuit) dot(d, "#ff775f", 3);
  }
  const crew = [s.player, ...s.ghosts];
  if (crew.length > 1) {
    ctx.strokeStyle = "#ffce8e90";
    ctx.beginPath();
    crew.forEach((p, i) => {
      const a = pos(p);
      i ? ctx.lineTo(a.x, a.y) : ctx.moveTo(a.x, a.y);
    });
    if (crew.length === 3) ctx.closePath();
    ctx.stroke();
  }
  s.ghosts.forEach((p, i) => dot(p, i ? "#ffd18e" : "#ff8caf", 3));
  dot(s.player, "#ffffff", 4);
  const player = pos(s.player);
  ctx.strokeStyle = "#0b1014";
  ctx.lineWidth = 1.5;
  ctx.stroke();
}
