import {
  createHeist,
  stepHeist,
  exportHeist,
  replayHeist,
  heistObjective,
  HSTEP,
  HZ,
  PASS_TICKS,
  MAX_TICKS,
  HEIST_RULES,
} from "./heist-sim.js";
import { download, localDate } from "./storage.js";
import {
  cash,
  heistRank,
  missionTarget,
  drawRadar,
  crewName,
  escapeSeconds,
} from "./heist-guide.js";

const $ = (id) => document.getElementById(id),
  canvas = $("district");
const reduce = matchMedia("(prefers-reduced-motion: reduce)");
const keys = new Set(),
  touchKeys = new Map();
let mode = "boot",
  resumeMode = "playing",
  world = createHeist(),
  view = null,
  last = 0,
  accumulator = 0,
  phaseHold = 0,
  endDelay = 0,
  dashQueued = false;
let lastRun = null,
  isReplay = false,
  saved = false,
  noticeUntil = 0,
  broadcastAt = 0,
  sound = false,
  audio = null;
let alarmAt = 0,
  jumpQueued = false,
  previousCrew = null;
let lastInput = Date.now();
let preference = "on";
try {
  preference = localStorage.getItem("echo-squad-effects") || "on";
} catch {}
let effects = preference !== "quiet" && !reduce.matches;
const SCORE_KEY = `${HEIST_RULES}-scores`,
  format = cash;
const station =
  typeof BroadcastChannel !== "undefined"
    ? new BroadcastChannel("echo-squad-station")
    : null;
function rows() {
  try {
    const data = JSON.parse(localStorage.getItem(SCORE_KEY) || "[]");
    return Array.isArray(data)
      ? data
          .filter(
            (r) =>
              r &&
              typeof r.name === "string" &&
              Number.isFinite(r.score) &&
              r.rules === HEIST_RULES,
          )
          .slice(0, 100)
      : [];
  } catch {
    return [];
  }
}
function setEffects(value, remember = false) {
  if (remember) {
    preference = value ? "on" : "quiet";
    try {
      localStorage.setItem("echo-squad-effects", preference);
    } catch {}
  }
  effects = value && !reduce.matches;
  $("quality").textContent = effects ? "Effects on" : "Effects quiet";
  $("quality").setAttribute("aria-pressed", String(effects));
  $("pause-quality").textContent = effects
    ? "Switch to quiet effects"
    : "Switch effects on";
  view?.setQuality(effects);
}
$("quality").onclick = () => setEffects(!effects, true);
$("pause-quality").onclick = () => setEffects(!effects, true);
reduce.addEventListener("change", () => setEffects(preference !== "quiet"));
setEffects(effects);
function tone(type) {
  if (!sound) return;
  try {
    audio ??= new AudioContext();
    audio.resume();
    const notes = {
      cell: [660],
      relay: [220, 330],
      vault: [130.81, 164.81, 196],
      damage: [90],
      escape: [523.25, 659.25, 783.99],
      alarm: [220, 330],
    }[type];
    if (!notes) return;
    notes.forEach((frequency, i) => {
      const oscillator = audio.createOscillator(),
        gain = audio.createGain(),
        start = audio.currentTime + i * 0.035,
        length = ["vault", "escape", "alarm"].includes(type) ? 0.55 : 0.15;
      oscillator.type = ["damage", "alarm"].includes(type)
        ? "triangle"
        : "sine";
      oscillator.frequency.setValueAtTime(frequency, start);
      oscillator.frequency.exponentialRampToValueAtTime(
        frequency * (type === "damage" ? 0.45 : 1.3),
        start + length,
      );
      gain.gain.setValueAtTime(0.028 / notes.length, start);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + length);
      oscillator.connect(gain);
      gain.connect(audio.destination);
      oscillator.start(start);
      oscillator.stop(start + length + 0.02);
    });
  } catch {
    sound = false;
    $("audio").textContent = "Sound unavailable";
  }
}
$("audio").onclick = () => {
  sound = !sound;
  $("audio").textContent = sound ? "Sound on" : "Sound off";
  $("audio").setAttribute("aria-pressed", String(sound));
  if (sound) tone("cell");
};
function notify(text, seconds = 1.2) {
  $("notice").textContent = text;
  $("notice").hidden = false;
  noticeUntil = performance.now() + seconds * 1000;
  if (effects)
    $("notice").animate(
      [
        { opacity: 0, transform: "translate(-50%,-40%) scale(.96)" },
        { opacity: 1, transform: "translate(-50%,-50%) scale(1)" },
      ],
      { duration: 180, easing: "cubic-bezier(.23,1,.32,1)" },
    );
}
function processEvents() {
  let soundEvent = null;
  for (const e of world.events) {
    if (e.points) reward(e);
    if (e.type === "cash") {
      soundEvent ??= "cell";
      const entry = document.createElement("li");
      entry.textContent = `${crewName(e.actor)} grabbed +${cash(e.points)}`;
      entry.dataset.actor = e.actor;
      $("crew-feed").prepend(entry);
      while ($("crew-feed").children.length > 3)
        $("crew-feed").lastElementChild.remove();
    }
    if (e.type === "cell") {
      if (world.cellsTaken <= 3) notify(`KEYCARD ${world.cellsTaken} / 3`, 0.6);
      soundEvent ??= "cell";
    }
    if (e.type === "relay") {
      notify("RELAY DOWN · +$350", 0.9);
      soundEvent = "relay";
    }
    if (e.type === "damage") {
      notify("ARMOR HIT", 0.55);
      soundEvent = "damage";
    }
    if (e.type === "vault") {
      notify("+$1,200. REACH THE AIRLOCK.", 2);
      soundEvent = "vault";
    }
    if (e.type === "alarm") {
      notify(`ALARM. AIRLOCK CLOSES IN ${escapeSeconds(world)} SECONDS.`, 1.4);
      alarmAt = 0;
    }
    if (e.type === "van-left") notify("AIRLOCK SEALED.", 1);
    if (e.type === "escape") {
      notify("CREW CLEAR", 1);
      soundEvent = "escape";
    }
    if (e.type === "phase") {
      phaseHold = 1.5;
      accumulator = 0;
      jumpQueued = false;
      keys.clear();
      touchKeys.clear();
      dashQueued = false;
      notify(
        world.phase === 1
          ? "ECHO 01 ONLINE. MAKE THE LINK."
          : "FULL CREW. CRACK THE VAULT.",
        1.5,
      );
    }
  }
  if (soundEvent) tone(soundEvent);
}
function showGame() {
  $("radar-panel").hidden = false;
  $("cash-feedback").replaceChildren();
  $("crew-feed").replaceChildren();
  $("crew-panel").hidden = false;
  $("brief").hidden = true;
  $("end").hidden = true;
  $("pause-menu").hidden = true;
  $("hud").hidden = false;
  $("loadout").hidden = false;
  $("objective").hidden = false;
  $("touch-controls").hidden = false;
  document.body.classList.add("in-mission", "playing");
  canvas.focus({ preventScroll: true });
}
function start() {
  lastInput = Date.now();
  world = createHeist();
  isReplay = false;
  saved = false;
  mode = "playing";
  view?.resetCamera();
  previousCrew = null;
  jumpQueued = false;
  phaseHold = 0;
  accumulator = 0;
  noticeUntil = 0;
  jumpQueued = false;
  keys.clear();
  touchKeys.clear();
  dashQueued = false;
  $("notice").hidden = true;
  $("callsign").value = "";
  $("save-status").textContent = "";
  showGame();
  update();
}
$("begin").onclick = start;
$("retry").onclick = start;
function lobby() {
  world = createHeist();
  mode = "lobby";
  phaseHold = 0;
  jumpQueued = false;
  keys.clear();
  touchKeys.clear();
  accumulator = 0;
  document.body.classList.remove("in-mission", "playing");
  for (const id of [
    "hud",
    "objective",
    "loadout",
    "end",
    "pause-menu",
    "notice",
    "touch-controls",
  ])
    $(id).hidden = true;
  $("brief").hidden = false;
  $("radar-panel").hidden = true;
  $("crew-panel").hidden = true;
  $("alarm-banner").hidden = true;
  document.body.classList.remove("alarm-active");
  $("target-marker").hidden = true;
  $("cash-feedback").replaceChildren();
  $("personal-best").textContent = rows().length
    ? `STATION BEST ${cash(rows()[0].score)}`
    : "CHASE A $10,000 GETAWAY";
  $("begin").focus({ preventScroll: true });
}
$("lobby").onclick = lobby;
$("quit").onclick = lobby;
function pause() {
  if (!["playing", "replay"].includes(mode)) return;
  lastInput = Date.now();
  resumeMode = mode;
  mode = "paused";
  jumpQueued = false;
  keys.clear();
  touchKeys.clear();
  dashQueued = false;
  $("pause-menu").hidden = false;
  $("notice").hidden = true;
  document.body.classList.remove("playing");
  $("resume").focus({ preventScroll: true });
}
function resume() {
  if (mode !== "paused") return;
  lastInput = Date.now();
  mode = resumeMode;
  accumulator = 0;
  $("pause-menu").hidden = true;
  document.body.classList.add("playing");
  canvas.focus({ preventScroll: true });
}
$("pause").onclick = pause;
$("resume").onclick = resume;
function finish() {
  if (!isReplay) lastRun = exportHeist(world);
  mode = "ending";
  endDelay = 0.9;
  jumpQueued = false;
  keys.clear();
  touchKeys.clear();
  document.body.classList.remove("playing");
}
function showResults() {
  lastInput = Date.now();
  mode = "results";
  $("end").hidden = false;
  $("notice").hidden = true;
  $("record-form").hidden = isReplay || saved;
  $("end-label").textContent = isReplay
    ? "RECORDED MISSION"
    : world.outcome === "escaped"
      ? "MISSION COMPLETE"
      : "MISSION FAILED";
  $("end-title").textContent =
    world.outcome === "escaped"
      ? "Crew clear."
      : world.outcome === "caught"
        ? "Caught in the act."
        : world.outcome === "van-left"
          ? "The airlock sealed."
          : "Lockdown.";
  $("end-score").textContent = format(world.score);
  $("end-summary").textContent =
    `${heistRank(world)} · ${world.lootTaken} cash bags (${cash(world.lootCash)}) · echoes earned ${cash(world.crewCash[1] + world.crewCash[2])} · ${world.stats.hits} armor hits`;
  $("end-tip").textContent =
    world.outcome === "escaped"
      ? "Your past selves pulled it off. Try a faster, cleaner escape."
      : world.outcome === "van-left"
        ? "When the alarm starts, head straight to the airlock. Follow green and save a dash for pursuit fire."
        : world.cellsTaken < 3
          ? "Follow the blue KEYCARD marker. Get three cards, grab green cash bags, and keep moving."
          : world.stats.links < 2
            ? "Next run: put your first route on one side, then sweep your link across the pink relays."
            : !world.vaultOpen
              ? "Next run: record opposite routes so your final triangle can surround the gold vault."
              : "The exit was open. Save a dash for the last run to the extraction airlock.";
  $("retry").focus({ preventScroll: true });
}
$("watch").onclick = () => {
  if (!lastRun) return;
  try {
    replayHeist(lastRun);
  } catch (err) {
    $("save-status").textContent = err.message;
    return;
  }
  world = createHeist(lastRun.seed, lastRun.rules);
  mode = "replay";
  isReplay = true;
  phaseHold = 0;
  accumulator = 0;
  jumpQueued = false;
  keys.clear();
  dashQueued = false;
  showGame();
  notify("YOUR RECORDED CREW", 1);
  update();
};
$("export").onclick = () => {
  if (lastRun) download("echo-heist-replay.json", JSON.stringify(lastRun));
};
$("record-form").onsubmit = (e) => {
  e.preventDefault();
  if (saved || isReplay || mode !== "results") return;
  const name = $("callsign").value.trim();
  if (!name) return;
  try {
    const scores = rows();
    scores.push({
      name,
      score: world.score,
      outcome: world.outcome,
      seed: world.seed,
      day: localDate(),
      date: new Date().toISOString(),
      rules: HEIST_RULES,
      mode: "heist",
    });
    scores.sort((a, b) => b.score - a.score);
    localStorage.setItem(SCORE_KEY, JSON.stringify(scores.slice(0, 100)));
    saved = true;
    $("record-form").hidden = true;
    $("save-status").textContent =
      "Saved on this station. The next crew has a score to beat.";
  } catch {
    $("save-status").textContent =
      "Station storage is unavailable. Download your replay to keep the run.";
  }
};
$("callsign").addEventListener("input", () => (lastInput = Date.now()));
$("spectator").onclick = () =>
  window.open("./spectator.html", "echo-squad-spectator", "noopener");
function action() {
  const held = (key) => keys.has(key) || [...touchKeys.values()].includes(key);
  const a = {
    x:
      (held("d") || held("ArrowRight") ? 1 : 0) -
      (held("a") || held("ArrowLeft") ? 1 : 0),
    z:
      (held("s") || held("ArrowDown") ? 1 : 0) -
      (held("w") || held("ArrowUp") ? 1 : 0),
    dash: dashQueued,
    jump: jumpQueued,
  };
  if (a.x || a.z || a.dash) lastInput = Date.now();
  dashQueued = false;
  jumpQueued = false;
  return { ...a, ...(view?.movement(a.x, a.z) || {}) };
}
function toggleCamera() {
  if (!view) return;
  const raised = !view.getOverview();
  view.setOverview(raised);
  $("camera-mode").textContent = raised ? "View: deck [V]" : "View: crew [V]";
  $("camera-mode").setAttribute("aria-pressed", String(raised));
  lastInput = Date.now();
}
$("camera-mode").onclick = toggleCamera;
let cameraDrag = null;
canvas.addEventListener("pointerdown", (e) => {
  if (!["playing", "replay", "paused"].includes(mode) || e.button !== 0) return;
  cameraDrag = { id: e.pointerId, x: e.clientX };
  canvas.setPointerCapture(e.pointerId);
  canvas.classList.add("looking");
  lastInput = Date.now();
});
canvas.addEventListener("pointermove", (e) => {
  if (!cameraDrag || e.pointerId !== cameraDrag.id) return;
  view?.turnCamera((cameraDrag.x - e.clientX) * 0.006);
  cameraDrag.x = e.clientX;
  lastInput = Date.now();
});
function endCameraDrag() {
  cameraDrag = null;
  canvas.classList.remove("looking");
}
canvas.addEventListener("pointerup", endCameraDrag);
canvas.addEventListener("pointercancel", endCameraDrag);
canvas.addEventListener("lostpointercapture", endCameraDrag);
window.addEventListener("blur", endCameraDrag);
document.addEventListener("keydown", (e) => {
  if (e.target.closest("input,textarea,select")) return;
  if (e.key === " " && e.target.closest("button,a")) return;
  if (e.key === "Escape") {
    e.preventDefault();
    mode === "paused" ? resume() : pause();
    return;
  }
  if (e.key.toLowerCase() === "v" && !e.repeat) {
    e.preventDefault();
    toggleCamera();
    return;
  }
  if (mode !== "playing") return;
  const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
  if (
    [
      "w",
      "a",
      "s",
      "d",
      "q",
      "e",
      "j",
      "ArrowUp",
      "ArrowDown",
      "ArrowLeft",
      "ArrowRight",
      " ",
    ].includes(key)
  ) {
    e.preventDefault();
    if (key === "j") {
      if (!e.repeat) jumpQueued = true;
    } else if (key === " ") {
      if (!e.repeat) dashQueued = true;
    } else keys.add(key);
  }
});
document.addEventListener("keyup", (e) =>
  keys.delete(e.key.length === 1 ? e.key.toLowerCase() : e.key),
);
document.querySelectorAll("[data-key]").forEach((button) => {
  button.onpointerdown = (e) => {
    e.preventDefault();
    button.setPointerCapture(e.pointerId);
    touchKeys.set(e.pointerId, button.dataset.key);
  };
  button.onpointerup = button.onpointercancel = (e) =>
    touchKeys.delete(e.pointerId);
  button.onlostpointercapture = (e) => touchKeys.delete(e.pointerId);
});
$("touch-dash").onpointerdown = (e) => {
  e.preventDefault();
  if (mode === "playing") dashQueued = true;
};
document.addEventListener("visibilitychange", () => {
  if (document.hidden) pause();
});
window.addEventListener("blur", pause);
canvas.addEventListener("webglcontextlost", (e) => {
  e.preventDefault();
  pause();
  mode = "error";
  $("pause-menu").hidden = true;
  $("graphics-error").hidden = false;
  $("error-message").textContent =
    "Graphics context was lost. Choose Retry 3D to reload the station.";
});
$("reload").onclick = () => location.reload();
function update() {
  const titles = ["SCOUT / PASS 01", "SYNC / PASS 02", "ESCAPE / PASS 03"];
  $("pass-label").textContent =
    (isReplay ? "REPLAY · " : "") + titles[world.phase];
  $("mission").textContent = world.vaultOpen
    ? "Get to the extraction airlock."
    : world.cellsTaken < 3
      ? "Grab 3 keycards. Take the cash."
      : world.phase === 0
        ? "Grab cash. Record your crew."
        : world.relays.some((r) => !r.open)
          ? "Break both relay shields with your link."
          : world.phase === 1
            ? "Relays down. Keep taking cash."
            : "Surround the vault. Take $1,200.";
  $("time").textContent = String(
    Math.max(0, Math.ceil((MAX_TICKS - world.total) / HZ)),
  ).padStart(2, "0");
  $("loot").textContent = format(world.score);
  $("armor").textContent = `${world.health} / 6`;
  $("cells").textContent = `KEYCARDS ${Math.min(3, world.cellsTaken)} / 3`;
  const chasing = world.escapeDeadline !== null && !world.done,
    heat = chasing ? 5 : world.phase + 1;
  $("heat").textContent = "★".repeat(heat) + "☆".repeat(5 - heat);
  $("heat").setAttribute("aria-label", `Security intensity ${heat} of 5`);
  $("health-fill").style.transform = `scaleX(${world.health / 6})`;
  $("take-goal").textContent =
    world.score >= 10000 ? "$10K TARGET REACHED" : "TARGET $10,000";
  $("haul-fill").style.transform =
    `scaleX(${Math.min(1, world.score / 10000)})`;
  drawRadar($("radar"), world);
  $("relays").textContent = `RELAYS ${world.stats.links} / 2`;
  $("vault").textContent = world.vaultOpen
    ? "VAULT OPEN"
    : world.phase === 2
      ? `EMP ${Math.min(100, Math.round((world.vaultCharge / 36) * 100))}%`
      : "VAULT LOCKED";
  $("dash").textContent = world.player.cooldown
    ? `DASH ${(world.player.cooldown / HZ).toFixed(1)}s`
    : "DASH READY";
  $("objective-copy").textContent = heistObjective(world)
    .replaceAll("The van left.", "The airlock sealed.")
    .replaceAll("Green bags add cash.", "Green salvage adds cash.")
    .replaceAll("green cash bags", "green salvage")
    .replaceAll("green van", "extraction airlock");
  $("objective-timer").textContent = world.done
    ? "MISSION ENDED"
    : chasing
      ? `AIRLOCK CLOSES IN ${escapeSeconds(world)}s · SPACE TO DASH`
      : `${world.phase < 2 ? "NEXT ECHO" : "LOCKDOWN"} IN ${Math.ceil((PASS_TICKS - world.tick) / HZ)}s`;
  $("pass-fill").style.transform =
    `scaleX(${Math.min(1, world.tick / PASS_TICKS)})`;
  document.body.classList.toggle("alarm-active", chasing);
  $("alarm-banner").hidden = !chasing;
  $("alarm-seconds").textContent = chasing ? `${escapeSeconds(world)}s` : "";
  $("echo-earned").textContent = cash(world.crewCash[1] + world.crewCash[2]);
  $("crew-empty").hidden = $("crew-feed").children.length > 0;
}
function reward(event) {
  if (!view) return;
  const point = view.project(event.x, event.z, 2);
  if (!point.visible) return;
  const label = document.createElement("span");
  label.className = "cash-pop" + (effects ? "" : " quiet");
  label.textContent =
    (event.type === "cash" && event.actor > 0
      ? crewName(event.actor) + " "
      : "") +
    "+" +
    cash(event.points);
  label.style.left = `${point.x}px`;
  label.style.top = `${point.y}px`;
  $("cash-feedback").append(label);
  setTimeout(() => label.remove(), 1000);
}
function updateTarget() {
  const marker = $("target-marker");
  const target =
    ["playing", "replay"].includes(mode) && phaseHold === 0
      ? missionTarget(world)
      : null;
  const point = target && view?.project(target.x, target.z, 2.8);
  marker.hidden = !point?.visible;
  const bearing = $("target-bearing");
  bearing.hidden = !target || !!point?.visible;
  if (target && !point?.visible) {
    bearing.textContent = `${target.label} · ${view.bearing(target, world.player)} · V FOR DECK MAP`;
  }
  if (marker.hidden) return;
  marker.style.left = `${point.x}px`;
  marker.style.top = `${point.y}px`;
  marker.style.setProperty("--target", target.color);
  $("target-label").textContent = target.label;
  $("target-detail").textContent = target.detail;
}
function frame(now) {
  const frameEvents = [];
  const elapsed = last ? Math.min((now - last) / 1000, 0.1) : 0;
  last = now;
  if (["playing", "replay"].includes(mode)) {
    if (mode === "playing" && !phaseHold) {
      const turning = (keys.has("q") ? 1 : 0) - (keys.has("e") ? 1 : 0);
      if (turning) {
        view?.turnCamera(turning * elapsed * 1.8);
        lastInput = Date.now();
      }
    }
    if (phaseHold > 0) {
      phaseHold = Math.max(0, phaseHold - elapsed);
      accumulator = 0;
    } else {
      accumulator += elapsed;
      while (accumulator >= HSTEP && ["playing", "replay"].includes(mode)) {
        accumulator -= HSTEP;
        previousCrew = [world.player, ...world.ghosts].map((p) => ({ ...p }));
        const previousPhase = world.phase;
        stepHeist(world, isReplay ? lastRun.inputs[world.total] : action());
        if (previousPhase !== world.phase) previousCrew = null;
        frameEvents.push(...world.events);
        processEvents();
        if (world.done) {
          finish();
          break;
        }
        if (phaseHold > 0) break;
      }
    }
  } else accumulator = 0;
  if (mode === "ending") {
    endDelay -= elapsed;
    if (endDelay <= 0) showResults();
  }
  if (noticeUntil && now > noticeUntil) $("notice").hidden = true;
  if (
    mode === "playing" &&
    world.escapeDeadline !== null &&
    !world.done &&
    now - alarmAt > 1300
  ) {
    tone("alarm");
    alarmAt = now;
  }
  if (view && mode !== "error") {
    try {
      view.setLive(mode !== "lobby" && mode !== "boot");
      view.render(world, now / 1000, effects, frameEvents, {
        previous: previousCrew,
        alpha:
          ["playing", "replay"].includes(mode) && !phaseHold
            ? accumulator / HSTEP
            : 1,
      });
      updateTarget();
    } catch (err) {
      mode = "error";
      $("graphics-error").hidden = false;
      $("error-message").textContent = err.message;
    }
  }
  if (["playing", "replay", "paused", "ending", "results"].includes(mode))
    update();
  if (now - broadcastAt > 250) {
    station?.postMessage({
      kind: "live",
      game: "heist",
      state: mode === "replay" ? "watching" : mode,
      phase: world.phase,
      score: world.score,
      seconds: Math.max(0, Math.ceil((MAX_TICKS - world.total) / HZ)),
      rows: rows(),
    });
    broadcastAt = now;
  }
  if (
    (mode === "playing" && Date.now() - lastInput > 20000) ||
    (["paused", "results"].includes(mode) && Date.now() - lastInput > 60000)
  )
    lobby();
  requestAnimationFrame(frame);
}
window.addEventListener("resize", () => view?.resize());
try {
  const { createStationScene } = await import("./station-scene.js");
  view = createStationScene(canvas);
  view.setQuality(effects);
  mode = "lobby";
  $("begin").disabled = false;
  $("begin").textContent = "Board the station";
  $("personal-best").textContent = rows().length
    ? `STATION BEST ${cash(rows()[0].score)}`
    : "CHASE A $10,000 GETAWAY";
  $("boot-status").textContent =
    "Station ready. Your first echo arrives in 25 seconds.";
  requestAnimationFrame(frame);
} catch (err) {
  $("brief").hidden = true;
  $("graphics-error").hidden = false;
  $("error-message").textContent = err.message;
}
if ("serviceWorker" in navigator)
  navigator.serviceWorker
    .register("./sw.js")
    .then(() => navigator.serviceWorker.ready)
    .then(() => ($("cache-status").textContent = "Offline cache ready"))
    .catch(() => ($("cache-status").textContent = "Online build"));
