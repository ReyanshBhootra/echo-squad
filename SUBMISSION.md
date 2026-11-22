# Devpost draft — ECHO SQUAD: Echo Heist

Category: Event Mini Game. Review this draft before submitting; no form has been submitted.

## Tagline

Your getaway crew is you, from twenty-five seconds ago. Record your squad, crack the vault, escape.

## Inspiration

A booth game needs to make sense before the next person in line gets impatient. We wanted the feeling of teamwork without requiring strangers to coordinate accounts, controllers or schedules. ECHO SQUAD lets one player create their own crew: the route you record now becomes a teammate in the next pass.

## What it does

Echo Heist is one original 3D district and a 75-second mission. During SCOUT, collect keycards, take replenishing cash bags and record your route. During SYNC, that route replays: sweep your connecting line through two shielded relays. During ESCAPE, two prior routes form your crew. Hold the vault inside the squad triangle to trigger an EMP, then reach the getaway van. Drone targeting warnings, cover and a dash make positioning matter. Green duffel bags pay $100/$250 and replenish away from the crew; echoes can collect them too. A visible cash counter, radar, objective marker and optional $10,000 haul challenge give the short mission a running incentive.

Keyboard movement responds directly, the camera stays fixed, sound is opt-in and quiet effects reduce motion/GPU work. Original code-built city meshes, animated crew, warning effects, physical materials, vault and getaway feedback support the mission. Completed runs have deterministic replay and export. A separate station-local score board and spectator view support booth operation. Classic mode preserves the original mouse game and its neural experiment.

## How it was built

The heist has its own deterministic 60Hz rules and a locally vendored Three.js renderer. Its complete winning path is checked using ordinary control inputs and reconstructed exactly from replay. Those checks are scripted, not human playtest evidence. Device rendering and enjoyment checks remain pending.

The separate Classic game and its training runner share a deterministic simulator. A small 16→32→2 network selects between engineered spark and link targets. Training used 28,800 synthetic examples and three initializations, with separate training, validation and test layouts. The selected controller averaged 5917.292 on 24 held-out arenas versus 5592.917 for the greedy collector. The untrained selector already averaged 5420.208: the engineered planner contributes substantial capability. These are exploratory bot scores, not evidence that people enjoy the game or that the network learned movement from scratch.

Weights, raw CSVs, manifests, reproducible scripts and exported charts are included. Earlier failed experiments remain archived. One intermediate scoring scheme let random sweeping dominate; that failure led to a stable-contact rule. Current replay scores are recalculated from recorded routes before playback.

## JetBrains tooling

PyCharm Community 2024.3 was used to navigate the project, format the independent Python audit and run it with Python 3.12. The recorded IDE audit verified the initial experiment’s checksum, split separation and 192 evaluation rows/eight summaries. The current experiment was subsequently audited through CLI tools. Most implementation/training used Codex and the command line. See JETBRAINS.md and research/jetbrains-audit.jpg for the exact scope. Junie and Air were not used.

## What we learned

A higher bot score is not a better game. Player feedback exposed cursor discomfort and a visually flat presentation. We replaced the following sprite with a native pointer, built a more expressive visual identity, and kept the experimental claims tied to saved artifacts. The user said the new visual direction feels closer; structured enjoyment/comprehension playtests remain outstanding. That feedback also prompted the complete 3D Echo Heist mode. Classic model results do not claim performance on the new heist mechanics.

## Links and remaining submission work

Demo: https://echo-squad-after-hours.alkalibutterfly8.chatgpt.site
Source: https://github.com/ReyanshBhootra/echo-squad
Video: still to record and publish; use DEMO-SCRIPT.md.
Methodology: research/EXPERIMENT.md.
License: MIT.

Required materials were checked against https://cloud9.devpost.com/rules and https://cloud9.devpost.com/details/submission-specifics on November 21, 2026. Registration, eligibility confirmation and final submission are entrant actions. A public repository, accessible project, tool/method explanation and public YouTube demo under three minutes are required. Do not describe this draft or a storyboard as a submitted entry or finished video.
