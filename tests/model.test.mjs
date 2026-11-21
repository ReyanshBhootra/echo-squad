import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { runPolicy, RULES } from "../src/sim.js";
import { predict } from "../src/neural.js";
const model = JSON.parse(
    await readFile(new URL("../models/policy.json", import.meta.url)),
  ),
  manifest = JSON.parse(
    await readFile(new URL("../research/manifest.json", import.meta.url)),
  ),
  evaluation = JSON.parse(
    await readFile(new URL("../research/evaluation.json", import.meta.url)),
  );
test("model checksum and rule version match experiment artifacts", async () => {
  const digest = createHash("sha256")
    .update(await readFile(new URL("../models/policy.json", import.meta.url)))
    .digest("hex");
  assert.equal(digest, manifest.modelSHA256);
  assert.equal(model.rules, RULES);
});
test("training, validation and final test layouts are disjoint", () => {
  const all = [
    ...manifest.trainSeeds,
    ...manifest.validationSeeds,
    ...manifest.testSeeds,
  ];
  assert.equal(new Set(all).size, all.length);
});
test("saved neural evaluation reproduces exactly on a held-out layout", () => {
  const row = evaluation.find(
    (r) =>
      r.seed === manifest.testSeeds[0] &&
      r.controller === `neural-${manifest.selectedSeed}`,
  );
  const result = runPolicy((s) => predict(model, s), manifest.testSeeds[0]);
  assert.equal(result.score, row.score);
  assert.deepEqual(result.byKind, [row.spark, row.link, row.core]);
});
