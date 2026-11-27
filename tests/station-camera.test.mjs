import test from "node:test";
import assert from "node:assert/strict";
import { cameraMovement, cameraPosition } from "../src/station-camera.js";
import {
  createHeist,
  stepHeist,
  exportHeist,
  replayHeist,
} from "../src/heist-sim.js";

test("camera-relative forward follows heading and diagonal does not gain speed", () => {
  const a = cameraMovement(0, -1, Math.PI / 2);
  assert.ok(Math.abs(a.x + 1) < 1e-12);
  assert.ok(Math.abs(a.z) < 1e-12);
  for (let yaw = -Math.PI; yaw < Math.PI; yaw += 0.17) {
    const diagonal = cameraMovement(1, -1, yaw);
    assert.ok(Math.abs(Math.hypot(diagonal.x, diagonal.z) - 1) < 1e-12);
  }
  assert.deepEqual(cameraMovement(0, -1, 2, true), { x: 0, z: -1 });
});
test("camera boom stays inside the station at every corner and angle", () => {
  for (const x of [-17.5, 0, 17.5])
    for (const z of [-11.5, 0, 11.5])
      for (let yaw = 0; yaw < 6.28; yaw += 0.1) {
        const p = cameraPosition({ x, z }, yaw);
        assert.ok(Math.abs(p.x) <= 18.46 && Math.abs(p.z) <= 12.46);
        assert.ok(p.y > 1.25);
      }
});
test("turning camera and dashing produces a replay independent of camera state", () => {
  const s = createHeist();
  for (let tick = 0; tick < 4500 && !s.done; tick++) {
    const move = cameraMovement(Math.sin(tick / 40), -1, tick / 80);
    stepHeist(s, { ...move, dash: tick % 140 === 0 });
  }
  const run = exportHeist(s),
    copy = replayHeist(run);
  assert.equal(copy.player.x, s.player.x);
  assert.equal(copy.player.z, s.player.z);
  assert.equal(copy.score, s.score);
  assert.equal(copy.stats.dashes, s.stats.dashes);
});
