// Scripted route for integration checks. Not a trained controller or human playtest.
import {
  createHeist,
  stepHeist,
  MAX_TICKS,
  linkDistance,
  blocked,
} from "../../src/heist-sim.js";
export function scriptedHeist(seed = 9019, rules, stopAtVault = false) {
  const s = createHeist(seed, rules);
  let waypoint = 0,
    anchored = false;
  const route = [
    { x: 0, z: 5 },
    { x: -8, z: 6 },
    { x: -8, z: -5 },
  ];
  for (let tick = 0; tick < MAX_TICKS && !s.done; tick++) {
    let target;
    if (s.phase === 0) {
      target = route[waypoint];
      if (
        Math.hypot(s.player.x - target.x, s.player.z - target.z) < 0.6 &&
        waypoint < route.length - 1
      )
        target = route[++waypoint];
      if (
        waypoint === 2 &&
        Math.hypot(s.player.x - target.x, s.player.z - target.z) < 1
      )
        anchored = true;
      if (anchored)
        target = {
          x: -8 + 2.5 * Math.sin(tick * 0.035),
          z: -5 + 2.5 * Math.cos(tick * 0.035),
        };
    } else if (s.phase === 1) {
      const relay = s.relays.find((r) => !r.open),
        g = s.ghosts[0];
      if (relay && g) {
        const candidates = [0.4, 0.6, 0.9, 1.2, 1.6]
          .map((k) => ({
            x: relay.x + (relay.x - g.x) * k,
            z: relay.z + (relay.z - g.z) * k,
          }))
          .filter(
            (p) => Math.abs(p.x) < 17 && Math.abs(p.z) < 11 && !blocked(p),
          );
        target = candidates.sort(
          (a, b) =>
            Math.hypot(a.x - s.player.x, a.z - s.player.z) -
            Math.hypot(b.x - s.player.x, b.z - s.player.z),
        )[0] || { x: 8, z: -5 };
      } else
        target = {
          x: 8 + 2.5 * Math.sin(tick * 0.035),
          z: -5 + 2.5 * Math.cos(tick * 0.035),
        };
    } else target = s.exitOpen ? { x: 14, z: 9 } : { x: 0, z: 9 };
    if (
      Math.hypot(s.player.x - target.x, s.player.z - target.z) < 0.75 &&
      !s.exitOpen
    )
      target = {
        x: target.x + Math.sin(tick * 0.07) * 1.2,
        z: target.z + Math.cos(tick * 0.07) * 1.2,
      };
    let dx = target.x - s.player.x,
      dz = target.z - s.player.z;
    const length = Math.hypot(dx, dz);
    dx /= Math.max(1, length);
    dz /= Math.max(1, length);
    stepHeist(s, { x: dx, z: dz, dash: s.player.cooldown === 0 && length > 3 });
    if (stopAtVault && s.vaultOpen) break;
  }
  return s;
}
