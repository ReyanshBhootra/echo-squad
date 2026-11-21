import test from "node:test";
import assert from "node:assert/strict";
import { createWorld, step, expert, PASS_STEPS } from "../src/sim.js";
import {
  exportReplay,
  parseReplay,
  createReplay,
  MAX_REPLAY_BYTES,
} from "../src/replay.js";

const world = createWorld(9019),
  checkpoints = new Map();
for (let i = 1; i <= PASS_STEPS * 3; i++) {
  step(world, expert(world));
  if ([1, 599, 600, 601, 1199, 1200, 1201, 1800].includes(i))
    checkpoints.set(i, structuredClone(world));
}
const file = JSON.stringify(exportReplay(world));

test("exported routes reproduce the score, targets and ghosts at every pass boundary", () => {
  const replay = createReplay(parseReplay(file));
  for (const [tick, expected] of checkpoints) {
    const actual = replay.seek(tick);
    assert.equal(actual.score, expected.score);
    assert.deepEqual(actual.byPass, expected.byPass);
    assert.deepEqual(actual.items, expected.items);
    assert.equal(actual.phase, expected.phase);
    assert.equal(actual.done, expected.done);
    assert.ok(Math.abs(actual.p.x - expected.p.x) < 1e-9);
    assert.ok(Math.abs(actual.p.y - expected.p.y) < 1e-9);
    for (let i = 0; i < actual.ghosts.length; i++) {
      assert.ok(Math.abs(actual.ghosts[i].x - expected.ghosts[i].x) < 1e-9);
      assert.ok(Math.abs(actual.ghosts[i].y - expected.ghosts[i].y) < 1e-9);
    }
  }
});
test("backward seeking and resuming do not reuse future score or routes", () => {
  const replay = createReplay(parseReplay(file));
  replay.seek(1800);
  replay.seek(599);
  const before = structuredClone(replay.world);
  replay.advance();
  assert.equal(replay.world.total, 600);
  assert.equal(replay.world.phase, 1);
  assert.deepEqual(replay.world.byPass, checkpoints.get(600).byPass);
  replay.seek(599);
  assert.deepEqual(replay.world, before);
  assert.equal(replay.seek(-99).total, 0);
  assert.equal(replay.seek(9000).total, 1800);
  assert.throws(() => replay.seek(NaN), /valid replay time/);
});
test("rejects incomplete, foreign, malformed and oversized replays", () => {
  assert.throws(() => exportReplay(createWorld()), /Finish the run/);
  assert.throws(() => parseReplay("{"), /not valid/);
  assert.throws(() => parseReplay(" ".repeat(MAX_REPLAY_BYTES + 1)), /512 KB/);
  for (const change of [
    (d) => (d.rules = "old-rules"),
    (d) => (d.schema = 999),
    (d) => (d.seed = -1),
    (d) => d.tracks[0].pop(),
    (d) => (d.tracks[1][0].x = null),
    (d) => (d.tracks[1][0].x = 99999),
    (d) => (d.byPass = [0, 0]),
    (d) => (d.score = "5"),
  ]) {
    const data = JSON.parse(file);
    change(data);
    assert.throws(() => parseReplay(JSON.stringify(data)));
  }
});
test("score verification rejects tampering and import strips extra metadata", () => {
  const data = JSON.parse(file);
  data.score += 10;
  assert.throws(() => createReplay(data), /score does not match/);
  data.score -= 10;
  data.byPass[0] += 10;
  assert.throws(() => createReplay(data), /score does not match/);
  data.byPass[0] -= 10;
  data.html = "<img src=x onerror=alert(1)>";
  data.tracks[0][0].extra = "untrusted";
  const parsed = parseReplay(JSON.stringify(data));
  assert.equal(parsed.html, undefined);
  assert.equal(parsed.tracks[0][0].extra, undefined);
});
