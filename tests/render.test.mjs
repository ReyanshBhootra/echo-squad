import test from "node:test";
import assert from "node:assert/strict";
import { draw } from "../src/render.js";
import { createWorld } from "../src/sim.js";

test("native mouse mode omits the canvas player but preserves echoes and keyboard fallback", (t) => {
  const previous = globalThis.devicePixelRatio;
  globalThis.devicePixelRatio = 1;
  t.after(() => {
    if (previous === undefined) delete globalThis.devicePixelRatio;
    else globalThis.devicePixelRatio = previous;
  });
  const labels = [];
  const ctx = new Proxy(
    {
      canvas: {
        width: 960,
        height: 560,
        getBoundingClientRect: () => ({ width: 960, height: 560 }),
      },
      fillText: (label) => labels.push(label),
    },
    { get: (target, key) => (key in target ? target[key] : () => {}) },
  );
  const world = createWorld();
  world.ghosts = [{ x: 200, y: 200 }];
  world.tracks = [[world.ghosts[0]]];
  draw(ctx, world, { hidePlayer: true });
  assert.deepEqual(labels, ["ECHO 01"]);
  labels.length = 0;
  draw(ctx, world);
  assert.deepEqual(labels, ["YOU", "ECHO 01"]);
});
