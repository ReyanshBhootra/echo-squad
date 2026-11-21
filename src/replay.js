import {
  RULES,
  W,
  H,
  PASS_STEPS,
  createWorld,
  pointAction,
  step,
} from "./sim.js";

export const REPLAY_KEY = "echo-squad-last-replay";
export const MAX_REPLAY_BYTES = 512 * 1024;
export const REPLAY_STEPS = PASS_STEPS * 3;

export function exportReplay(world) {
  if (!world.done) throw Error("Finish the run before exporting its replay.");
  return {
    schema: 1,
    rules: RULES,
    seed: world.seed,
    score: world.score,
    byPass: [...world.byPass],
    tracks: world.tracks.map((track) => track.map(({ x, y }) => ({ x, y }))),
  };
}

export function parseReplay(text) {
  if (typeof text !== "string" || text.length > MAX_REPLAY_BYTES)
    throw Error("Choose a replay smaller than 512 KB.");
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    throw Error("That file is not valid replay JSON.");
  }
  if (!data || data.schema !== 1 || data.rules !== RULES)
    throw Error(
      "This replay uses different game rules. Choose an echo-0.2-precision replay.",
    );
  if (!Number.isInteger(data.seed) || data.seed < 0 || data.seed > 0xffffffff)
    throw Error("The replay has an invalid arena seed.");
  if (
    !Number.isInteger(data.score) ||
    data.score < 0 ||
    !Array.isArray(data.byPass) ||
    data.byPass.length !== 3 ||
    data.byPass.some((n) => !Number.isInteger(n) || n < 0)
  )
    throw Error("The replay has invalid scores.");
  if (
    !Array.isArray(data.tracks) ||
    data.tracks.length !== 3 ||
    data.tracks.some(
      (track) =>
        !Array.isArray(track) ||
        track.length !== PASS_STEPS ||
        track.some(
          (p) =>
            !p ||
            !Number.isFinite(p.x) ||
            !Number.isFinite(p.y) ||
            p.x < 14 ||
            p.x > W - 14 ||
            p.y < 14 ||
            p.y > H - 14,
        ),
    )
  )
    throw Error("A replay needs three complete routes of 600 arena positions.");
  // Copy only known fields; imported metadata never becomes HTML or game state.
  return {
    schema: 1,
    rules: RULES,
    seed: data.seed,
    score: data.score,
    byPass: [...data.byPass],
    tracks: data.tracks.map((track) => track.map(({ x, y }) => ({ x, y }))),
  };
}

export function createReplay(data) {
  const replay = parseReplay(JSON.stringify(data));
  const snapshots = [];
  let world = createWorld(replay.seed);
  const advance = () =>
    step(
      world,
      pointAction(
        replay.tracks[Math.floor(world.total / PASS_STEPS)][
          world.total % PASS_STEPS
        ],
      ),
    );
  snapshots.push(structuredClone(world));
  for (let i = 1; i <= REPLAY_STEPS; i++) {
    advance();
    if (i % 60 === 0) snapshots.push(structuredClone(world));
  }
  if (
    world.score !== replay.score ||
    world.byPass.some((n, i) => n !== replay.byPass[i])
  )
    throw Error(
      "The recorded score does not match these routes. The replay may be modified or incompatible.",
    );
  world = structuredClone(snapshots[0]);
  return {
    replay,
    get world() {
      return world;
    },
    advance() {
      if (!world.done) advance();
      return world;
    },
    seek(tick) {
      if (!Number.isFinite(tick)) throw Error("Choose a valid replay time.");
      const target = Math.max(0, Math.min(REPLAY_STEPS, Math.round(tick)));
      world = structuredClone(snapshots[Math.floor(target / 60)]);
      while (world.total < target) advance();
      return world;
    },
  };
}
