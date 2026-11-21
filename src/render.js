import { W, H } from "./sim.js";
const colors = ["#8dd7ff", "#ff916d", "#ead080"];
export function draw(
  ctx,
  s,
  {
    particles = [],
    playerPosition = null,
    ghostFraction = 0,
    preview = false,
    hidePlayer = false,
  } = {},
) {
  const canvas = ctx.canvas,
    dpr = Math.min(devicePixelRatio || 1, 2),
    rect = canvas.getBoundingClientRect();
  const width = Math.round(rect.width * dpr),
    height = Math.round(rect.height * dpr);
  if (canvas.width !== width || canvas.height !== height) {
    canvas.width = width;
    canvas.height = height;
  }
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.fillStyle = "#151e24";
  ctx.fillRect(0, 0, width, height);
  const scale = Math.min(width / W, height / H);
  ctx.setTransform(
    scale,
    0,
    0,
    scale,
    (width - W * scale) / 2,
    (height - H * scale) / 2,
  );
  ctx.fillStyle = "#151e24";
  ctx.fillRect(0, 0, W, H);
  // Quiet structural texture; targets and connections carry the contrast.
  ctx.fillStyle = "#a5c4d012";
  for (let x = 24; x < W; x += 24)
    for (let y = 20; y < H; y += 24) {
      ctx.beginPath();
      ctx.arc(x, y, 0.8, 0, Math.PI * 2);
      ctx.fill();
    }
  ctx.strokeStyle = "#9ab3c418";
  ctx.lineWidth = 1;
  ctx.strokeRect(15, 15, W - 30, H - 30);
  for (const [x, y, dx, dy] of [
    [15, 15, 1, 1],
    [W - 15, 15, -1, 1],
    [15, H - 15, 1, -1],
    [W - 15, H - 15, -1, -1],
  ]) {
    ctx.strokeStyle = "#9ab3c450";
    ctx.beginPath();
    ctx.moveTo(x + dx * 20, y);
    ctx.lineTo(x, y);
    ctx.lineTo(x, y + dy * 20);
    ctx.stroke();
  }
  const ghosts = preview
    ? [
        { x: 760, y: 160 },
        { x: 820, y: 440 },
      ]
    : s.ghosts.map((ghost, i) => {
        const next =
          s.tracks[i][Math.min(s.tick, s.tracks[i].length - 1)] || ghost;
        const fraction = Math.max(0, Math.min(1, ghostFraction));
        return {
          x: ghost.x + (next.x - ghost.x) * fraction,
          y: ghost.y + (next.y - ghost.y) * fraction,
        };
      });
  const drones = [
    preview ? { x: 660, y: 300 } : playerPosition || s.p,
    ...ghosts,
  ];
  if (drones.length === 3) {
    ctx.fillStyle = "#ebc9740c";
    ctx.beginPath();
    ctx.moveTo(drones[0].x, drones[0].y);
    ctx.lineTo(drones[1].x, drones[1].y);
    ctx.lineTo(drones[2].x, drones[2].y);
    ctx.closePath();
    ctx.fill();
  }
  for (let a = 0; a < drones.length; a++)
    for (let b = a + 1; b < drones.length; b++) {
      ctx.strokeStyle = b === 2 ? "#e8c56d55" : "#f2946855";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(drones[a].x, drones[a].y);
      ctx.lineTo(drones[b].x, drones[b].y);
      ctx.stroke();
    }
  for (const item of s.items) {
    if (!item.active || item.kind > (preview ? 2 : s.phase)) continue;
    const { x, y, kind } = item;
    ctx.save();
    ctx.translate(x, y);
    ctx.fillStyle = colors[kind];
    ctx.strokeStyle = colors[kind];
    ctx.lineWidth = 1.5;
    if (item.contact > 0) {
      ctx.strokeStyle = "#ffffffa0";
      ctx.beginPath();
      ctx.arc(0, 0, kind === 0 ? 10 : kind === 1 ? 12 : 16, 0, Math.PI * 2);
      ctx.stroke();
      ctx.strokeStyle = colors[kind];
    }
    if (kind === 0) {
      ctx.beginPath();
      ctx.moveTo(0, -6);
      ctx.lineTo(2, -2);
      ctx.lineTo(6, 0);
      ctx.lineTo(2, 2);
      ctx.lineTo(0, 6);
      ctx.lineTo(-2, 2);
      ctx.lineTo(-6, 0);
      ctx.lineTo(-2, -2);
      ctx.closePath();
      ctx.fill();
    }
    if (kind === 1) {
      ctx.rotate(Math.PI / 4);
      ctx.strokeRect(-5, -5, 10, 10);
      ctx.fillStyle = "#ff916d18";
      ctx.fillRect(-5, -5, 10, 10);
    }
    if (kind === 2) {
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const a = (i * Math.PI) / 3;
        const px = Math.cos(a) * 11,
          py = Math.sin(a) * 11;
        i ? ctx.lineTo(px, py) : ctx.moveTo(px, py);
      }
      ctx.closePath();
      ctx.stroke();
      ctx.fillStyle = "#ead080";
      ctx.fillRect(-2, -2, 4, 4);
    }
    ctx.restore();
  }
  // Keep the arena still: no motion trails, auto-spinning echoes or rival cursor.
  drones.forEach((p, i) => {
    // The browser's native crosshair is the mouse player's sole visible marker.
    if (i === 0 && hidePlayer && !preview) return;
    const c = colors[i];
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.strokeStyle = c + "35";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(0, 0, 21, 0, Math.PI * 2);
    ctx.stroke();
    // A fixed marker avoids rotation flicker when the pointer changes direction.
    ctx.fillStyle = c;
    ctx.beginPath();
    ctx.moveTo(0, -12);
    ctx.lineTo(9, 9);
    ctx.lineTo(0, 5);
    ctx.lineTo(-9, 9);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
    ctx.fillStyle = c;
    ctx.font = "8px monospace";
    ctx.textAlign = "center";
    ctx.fillText(i === 0 ? "YOU" : `ECHO 0${i}`, p.x, p.y + 33);
  });
  for (const p of particles) {
    ctx.globalAlpha = Math.max(0, 1 - p.age / 0.65);
    ctx.fillStyle = colors[p.kind];
    ctx.font = "11px monospace";
    ctx.textAlign = "center";
    ctx.fillText("+" + p.points, p.x, p.y - 12);
  }
  ctx.globalAlpha = 1;
}
