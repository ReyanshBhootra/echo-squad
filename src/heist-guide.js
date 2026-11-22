import { VAULT, EXIT, LIMITS, blocked, surrounds } from "./heist-sim.js";
const distance = (a, b) => Math.hypot(a.x - b.x, a.z - b.z);
const nearest = (s, items) =>
  items
    .slice()
    .sort((a, b) => distance(s.player, a) - distance(s.player, b))[0];
export const cash = (n) => "$" + Math.round(n).toLocaleString("en-US");
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
      detail: "Run to the van",
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
