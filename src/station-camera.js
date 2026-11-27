import { BLOCKS, LIMITS } from "./heist-sim.js";

// The recorder receives world-space inputs. Camera changes never change a replay.
export function cameraMovement(x, z, yaw = 0, overview = false) {
  if (overview) return { x, z };
  const length = Math.max(1, Math.hypot(x, z));
  x /= length;
  z /= length;
  return {
    x: x * Math.cos(yaw) + z * Math.sin(yaw),
    z: -x * Math.sin(yaw) + z * Math.cos(yaw),
  };
}

export function cameraPosition(player, yaw, distance = 7, height = 5.6) {
  // Shorten the boom against bulkheads and cargo; never ease behind input.
  const target = { x: player.x, y: 1.25, z: player.z };
  let fraction = 1;
  for (let t = 0.05; t <= 1; t += 0.025) {
    const x = player.x + Math.sin(yaw) * distance * t;
    const z = player.z + Math.cos(yaw) * distance * t;
    const y = 1.25 + (height - 1.25) * t;
    const boundary =
      Math.abs(x) > LIMITS.x + 0.45 || Math.abs(z) > LIMITS.z + 0.45;
    const cargo =
      y < 2.5 &&
      BLOCKS.some(
        (b) =>
          Math.abs(x - b.x) < b.w / 2 + 0.35 &&
          Math.abs(z - b.z) < b.d / 2 + 0.35,
      );
    if (boundary || cargo) {
      fraction = Math.max(0.1, t - 0.04);
      break;
    }
  }
  return {
    target,
    x: player.x + Math.sin(yaw) * distance * fraction,
    y: height,
    z: player.z + Math.cos(yaw) * distance * fraction,
  };
}
