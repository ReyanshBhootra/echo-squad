// Render interpolation is one fixed simulation interval, never a chase filter.
export function interpolatePose(previous, current, alpha) {
  if (
    !previous ||
    Math.hypot(current.x - previous.x, current.z - previous.z) > 2
  )
    return { ...current };
  const t = Math.max(0, Math.min(1, alpha));
  const delta = Math.atan2(
    Math.sin(current.heading - previous.heading),
    Math.cos(current.heading - previous.heading),
  );
  return {
    ...current,
    x: previous.x + (current.x - previous.x) * t,
    z: previous.z + (current.z - previous.z) * t,
    y: (previous.y || 0) + ((current.y || 0) - (previous.y || 0)) * t,
    heading: previous.heading + delta * t,
  };
}

export function footPose(distance, side, moving = true, airborne = false) {
  if (airborne) return { y: 0.2, z: side ? -0.15 : 0.18 };
  if (!moving) return { y: 0, z: 0 };
  const cycle = (((distance / 1.5 + (side ? 0.5 : 0)) % 1) + 1) % 1;
  if (cycle < 0.5) {
    const t = cycle * 2;
    return { z: -0.375 + 0.75 * t, y: 0.2 * Math.sin(Math.PI * t) };
  }
  // Stance leg travels backwards at exactly the character's world speed.
  return { z: 0.375 - 0.75 * (cycle - 0.5) * 2, y: 0 };
}

export function legJoints(foot, hipY = 0.84, length = 0.49) {
  const ankle = { y: foot.y + 0.14, z: foot.z };
  const dy = ankle.y - hipY,
    dz = ankle.z,
    d = Math.min(2 * length - 0.001, Math.hypot(dy, dz));
  const bend = Math.sqrt(Math.max(0, length * length - (d * d) / 4));
  const norm = Math.max(0.001, Math.hypot(dy, dz));
  return {
    hip: { y: hipY, z: 0 },
    knee: {
      y: (hipY + ankle.y) / 2 + (dz / norm) * bend,
      z: dz / 2 - (dy / norm) * bend,
    },
    ankle,
  };
}
