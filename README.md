# ECHO SQUAD

Your past self is your teammate. A 60-second, mouse-driven arcade game with replay teammates, a trained neural rival and an inspectable experiment lab.

## Run locally

Requires Node.js 22 or later. No packages, accounts, external services, network assets or install step.

```sh
npm start
```

Open http://127.0.0.1:4173 in a modern desktop browser. Serve over HTTP, rather than double-clicking index.html: ES modules and offline caching need a suitable origin. The server binds only to this machine. After first load and successful cache installation, the browser can use cached assets without the server; keep the server running for the simplest booth setup. A browser reload, model loading and training-lab rendering were verified with the local server stopped.

## Play

Build 0.5.0: move the native crosshair inside the arena. It is your player marker; there is no canvas drone chasing behind it. Mouse coordinates feed scoring and replay directly, with no acceleration or drift. Arrow keys/WASD also work. No clicking is needed during play. Touch dragging also steers, but desktop is the primary target.

- Pass 1, 20 seconds: briefly hold over blue sparks, 10 points each.
- Pass 2, 20 seconds: your first route replays. Use the line between you to sweep pink diamonds, 35 points each.
- Pass 3, 20 seconds: two routes replay. Surround gold cores with the three-drone triangle, 90 points each.

Targets need two consecutive contact samples to collect, preventing random flickering across the arena from dominating the score. Every five seconds, a fresh deterministic target wave appears. Both sides use the same layout seed, time, absolute-position control interface and contact scoring. Short explanations between passes pause both simulations. Escape pauses; the run also pauses on tab/window focus loss. An inactive run resets after 18 seconds of no steering input. Result screens reset after 60 seconds; save your score first. Scores are stored locally, capped at 200, and never sent to a server. Do not use public leaderboards as an anti-cheat system; browser-local records are editable.

Vs neural squad runs the trained controller in a separate identical arena. It has its own replay teammates and target collection; its score is shown without adding another moving cursor to your arena. The AI does not steal your targets. Open Spectator on the same browser/origin for a local station display.

## First-run guidance

The first uncollected spark nearest the arena center is marked HOLD HERE until your first pickup. A mission strip explains the current scoring shape, and a pass-progress indicator counts down to each echo or the finish. The mission updates after your first spark, link pickup and gold core. Result screens report link-hit/core counts separately from pass totals and suggest what to try next. These helpers do not change the clock, pickup rules, scoring or saved model results.

## Build for hosting

Run `npm run build` to create `dist/`, a static site containing only the runtime assets, selected model and published experiment files. It works on static HTTPS hosting without a server backend. Sites configuration is in `.openai/hosting.json`; new hosting starts owner-private. The local development server still serves port4173.

## After Hours presentation

Original coastal-night lobby art, a neon court, luminous pickups and team links, brief pickup bursts, score feedback, pass reveals and optional synthesized chimes. **Effects quiet** is available in the header and pause screen; the choice is stored locally, and reduced-motion preferences suppress the added motion. **Sound off** remains the default. The native browser cursor is still the sole mouse marker. The pickup streak counts successive collections within 1.5 seconds; it never multiplies score. The court background is cached separately from moving game objects. Camera motion and mouse-following trails are absent.

## Replay room

After a finished run, choose **Watch this run**. The routes open in the same tab, paused. Replay room is also linked beneath the arena: import a downloaded JSON replay or choose **Open neural example**. Play/pause, ½×/1×/2× speed, pass jumps and a frame-accurate timeline let you inspect the run. Imported routes are validated and their scores recalculated before playback; incompatible rules, incomplete routes and score mismatches are rejected. Files stay on this device. This is consistency checking, not authentication or anti-cheat.

The included neural example is a generated controller run on arena 9019: 6,465 points (960 / 1,655 / 3,850). It is not a human playtest or an additional held-out evaluation. Reproduce it with `node scripts/export-example.mjs`. Current replay schema supports completed three-pass runs under echo-0.2-precision; older momentum-rule replays are incompatible.

## Train and verify

```sh
npm test
npm run train
```

Training regenerates model files and experiment artifacts deterministically, apart from elapsed wall time. Read research/EXPERIMENT.md. It is supervised imitation, not reinforcement learning. The current model selects between engine-supplied spark/link targets. Its measured results and the earlier failed runs are disclosed in the lab. Do not call generated examples human data or simulation steps completed games.

## Source map

- src/sim.js: shared deterministic simulation and scripted controllers.
- src/neural.js: 16 → 32 → 2 target-preference network, inference and SGD backpropagation.
- scripts/train.mjs: synthetic examples, three independent runs, validation selection, held-out evaluation.
- src/app.js / render.js: station lifecycle, accessible HTML controls and canvas presentation.
- src/replay.js / replay-viewer.js: validated reconstruction, cached timeline seeking and replay controls.
- src/lab.js: charts and tables built directly from actual experiment artifacts.
- spectator.html / sw.js: local spectator sync and offline assets.
- tests/: meaningful simulation, replay and learning checks.

## Hackathon status

Local development build. Not registered, deployed or submitted by this project. The entrant handles registration and account access. No GRID dataset is used. PyCharm Community 2024.3 was used to navigate the project, format and run the independent Python evidence audit successfully; see JETBRAINS.md for the precise scope and evidence. No claim of human playtesting, biological brain simulation, scientific novelty or guaranteed prize.

Original code and procedural graphics/sound. Design guidance: Emil Kowalski's [design-engineering and animation skills](https://github.com/emilkowalski/skills), applied to restrained state transitions, press feedback and reduced-motion behavior. This is not an affiliation with Cloud9, JetBrains or NVIDIA.
