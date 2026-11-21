import test from "node:test";
import assert from "node:assert/strict";
import { createWorld, step, pointAction, PASS_STEPS } from "../src/sim.js";
import { coachState, resultInsight } from "../src/coach.js";

test("first-pickup guide points to a collectible and disappears after a real pickup", () => {
  const world = createWorld(),
    before = structuredClone(world),
    coach = coachState(world);
  assert.equal(coach.seconds, 20);
  assert.equal(coach.progress, 0);
  assert.equal(coach.target.kind, 0);
  assert.equal(coach.target.active, true);
  assert.deepEqual(world, before);
  step(world, pointAction(coach.target));
  step(world, pointAction(coach.target));
  assert.equal(world.score, 10);
  assert.equal(coachState(world).target, null);
  assert.match(coachState(world).mission, /route becomes/);
});
test("pass countdown resets at the recorded-route boundary without altering the clock", () => {
  const world = createWorld();
  for (let i = 0; i < PASS_STEPS - 1; i++) step(world, pointAction(world.p));
  assert.equal(coachState(world).seconds, 1);
  step(world, pointAction(world.p));
  const coach = coachState(world);
  assert.equal(world.total, 600);
  assert.equal(coach.seconds, 20);
  assert.equal(coach.progress, 0);
  assert.match(coach.countdown, /ECHO 02/);
  assert.equal(coach.target, null);
});
test("results distinguish link/triangle pickups from pass totals", () => {
  const world = createWorld();
  world.byKind = [120, 70, 270];
  world.byPass = [50, 100, 310];
  assert.match(resultInsight(world), /^2 link hits · 3 gold cores/);
  assert.match(resultInsight(world), /replay/);
});
