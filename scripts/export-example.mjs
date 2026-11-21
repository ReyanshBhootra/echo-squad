import { readFile, writeFile } from "node:fs/promises";
import { createWorld, step } from "../src/sim.js";
import { predict } from "../src/neural.js";
import { exportReplay, createReplay } from "../src/replay.js";

const model = JSON.parse(
  await readFile(new URL("../models/policy.json", import.meta.url), "utf8"),
);
const world = createWorld(9019);
while (!world.done) step(world, predict(model, world));
const data = {
  ...exportReplay(world),
  source: {
    kind: "neural-controller-example",
    model: "models/policy.json",
    note: "Generated controller run, not a human playtest or a new held-out evaluation.",
  },
};
createReplay(data);
await writeFile(
  new URL("../research/neural-example.json", import.meta.url),
  JSON.stringify(data) + "\n",
);
console.log(
  `Saved neural example: ${world.score} points; passes ${world.byPass.join(", ")}.`,
);
