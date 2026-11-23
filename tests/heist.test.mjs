import test from "node:test";
import assert from "node:assert/strict";
import {
  createHeist,
  stepHeist,
  exportHeist,
  replayHeist,
  PASS_TICKS,
  MAX_TICKS,
  blocked,
  surrounds,
  LEGACY_HEIST_RULES,
  LOOT_RESPAWN_TICKS,
  CASH_HEIST_RULES,
  CHASE_TICKS,
} from "../src/heist-sim.js";
import {
  missionTarget,
  escapeRoute,
  clearEscapeSegment,
} from "../src/heist-guide.js";
import { scriptedHeist } from "./fixtures/heist-route.mjs";

test("full heist is winnable through controls and replays exactly", () => {
  const s = scriptedHeist();
  assert.equal(s.outcome, "escaped");
  assert.equal(s.tracks.length, 2);
  assert.ok(s.relays.every((r) => r.open));
  assert.ok(s.vaultOpen && s.exitOpen && s.health > 0 && s.total < MAX_TICKS);
  assert.ok(s.stats.hits > 0, "route also exercises real damage");
  const replay = replayHeist(JSON.parse(JSON.stringify(exportHeist(s))));
  assert.equal(replay.total, s.total);
  assert.deepEqual(replay.stats, s.stats);
  assert.deepEqual(replay.player, s.player);
  assert.equal(replay.score, s.score);
  assert.deepEqual(replay.crewCash, s.crewCash);
  assert.equal(replay.escapeDeadline, s.escapeDeadline);
});

test("replay rejects tampering, truncation, extra controls and foreign rules", () => {
  const data = exportHeist(scriptedHeist());
  assert.throws(() => replayHeist({ ...data, score: data.score + 1 }));
  assert.throws(() =>
    replayHeist({ ...data, inputs: data.inputs.slice(0, -1) }),
  );
  assert.throws(() =>
    replayHeist({
      ...data,
      inputs: [...data.inputs, { x: 0, z: 0, dash: false }],
    }),
  );
  assert.throws(() => replayHeist({ ...data, rules: "echo-0.2-precision" }));
  assert.throws(() =>
    replayHeist({ ...data, inputs: [{ x: Infinity, z: 0, dash: false }] }),
  );
  assert.throws(() =>
    replayHeist({ ...data, inputs: [{ x: 2, z: 0, dash: false }] }),
  );
});

test("stopping control stops immediately; diagonals and dash stay bounded", () => {
  const a = createHeist(),
    b = createHeist();
  stepHeist(a, { x: 1, z: 0 });
  stepHeist(b, { x: 1, z: 1 });
  assert.ok(
    Math.abs(
      Math.hypot(a.player.x, a.player.z - 9) -
        Math.hypot(b.player.x, b.player.z - 9),
    ) < 1e-10,
  );
  const at = { x: a.player.x, z: a.player.z };
  stepHeist(a, {});
  assert.equal(a.player.x, at.x);
  assert.equal(a.player.z, at.z);
  for (let i = 0; i < 220; i++) stepHeist(b, { x: 1, z: 1, dash: true });
  assert.ok(b.player.x <= 17.5 && b.player.z <= 11.5);
  assert.ok(b.stats.dashes <= 2);
});

test("collision keeps a dashing player out of crates", () => {
  const s = createHeist();
  // Move from the spawn along the bottom, then directly toward the left crate.
  for (let i = 0; i < 104; i++) stepHeist(s, { x: -1, z: 0 });
  for (let i = 0; i < 80; i++) {
    stepHeist(s, { x: 0, z: -1, dash: i === 0 });
    assert.ok(!blocked(s.player));
  }
  assert.ok(s.player.z > 3.8);
});

test("echoes replay the exact prior route, including stationary samples", () => {
  const s = scriptedHeist();
  assert.equal(s.tracks[0].length, PASS_TICKS);
  assert.equal(s.tracks[1].length, PASS_TICKS);
  assert.deepEqual(s.ghosts[0], s.tracks[0][s.tick - 1]);
  assert.deepEqual(s.ghosts[1], s.tracks[1][s.tick - 1]);
});

test("caught and lockdown terminate and cannot continue scoring", () => {
  const s = createHeist();
  while (!s.done) stepHeist(s, {});
  assert.equal(s.outcome, "caught");
  const total = s.total,
    score = s.score;
  stepHeist(s, { x: 1, dash: true });
  assert.equal(s.total, total);
  assert.equal(s.score, score);
  assert.equal(replayHeist(exportHeist(s)).outcome, "caught");
  const t = createHeist();
  // Isolate the final-tick boundary. Full real-input replay is covered above.
  t.phase = 2;
  t.tick = PASS_TICKS - 1;
  t.total = MAX_TICKS - 1;
  stepHeist(t, {});
  assert.equal(t.outcome, "lockdown");
  assert.equal(t.total, MAX_TICKS);
});

test("vault geometry rejects collapsed or exterior triangles", () => {
  const p = { x: 0, z: 0 };
  assert.ok(surrounds(p, { x: -5, z: -4 }, { x: 5, z: -4 }, { x: 0, z: 7 }));
  assert.ok(!surrounds(p, { x: -5, z: 2 }, { x: 5, z: 2 }, { x: 0, z: 7 }));
  assert.ok(!surrounds(p, { x: -5, z: 0 }, { x: 5, z: 0 }, { x: 1, z: 0 }));
});

test("cash pays once per pickup and respawns away from a camping crew", () => {
  const s = createHeist();
  const first = s.loot[0];
  while (!first.taken && s.total < 100) {
    const x = first.x - s.player.x,
      z = first.z - s.player.z,
      length = Math.hypot(x, z);
    stepHeist(s, { x: x / length, z: z / length });
  }
  assert.ok(first.taken);
  assert.equal(s.lootTaken, 1);
  assert.equal(s.lootCash, 100);
  assert.equal(first.ready, s.total - 1 + LOOT_RESPAWN_TICKS);
  for (let i = 0; i < 15; i++) stepHeist(s, {});
  assert.equal(
    s.lootCash,
    100,
    "standing on a collected drop never scores again",
  );
  s.total = first.ready;
  stepHeist(s, {});
  assert.ok(!first.taken);
  assert.ok(Math.hypot(first.x - s.player.x, first.z - s.player.z) > 3);
  assert.ok(!blocked(first));
  assert.equal(s.loot.length, 8);
});

test("a recorded echo can earn real cash for the crew", () => {
  const s = createHeist(),
    bag = s.loot[0];
  s.phase = 1;
  s.tracks = [[{ x: bag.x, z: bag.z, heading: 0, dash: 0, moving: false }]];
  stepHeist(s, {});
  assert.ok(bag.taken);
  assert.equal(s.lootTaken, 1);
  assert.equal(s.lootCash, bag.value);
  assert.deepEqual(s.crewCash, [0, bag.value, 0]);
  assert.ok(s.events.some((e) => e.type === "cash" && e.points === bag.value));
  assert.equal(s.events.find((e) => e.type === "cash").actor, 1);
});

test("old heist replays preserve their original result after the loot update", () => {
  const s = scriptedHeist(9019, LEGACY_HEIST_RULES);
  assert.equal(s.score, 6515);
  assert.equal(s.total, 3248);
  assert.equal(s.lootTaken, 0);
  assert.equal(replayHeist(exportHeist(s)).score, 6515);
  const cashRun = scriptedHeist(9019, CASH_HEIST_RULES);
  assert.equal(cashRun.score, 6865);
  assert.equal(cashRun.escapeDeadline, null);
  assert.equal(replayHeist(exportHeist(cashRun)).score, 6865);
});

test("vault triggers one timed pursuit with faster telegraphed shots", () => {
  const s = scriptedHeist(9019, undefined, true);
  assert.equal(s.escapeDeadline, s.total - 1 + CHASE_TICKS);
  assert.equal(s.drones.length, 5);
  assert.equal(s.drones.filter((d) => d.pursuit).length, 2);
  assert.ok(s.events.some((e) => e.type === "alarm"));
  const before = { x: s.drones[3].x, z: s.drones[3].z };
  for (let i = 0; i < 75 && !s.done; i++) stepHeist(s, { x: -1 });
  assert.ok(s.shots.some((p) => Math.abs(Math.hypot(p.vx, p.vz) - 9) < 1e-10));
  assert.notDeepEqual({ x: s.drones[3].x, z: s.drones[3].z }, before);
  assert.equal(s.drones.length, 5, "no repeated reinforcement spawn");
});

test("missing the van ends on its deadline and replays exactly", () => {
  const s = scriptedHeist(9019, undefined, true);
  let i = 0;
  while (!s.done && i < CHASE_TICKS) {
    const target = {
        x: -6 + 3 * Math.sin(i * 0.04),
        z: 6 + 3 * Math.cos(i * 0.04),
      },
      x = target.x - s.player.x,
      z = target.z - s.player.z,
      len = Math.hypot(x, z);
    stepHeist(s, {
      x: x / Math.max(1, len),
      z: z / Math.max(1, len),
      dash: s.player.cooldown === 0 && len > 3,
    });
    i++;
  }
  assert.equal(s.outcome, "van-left");
  assert.ok(s.health > 0);
  assert.equal(s.total, s.escapeDeadline);
  const replay = replayHeist(exportHeist(s));
  assert.equal(replay.outcome, "van-left");
  assert.equal(replay.score, s.score);
});

test("escape route avoids every crate, including from beside cover", () => {
  const starts = [
    { x: -17, z: -11 },
    { x: -13, z: -4.9 },
    { x: 14.73, z: 2 },
    { x: 0, z: 9 },
  ];
  assert.ok(
    !clearEscapeSegment(starts[0], { x: 14, z: 9 }),
    "direct line hits cover",
  );
  for (const start of starts) {
    const route = escapeRoute(start);
    assert.ok(route.length >= 2);
    assert.deepEqual(route.at(-1), { x: 14, z: 9 });
    for (let i = 1; i < route.length; i++)
      for (let t = 0; t <= 1; t += 0.01) {
        const p = {
          x: route[i - 1].x + (route[i].x - route[i - 1].x) * t,
          z: route[i - 1].z + (route[i].z - route[i - 1].z) * t,
        };
        assert.ok(!blocked(p));
      }
  }
});

test("guidance follows the real objective and offers a valid vault triangle", () => {
  const s = createHeist();
  let target = missionTarget(s);
  assert.equal(target.label, "KEYCARD");
  assert.ok(
    s.cells.some((c) => c.x === target.x && c.z === target.z && !c.taken),
  );
  s.cellsTaken = 3;
  assert.ok(missionTarget(s).label.startsWith("$"));
  s.phase = 1;
  assert.equal(missionTarget(s).label, "BREAK RELAY");
  s.phase = 2;
  s.relays.forEach((r) => (r.open = true));
  s.ghosts = [
    { x: -8, z: -5 },
    { x: 8, z: -5 },
  ];
  s.player = { x: 0, z: -6 };
  target = missionTarget(s);
  assert.equal(target.label, "MOVE HERE");
  assert.ok(!blocked(target));
  assert.ok(surrounds({ x: 0, z: -2 }, target, ...s.ghosts));
  s.exitOpen = true;
  assert.equal(missionTarget(s).label, "GETAWAY");
});
