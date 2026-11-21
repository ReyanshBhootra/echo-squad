import { createWorld, step, DT, W, H, RULES, pointAction } from "./sim.js";
import { pointerPosition, keyboardAction } from "./controls.js";
import { predict, makeModel } from "./neural.js";
import { draw } from "./render.js";
import { loadScores, saveScore, download, localDate } from "./storage.js";
import { renderLab } from "./lab.js";
import { exportReplay, REPLAY_KEY } from "./replay.js";
const $ = (id) => document.getElementById(id),
  canvas = $("game"),
  ctx = canvas.getContext("2d");
const reduced = matchMedia("(prefers-reduced-motion: reduce)");
const channel =
  typeof BroadcastChannel !== "undefined"
    ? new BroadcastChannel("echo-squad-station")
    : null;
let model = null,
  world = createWorld(9019),
  rival = null,
  mode = "solo",
  state = "idle",
  activeView = "arena",
  last = 0,
  accumulator = 0,
  phaseHold = 0,
  demoModel = null,
  particles = [],
  lastInput = Date.now(),
  boardToday = true,
  saved = false,
  labLoaded = false;
let pointer = { x: W / 2, y: H / 2, active: false },
  mouseInside = false,
  keys = new Set(),
  sound = false,
  audio = null,
  lastBeep = 0;
const formatter = new Intl.NumberFormat("en-US");
function focusMode(on) {
  document.body.classList.toggle("in-run", on);
  document
    .querySelectorAll(
      ".site-header,.site-footer,.skip,.title-row,.manual,.below-arena",
    )
    .forEach((el) => (el.inert = on));
}
fetch("./models/policy.json")
  .then((r) => {
    if (!r.ok) throw Error();
    return r.json();
  })
  .then((m) => {
    if (m.rules !== RULES) throw Error();
    model = m;
    $("rival-mode").disabled = false;
  })
  .catch(() => {
    $("rival-mode").textContent = "Model unavailable";
  });
function beep(kind) {
  if (!sound || performance.now() - lastBeep < 65) return;
  try {
    audio ??= new AudioContext();
    audio.resume();
    const o = audio.createOscillator(),
      g = audio.createGain();
    o.connect(g);
    g.connect(audio.destination);
    o.type = "sine";
    o.frequency.value = [540, 720, 960][kind];
    g.gain.setValueAtTime(0.035, audio.currentTime);
    g.gain.exponentialRampToValueAtTime(0.0001, audio.currentTime + 0.12);
    o.start();
    o.stop(audio.currentTime + 0.13);
    lastBeep = performance.now();
  } catch {
    sound = false;
    $("sound").textContent = "Sound unavailable";
  }
}
function motion(el) {
  if (reduced.matches) return;
  el.animate(
    [
      { opacity: 0, transform: "scale(.97)" },
      { opacity: 1, transform: "scale(1)" },
    ],
    { duration: 200, easing: "cubic-bezier(.23,1,.32,1)" },
  );
}
function showView(name) {
  if (activeView === "arena" && name !== "arena" && state === "playing")
    pause();
  activeView = name;
  document.querySelectorAll(".view").forEach((e) => (e.hidden = e.id !== name));
  document.querySelectorAll("[data-view]").forEach((b) => {
    const active = b.dataset.view === name;
    b.classList.toggle("active", active);
    active
      ? b.setAttribute("aria-current", "page")
      : b.removeAttribute("aria-current");
  });
  if (name === "lab" && !labLoaded) {
    renderLab($("lab-content"), watch);
    labLoaded = true;
  }
  if (name === "scores") renderBoard();
}
document
  .querySelectorAll("[data-view]")
  .forEach((b) => (b.onclick = () => showView(b.dataset.view)));
document
  .querySelectorAll("[data-go]")
  .forEach((b) => (b.onclick = () => showView(b.dataset.go)));
function setMode(next) {
  mode = next;
  for (const [id, v] of [
    ["solo-mode", "solo"],
    ["rival-mode", "rival"],
  ]) {
    $(id).classList.toggle("chosen", next === v);
    $(id).setAttribute("aria-pressed", String(next === v));
  }
}
$("solo-mode").onclick = () => setMode("solo");
$("rival-mode").onclick = () => setMode("rival");
function start() {
  world = createWorld(9019);
  rival = mode === "rival" && model ? createWorld(9019) : null;
  state = "playing";
  saved = false;
  phaseHold = 0;
  particles = [];
  pointer = { x: W / 2, y: H / 2, active: false };
  keys.clear();
  lastInput = Date.now();
  accumulator = 0;
  focusMode(true);
  $("pause").textContent = "Pause ESC";
  for (const id of ["welcome", "results", "pause-panel", "transition"])
    $(id).hidden = true;
  $("stage").classList.add("playing");
  $("pause").disabled = false;
  $("demo-label").hidden = true;
  $("rival-hud").hidden = !rival;
  $("save-form").hidden = false;
  $("save-status").textContent = "";
  $("player-name").value = "";
  canvas.focus({ preventScroll: true });
  updateHud();
  beep(1);
}
$("start").onclick = start;
$("again").onclick = start;
function watch(trained) {
  showView("arena");
  focusMode(true);
  world = createWorld(9019);
  rival = null;
  demoModel = trained ? model : makeModel(42);
  state = "watching";
  phaseHold = 0;
  particles = [];
  accumulator = 0;
  for (const id of ["welcome", "results", "pause-panel", "transition"])
    $(id).hidden = true;
  $("demo-label").hidden = false;
  $("demo-label").textContent = trained
    ? "AI DEMONSTRATION / TRAINED CHECKPOINT"
    : "AI DEMONSTRATION / UNTRAINED CHECKPOINT";
  $("rival-hud").hidden = true;
  $("pause").disabled = false;
  $("pause").textContent = "Back to lobby";
  $("stage").classList.remove("playing");
  canvas.focus({ preventScroll: true });
}
function pause() {
  if (state !== "playing") return;
  state = "paused";
  $("pause-panel").hidden = false;
  canvas.blur();
  keys.clear();
}
function resume() {
  if (state !== "paused") return;
  state = "playing";
  lastInput = Date.now();
  accumulator = 0;
  $("pause-panel").hidden = true;
  canvas.focus({ preventScroll: true });
}
$("pause").onclick = () =>
  state === "watching" || state === "results" ? reset() : pause();
$("resume").onclick = resume;
function reset() {
  focusMode(false);
  state = "idle";
  world = createWorld(9019);
  rival = null;
  phaseHold = 0;
  particles = [];
  for (const id of ["results", "pause-panel", "transition", "rival-hud"])
    $(id).hidden = true;
  $("welcome").hidden = false;
  $("demo-label").hidden = false;
  $("demo-label").textContent = "ARENA PREVIEW / YOUR ROUTES BECOME TEAMMATES";
  $("pause").disabled = true;
  $("pause").textContent = "Pause ESC";
  $("stage").classList.remove("playing");
  updateHud();
  $("start").focus({ preventScroll: true });
}
$("abandon").onclick = reset;
function finish() {
  state = "results";
  $("results").hidden = false;
  $("pause").disabled = false;
  $("pause").textContent = "Back to lobby";
  $("stage").classList.remove("playing");
  $("result-score").textContent = formatter.format(world.score);
  $("result-message").textContent = rival
    ? `Neural squad: ${formatter.format(rival.score)}. ${world.score > rival.score ? "You outplayed the model." : world.score === rival.score ? "A dead heat." : "The model takes this round."}`
    : "One player. Three teammates. Your squad is complete.";
  $("result-split").replaceChildren(
    ...world.byPass.map((v, i) => {
      const span = document.createElement("span");
      span.textContent = ["SOLO", "LINK", "SQUAD"][i];
      const b = document.createElement("b");
      b.textContent = formatter.format(v);
      span.append(b);
      return span;
    }),
  );
  motion($("results"));
  $("player-name").focus({ preventScroll: true });
  lastInput = Date.now();
}
function updateHud() {
  const demo = state === "idle" || state === "watching";
  $("clock").textContent =
    demo && state === "idle"
      ? "60"
      : String(Math.max(0, 60 - Math.floor(world.total / 30))).padStart(2, "0");
  $("score").textContent =
    state === "idle" ? "00000" : String(world.score).padStart(5, "0");
  document
    .querySelectorAll("[data-pass]")
    .forEach((el) =>
      el.classList.toggle(
        "selected",
        Number(el.dataset.pass) === Math.min(2, world.phase),
      ),
    );
  $("state-label").lastChild.textContent =
    {
      idle: " Arena ready",
      playing: " Recording your route",
      paused: " Run paused",
      results: " Run complete",
      watching: " Model replay",
    }[state] || "";
  $("game-hint").textContent =
    state === "idle"
      ? "Move to collect. Come back stronger."
      : [
          "Touch blue sparks. Pause briefly to collect.",
          "Sweep orange diamonds with your link.",
          "Surround gold cores with your squad.",
        ][Math.min(world.phase, 2)];
  if (rival) $("rival-score").textContent = formatter.format(rival.score);
}
function input() {
  let x =
      (keys.has("ArrowRight") || keys.has("d") ? 1 : 0) -
      (keys.has("ArrowLeft") || keys.has("a") ? 1 : 0),
    y =
      (keys.has("ArrowDown") || keys.has("s") ? 1 : 0) -
      (keys.has("ArrowUp") || keys.has("w") ? 1 : 0);
  if (x || y) {
    lastInput = Date.now();
    pointer.active = false;
    return keyboardAction(world.p, x, y);
  }
  return pointAction(pointer.active ? pointer : world.p);
}
function steer(e) {
  mouseInside = e.pointerType === "mouse";
  pointer = {
    ...pointerPosition(e.clientX, e.clientY, canvas.getBoundingClientRect()),
    active: true,
  };
  lastInput = Date.now();
  syncCursor();
}
function syncCursor() {
  const native =
    state === "playing" && phaseHold <= 0 && pointer.active && mouseInside;
  $("stage").classList.toggle("mouse-control", native);
  return native;
}
canvas.addEventListener("pointerleave", () => {
  mouseInside = false;
  syncCursor();
});
canvas.addEventListener("pointermove", (e) => {
  if (e.pointerType === "touch" && e.buttons === 0) return;
  steer(e);
});
canvas.addEventListener("pointerdown", (e) => {
  canvas.setPointerCapture(e.pointerId);
  steer(e);
});
document.addEventListener("keydown", (e) => {
  if (e.target instanceof HTMLInputElement) return;
  if (e.key === "Escape") {
    state === "playing"
      ? pause()
      : state === "paused"
        ? resume()
        : state === "watching"
          ? reset()
          : null;
    return;
  }
  if (
    activeView === "arena" &&
    state === "playing" &&
    [
      "ArrowUp",
      "ArrowDown",
      "ArrowLeft",
      "ArrowRight",
      "w",
      "a",
      "s",
      "d",
    ].includes(e.key)
  ) {
    e.preventDefault();
    keys.add(e.key);
    pointer.active = false;
    syncCursor();
    lastInput = Date.now();
  }
});
document.addEventListener("keyup", (e) => keys.delete(e.key));
document.addEventListener("visibilitychange", () => {
  if (document.hidden) pause();
});
window.addEventListener("blur", () => {
  keys.clear();
  pause();
});
$("sound").onclick = () => {
  sound = !sound;
  $("sound").textContent = sound ? "Sound on" : "Sound off";
  $("sound").setAttribute("aria-pressed", String(sound));
  if (sound) beep(0);
};
$("station").onclick = () =>
  window.open("./spectator.html", "echo-squad-spectator", "noopener");
$("save-form").onsubmit = (e) => {
  e.preventDefault();
  if (saved || state !== "results") return;
  const name = $("player-name").value.trim();
  if (!name) return;
  try {
    saveScore({
      name,
      score: world.score,
      date: new Date().toISOString(),
      day: localDate(),
      seed: world.seed,
      mode,
      rules: RULES,
    });
    saved = true;
    $("save-form").hidden = true;
    $("save-status").textContent =
      "Saved on this device. Your move, next challenger.";
    channel?.postMessage({ kind: "scores", rows: loadScores() });
  } catch {
    $("save-status").textContent =
      "Storage is unavailable. Download your replay to keep this run.";
  }
};
$("player-name").addEventListener("input", () => (lastInput = Date.now()));
$("download-replay").onclick = () =>
  download("echo-squad-replay.json", JSON.stringify(exportReplay(world)));
$("watch-replay").onclick = () => {
  try {
    sessionStorage.setItem(REPLAY_KEY, JSON.stringify(exportReplay(world)));
    location.assign("./replay.html");
  } catch {
    $("save-status").textContent =
      "Replay storage is unavailable. Download your replay and open it in the Replay room.";
  }
};
function renderBoard() {
  const rows = loadScores().filter(
    (r) => r.seed === 9019 && (!boardToday || r.day === localDate()),
  );
  const root = $("scoreboard");
  root.replaceChildren();
  if (!rows.length) {
    const box = document.createElement("div");
    box.className = "empty-board";
    const h = document.createElement("h2");
    h.textContent = "The first move is yours.";
    const p = document.createElement("p");
    p.textContent = "Finish a run and leave your callsign on this device.";
    const b = document.createElement("button");
    b.className = "primary";
    b.textContent = "Enter the arena ↗";
    b.onclick = () => showView("arena");
    box.append(h, p, b);
    root.append(box);
    return;
  }
  const table = document.createElement("table");
  table.className = "scores-table";
  const head = document.createElement("thead");
  head.innerHTML =
    '<tr><th>RANK</th><th>CALLSIGN</th><th>MODE</th><th style="text-align:right">SCORE</th></tr>';
  const body = document.createElement("tbody");
  rows.forEach((r, i) => {
    const tr = document.createElement("tr");
    [
      String(i + 1).padStart(2, "0"),
      r.name,
      r.mode === "rival" ? "Neural challenge" : "Solo run",
      formatter.format(r.score),
    ].forEach((v) => {
      const td = document.createElement("td");
      td.textContent = v;
      tr.append(td);
    });
    body.append(tr);
  });
  table.append(head, body);
  root.append(table);
}
for (const [id, today] of [
  ["today-board", true],
  ["all-board", false],
])
  $(id).onclick = () => {
    boardToday = today;
    $("today-board").classList.toggle("chosen", today);
    $("all-board").classList.toggle("chosen", !today);
    renderBoard();
  };
$("export-scores").onclick = () =>
  download(
    "echo-squad-scores.json",
    JSON.stringify(
      {
        rules: RULES,
        exportedAt: new Date().toISOString(),
        scores: loadScores(),
      },
      null,
      2,
    ),
  );
let broadcastTick = 0;
function frame(now) {
  const elapsed = last ? Math.min((now - last) / 1000, 0.12) : 0;
  last = now;
  if (activeView === "arena") {
    accumulator += elapsed;
    if (phaseHold > 0) {
      phaseHold -= elapsed;
      accumulator = 0;
      if (phaseHold <= 0) $("transition").hidden = true;
    } else
      while (accumulator >= DT) {
        accumulator -= DT;
        if (state === "watching") {
          step(world, safePrediction(demoModel, world));
          if (world.done) {
            world = createWorld(9019);
          }
        }
        if (state === "playing") {
          const phase = world.phase;
          step(world, input());
          if (rival) step(rival, safePrediction(model, rival));
          for (const event of world.events) {
            particles.push({ ...event, age: 0 });
            beep(event.kind);
          }
          if (world.done) {
            finish();
            break;
          }
          if (world.phase !== phase) {
            phaseHold = 2;
            $("transition").hidden = false;
            $("transition-label").textContent =
              world.phase === 1 ? "ECHO 01 ONLINE" : "FULL SQUAD ONLINE";
            $("transition-title").textContent =
              world.phase === 1
                ? "Meet your past self."
                : "Three of you. One team.";
            $("transition-copy").textContent =
              world.phase === 1
                ? "Sweep orange diamonds with the line between you."
                : "Surround gold cores with the triangle you create together.";
            motion($("transition"));
            accumulator = 0;
            break;
          }
        }
      }
    particles = particles
      .map((p) => ({ ...p, age: p.age + elapsed }))
      .filter((p) => p.age < 0.65);
    const nativePointer = syncCursor();
    if (!reduced.matches || state !== "idle" || now % 500 < 30)
      draw(ctx, world, {
        hidePlayer: nativePointer,
        particles,
        preview: state === "idle",
        playerPosition:
          state === "playing" && phaseHold <= 0 && pointer.active
            ? pointer
            : null,
        ghostFraction:
          ["playing", "idle", "watching"].includes(state) && !world.done
            ? accumulator / DT
            : 0,
      });
    updateHud();
  } else accumulator = 0;
  if (state === "playing" && Date.now() - lastInput > 18000) reset();
  if (state === "results" && Date.now() - lastInput > 60000) reset();
  if (now - broadcastTick > 180) {
    channel?.postMessage({
      kind: "live",
      state,
      phase: world.phase,
      score: world.score,
      seconds: Math.max(0, 60 - Math.floor(world.total / 30)),
      rivalScore: rival?.score ?? null,
      rows: loadScores(),
    });
    broadcastTick = now;
  }
  requestAnimationFrame(frame);
}
const safePrediction = (m, s) => (m ? predict(m, s) : [0, 0]);
requestAnimationFrame(frame);
if ("serviceWorker" in navigator) {
  navigator.serviceWorker
    .register("./sw.js")
    .then(() => navigator.serviceWorker.ready)
    .then(() => {
      $("offline-status").textContent = "Offline cache ready";
    })
    .catch(() => {
      $("offline-status").textContent = "Local server mode";
    });
} else $("offline-status").textContent = "Local server mode";
// Observable state for repeatable UI checks; no bypass of scoring or elapsed time.
window.echoSquad = {
  get status() {
    return {
      state,
      phase: world.phase,
      score: world.score,
      total: world.total,
      mode,
      modelLoaded: !!model,
      position: { x: world.p.x, y: world.p.y },
      pointer: pointer.active ? { x: pointer.x, y: pointer.y } : null,
      rules: RULES,
      build: "0.3.0-replay-room",
      nativePointer: $("stage").classList.contains("mouse-control"),
    };
  },
};
