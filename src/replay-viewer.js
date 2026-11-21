import { createWorld, DT, PASS_STEPS } from "./sim.js";
import { draw } from "./render.js";
import {
  parseReplay,
  createReplay,
  REPLAY_KEY,
  MAX_REPLAY_BYTES,
  REPLAY_STEPS,
} from "./replay.js";

const $ = (id) => document.getElementById(id);
const canvas = $("replay-canvas"),
  ctx = canvas.getContext("2d");
let replay = null,
  playing = false,
  previous = 0,
  accumulator = 0;
const formatTime = (tick) =>
  `${String(Math.floor(tick / 30 / 60)).padStart(2, "0")}:${String(Math.floor(tick / 30) % 60).padStart(2, "0")}`;
function paint() {
  draw(ctx, replay ? replay.world : createWorld(), {
    preview: !replay,
    playerLabel: "PLAYER",
  });
  if (!replay) return;
  const world = replay.world;
  $("replay-timeline").value = world.total;
  $("replay-timeline").setAttribute(
    "aria-valuetext",
    `${(world.total / 30).toFixed(2)} seconds, pass ${Math.min(world.phase + 1, 3)}`,
  );
  $("replay-time").textContent = `${formatTime(world.total)} / 01:00`;
  $("replay-score").textContent = String(world.score).padStart(5, "0");
  $("replay-pass").textContent = world.done
    ? "RUN COMPLETE"
    : `PASS 0${world.phase + 1} / ${["SOLO", "LINK", "SQUAD"][world.phase]}`;
  document
    .querySelectorAll("[data-seek]")
    .forEach((b) =>
      b.setAttribute(
        "aria-current",
        String(
          Math.floor(Number(b.dataset.seek) / PASS_STEPS) ===
            Math.min(world.phase, 2),
        ),
      ),
    );
  $("replay-toggle").textContent = playing
    ? "Pause replay"
    : world.done
      ? "Watch again"
      : "Play replay";
}
function setPlaying(value) {
  playing = value;
  accumulator = 0;
  paint();
}
function load(text) {
  const next = createReplay(parseReplay(text));
  replay = next;
  playing = false;
  accumulator = 0;
  $("replay-error").textContent = "";
  for (const id of ["replay-toggle", "replay-speed", "replay-timeline"])
    $(id).disabled = false;
  document.querySelectorAll("[data-seek]").forEach((b) => (b.disabled = false));
  replay.replay.byPass.forEach(
    (n, i) => ($("pass-score-" + i).textContent = n.toLocaleString("en-US")),
  );
  $("replay-summary").textContent =
    `${replay.replay.score.toLocaleString("en-US")} points across three passes. Arena ${replay.replay.seed}. Recalculated score matches the file.`;
  paint();
}
$("replay-file").onchange = async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  setPlaying(false);
  try {
    if (file.size > MAX_REPLAY_BYTES)
      throw Error("Choose a replay smaller than 512 KB.");
    load(await file.text());
  } catch (err) {
    $("replay-error").textContent = err.message;
  }
  e.target.value = "";
};
$("replay-example").onclick = async () => {
  setPlaying(false);
  $("replay-example").disabled = true;
  try {
    const response = await fetch("./research/neural-example.json");
    if (!response.ok)
      throw Error(
        "The neural example is unavailable. Try a local replay file.",
      );
    load(await response.text());
    $("replay-summary").textContent =
      "Neural controller example. " + $("replay-summary").textContent;
  } catch (err) {
    $("replay-error").textContent = err.message;
  } finally {
    $("replay-example").disabled = false;
  }
};
$("replay-toggle").onclick = () => {
  if (!replay) return;
  if (replay.world.done) replay.seek(0);
  setPlaying(!playing);
};
$("replay-timeline").oninput = (e) => {
  if (!replay) return;
  playing = false;
  accumulator = 0;
  replay.seek(Number(e.target.value));
  paint();
};
document.querySelectorAll("[data-seek]").forEach(
  (b) =>
    (b.onclick = () => {
      if (!replay) return;
      replay.seek(Number(b.dataset.seek));
      setPlaying(false);
    }),
);
document.addEventListener("keydown", (e) => {
  if (
    e.code !== "Space" ||
    e.target.closest("input,select,button,a") ||
    !replay
  )
    return;
  e.preventDefault();
  $("replay-toggle").click();
});
document.addEventListener("visibilitychange", () => {
  if (document.hidden) setPlaying(false);
});
window.addEventListener("blur", () => setPlaying(false));
window.addEventListener("resize", paint);
function frame(now) {
  const elapsed = previous ? Math.min((now - previous) / 1000, 0.12) : 0;
  previous = now;
  if (playing && replay) {
    accumulator += elapsed * Number($("replay-speed").value);
    while (accumulator >= DT && replay.world.total < REPLAY_STEPS) {
      replay.advance();
      accumulator -= DT;
    }
    if (replay.world.done) playing = false;
    paint();
  }
  requestAnimationFrame(frame);
}
paint();
try {
  const saved = sessionStorage.getItem(REPLAY_KEY);
  if (saved) load(saved);
} catch (err) {
  $("replay-error").textContent =
    `Could not open the last run. ${err.message} You can choose a downloaded file instead.`;
}
requestAnimationFrame(frame);
if ("serviceWorker" in navigator)
  navigator.serviceWorker.register("./sw.js").catch(() => {});
