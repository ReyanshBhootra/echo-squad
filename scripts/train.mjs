import { mkdir, writeFile, readFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import {
  createWorld,
  step,
  expert,
  observe,
  random,
  runPolicy,
  RULES,
} from "../src/sim.js";
import {
  makeModel,
  trainExample,
  predict,
  forward,
  parameterCount,
} from "../src/neural.js";
const started = performance.now();
await mkdir("models", { recursive: true });
await mkdir("research", { recursive: true });
const trainSeeds = Array.from({ length: 64 }, (_, i) => 1000 + i);
const validationSeeds = Array.from({ length: 8 }, (_, i) => 3000 + i);
const testSeeds = Array.from({ length: 24 }, (_, i) => 9000 + i);
const rows = [],
  rng = random(8128);
for (const seed of trainSeeds) {
  const s = createWorld(seed);
  while (!s.done) {
    const a = expert(s);
    if (s.total % 4 === 0) rows.push({ x: observe(s), y: a });
    step(s, rng() < 0.16 ? [(rng() - 0.5) * 2, (rng() - 0.5) * 2] : a);
  }
}
const validation = [];
for (const seed of validationSeeds) {
  const s = createWorld(seed);
  while (!s.done) {
    if (s.total % 8 === 0) validation.push({ x: observe(s), y: expert(s) });
    step(s, expert(s));
  }
}
const loss = (m) =>
  validation.reduce((sum, r) => {
    const y = forward(m, r.x).y;
    return sum + ((y[0] - r.y[0]) ** 2 + (y[1] - r.y[1]) ** 2) / 2;
  }, 0) / validation.length;
const score = (m, seeds) =>
  seeds.reduce(
    (sum, seed) => sum + runPolicy((s) => predict(m, s), seed).score,
    0,
  ) / seeds.length;
const logs = [],
  models = [];
for (const initSeed of [42, 43, 44]) {
  const m = makeModel(initSeed),
    sampler = random(initSeed + 700);
  let updates = 0,
    bestScore = -Infinity,
    bestModel;
  for (let epoch = 0; epoch <= 12; epoch++) {
    if (epoch) {
      for (let i = 0; i < rows.length; i++) {
        const r = rows[Math.floor(sampler() * rows.length)];
        trainExample(m, r.x, r.y, 0.012 / (1 + epoch * 0.08));
        updates++;
      }
    }
    if (epoch % 2 === 0) {
      const validationScore = score(m, validationSeeds),
        validationLoss = loss(m);
      logs.push({ initSeed, epoch, updates, validationLoss, validationScore });
      if (validationScore > bestScore) {
        bestScore = validationScore;
        bestModel = structuredClone(m);
        bestModel.selectedEpoch = epoch;
      }
      console.log(JSON.stringify(logs.at(-1)));
    }
  }
  models.push({ initSeed, model: bestModel, validationScore: bestScore });
}
models.sort((a, b) => b.validationScore - a.validationScore);
const selected = models[0];
selected.model.rules = RULES;
selected.model.seed = selected.initSeed;
selected.model.training = {
  examples: rows.length,
  generatedEpisodes: trainSeeds.length,
  environmentSteps: trainSeeds.length * 1800,
  epochs: 12,
  independentRuns: 3,
};
for (const entry of models)
  await writeFile(
    `models/run-${entry.initSeed}.json`,
    JSON.stringify(entry.model),
  );
await writeFile("models/policy.json", JSON.stringify(selected.model));
const evaluations = [];
for (const seed of testSeeds) {
  const rr = random(seed + 99);
  const controllers = [
    ["random", () => [rr() * 2 - 1, rr() * 2 - 1]],
    ["greedy", (s) => expert(s, false)],
    ["scripted-teamwork", (s) => expert(s)],
    ["untrained", (s) => predict(makeModel(42), s)],
    ...models.map((e) => [`neural-${e.initSeed}`, (s) => predict(e.model, s)]),
    ["team-input-masked", (s) => predict(selected.model, s, true)],
  ];
  for (const [controller, policy] of controllers) {
    const result = runPolicy(policy, seed);
    evaluations.push({
      seed,
      controller,
      score: result.score,
      spark: result.byKind[0],
      link: result.byKind[1],
      core: result.byKind[2],
    });
  }
}
const summarize = (name) => {
  const values = evaluations
      .filter((r) => r.controller === name)
      .map((r) => r.score),
    mean = values.reduce((a, b) => a + b, 0) / values.length;
  return {
    controller: name,
    n: values.length,
    mean,
    sd: Math.sqrt(
      values.reduce((a, b) => a + (b - mean) ** 2, 0) / (values.length - 1),
    ),
    min: Math.min(...values),
    max: Math.max(...values),
  };
};
const summary = [...new Set(evaluations.map((r) => r.controller))].map(
  summarize,
);
const manifest = {
  schema: 1,
  rules: RULES,
  algorithm:
    "Supervised behavior cloning of a teammate-aware scripted controller; SGD, tanh MLP, squared error. Not reinforcement learning.",
  architecture: selected.model.architecture,
  parameters: parameterCount(selected.model),
  selectedSeed: selected.initSeed,
  selectedEpoch: selected.model.selectedEpoch,
  selection:
    "Highest mean score on 8 validation layouts across 3 initializations and epochs 0,2,...12; final 24 test layouts never used for selection.",
  training: selected.model.training,
  trainSeeds,
  validationSeeds,
  testSeeds,
  elapsedSeconds: (performance.now() - started) / 1000,
  modelSHA256: createHash("sha256")
    .update(await readFile("models/policy.json"))
    .digest("hex"),
  node: process.version,
  summary,
  limitations: [
    "Synthetic trajectories from scripted teacher, no human training examples.",
    "Input-masking is a sensitivity check, not a separately retrained ablation.",
    "Teacher engineered observation includes a heuristic link endpoint; this is not learning perception or planning from pixels.",
    "Three initializations are exploratory evidence, not a large statistical study.",
    "No inference about human enjoyment or esports skill.",
  ],
};
await writeFile("research/manifest.json", JSON.stringify(manifest, null, 2));
await writeFile("research/learning.json", JSON.stringify(logs));
await writeFile("research/evaluation.json", JSON.stringify(evaluations));
await writeFile(
  "research/evaluation.csv",
  "seed,controller,score,spark,link,core\n" +
    evaluations
      .map((r) =>
        [r.seed, r.controller, r.score, r.spark, r.link, r.core].join(","),
      )
      .join("\n"),
);
await writeFile(
  "research/learning.csv",
  "initSeed,epoch,updates,validationLoss,validationScore\n" +
    logs.map((r) => Object.values(r).join(",")).join("\n"),
);
console.log(
  JSON.stringify(
    {
      parameters: manifest.parameters,
      elapsed: manifest.elapsedSeconds,
      summary,
    },
    null,
    2,
  ),
);
