export async function renderLab(root, onWatch) {
  try {
    const [manifest, learning] = await Promise.all(
      ["./research/manifest.json", "./research/learning.json"].map(
        async (url) => {
          const r = await fetch(url);
          if (!r.ok) throw Error("Missing experiment artifacts");
          return r.json();
        },
      ),
    );
    const selected = manifest.summary.find(
        (r) => r.controller === `neural-${manifest.selectedSeed}`,
      ),
      greedy = manifest.summary.find((r) => r.controller === "greedy"),
      teacher = manifest.summary.find(
        (r) => r.controller === "scripted-teamwork",
      ),
      masked = manifest.summary.find(
        (r) => r.controller === "team-input-masked",
      );
    root.innerHTML = `<div class="lab-intro"><div><div class="eyebrow">EXPERIMENT 001 / BEHAVIOR CLONING</div><p>Can a small network learn to coordinate with its past self? We trained it to imitate a scripted pilot, then tested it on 24 unfamiliar arenas.</p></div><div class="lab-actions"><button id="watch-untrained">Watch untrained ↗</button><button id="watch-trained">Watch trained ↗</button></div></div>
    <div class="metric-strip"><div class="metric"><small>TRAINABLE PARAMETERS</small><strong>${manifest.parameters}</strong><p>16 inputs → 32 hidden → 2 outputs</p></div><div class="metric"><small>GENERATED EXAMPLES</small><strong>${manifest.training.examples.toLocaleString()}</strong><p>64 simulated games · no human data</p></div><div class="metric"><small>INDEPENDENT RUNS</small><strong>03</strong><p>Different initial network weights</p></div><div class="metric"><small>UNSEEN TEST ARENAS</small><strong>24</strong><p>Separate from training and selection</p></div></div>
    <div class="research-grid"><article class="research-block"><h3>The learning curve.</h3><p>Mean game score on eight validation layouts. Each line is a real training run. Checkpoints were selected on validation scores.</p><div id="curve"></div><div class="chart-legend"><span>Seed 42</span><span>Seed 43</span><span>Seed 44</span></div></article><article class="research-block"><h3>Learning is not the same as winning.</h3><p>The selected network averages ${Math.round(selected.mean).toLocaleString()} points. The simple greedy pilot still scores higher. That's a limitation of this first model.</p><table class="lab-table"><thead><tr><th>CONTROLLER</th><th>MEAN SCORE</th><th>STD. DEV.</th></tr></thead><tbody>${[
      ["Random movement", "random"],
      ["Untrained network", "untrained"],
      ["Trained network", `neural-${manifest.selectedSeed}`],
      ["Greedy collector", "greedy"],
      ["Scripted teamwork", "scripted-teamwork"],
      ["Trained / team inputs masked", "team-input-masked"],
    ]
      .map(([label, key]) => {
        const r = manifest.summary.find((r) => r.controller === key);
        return `<tr><td>${label}</td><td>${Math.round(r.mean).toLocaleString()}</td><td>±${Math.round(r.sd)}</td></tr>`;
      })
      .join("")}</tbody></table></article></div>
    <div class="limitations"><article><div class="eyebrow">WHAT WE OBSERVED</div><h3>Team information didn't help this model.</h3><p>Masking the selected network's teammate inputs raised its test score from ${Math.round(selected.mean)} to ${Math.round(masked.mean)}. This does not demonstrate learned cooperation. Masking is a sensitivity test, not a separately trained ablation.</p><p>The scripted teamwork pilot scored ${Math.round(teacher.mean)}, compared with the greedy pilot's ${Math.round(greedy.mean)}. The next research question is how to teach that advantage to the network.</p></article><article><div class="eyebrow">WHAT THIS DOESN'T ESTABLISH</div><h3>A small, transparent first experiment.</h3><p>This is supervised imitation, not reinforcement learning or a biological brain. Inputs include engineered target features. Bot scores do not measure human enjoyment. Three training runs are exploratory evidence.</p><div class="artifact-links"><a href="./research/evaluation.csv" download>Raw evaluation ↓</a><a href="./research/learning.csv" download>Training log ↓</a><a href="./research/manifest.json" download>Run manifest ↓</a><a href="./models/policy.json" download>Model weights ↓</a><a href="./research/EXPERIMENT.md">Methodology ↗</a></div></article></div>`;
    const figures = document.createElement("div");
    figures.className = "artifact-links";
    figures.innerHTML =
      '<a href="./research/learning-curves.svg" download>Learning figure SVG ↓</a><a href="./research/controller-comparison.pdf" download>Comparison PDF ↓</a>';
    root.append(figures);
    root.querySelector("#watch-untrained").onclick = () => onWatch(false);
    root.querySelector("#watch-trained").onclick = () => onWatch(true);
    const colors = ["#e3633c", "#347fa1", "#80714d"];
    const width = 560,
      height = 285,
      left = 42,
      top = 12,
      bottom = 38,
      right = 15,
      maxY =
        Math.ceil(Math.max(...learning.map((r) => r.validationScore)) / 1000) *
        1000;
    const x = (v) => left + (v / 12) * (width - left - right),
      y = (v) => height - bottom - (v / maxY) * (height - top - bottom);
    root.querySelector("#curve").innerHTML =
      `<svg class="chart" role="img" aria-label="Validation score across twelve epochs for three training seeds" viewBox="0 0 ${width} ${height}">${Array.from(
        { length: 5 },
        (_, i) => {
          const v = (maxY * i) / 4;
          return `<line x1="${left}" y1="${y(v)}" x2="${width - right}" y2="${y(v)}" stroke="#d4d4ca"/><text x="${left - 9}" y="${y(v) + 4}" text-anchor="end">${v}</text>`;
        },
      ).join(
        "",
      )}${[0, 2, 4, 6, 8, 10, 12].map((v) => `<text x="${x(v)}" y="${height - 18}" text-anchor="middle">${v}</text>`).join("")}<text x="${width / 2}" y="${height - 1}" text-anchor="middle">TRAINING EPOCH</text>${[
        42, 43, 44,
      ]
        .map((seed, i) => {
          const rows = learning.filter((r) => r.initSeed === seed);
          return `<polyline points="${rows.map((r) => `${x(r.epoch)},${y(r.validationScore)}`).join(" ")}" fill="none" stroke="${colors[i]}" stroke-width="2"/>${rows.map((r) => `<circle cx="${x(r.epoch)}" cy="${y(r.validationScore)}" r="3" fill="${colors[i]}"/>`).join("")}`;
        })
        .join("")}</svg>`;
  } catch {
    root.innerHTML =
      '<p class="loading">Experiment artifacts are unavailable. Run <code>npm run train</code> in the project folder to generate them.</p>';
  }
}
