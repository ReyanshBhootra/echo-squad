import { W, H, DT, PASS_STEPS } from "./sim.js";

export function coachState(world) {
  const phase = Math.min(2, world.phase);
  let target = null;
  if (phase === 0 && world.byKind[0] === 0 && !world.done) {
    let distance = Infinity;
    for (const item of world.items) {
      if (!item.active || item.kind !== 0) continue;
      const next = Math.hypot(item.x - W / 2, item.y - H / 2);
      if (next < distance) {
        distance = next;
        target = item;
      }
    }
  }
  return {
    target,
    progress: world.done ? 1 : world.tick / PASS_STEPS,
    seconds: world.done ? 0 : Math.ceil((PASS_STEPS - world.tick) * DT),
    countdown: ["ECHO 01 IN", "ECHO 02 IN", "FINISH IN"][phase],
    mission: [
      world.byKind[0] === 0
        ? "Move onto the marked spark. Hold briefly."
        : "Keep collecting. Your route becomes Echo 01.",
      world.byKind[1] === 0
        ? "Sweep your LINK through pink diamonds."
        : "Link hit. Spread out to shape your final triangle.",
      world.byKind[2] === 0
        ? "Keep gold cores INSIDE your triangle."
        : "Squad hit. Keep making room for gold cores.",
    ][phase],
  };
}

export function resultInsight(world) {
  const links = world.byKind[1] / 35,
    cores = world.byKind[2] / 90;
  return (
    `${links} link hits · ${cores} gold cores. ` +
    (cores === 0
      ? "Next run: record routes on opposite sides to open up your triangle."
      : "Watch your replay to find the triangles that scored.")
  );
}
