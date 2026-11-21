import { W, H, DT, clamp, pointAction } from "./sim.js";

export function pointerPosition(clientX, clientY, rect) {
  const scale = Math.min(rect.width / W, rect.height / H);
  return {
    x: clamp(
      (clientX - rect.left - (rect.width - W * scale) / 2) / scale,
      14,
      W - 14,
    ),
    y: clamp(
      (clientY - rect.top - (rect.height - H * scale) / 2) / scale,
      14,
      H - 14,
    ),
  };
}

export function keyboardAction(position, x, y) {
  const distance = (520 * DT) / Math.max(1, Math.hypot(x, y));
  return pointAction({
    x: position.x + x * distance,
    y: position.y + y * distance,
  });
}
