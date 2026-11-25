import {
  createHeist,
  stepHeist,
  replayHeist,
  MAX_TICKS,
} from "../../src/heist-sim.js";
import { createHeistScene } from "../../src/heist-scene.js";
const $ = (id) => document.getElementById(id),
  canvas = $("video"),
  ctx = canvas.getContext("2d"),
  source = $("scene");
const run = await fetch("./run.json").then((r) => r.json());
replayHeist(run.replay);
await Promise.all([
  document.fonts.load("40px Display"),
  document.fonts.load("24px Condensed"),
]);
const view = createHeistScene(source);
view.renderer.setPixelRatio(1);
view.resize();
const frames = [];
const state = createHeist(run.replay.seed, run.replay.rules);
function remember() {
  const { tracks, record, inputs, ...snapshot } = state;
  frames.push(structuredClone(snapshot));
}
remember();
for (const input of run.replay.inputs) {
  stepHeist(state, input);
  remember();
}
async function loadImage(url) {
  const image = new Image();
  image.src = url;
  await image.decode();
  return image;
}
const chart = await loadImage("../../research/controller-comparison.png"),
  learning = await loadImage("../../research/learning-curves.png"),
  audit = await loadImage("../../research/jetbrains-audit.jpg");
const money = (n) => "$" + Math.round(n).toLocaleString("en-US");
function text(value, x, y, size = 24, color = "#fff1d8", font = "Condensed") {
  ctx.fillStyle = color;
  ctx.font = `${size}px ${font}`;
  ctx.fillText(value, x, y);
}
function panel(title, lines) {
  ctx.fillStyle = "#07100ee8";
  ctx.fillRect(40, 100, 1200, 530);
  text(title, 74, 170, 42, "#efc957", "Display");
  lines.forEach((s, i) => text(s, 78, 238 + i * 49, 27));
}
function fitted(image, x, y, w, h) {
  const ratio = Math.min(w / image.width, h / image.height);
  ctx.drawImage(
    image,
    x + (w - image.width * ratio) / 2,
    y + (h - image.height * ratio) / 2,
    image.width * ratio,
    image.height * ratio,
  );
}
function frame(time) {
  let tick = 0,
    chapter = "",
    subtitle = "",
    cut = "";
  if (time < 5) {
    tick = Math.min(3248, 3150 + Math.floor(time * 60));
    chapter = "YOUR CREW IS YOU.";
    subtitle =
      "An actual escape from the current game. Every teammate is a recorded past route.";
  } else if (time < 12) {
    chapter = "ECHO HEIST";
    subtitle = "One player. Three passes. Seventy-five seconds of active play.";
  } else if (time < 23) {
    tick = Math.floor((time - 12) * 60);
    chapter = "01 / SCOUT";
    subtitle =
      "Grab three blue keycards, take green cash bags, and record a useful moving route.";
  } else if (time < 31) {
    tick = 1500 + Math.floor((time - 23) * 60);
    chapter = "02 / SYNC";
    cut = "TIME CUT: FIRST PASS COMPLETE";
    subtitle =
      "Your exact first route returns. Sweep the link between you through both relay shields.";
  } else if (time < 41) {
    tick = Math.min(3248, 3000 + Math.floor((time - 31) * 60));
    chapter = "03 / ESCAPE";
    cut = "TIME CUT: SECOND PASS COMPLETE";
    subtitle =
      "Surround the vault with your triangle. The alarm starts a nine-second getaway window.";
  } else {
    tick = 3248;
    chapter =
      time < 50
        ? "EVERY RUN CAN BE RECONSTRUCTED"
        : time < 65
          ? "CLASSIC / NEURAL EXPERIMENT"
          : time < 78
            ? "SAVED EVIDENCE, INCLUDING FAILURES"
            : time < 88
              ? "ACTUAL JETBRAINS WORKFLOW"
              : "ONE PLAYER. A WHOLE CREW.";
  }
  const s = frames[Math.min(tick, frames.length - 1)];
  view.render(s, time, true, []);
  ctx.drawImage(source, 0, 0, 1280, 720);
  ctx.fillStyle = "#07100dcf";
  ctx.fillRect(0, 0, 1280, 80);
  text("ECHO SQUAD / " + chapter, 26, 36, 23, "#efc957");
  text(
    "SCRIPTED ENGINE REPLAY • EDITED TIME CUTS • NOT A HUMAN PLAYTEST",
    26,
    62,
    15,
    "#c6d6c9",
  );
  if (time < 41) {
    text(money(s.score), 1080, 40, 34, "#a1e890");
    text(`${Math.ceil((MAX_TICKS - s.total) / 60)}s TO LOCKDOWN`, 1050, 66, 16);
    if (cut) text(cut, 30, 111, 18, "#efc957");
    ctx.fillStyle = "#07100de8";
    ctx.fillRect(0, 625, 1280, 95);
    text(subtitle, 28, 665, 24);
    text(
      "WASD / ARROWS: MOVE     SPACE: DASH     ESC: PAUSE",
      28,
      699,
      16,
      "#a1e890",
    );
  }
  if (time >= 5 && time < 12)
    panel("ECHO HEIST", [
      "Your getaway crew is you, from twenty-five seconds ago.",
      "Direct keyboard movement. Fixed camera. Quiet effects. Optional sound.",
      "Built for one-player, local-score event stations.",
    ]);
  if (time >= 41 && time < 50)
    panel("CREW CLEAR · " + money(s.score), [
      `${run.metadata.ticks.toLocaleString()} input ticks reconstruct this completed mission.`,
      `${s.stats.links} relay shields broken. ${s.health} armor remaining.`,
      `Recorded echoes earned ${money(s.crewCash[1] + s.crewCash[2])} from cash bags.`,
      "Export validates rules and score. Watch this run replays your own crew.",
    ]);
  if (time >= 50 && time < 65) {
    ctx.fillStyle = "#f5f1e7";
    ctx.fillRect(24, 98, 1232, 500);
    fitted(chart, 40, 110, 850, 470);
    text("SEPARATE CLASSIC GAME", 910, 150, 22, "#182d2d");
    text("610 parameters", 910, 203, 26, "#182d2d");
    text("28,800 synthetic examples", 910, 249, 23, "#182d2d");
    text("24 held-out layouts", 910, 295, 23, "#182d2d");
    text("Supervised target selection", 910, 341, 22, "#182d2d");
    text("Engineered planner supplies targets", 910, 385, 18, "#182d2d");
    text("NOT the Heist controller", 910, 448, 23, "#8b413b");
    text(
      "Classic experiment results do not establish human enjoyment or performance on Heist.",
      28,
      657,
      24,
    );
  }
  if (time >= 65 && time < 78) {
    ctx.fillStyle = "#f5f1e7";
    ctx.fillRect(24, 98, 1232, 500);
    fitted(learning, 40, 110, 800, 470);
    text("Weights, raw CSV and scripts", 865, 170, 26, "#182d2d");
    text("Three independent training runs", 865, 223, 23, "#182d2d");
    text("Separate train / validation / test", 865, 268, 22, "#182d2d");
    text("Earlier failed experiments retained", 865, 320, 22, "#182d2d");
    text("Random sweeping exposed a", 865, 385, 22, "#182d2d");
    text("scoring exploit; contact rules changed.", 865, 425, 20, "#182d2d");
    text(
      "Higher bot scores do not prove a better game. Newcomer enjoyment still needs testing.",
      28,
      657,
      24,
    );
  }
  if (time >= 78 && time < 88) {
    ctx.fillStyle = "#07100eec";
    ctx.fillRect(24, 98, 1232, 500);
    fitted(audit, 40, 110, 790, 470);
    text("PYCHARM COMMUNITY 2024.3", 850, 170, 24, "#efc957");
    text("Experiment 001 evidence audit", 850, 226, 23);
    text("November 19, 2026", 850, 271, 22);
    text("Most implementation: Codex + CLI", 850, 337, 22);
    text("No Junie or Air usage claimed", 850, 389, 22);
    text("Exact scope: JETBRAINS.md", 850, 452, 22);
    text(
      "This is the actual saved audit screenshot, not staged footage of current IDE work.",
      28,
      657,
      24,
    );
  }
  if (time >= 88)
    panel("YOUR PAST SELF IS YOUR TEAMMATE.", [
      "Play: echo-squad-after-hours.alkalibutterfly8.chatgpt.site",
      "Source: github.com/ReyanshBhootra/echo-squad",
      "Original district and assets. MIT source. Public experiment evidence.",
      "Cloud9 × JetBrains hackathon · Event Mini Game",
    ]);
  text(
    `BUILD 0.8.0 · ${Math.min(100, Math.floor(time))} / 100s`,
    1020,
    710,
    14,
    "#bdcebf",
  );
}
frame(0);
$("record").disabled = false;
$("record").textContent = "Record 100-second demo";
$("status").textContent = "Validated replay ready. Real scene rendered.";
$("record").onclick = async () => {
  $("record").disabled = true;
  const mime = ["video/mp4", "video/webm;codecs=vp9", "video/webm"].find(
    (type) => MediaRecorder.isTypeSupported(type),
  );
  const stream = canvas.captureStream(30),
    recorder = new MediaRecorder(stream, {
      mimeType: mime,
      videoBitsPerSecond: 6000000,
    }),
    chunks = [];
  recorder.ondataavailable = (e) => {
    if (e.data.size) chunks.push(e.data);
  };
  const finished = new Promise((resolve) => (recorder.onstop = resolve));
  recorder.start(1000);
  const start = performance.now();
  let count = 0;
  await new Promise((resolve) => {
    function next(now) {
      const elapsed = (now - start) / 1000;
      frame(Math.min(99.999, elapsed));
      count++;
      $("status").textContent =
        `Recording ${Math.min(100, Math.floor(elapsed))}/100s · ${count} frames`;
      if (elapsed >= 100) {
        recorder.stop();
        resolve();
      } else requestAnimationFrame(next);
    }
    requestAnimationFrame(next);
  });
  await finished;
  stream.getTracks().forEach((t) => t.stop());
  const type = mime.startsWith("video/mp4") ? "video/mp4" : "video/webm",
    blob = new Blob(chunks, { type });
  const saved = await fetch("/__studio/save", {
    method: "POST",
    headers: { "Content-Type": type },
    body: blob,
  }).then((r) => r.json());
  const metadata = {
    ...run.metadata,
    seconds: (performance.now() - start) / 1000,
    frames: count,
    mime,
    bytes: blob.size,
    silentCaptionedDemo: true,
    edited: true,
    capture:
      "Actual Three.js canvas rendered in Chrome; scripted input replay with caption/evidence chapters",
    file: saved.saved,
  };
  await fetch("/__studio/save", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(metadata, null, 2),
  });
  $("status").textContent =
    `Saved ${saved.saved} (${Math.round(blob.size / 1048576)}MB). Ready for review.`;
  $("review").href = "/" + saved.saved;
  $("review").hidden = false;
};
