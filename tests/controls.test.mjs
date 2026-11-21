import test from "node:test";
import assert from "node:assert/strict";
import { createWorld, step, pointAction } from "../src/sim.js";
import { pointerPosition, keyboardAction } from "../src/controls.js";

test("pointer arrives at the target on the very next simulation tick", () => {
  const s = createWorld();
  for (const p of [
    { x: 800, y: 100 },
    { x: 80, y: 480 },
    { x: 500, y: 300 },
  ]) {
    step(s, pointAction(p));
    assert.ok(Math.abs(s.p.x - p.x) < 1e-9);
    assert.ok(Math.abs(s.p.y - p.y) < 1e-9);
  }
  step(s, pointAction(s.p));
  assert.equal(s.p.vx, 0);
  assert.equal(s.p.vy, 0);
});
test("mouse mapping stays exact at different scales and in letterboxed layouts", () => {
  assert.deepEqual(
    pointerPosition(500, 300, { left: 20, top: 20, width: 960, height: 560 }),
    { x: 480, y: 280 },
  );
  assert.deepEqual(
    pointerPosition(250, 150, { left: 10, top: 10, width: 480, height: 280 }),
    { x: 480, y: 280 },
  );
  assert.deepEqual(
    pointerPosition(200, 400, { left: 20, top: 20, width: 360, height: 760 }),
    { x: 480, y: 280 },
  );
});
test("random sweeping cannot collect a spark without stable contact", () => {
  const s = createWorld();
  s.p = { x: 100, y: 200, vx: 0, vy: 0 };
  s.items = [{ x: 500, y: 200, kind: 0, active: true }];
  step(s, pointAction({ x: 900, y: 200 }));
  assert.equal(s.score, 0);
  step(s, pointAction({ x: 500, y: 200 }));
  assert.equal(s.score, 0);
  step(s, pointAction({ x: 500, y: 200 }));
  assert.equal(s.score, 10);
  step(s, pointAction({ x: 500, y: 200 }));
  assert.equal(s.score, 10);
});
test("keyboard stops immediately when direction is released", () => {
  const s = createWorld();
  step(s, keyboardAction(s.p, 1, 0));
  const x = s.p.x;
  step(s, keyboardAction(s.p, 0, 0));
  assert.equal(s.p.x, x);
  assert.equal(s.p.vx, 0);
});
test("echo recordings contain direct pointer positions without a trailing chase", () => {
  const s = createWorld(),
    p = { x: 800, y: 120 };
  step(s, pointAction(p));
  for (let i = 1; i < 600; i++) step(s, pointAction(p));
  assert.ok(Math.abs(s.tracks[0][0].x - p.x) < 1e-9);
  step(s, pointAction({ x: 300, y: 300 }));
  assert.deepEqual(s.ghosts[0], s.tracks[0][0]);
});
