# Devpost draft — ECHO SQUAD: After Hours

Category: Event Mini Game. Review this draft before submitting; no form has been submitted.

## Tagline

Your past self is your teammate. Build a three-player squad in a one-player, 60-second arcade run.

## Inspiration

A booth game needs to make sense before the next person in line gets impatient. We wanted the feeling of teamwork without requiring strangers to coordinate accounts, controllers or schedules. ECHO SQUAD lets one player create their own crew: the route you record now becomes a teammate in the next pass.

## What it does

The first 20-second pass teaches direct mouse control: touch blue sparks to collect. In pass two, your first route returns as an echo. Sweep the line between you through pink diamonds. In pass three, two earlier routes replay; gold cores score inside your squad’s triangle. Your earlier decisions change what is possible later.

The After Hours presentation uses original coastal-night art, cyan/pink/gold gameplay and localized pickup feedback. A native browser cursor keeps the player marker independent of the canvas frame loop. Effects quiet and keyboard controls provide alternatives to the extra motion and mouse input. Each run ends with a score, pass breakdown, pickup insights, replay export and a replay viewer. A local leaderboard and same-browser spectator page support a two-screen booth station. Runs reset between players; sound is opt-in.

## How it was built

The browser game and training runner share one deterministic JavaScript simulator. A small 16→32→2 network selects between engineered spark and link targets. Training used 28,800 synthetic examples and three initializations, with separate training, validation and test layouts. The selected controller averaged 5917.292 on 24 held-out arenas versus 5592.917 for the greedy collector. The untrained selector already averaged 5420.208: the engineered planner contributes substantial capability. These are exploratory bot scores, not evidence that people enjoy the game or that the network learned movement from scratch.

Weights, raw CSVs, manifests, reproducible scripts and exported charts are included. Earlier failed experiments remain archived. One intermediate scoring scheme let random sweeping dominate; that failure led to a stable-contact rule. Current replay scores are recalculated from recorded routes before playback.

## JetBrains tooling

PyCharm Community 2024.3 was used to navigate the project, format the independent Python audit and run it with Python 3.12. The recorded IDE audit verified the initial experiment’s checksum, split separation and 192 evaluation rows/eight summaries. The current experiment was subsequently audited through CLI tools. Most implementation/training used Codex and the command line. See JETBRAINS.md and research/jetbrains-audit.jpg for the exact scope. Junie and Air were not used.

## What we learned

A higher bot score is not a better game. Player feedback exposed cursor discomfort and a visually flat presentation. We replaced the following sprite with a native pointer, built a more expressive visual identity, and kept the experimental claims tied to saved artifacts. The user said the new visual direction feels closer; structured enjoyment/comprehension playtests remain outstanding.

## Links and remaining submission work

Demo: https://echo-squad-after-hours.alkalibutterfly8.chatgpt.site
Source: https://github.com/ReyanshBhootra/echo-squad
Video: still to record and publish; use DEMO-SCRIPT.md.
Methodology: research/EXPERIMENT.md.
License: MIT.

Required materials were checked against https://cloud9.devpost.com/rules and https://cloud9.devpost.com/details/submission-specifics on November 21, 2026. Registration, eligibility confirmation and final submission are entrant actions. A public repository, accessible project, tool/method explanation and public YouTube demo under three minutes are required. Do not describe this draft or a storyboard as a submitted entry or finished video.
