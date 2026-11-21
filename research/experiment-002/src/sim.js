// The browser and training runner import this exact simulation.
export const RULES = "echo-0.2-direct";
export const W = 960,
  H = 560,
  DT = 1 / 30,
  PASS_STEPS = 600;
export const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
// Absolute actions are shared by humans, scripted pilots and the neural policy.
// No chasing, acceleration or momentum is applied to pointer positions.
export const pointAction = (p) => [p.x / W * 2 - 1, p.y / H * 2 - 1];
export const actionPoint = (a) => ({
  x: clamp((clamp(Number.isFinite(a[0]) ? a[0] : 0, -1, 1) + 1) / 2 * W, 14, W - 14),
  y: clamp((clamp(Number.isFinite(a[1]) ? a[1] : 0, -1, 1) + 1) / 2 * H, 14, H - 14),
});
export function random(seed) {
  let a = seed >>> 0;
  return () => {
    a += 0x6d2b79f5;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t ^= t + Math.imul(t ^ (t >>> 7), 61 | t);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
export function segmentDistance(p, a, b) {
  const dx = b.x - a.x,
    dy = b.y - a.y,
    l = dx * dx + dy * dy;
  const t = l ? clamp(((p.x - a.x) * dx + (p.y - a.y) * dy) / l, 0, 1) : 0;
  return Math.hypot(p.x - a.x - t * dx, p.y - a.y - t * dy);
}
export function inTriangle(p, a, b, c, minimumArea = 1800) {
  const cross = (q, r, s) =>
    (r.x - q.x) * (s.y - q.y) - (r.y - q.y) * (s.x - q.x);
  if (Math.abs(cross(a, b, c)) < minimumArea) return false;
  const x = cross(a, b, p),
    y = cross(b, c, p),
    z = cross(c, a, p);
  return (x >= 0 && y >= 0 && z >= 0) || (x <= 0 && y <= 0 && z <= 0);
}
export function createWorld(seed = 9019) {
  const s = {
    seed,
    phase: 0,
    tick: 0,
    total: 0,
    score: 0,
    byPass: [0, 0, 0],
    byKind: [0, 0, 0],
    p: { x: W / 2, y: H / 2, vx: 0, vy: 0 },
    tracks: [],
    record: [],
    ghosts: [],
    items: [],
    events: [],
    done: false,
  };
  wave(s);
  return s;
}
function wave(s) {
  // Wave layout depends only on seed, pass and clock, never on a player's score.
  const rng = random(
    s.seed + s.phase * 100003 + Math.floor(s.tick / 150) * 7919,
  );
  s.items = Array.from({ length: 40 }, (_, i) => ({
    x: 45 + rng() * (W - 90),
    y: 45 + rng() * (H - 90),
    kind: i < 24 ? 0 : i < 35 ? 1 : 2,
    active: true,
    id: i,
  }));
}
export function step(s, action) {
  if (s.done) return s;
  s.events = [];
  const p = s.p, previous = {x:p.x,y:p.y}, next = actionPoint(action);
  p.vx = (next.x - p.x) / DT;
  p.vy = (next.y - p.y) / DT;
  p.x = next.x;
  p.y = next.y;
  s.ghosts = s.tracks.map((t) => t[s.tick]);
  s.record.push({ x: p.x, y: p.y });
  const drones = [p, ...s.ghosts];
  const oldDrones = [previous, ...s.tracks.map(t => s.tick ? t[s.tick - 1] : {x:W/2,y:H/2})];
  for (const item of s.items) {
    if (!item.active || item.kind > s.phase) continue;
    let hit = false;
    if (item.kind === 0)
      hit = drones.some((d, i) => segmentDistance(item, oldDrones[i], d) < 23);
    if (item.kind === 1)
      for (let a = 0; a < drones.length; a++)
        for (let b = a + 1; b < drones.length; b++) {
          if (
            Math.hypot(drones[a].x - drones[b].x, drones[a].y - drones[b].y) >
              45 &&
            (segmentDistance(item, drones[a], drones[b]) < 13 ||
             inTriangle(item, oldDrones[a], oldDrones[b], drones[a], .01) ||
             inTriangle(item, drones[a], oldDrones[b], drones[b], .01))
          )
            hit = true;
        }
    if (item.kind === 2 && drones.length === 3)
      hit = inTriangle(item, ...drones);
    if (hit) {
      const points = [10, 35, 90][item.kind];
      item.active = false;
      s.score += points;
      s.byPass[s.phase] += points;
      s.byKind[item.kind] += points;
      s.events.push({ x: item.x, y: item.y, points, kind: item.kind });
    }
  }
  s.tick++;
  s.total++;
  if (s.tick === PASS_STEPS) {
    s.tracks.push(s.record);
    s.record = [];
    s.phase++;
    s.tick = 0;
    if (s.phase === 3) {
      s.done = true;
      return s;
    }
    s.p = { x: W / 2, y: H / 2, vx: 0, vy: 0 };
    s.ghosts = s.tracks.map((t) => t[0]);
    wave(s);
  } else if (s.tick % 150 === 0) wave(s);
  return s;
}
export function targets(s) {
  const p = s.p;
  let spark = null,
    best = Infinity;
  for (const i of s.items)
    if (i.active && i.kind === 0) {
      const d = Math.hypot(i.x - p.x, i.y - p.y);
      if (d < best) {
        best = d;
        spark = i;
      }
    }
  let link = null,
    cost = Infinity;
  const g = s.ghosts[0];
  if (g)
    for (const i of s.items)
      if (i.active && i.kind === 1) {
        const x = clamp(i.x + (i.x - g.x) * 0.7, 14, W - 14),
          y = clamp(i.y + (i.y - g.y) * 0.7, 14, H - 14);
        const c = Math.hypot(x - p.x, y - p.y) / 3.5;
        if (c < cost) {
          cost = c;
          link = { x, y };
        }
      }
  return { spark, link, best, cost };
}
export function expert(s, cooperate = true) {
  const t = targets(s),
    p = s.p;
  const target = cooperate && t.link && t.cost < t.best ? t.link : t.spark;
  return pointAction(target || p);
}
export function observe(s, hideTeam = false) {
  const t = targets(s),
    p = s.p,
    g = !hideTeam && s.ghosts[0],
    f = g && s.tracks[0][Math.min(PASS_STEPS - 1, s.tick + 15)];
  const rel = (q) => (q ? [(q.x - p.x) / W, (q.y - p.y) / H] : [0, 0]);
  return [
    (p.x / W) * 2 - 1,
    (p.y / H) * 2 - 1,
    p.vx * DT / W,
    p.vy * DT / H,
    ...rel(t.spark),
    ...rel(!hideTeam && t.link),
    ...rel(g),
    ...rel(f),
    s.phase / 2,
    !hideTeam && t.link ? 1 : 0,
    s.tick / PASS_STEPS,
    t.spark ? 1 : 0,
  ];
}
export function runPolicy(policy, seed = 9019) {
  const s = createWorld(seed);
  while (!s.done) step(s, policy(s));
  return s;
}
