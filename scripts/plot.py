"""Export the actual experiment data as publication-ready figures.

Optional tooling only: pip install -r scripts/plot-requirements.txt
Run from any directory with python scripts/plot.py.
"""
import json
from pathlib import Path

import matplotlib

matplotlib.use("Agg")
import matplotlib.pyplot as plt

ROOT = Path(__file__).resolve().parents[1]
RESEARCH = ROOT / "research"
learning = json.loads((RESEARCH / "learning.json").read_text())
manifest = json.loads((RESEARCH / "manifest.json").read_text())
plt.rcParams.update({
    "font.family": "DejaVu Sans", "font.size": 10,
    "axes.spines.top": False, "axes.spines.right": False,
    "axes.facecolor": "#f2f0e9", "figure.facecolor": "#f2f0e9",
    "axes.labelcolor": "#263239", "text.color": "#263239",
    "svg.hashsalt": f"echo-experiment-{manifest.get('experiment',1)}",
})

fig, ax = plt.subplots(figsize=(8, 4.8), layout="constrained")
for seed, color in zip((42, 43, 44), ("#df623e", "#347fa1", "#80714d")):
    rows = [row for row in learning if row["initSeed"] == seed]
    ax.plot([r["epoch"] for r in rows], [r["validationScore"] for r in rows],
            marker="o", markersize=4, color=color, label=f"Initialization {seed}")
ax.set(title="Learning to imitate a teammate-aware pilot",
       xlabel="Training epoch (same examples reused)",
       ylabel="Mean game score on 8 validation layouts", ylim=(0, max(r["validationScore"] for r in learning)*1.15))
ax.grid(axis="y", alpha=.2)
ax.legend(frameon=False, loc="lower right")
fig.text(.01, -.025, "Three independent runs. Validation scores used for checkpoint selection; these are not final test scores.", fontsize=8)
for ext in ("svg", "png", "pdf"):
    fig.savefig(RESEARCH / f"learning-curves.{ext}", dpi=180, bbox_inches="tight")
plt.close(fig)

names = ["random", "untrained", f"neural-{manifest['selectedSeed']}", "greedy", "scripted-teamwork", "team-input-masked"]
labels = ["Random", "Untrained network", "Selected neural network", "Greedy collector", "Scripted teamwork", "Neural / team inputs masked"]
rows = [next(r for r in manifest["summary"] if r["controller"] == name) for name in names]
fig, ax = plt.subplots(figsize=(8, 4.8), layout="constrained")
ax.barh(labels, [r["mean"] for r in rows], xerr=[r["sd"] for r in rows],
        color=["#a1aaa8", "#a1aaa8", "#df623e", "#347fa1", "#347fa1", "#80714d"],
        error_kw={"elinewidth": 1.2, "capsize": 3}, height=.6)
ax.invert_yaxis()
ax.set(title="Controller performance under direct controls",
       xlabel="Game score on 24 held-out layouts (mean ± sample SD)", xlim=(0, max(r["mean"]+r["sd"] for r in rows)*1.1))
ax.grid(axis="x", alpha=.15)
fig.text(.01, -.025, "Error bars show variation across layouts, not confidence intervals. Input masking is a sensitivity check.", fontsize=8)
for ext in ("svg", "png", "pdf"):
    fig.savefig(RESEARCH / f"controller-comparison.{ext}", dpi=180, bbox_inches="tight")
plt.close(fig)
print("Exported learning curves and controller comparisons as SVG, PNG and PDF.")
