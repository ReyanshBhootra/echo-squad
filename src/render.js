import { W, H } from "./sim.js";
const colors = ["#7cecf4", "#ff83ab", "#ffd18e"];
const floors = new WeakMap();
function paintFloor(ctx) {
  const sky = ctx.createLinearGradient(0, 0, W, H);
  if (sky?.addColorStop) {
    sky.addColorStop(0, "#152132");
    sky.addColorStop(0.55, "#141b2c");
    sky.addColorStop(1, "#291d34");
  }
  ctx.fillStyle = sky || "#141b2c";
  ctx.fillRect(0, 0, W, H);
  // Static asphalt and court markings are cached, not rebuilt every frame.
  ctx.strokeStyle = "#b2bad408";
  ctx.lineWidth = 1;
  for (let x = 80; x < W; x += 80) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, H);
    ctx.stroke();
  }
  for (let y = 80; y < H; y += 80) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(W, y);
    ctx.stroke();
  }
  ctx.fillStyle = "#e5d7ef0a";
  for (let i = 0; i < 200; i++)
    ctx.fillRect((i * 137.37) % W, (i * 61.91) % H, 1, 1);
  ctx.strokeStyle = "#f3d4e21b";
  ctx.strokeRect(15, 15, W - 30, H - 30);
  ctx.strokeStyle = "#f3d4e20b";
  ctx.strokeRect(38, 38, W - 76, H - 76);
  ctx.beginPath();
  ctx.arc(W / 2, H / 2, 90, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(W / 2, 38);
  ctx.lineTo(W / 2, H - 38);
  ctx.stroke();
  for (const [x, c] of [
    [15, colors[0]],
    [W - 15, colors[1]],
  ]) {
    ctx.strokeStyle = c;
    ctx.shadowColor = c;
    ctx.shadowBlur = 14;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(x, 45);
    ctx.lineTo(x, H - 45);
    ctx.stroke();
  }
  ctx.shadowBlur = 0;
  for (let i = 0; i < 10; i++) {
    ctx.fillStyle = i % 2 ? "#ff83ab55" : "#ffd18e66";
    ctx.fillRect(W / 2 - 85 + i * 18, 14, 10, 3);
    ctx.fillRect(W / 2 - 85 + i * 18, H - 17, 10, 3);
  }
}
function floor(ctx) {
  let surface = floors.get(ctx);
  if (!surface && ctx.canvas.ownerDocument) {
    surface = ctx.canvas.ownerDocument.createElement("canvas");
    surface.width = W;
    surface.height = H;
    paintFloor(surface.getContext("2d"));
    floors.set(ctx, surface);
  }
  if (surface) ctx.drawImage(surface, 0, 0);
  else paintFloor(ctx);
}
export function draw(
  ctx,
  s,
  {
    particles = [],
    playerPosition = null,
    ghostFraction = 0,
    preview = false,
    hidePlayer = false,
    playerLabel = "YOU",
    motion = false,
    time = 0,
    guide = null,
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
  ctx.fillStyle = "#101623";
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
  floor(ctx);
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
    ctx.fillStyle = "#ffd18e12";
    ctx.beginPath();
    ctx.moveTo(drones[0].x, drones[0].y);
    ctx.lineTo(drones[1].x, drones[1].y);
    ctx.lineTo(drones[2].x, drones[2].y);
    ctx.closePath();
    ctx.fill();
  }
  for (let a = 0; a < drones.length; a++)
    for (let b = a + 1; b < drones.length; b++) {
      const color = colors[b];
      ctx.strokeStyle = color + "aa";
      ctx.shadowColor = color;
      ctx.shadowBlur = 9;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(drones[a].x, drones[a].y);
      ctx.lineTo(drones[b].x, drones[b].y);
      ctx.stroke();
      ctx.shadowBlur = 0;
      if (motion) {
        const t = (time * 0.45 + a * 0.33) % 1;
        ctx.fillStyle = "#fff5e5";
        ctx.beginPath();
        ctx.arc(
          drones[a].x + (drones[b].x - drones[a].x) * t,
          drones[a].y + (drones[b].y - drones[a].y) * t,
          2.3,
          0,
          Math.PI * 2,
        );
        ctx.fill();
      }
    }
  for (const item of s.items) {
    if (!item.active || item.kind > (preview ? 2 : s.phase)) continue;
    const { x, y, kind } = item;
    ctx.save();
    ctx.translate(x, y);
    if (motion) {
      const pulse = 1 + Math.sin(time * 3 + item.id * 0.7) * 0.08;
      ctx.scale(pulse, pulse);
    }
    ctx.fillStyle = colors[kind];
    ctx.strokeStyle = colors[kind];
    ctx.lineWidth = 1.5;
    ctx.shadowColor = colors[kind];
    ctx.shadowBlur = kind === 0 ? 10 : 15;
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
      ctx.shadowBlur = 0;
      ctx.fillStyle = "#efffff";
      ctx.fillRect(-1.5, -1.5, 3, 3);
    }
    if (kind === 1) {
      ctx.rotate(Math.PI / 4);
      ctx.strokeRect(-5, -5, 10, 10);
      ctx.fillStyle = "#ff83ab25";
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
      ctx.fillStyle = colors[2];
      ctx.fillRect(-2, -2, 4, 4);
    }
    ctx.restore();
  }
  if (guide) {
    ctx.save();
    ctx.strokeStyle = "#fff3da";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(guide.x, guide.y, 18, 0, Math.PI * 2);
    ctx.stroke();
    ctx.font = "bold 12px monospace";
    ctx.textAlign = "center";
    ctx.fillStyle = "#0a1220";
    ctx.fillRect(guide.x - 45, guide.y - 43, 90, 19);
    ctx.fillStyle = "#fff3da";
    ctx.fillText("HOLD HERE", guide.x, guide.y - 29);
    ctx.restore();
  }
  // The camera and pointer stay still; only feedback and link signals animate.
  drones.forEach((p, i) => {
    // The browser's native crosshair is the mouse player's sole visible marker.
    if (i === 0 && hidePlayer && !preview) return;
    const c = colors[i];
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.strokeStyle = c + "70";
    ctx.shadowColor = c;
    ctx.shadowBlur = 14;
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
    ctx.shadowBlur = 0;
    ctx.strokeStyle = "#fff8ee";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-3, 2);
    ctx.lineTo(0, -5);
    ctx.lineTo(3, 2);
    ctx.stroke();
    ctx.restore();
    ctx.fillStyle = c;
    ctx.font = "8px monospace";
    ctx.textAlign = "center";
    ctx.fillText(i === 0 ? playerLabel : `ECHO 0${i}`, p.x, p.y + 33);
  });
  for (const p of particles) {
    const progress = Math.min(1, p.age / 0.65);
    ctx.globalAlpha = Math.max(0, 1 - progress);
    ctx.fillStyle = colors[p.kind];
    if (motion) {
      ctx.strokeStyle = colors[p.kind];
      ctx.lineWidth = 2 * (1 - progress);
      ctx.beginPath();
      ctx.arc(p.x, p.y, 8 + progress * 32, 0, Math.PI * 2);
      ctx.stroke();
      for (let i = 0; i < 6; i++) {
        const a = (i * Math.PI) / 3,
          r = 10 + progress * 27;
        ctx.fillRect(
          p.x + Math.cos(a) * r - 1.5,
          p.y + Math.sin(a) * r - 1.5,
          3,
          3,
        );
      }
    }
    ctx.font = "bold 13px monospace";
    ctx.textAlign = "center";
    ctx.fillText(
      (p.kind === 2 ? "SQUAD " : p.kind === 1 ? "LINK " : "") + "+" + p.points,
      p.x,
      p.y - 16 - (motion ? progress * 18 : 0),
    );
  }
  ctx.globalAlpha = 1;
}
