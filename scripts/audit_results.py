"""Independently audit the neural experiment's exported evidence.

Uses Python's standard library, separate from the JavaScript training code.
Run this file in PyCharm or with Python 3.12+.
"""
import csv
import hashlib
import json
import math
import statistics
from pathlib import Path

root = Path(__file__).resolve().parents[1]
manifest = json.loads((root / "research/manifest.json").read_text())
with (root / "research/evaluation.csv").open(newline="") as stream:
    rows = list(csv.DictReader(stream))

assert hashlib.sha256((root / "models/policy.json").read_bytes()).hexdigest() == manifest["modelSHA256"]
sets = [set(manifest[key]) for key in ("trainSeeds", "validationSeeds", "testSeeds")]
assert not (sets[0] & sets[1] or sets[1] & sets[2] or sets[0] & sets[2])
for summary in manifest["summary"]:
    values = [int(row["score"]) for row in rows if row["controller"] == summary["controller"]]
    assert len(values) == summary["n"] == 24
    assert math.isclose(statistics.mean(values), summary["mean"])
    assert math.isclose(statistics.stdev(values), summary["sd"])
    print(
        f"PASS {summary['controller']}: mean={statistics.mean(values):.3f}, SD={statistics.stdev(values):.3f}, n={len(values)}")

assert len(rows) == 192
print("PASS model SHA-256, disjoint data splits, all 192 evaluation rows and 8 aggregate summaries.")
print("Audit complete. Bot performance does not establish human enjoyment.")
