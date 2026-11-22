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
} from "../src/heist-sim.js";
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
