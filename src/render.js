import { W, H } from "./sim.js";
const colors = ["#8dd7ff", "#ff916d", "#ead080"];
export function draw(
  ctx,
  s,
  { time = 0, reduced = false, rival = null, particles = [] } = {},
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
  const drones = [s.p, ...s.ghosts];
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
    if (!item.active || item.kind > s.phase) continue;
    const { x, y, kind } = item;
    ctx.save();
    ctx.translate(x, y);
    ctx.fillStyle = colors[kind];
    ctx.strokeStyle = colors[kind];
    ctx.lineWidth = 1.5;
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
  for (let g = 0; g < s.tracks.length; g++) {
    const track = s.tracks[g];
    ctx.strokeStyle = colors[g + 1] + "24";
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (
      let i = Math.max(0, s.tick - 48);
      i < Math.min(s.tick, track.length);
      i++
    ) {
      const p = track[i];
      i === Math.max(0, s.tick - 48)
        ? ctx.moveTo(p.x, p.y)
        : ctx.lineTo(p.x, p.y);
    }
    ctx.stroke();
  }
  if (!reduced && s.record.length > 2) {
    ctx.strokeStyle = "#8dd7ff45";
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let i = Math.max(0, s.record.length - 25); i < s.record.length; i++) {
      const p = s.record[i];
      i === Math.max(0, s.record.length - 25)
        ? ctx.moveTo(p.x, p.y)
        : ctx.lineTo(p.x, p.y);
    }
    ctx.stroke();
  }
  if (rival) {
    ctx.strokeStyle = "#ee775544";
    ctx.setLineDash([4, 5]);
    ctx.beginPath();
    ctx.arc(rival.p.x, rival.p.y, 19, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = "#e88d6c66";
    ctx.font = "8px monospace";
    ctx.textAlign = "center";
    ctx.fillText("NN", rival.p.x, rival.p.y - 25);
  }
  drones.forEach((p, i) => {
    const c = colors[i];
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.strokeStyle = c + "35";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(0, 0, 21, 0, Math.PI * 2);
    ctx.stroke();
    ctx.rotate(
      i === 0 ? Math.atan2(s.p.vy, s.p.vx) + Math.PI / 2 : time * 0.0001,
    );
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
    ctx.fillText("+" + p.points, p.x, p.y - (reduced ? 0 : p.age * 30));
  }
  ctx.globalAlpha = 1;
}
