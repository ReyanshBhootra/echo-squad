import test from "node:test";
import assert from "node:assert/strict";
import {
  createWorld,
  step,
  expert,
  runPolicy,
  segmentDistance,
  inTriangle,
  observe,
  W,
  H,
} from "../src/sim.js";
import {
  makeModel,
  trainExample,
  forward,
  parameterCount,
} from "../src/neural.js";
test("identical actions reproduce every pass, score and replay", () => {
  const a = runPolicy((s) => expert(s), 101),
    b = runPolicy((s) => expert(s), 101);
  assert.deepEqual(a, b);
  assert.equal(a.total, 1800);
  assert.equal(a.tracks.length, 3);
  assert.equal(a.tracks[0].length, 600);
});
test("recorded teammate is at the exact earlier tick", () => {
  const s = createWorld();
  for (let i = 0; i < 600; i++) step(s, [1, 0]);
  const first = s.tracks[0][0];
  step(s, [0, 1]);
  assert.deepEqual(s.ghosts[0], first);
  assert.equal(s.record.length, 1);
});
test("speed limits and boundaries survive adversarial inputs", () => {
  const s = createWorld();
  for (let i = 0; i < 1800; i++) {
    step(s, [1e9, -1e9]);
    assert.ok(s.p.x >= 14 && s.p.x <= W - 14);
    assert.ok(s.p.y >= 14 && s.p.y <= H - 14);
    assert.ok(Math.hypot(s.p.vx, s.p.vy) <= 275 + 0.0001);
  }
});
test("each item scores once per wave", () => {
  const s = createWorld();
  s.items = [{ x: s.p.x, y: s.p.y, kind: 0, active: true }];
  step(s, [0, 0]);
  assert.equal(s.score, 10);
  step(s, [0, 0]);
  assert.equal(s.score, 10);
});
test("geometry handles degenerate links and triangles", () => {
  assert.equal(
    segmentDistance({ x: 3, y: 4 }, { x: 0, y: 0 }, { x: 0, y: 0 }),
    5,
  );
  assert.equal(
    inTriangle({ x: 3, y: 3 }, { x: 0, y: 0 }, { x: 0, y: 0 }, { x: 1, y: 1 }),
    false,
  );
  assert.equal(
    inTriangle(
      { x: 20, y: 20 },
      { x: 0, y: 0 },
      { x: 100, y: 0 },
      { x: 0, y: 100 },
    ),
    true,
  );
});
test("world seed fixes layouts independently of actions", () => {
  const a = createWorld(1),
    b = createWorld(1);
  for (let i = 0; i < 150; i++) {
    step(a, [1, 0]);
    step(b, [-1, 1]);
  }
  assert.deepEqual(a.items, b.items);
});
test("model dimensions and backprop reduce example loss", () => {
  const m = makeModel(),
    x = observe(createWorld()),
    target = [0.5, -0.5],
    loss = () =>
      forward(m, x).y.reduce((n, v, i) => n + (v - target[i]) ** 2, 0);
  const before = loss();
  for (let i = 0; i < 500; i++) trainExample(m, x, target);
  assert.ok(loss() < before * 0.01);
  assert.equal(parameterCount(m), 610);
});
