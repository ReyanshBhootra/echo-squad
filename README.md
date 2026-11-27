# ECHO SQUAD

Your getaway crew is you, from twenty-five seconds ago. Echo Heist is a 75-second 3D scout/sync/escape mission. The original 60-second arcade game and its reproducible neural experiment remain available in Classic.

## Orbital - build 0.9.0

The main game now uses an original orbital salvage station and rounded crew suits. This remains one player with exact recorded selves. WASD/arrows move relative to the third-person camera; drag to orbit, Q/E turn, V switches to the raised deck view, Space dashes, J jumps, Escape pauses. Jumping uses fixed-step gravity (20 units/s squared), ground collision and one jump per press. High jumps clear low security shots. Platform climbing is not implemented.

Rendering interpolates the 60 Hz simulation samples. The distance-driven walk cycle uses alternating stance/swing feet and two-segment knee geometry; stance boots stay at floor level. Landing compresses the suit. Camera follows interpolated horizontal motion without jump bobbing. Overlapping echoes hide their suit to keep the real player readable. Quiet effects preserve functional leg movement. Cargo collision matches the tested mission layout.

Rules are echo-orbital-4; older heist rules 1-3 remain replayable and current scores use a new key. The saved version-three trailer run still reproduces 6,865 points at tick 3,248. The old city renderer is retained for the recording studio. Classic neural evidence is unchanged and does not describe the station controller.

Verification: 46 Node tests pass. Actual browser spot checks verified the station, start, movement/keycard pickup, jumping, return to the deck, orbit drag and pause. Perceived smoothness, full human mission completion, mobile comfort and sustained frame rate still need user feedback. Existing videos show the earlier city build; a station video has not been recorded.

## Play online

https://echo-squad-after-hours.alkalibutterfly8.chatgpt.site — public, no account required. Scores stay in each browser; the leaderboard is station-local.

Source and reproducible evidence: https://github.com/ReyanshBhootra/echo-squad. Submission draft: SUBMISSION.md; video recording plan: DEMO-SCRIPT.md; workflow story: AI_SHOWCASE.md.

## Run locally

Requires Node.js 22 or later. Vendored Three.js runs locally: no install step, account or CDN is required to play. Rebuilding the vendor files requires `npm ci` and `npm run vendor`; see THIRD_PARTY.md.

```sh
npm start
```

Open http://127.0.0.1:4173 in a modern desktop browser. Serve over HTTP, rather than double-clicking index.html: ES modules and offline caching need a suitable origin. The server binds only to this machine. After first load and successful cache installation, the browser can use cached assets without the server; keep the server running for the simplest booth setup. A browser reload, model loading and training-lab rendering were verified with the local server stopped.

## Getaway update — build 0.8.0

Opening the vault starts an alarm and a getaway deadline: nine active seconds, capped by the remaining lockdown time. Two pursuit drones arrive near the exit, follow the player and fire faster telegraphed shots. The original guards recover from the EMP after 0.75 seconds; pursuit shots are aimed at the player. Escape still awards the ordinary getaway bonus. Miss the window and the result is “The van left,” even if armor remains. Pausing freezes the simulation deadline.

A green ground route and chevrons lead to the van and bend around cover; the radar shows the same route and pursuers. The alarm has a static red countdown, red beacon lighting, and visible pursuit search cones. Quiet effects remove the decorative cones and keep essential targeting warnings. A synthesized two-tone alarm plays only with sound enabled; sound remains off by default. No moving camera or screen flash was added.

Cash events now identify their actual collector. The crew feed names YOU, ECHO 01 or ECHO 02; echo pickups have attributed floating rewards. Echo earnings and the results summary show cash-bag value actually collected by recorded teammates. A pickup pays once, with player-first tie breaking if crew overlap. This does not double-count the score.

Three original low storefronts—NIGHT OWL, 24 / 7 and BAY AUTO—add readable landmarks along the north edge, with lit canopies, crossing/loading/parking paint, brighter ambient light and stronger exposure. These are code-built original assets. Browser rendering, audio, layout, performance and enjoyment remain unverified because browser-control tools are unavailable.

Rules are now echo-heist-3; both older heist rules retain exact replay compatibility and separate score storage. Classic neural artifacts remain unchanged. Tests cover winning and missed-van runs, reinforcement spawning/firing, attribution, paths around crates and exact replay, including the previous rule results.

## Previous Cash Job update — build 0.7.0

There are now green duffel bags worth $100 or $250 throughout the district. Collected bags replenish after six active seconds at a different free location away from the crew. Higher-value bags sit near the northern security patrol. Echoes collect bags too. All pickup value is added to the visible cash counter with local +$ feedback. The $10,000 target is an optional score challenge; escaping still completes the mission below that target. Pickup, relay, vault, armor/time and escape rewards use the same score total displayed as fictional heist cash.

The original small power diamonds are now recognizable blue keycards: collect three to power the relay job. A projected next-objective marker names the keycard, cash bag, relay or getaway. During the final triangle stage, it suggests a currently valid position when one is available; this is geometric guidance, not a guarantee that moving echoes will hold that formation. A compact radar shows cash, cards, relays, vault, exit and crew. Security stars show the actual pass-based difficulty; armor and haul have progress bars.

The website and HUD now use locally bundled Bowlby One SC and Anton, white outlined display text, green cash, yellow job accents and dark square panels, inspired by the user's GTA interface preference. These are open fonts, not Rockstar assets; see THIRD_PARTY.md. World-label textures fit their text rather than shrinking short labels into oversized canvases. Input, fixed camera, quiet effects and opt-in sound remain.

Rules are versioned as echo-heist-2; original echo-heist-1 replay results remain reproducible and old scores are retained in their separate storage key. No classic neural artifacts were changed. Automated checks cover loot scoring/respawn/camping avoidance, echo pickup credit, objective guidance, exact replay and the legacy result. Browser tools remain unavailable: device visual/layout/comfort checks are pending. The supplied screenshot shows the previous rendered district; it is not a screenshot of this update.

## Echo Heist mission

Open the home page in a WebGL2-capable browser. WASD/arrows move immediately; Space dashes with a 2.2-second cooldown; Escape pauses. The camera stays fixed. Touch direction/dash buttons are provided, but mobile comfort and GPU performance have not been verified.

- SCOUT, 25 seconds: collect at least three blue keycards and record a useful moving route.
- SYNC, 25 seconds: your exact first route replays. Sweep your connecting line through both pink relays for 0.3 seconds each to break their shields.
- ESCAPE, 25 seconds: two earlier routes replay. Surround the gold vault with your squad triangle for 0.6 seconds, then reach the green getaway van.

Security drones mark a target for one second before firing. Keep moving or use dash invulnerability. Six armor hits end the mission; the 75-second active-play clock ends in lockdown. Pass reveals pause the clock briefly. Scores reward cells, relays, the vault and a healthy, fast escape. Watch this run reconstructs your own completed mission; Download replay saves validated inputs and the result. Heist scores use a separate local board and rules version. Classic replay imports and classic model weights do not apply to Heist. The spectator station labels the active mode separately.

The original district contains code-built buildings, palms, vehicles, articulated characters, physical materials, shadows, an environment reflection probe, targeted warning effects, pickup bursts, vault lid/EMP and departure feedback. Effects quiet lowers pixel density and disables shadows/decorative motion; reduced-motion preferences override effects. Sound is opt-in. No Rockstar assets are used. No claim of GTA-scale content or fidelity is made.

Verification includes a winning scripted route using ordinary controls and exact deterministic replay, plus collision, input, failure and import validation tests. This is not a human playtest or trained heist policy. Current browser/GPU tools were unavailable for this release: actual rendering, layout, audio and perceived responsiveness still need a device check. Existing classic browser evidence below applies only to that earlier mode.

## Classic play (`classic.html`)

Build 0.5.0: move the native crosshair inside the arena. It is your player marker; there is no canvas drone chasing behind it. Mouse coordinates feed scoring and replay directly, with no acceleration or drift. Arrow keys/WASD also work. No clicking is needed during play. Touch dragging also steers, but desktop is the primary target.

- Pass 1, 20 seconds: briefly hold over blue sparks, 10 points each.
- Pass 2, 20 seconds: your first route replays. Use the line between you to sweep pink diamonds, 35 points each.
- Pass 3, 20 seconds: two routes replay. Surround gold cores with the three-drone triangle, 90 points each.

Targets need two consecutive contact samples to collect, preventing random flickering across the arena from dominating the score. Every five seconds, a fresh deterministic target wave appears. Both sides use the same layout seed, time, absolute-position control interface and contact scoring. Short explanations between passes pause both simulations. Escape pauses; the run also pauses on tab/window focus loss. An inactive run resets after 18 seconds of no steering input. Result screens reset after 60 seconds; save your score first. Scores are stored locally, capped at 200, and never sent to a server. Do not use public leaderboards as an anti-cheat system; browser-local records are editable.

Vs neural squad runs the trained controller in a separate identical arena. It has its own replay teammates and target collection; its score is shown without adding another moving cursor to your arena. The AI does not steal your targets. Open Spectator on the same browser/origin for a local station display.

## Classic first-run guidance

The first uncollected spark nearest the arena center is marked HOLD HERE until your first pickup. A mission strip explains the current scoring shape, and a pass-progress indicator counts down to each echo or the finish. The mission updates after your first spark, link pickup and gold core. Result screens report link-hit/core counts separately from pass totals and suggest what to try next. These helpers do not change the clock, pickup rules, scoring or saved model results.

## Build for hosting

Run `npm run build` to create `dist/`, a static site containing only the runtime assets, selected model and published experiment files. It works on static HTTPS hosting without a server backend. Sites configuration is in `.openai/hosting.json`; the deployed game was made public at the entrant’s request. The local development server still serves port4173.

## Classic After Hours presentation

Original coastal-night lobby art, a neon court, luminous pickups and team links, brief pickup bursts, score feedback, pass reveals and optional synthesized chimes. **Effects quiet** is available in the header and pause screen; the choice is stored locally, and reduced-motion preferences suppress the added motion. **Sound off** remains the default. The native browser cursor is still the sole mouse marker. The pickup streak counts successive collections within 1.5 seconds; it never multiplies score. The court background is cached separately from moving game objects. Camera motion and mouse-following trails are absent.

## Classic replay room

After a finished run, choose **Watch this run**. The routes open in the same tab, paused. Replay room is also linked beneath the arena: import a downloaded JSON replay or choose **Open neural example**. Play/pause, ½×/1×/2× speed, pass jumps and a frame-accurate timeline let you inspect the run. Imported routes are validated and their scores recalculated before playback; incompatible rules, incomplete routes and score mismatches are rejected. Files stay on this device. This is consistency checking, not authentication or anti-cheat.

The included neural example is a generated controller run on arena 9019: 6,465 points (960 / 1,655 / 3,850). It is not a human playtest or an additional held-out evaluation. Reproduce it with `node scripts/export-example.mjs`. Current replay schema supports completed three-pass runs under echo-0.2-precision; older momentum-rule replays are incompatible.

## Train and verify

```sh
npm test
npm run train
```

Training regenerates model files and experiment artifacts deterministically, apart from elapsed wall time. Read research/EXPERIMENT.md. It is supervised imitation, not reinforcement learning. The current model selects between engine-supplied spark/link targets. Its measured results and the earlier failed runs are disclosed in the lab. Do not call generated examples human data or simulation steps completed games.

## Source map

- src/heist-sim.js / heist-scene.js / heist-app.js: separate 60Hz heist rules, Three.js district and mission lifecycle.
- src/sim.js: shared deterministic simulation and scripted controllers.
- src/neural.js: 16 → 32 → 2 target-preference network, inference and SGD backpropagation.
- scripts/train.mjs: synthetic examples, three independent runs, validation selection, held-out evaluation.
- src/app.js / render.js: station lifecycle, accessible HTML controls and canvas presentation.
- src/replay.js / replay-viewer.js: validated reconstruction, cached timeline seeking and replay controls.
- src/lab.js: charts and tables built directly from actual experiment artifacts.
- spectator.html / sw.js: local spectator sync and offline assets.
- tests/: meaningful simulation, replay and learning checks.

## Hackathon status

Public web build deployed with Sites. Hackathon registration and final Devpost submission remain unconfirmed. The entrant handles registration and account access. No GRID dataset is used. PyCharm Community 2024.3 was used to navigate the project, format and run the independent Python evidence audit successfully; see JETBRAINS.md for the precise scope and evidence. No claim of human playtesting, biological brain simulation, scientific novelty or guaranteed prize.

Original code and procedural graphics/sound. Design guidance: Emil Kowalski's [design-engineering and animation skills](https://github.com/emilkowalski/skills), applied to restrained state transitions, press feedback and reduced-motion behavior. This is not an affiliation with Cloud9, JetBrains or NVIDIA.
