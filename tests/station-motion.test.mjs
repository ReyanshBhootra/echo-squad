import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  createHeist,
  stepHeist,
  exportHeist,
  replayHeist,
  GRAVITY,
  JUMP_SPEED,
} from "../src/heist-sim.js";
import { interpolatePose, footPose, legJoints } from "../src/station-motion.js";

test("jump follows gravity, cannot double-jump or auto-repeat, and lands on the deck", () => {
  const s = createHeist();
  let peak = 0,
    landings = 0;
  stepHeist(s, { jump: true });
  assert.equal(s.player.vy, JUMP_SPEED - GRAVITY / 60);
  for (let t = 0; t < 95; t++) {
    stepHeist(s, { jump: true });
    peak = Math.max(peak, s.player.y);
    assert.ok(s.player.y >= 0);
    landings += s.events.filter((e) => e.type === "land").length;
  }
  assert.ok(peak > 1.1 && peak < 1.4);
  assert.equal(landings, 1);
  assert.equal(s.player.y, 0);
  assert.equal(s.player.vy, 0);
  assert.equal(s.player.grounded, true);
  stepHeist(s, { jump: false });
  stepHeist(s, { jump: true });
  assert.ok(s.player.y > 0);
});
test("jumping clears low shots, while grounded hits still cost armor", () => {
  for (const airborne of [false, true]) {
    const s = createHeist();
    if (airborne) for (let t = 0; t < 12; t++) stepHeist(s, { jump: t === 0 });
    s.shots.push({ x: s.player.x, z: s.player.z, vx: 0, vz: 0, life: 10 });
    stepHeist(s, {});
    assert.equal(s.health, airborne ? 6 : 5);
  }
});
test("jump samples and gravity replay exactly, including across a pass boundary", () => {
  const s = createHeist();
  for (let t = 0; t < 4500 && !s.done; t++)
    stepHeist(s, {
      x: Math.sin(t / 60),
      z: Math.cos(t / 60),
      jump: t % 75 === 0,
      dash: t % 160 === 0,
    });
  const copy = replayHeist(JSON.parse(JSON.stringify(exportHeist(s))));
  assert.deepEqual(copy.player, s.player);
  assert.deepEqual(copy.tracks, s.tracks);
  assert.equal(copy.score, s.score);
});
test("stance boots stay on the floor and knees retain two equal bone lengths", () => {
  for (let d = 0; d < 6; d += 0.01)
    for (const side of [0, 1]) {
      const f = footPose(d, side),
        leg = legJoints(f);
      assert.ok(f.y >= 0 && f.y <= 0.201);
      if ((((d / 1.5 + side * 0.5) % 1) + 1) % 1 >= 0.5) assert.equal(f.y, 0);
      for (const [a, b] of [
        [leg.hip, leg.knee],
        [leg.knee, leg.ankle],
      ])
        assert.ok(Math.abs(Math.hypot(a.y - b.y, a.z - b.z) - 0.49) < 0.002);
    }
});
test("render interpolation fills high-refresh frames and never sweeps across resets", () => {
  const a = { x: 0, z: 0, y: 0, heading: Math.PI - 0.1 },
    b = { x: 0.125, z: 0, y: 0.12, heading: -Math.PI + 0.1 };
  const middle = interpolatePose(a, b, 0.5);
  assert.equal(middle.x, 0.0625);
  assert.equal(middle.y, 0.06);
  assert.ok(Math.abs(Math.abs(middle.heading) - Math.PI) < 1e-12);
  assert.deepEqual(interpolatePose(a, { ...b, x: 14 }, 0.5), { ...b, x: 14 });
});
test("saved version-three trailer run still reproduces its original outcome", () => {
  const saved = JSON.parse(
    readFileSync(
      new URL("../tools/submission-studio/run.json", import.meta.url),
      "utf8",
    ),
  );
  const run = saved.run || saved.replay || saved;
  const s = replayHeist(run);
  assert.equal(s.score, 6865);
  assert.equal(s.total, 3248);
  assert.equal(s.outcome, "escaped");
});
