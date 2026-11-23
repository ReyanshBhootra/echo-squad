// Echo Heist has its own rules. Classic experiment weights do not control it.
export const HEIST_RULES = "echo-heist-3";
export const CASH_HEIST_RULES = "echo-heist-2";
export const LEGACY_HEIST_RULES = "echo-heist-1";
const SUPPORTED_RULES = [HEIST_RULES, CASH_HEIST_RULES, LEGACY_HEIST_RULES];
export const CHASE_TICKS = 9 * 60;
export const LOOT_RESPAWN_TICKS = 6 * 60;
export const HZ = 60,
  HSTEP = 1 / HZ,
  PASS_TICKS = 25 * HZ,
  MAX_TICKS = PASS_TICKS * 3;
export const LIMITS = { x: 18, z: 12 };
export const START = { x: 0, z: 9 };
export const EXIT = { x: 14, z: 9 };
export const VAULT = { x: 0, z: -2 };
export const BLOCKS = [
  { x: -13, z: -7, w: 3.8, d: 2.8 },
  { x: 13, z: -7, w: 3.8, d: 2.8 },
  { x: -13, z: 2, w: 2.6, d: 2.8 },
  { x: 13, z: 2, w: 2.6, d: 2.8 },
];
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
const dist = (a, b) => Math.hypot(a.x - b.x, a.z - b.z);
export function linkDistance(p, a, b) {
  const x = b.x - a.x,
    z = b.z - a.z,
    l = x * x + z * z;
  const t = l ? clamp(((p.x - a.x) * x + (p.z - a.z) * z) / l, 0, 1) : 0;
  return Math.hypot(p.x - a.x - t * x, p.z - a.z - t * z);
}
export function surrounds(p, a, b, c) {
  const cross = (q, r, s) =>
    (r.x - q.x) * (s.z - q.z) - (r.z - q.z) * (s.x - q.x);
  if (Math.abs(cross(a, b, c)) < 12) return false;
  const u = cross(a, b, p),
    v = cross(b, c, p),
    w = cross(c, a, p);
  return (u >= 0 && v >= 0 && w >= 0) || (u <= 0 && v <= 0 && w <= 0);
}
export function blocked(p) {
  return BLOCKS.some(
    (b) =>
      Math.abs(p.x - b.x) < b.w / 2 + 0.42 &&
      Math.abs(p.z - b.z) < b.d / 2 + 0.42,
  );
}
const CASH_SPOTS = [
  [-5, 7],
  [5, 7],
  [-10, 0],
  [10, 0],
  [-7, -8],
  [7, -8],
  [-3, -5],
  [3, -5],
  [-10, 8],
  [10, 8],
  [-3, 3],
  [3, 3],
  [-10, -4],
  [10, -4],
  [-6, -2],
  [6, -2],
];
export function createHeist(seed = 9019, rules = HEIST_RULES) {
  if (!SUPPORTED_RULES.includes(rules)) throw Error("Unsupported heist rules.");
  // Fixed mission layout makes route planning learnable; seed offsets patrol timing.
  return {
    rules,
    seed,
    tick: 0,
    total: 0,
    phase: 0,
    score: 0,
    health: 6,
    loot:
      rules !== LEGACY_HEIST_RULES
        ? CASH_SPOTS.slice(0, 8).map(([x, z], id) => ({
            id,
            x,
            z,
            value: z < -4 ? 250 : 100,
            ready: 0,
            generation: 0,
            taken: false,
          }))
        : [],
    lootTaken: 0,
    lootCash: 0,
    crewCash: [0, 0, 0],
    escapeDeadline: null,
    player: {
      ...START,
      heading: Math.PI,
      dash: 0,
      cooldown: 0,
      invulnerable: 0,
    },
    cells: [
      [-8, 6],
      [0, 5],
      [8, 6],
      [-8, -5],
      [8, -5],
      [0, -8],
      [-5, 1],
      [5, 1],
      [-9, 9],
      [9, 9],
    ].map(([x, z], id) => ({ x, z, id, taken: false })),
    relays: [
      { x: -4, z: 0, charge: 0, open: false },
      { x: 4, z: 0, charge: 0, open: false },
    ],
    drones: [-1, 0, 1].map((side, id) => ({
      id,
      x: side * 11,
      z: -8,
      angle: 0,
      aim: null,
      windup: 0,
      next: 240 + id * 100 + (seed % 31),
      stun: 0,
    })),
    cellsTaken: 0,
    vaultCharge: 0,
    vaultOpen: false,
    exitOpen: false,
    tracks: [],
    record: [],
    inputs: [],
    ghosts: [],
    shots: [],
    events: [],
    done: false,
    outcome: null,
    stats: { links: 0, dashes: 0, hits: 0 },
  };
}
function move(s, action) {
  const p = s.player,
    oldX = p.x,
    oldZ = p.z,
    x = clamp(Number.isFinite(action.x) ? action.x : 0, -1, 1),
    z = clamp(Number.isFinite(action.z) ? action.z : 0, -1, 1);
  const length = Math.hypot(x, z),
    nx = length ? x / Math.max(1, length) : 0,
    nz = length ? z / Math.max(1, length) : 0;
  p.cooldown = Math.max(0, p.cooldown - 1);
  p.invulnerable = Math.max(0, p.invulnerable - 1);
  if (action.dash && p.cooldown === 0 && length) {
    p.dash = 12;
    p.cooldown = 132;
    s.stats.dashes++;
    s.events.push({ type: "dash", x: p.x, z: p.z });
  }
  const speed = p.dash > 0 ? 22 : 7.5;
  if (length) p.heading = Math.atan2(nx, nz);
  const nextX = clamp(p.x + nx * speed * HSTEP, -17.5, 17.5);
  if (!blocked({ x: nextX, z: p.z })) p.x = nextX;
  const nextZ = clamp(p.z + nz * speed * HSTEP, -11.5, 11.5);
  if (!blocked({ x: p.x, z: nextZ })) p.z = nextZ;
  p.moving = Math.hypot(p.x - oldX, p.z - oldZ) > 0.001;
  p.dash = Math.max(0, p.dash - 1);
}
function security(s) {
  const chase = s.escapeDeadline !== null;
  for (const d of s.drones) {
    const time = s.total / HZ,
      base = (d.id - 1) * 11;
    if (d.pursuit) {
      const distance = Math.max(1, dist(d, s.player));
      d.x += ((s.player.x - d.x) / distance) * 3.8 * HSTEP;
      d.z += ((s.player.z - d.z) / distance) * 3.8 * HSTEP;
    } else {
      d.x = clamp(base + Math.sin(time * 0.38 + d.id) * 3, -16, 16);
      d.z = -7 + Math.cos(time * 0.3 + d.id) * 2;
    }
    if (d.stun > 0) {
      d.stun--;
      continue;
    }
    if (d.windup > 0) {
      d.windup--;
      if (d.windup === 0) {
        const len = Math.max(0.01, dist(d, d.aim));
        s.shots.push({
          x: d.x,
          z: d.z,
          vx: ((d.aim.x - d.x) / len) * (chase ? 9 : 6),
          vz: ((d.aim.z - d.z) / len) * (chase ? 9 : 6),
          life: 240,
        });
        s.events.push({ type: "shot", x: d.x, z: d.z });
        d.aim = null;
      }
    } else if (s.total >= d.next) {
      const targets = chase ? [s.player] : [s.player, ...s.ghosts];
      const target = targets.reduce((a, b) =>
        dist(d, a) < dist(d, b) ? a : b,
      );
      d.aim = { x: target.x, z: target.z };
      d.windup = chase ? 42 : 60;
      d.next = s.total + (chase ? 110 : [260, 220, 180][s.phase]);
    }
  }
  for (const shot of s.shots) {
    shot.x += shot.vx * HSTEP;
    shot.z += shot.vz * HSTEP;
    shot.life--;
    if (blocked(shot) || Math.abs(shot.x) > 19 || Math.abs(shot.z) > 13)
      shot.life = 0;
    if (shot.life > 0 && dist(shot, s.player) < 0.75) {
      shot.life = 0;
      if (!s.player.invulnerable && !s.player.dash) {
        s.health--;
        s.stats.hits++;
        s.player.invulnerable = 84;
        s.score = Math.max(0, s.score - 100);
        s.events.push({ type: "damage", x: s.player.x, z: s.player.z });
      }
    }
  }
  s.shots = s.shots.filter((p) => p.life > 0);
}
function objectives(s) {
  const crew = [s.player, ...s.ghosts];
  for (const bag of s.loot) {
    if (bag.taken && s.total >= bag.ready) {
      // Rotate drops away from every crew member: camping cannot farm respawns.
      const offset = (bag.id + bag.generation * 5) % CASH_SPOTS.length;
      const spot = Array.from(
        { length: CASH_SPOTS.length },
        (_, i) => CASH_SPOTS[(offset + i) % CASH_SPOTS.length],
      ).find(
        ([x, z]) =>
          crew.every((p) => dist(p, { x, z }) > 3) &&
          s.loot.every(
            (other) =>
              other === bag || other.taken || dist(other, { x, z }) > 1.5,
          ),
      );
      if (spot) {
        [bag.x, bag.z] = spot;
        bag.value = bag.z < -4 ? 250 : 100;
        bag.taken = false;
      }
    }
    const collector = crew.findIndex((p) => dist(bag, p) < 1.1);
    if (!bag.taken && collector !== -1) {
      bag.taken = true;
      bag.ready = s.total + LOOT_RESPAWN_TICKS;
      bag.generation++;
      s.score += bag.value;
      s.lootTaken++;
      s.lootCash += bag.value;
      s.crewCash[collector] += bag.value;
      s.events.push({
        type: "cash",
        x: bag.x,
        z: bag.z,
        points: bag.value,
        actor: collector,
      });
    }
  }
  for (const cell of s.cells)
    if (!cell.taken && crew.some((p) => dist(cell, p) < 0.9)) {
      cell.taken = true;
      s.cellsTaken++;
      s.score += 100;
      s.events.push({ type: "cell", x: cell.x, z: cell.z, points: 100 });
    }
  if (s.phase >= 1 && s.cellsTaken >= 3) {
    for (const relay of s.relays) {
      if (relay.open) continue;
      let contact = false;
      for (let i = 0; i < crew.length; i++)
        for (let j = i + 1; j < crew.length; j++) {
          if (
            dist(crew[i], crew[j]) > 3 &&
            linkDistance(relay, crew[i], crew[j]) < 1.05
          )
            contact = true;
        }
      relay.charge = contact ? relay.charge + 1 : Math.max(0, relay.charge - 1);
      if (relay.charge >= 18) {
        relay.open = true;
        s.stats.links++;
        s.score += 350;
        s.events.push({ type: "relay", x: relay.x, z: relay.z, points: 350 });
        for (const d of s.drones) if (dist(d, relay) < 10) d.stun = 150;
      }
    }
  }
  if (s.phase === 2 && !s.vaultOpen && s.relays.every((r) => r.open)) {
    const inside = surrounds(VAULT, ...crew);
    s.vaultCharge = inside ? s.vaultCharge + 1 : Math.max(0, s.vaultCharge - 1);
    if (s.vaultCharge >= 36) {
      s.vaultOpen = true;
      s.exitOpen = true;
      s.score += 1200;
      s.shots = [];
      s.events.push({ type: "vault", ...VAULT, points: 1200 });
      for (const d of s.drones) {
        d.stun = s.rules === HEIST_RULES ? 45 : 240;
        d.aim = null;
        d.windup = 0;
        if (s.rules === HEIST_RULES) d.next = s.total + 60;
      }
      if (s.rules === HEIST_RULES) {
        s.escapeDeadline = Math.min(MAX_TICKS, s.total + CHASE_TICKS);
        for (const [id, x, z] of [
          [3, 16, 5],
          [4, 7, 11],
        ])
          s.drones.push({
            id,
            x,
            z,
            pursuit: true,
            aim: null,
            windup: 0,
            next: s.total + 18 + (id - 3) * 22,
            stun: 0,
          });
        s.events.push({ type: "alarm", ...VAULT });
      }
    }
  }
  if (s.exitOpen && dist(s.player, EXIT) < 1.5) {
    s.done = true;
    s.outcome = "escaped";
    s.score +=
      3000 + s.health * 200 + Math.ceil((MAX_TICKS - s.total) / HZ) * 15;
    s.events.push({ type: "escape", ...EXIT });
  }
}
export function stepHeist(s, action = {}) {
  if (s.done) return s;
  s.events = [];
  const normalized = {
    x: clamp(Number.isFinite(action.x) ? action.x : 0, -1, 1),
    z: clamp(Number.isFinite(action.z) ? action.z : 0, -1, 1),
    dash: !!action.dash,
  };
  s.inputs.push(normalized);
  move(s, normalized);
  s.ghosts = s.tracks.map((track) => track[Math.min(s.tick, track.length - 1)]);
  s.record.push({
    x: s.player.x,
    z: s.player.z,
    heading: s.player.heading,
    dash: s.player.dash,
    moving: s.player.moving,
  });
  objectives(s);
  if (!s.done) security(s);
  s.total++;
  s.tick++;
  if (s.health <= 0) {
    s.done = true;
    s.outcome = "caught";
  }
  if (!s.done && s.escapeDeadline !== null && s.total >= s.escapeDeadline) {
    s.done = true;
    s.outcome = "van-left";
    s.events.push({ type: "van-left", ...EXIT });
  }
  if (!s.done && s.tick === PASS_TICKS) {
    if (s.phase === 2) {
      s.done = true;
      s.outcome = "lockdown";
    } else {
      s.tracks.push(s.record);
      s.record = [];
      s.phase++;
      s.tick = 0;
      s.player = {
        ...START,
        heading: Math.PI,
        dash: 0,
        cooldown: 0,
        invulnerable: 60,
      };
      s.shots = [];
      s.ghosts = s.tracks.map((t) => t[0]);
      for (const d of s.drones) {
        d.aim = null;
        d.windup = 0;
        d.next = Math.max(d.next, s.total + 120);
      }
      s.events.push({ type: "phase", phase: s.phase });
    }
  }
  return s;
}
export function heistObjective(s) {
  if (s.done)
    return s.outcome === "escaped"
      ? "Crew clear. Heist complete."
      : s.outcome === "caught"
        ? "Security caught you. Your next route can change the outcome."
        : s.outcome === "van-left"
          ? "The van left. Save a dash for the alarm and follow the green route."
          : "Lockdown. Plan wider routes for your next crew.";
  if (s.cellsTaken < 3)
    return `Grab ${3 - s.cellsTaken} more blue keycards to unlock the relay job. Green bags add cash.`;
  if (s.phase === 0)
    return "Grab green cash bags while recording your route. An echo joins when this pass ends.";
  if (s.relays.some((r) => !r.open))
    return "Sweep the line between you and an echo through both pink relays.";
  if (s.phase === 1)
    return "Relays down. Grab more cash on the opposite side to record a wider crew.";
  if (!s.vaultOpen)
    return "Keep the gold vault INSIDE your squad triangle to charge the EMP.";
  return s.escapeDeadline === null
    ? "Vault cracked! Reach the green getaway van before lockdown."
    : "ALARM! Follow the green route. Dash past pursuit drones to the van.";
}
export function exportHeist(s) {
  if (!s.done) throw Error("Finish the mission before exporting.");
  return {
    schema: 1,
    rules: s.rules,
    seed: s.seed,
    score: s.score,
    outcome: s.outcome,
    inputs: s.inputs.map((a) => ({ ...a })),
  };
}
export function replayHeist(data) {
  if (
    !data ||
    data.schema !== 1 ||
    !SUPPORTED_RULES.includes(data.rules) ||
    !Number.isInteger(data.seed) ||
    !Array.isArray(data.inputs) ||
    data.inputs.length < 1 ||
    data.inputs.length > MAX_TICKS
  )
    throw Error("Unsupported heist replay.");
  const s = createHeist(data.seed, data.rules);
  for (const a of data.inputs) {
    if (
      !a ||
      !Number.isFinite(a.x) ||
      !Number.isFinite(a.z) ||
      Math.abs(a.x) > 1 ||
      Math.abs(a.z) > 1 ||
      typeof a.dash !== "boolean" ||
      s.done
    )
      throw Error("Invalid replay controls.");
    stepHeist(s, a);
  }
  if (!s.done || s.score !== data.score || s.outcome !== data.outcome)
    throw Error("Replay result does not match its controls.");
  return s;
}
