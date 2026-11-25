import { writeFile, mkdir } from "node:fs/promises";
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { scriptedHeist } from "../tests/fixtures/heist-route.mjs";
import { exportHeist, replayHeist } from "../src/heist-sim.js";
const replay = exportHeist(scriptedHeist());
replayHeist(replay);
const directory = new URL("../tools/submission-studio/", import.meta.url);
await mkdir(directory, { recursive: true });
const input = JSON.stringify(replay);
const metadata = {
  kind: "scripted-engine-replay",
  humanPlaytest: false,
  sourceCommit: execFileSync("git", ["rev-parse", "HEAD"], {
    encoding: "utf8",
  }).trim(),
  inputSha256: createHash("sha256").update(input).digest("hex"),
  ticks: replay.inputs.length,
  score: replay.score,
  rules: replay.rules,
};
await writeFile(
  new URL("run.json", directory),
  JSON.stringify({ metadata, replay }),
);
console.log(JSON.stringify(metadata));
