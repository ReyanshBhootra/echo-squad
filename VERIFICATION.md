# Native cursor follow-up — November 21, 2026

The user reported continued lag/discomfort after the prior fix. Build 0.2.1 uses the browser-native crosshair and suppresses the mouse player canvas glyph/halo/label. It retains the canvas player for keyboard/touch. Current browser checks verified crosshair activation, keyboard fallback, Escape pause and lobby restoration. Footer identified BUILD 0.2.1. Cache v4 prevents using the previous cached presentation after successful update. No timing benchmark or user comfort confirmation is claimed. Rules and saved neural artifacts are unchanged.

The renderer regression verifies that native mode hides the player while keeping echoes and the keyboard fallback. All 16 Node tests and syntax checks passed.

The observations below describe build 0.2.0 and its earlier canvas pointer.

# Verified direct-control revision — November 19, 2026

## Player feedback addressed

The player reported mouse/drone lag, dizziness and annoyance. Removed acceleration, speed-limited mouse pursuit, residual momentum, motion trails, auto-spinning echoes and the second moving rival cursor. The player is rendered at the latest pointer coordinate on every animation frame. Scores and ghost recordings use those same absolute coordinates on fixed simulation ticks. Keyboard motion stops immediately on release.

## Current automated checks

15 Node tests passed: five new direct-control/contact/mapping/replay checks and ten simulator/model checks. The tests assert exact next-tick pointer arrival, no drift, correct coordinates in scaled and letterboxed arenas, rejection of random sweep pickups, replayed direct positions, rule/model compatibility and exact held-out evaluation reproduction. The standard-library Python audit also passed for all 192 current rows/eight summaries, checksum and nonoverlapping data splits.

## Current browser observations

Three requested positions were checked after pointer events: (760,110), (140,430), (640,240). On the very next animation frame, the actual canvas pixel at each requested coordinate was [141,215,255,255], the blue player marker. Subsequent simulation positions matched within floating-point error below 3e-14 units. Canvas cursor was 'none', removing the duplicate visible pointer. Current rule version and compatible model both loaded successfully.

The first contact sample now shows a static target ring; collection requires two consecutive contact samples. This changes scoring, not motion responsiveness. Camera position is fixed. Previous results and browser evidence are archived under research/experiment-001 and apply to the previous controls only.

## Research honesty

Current experiment 003 trains target preference between engine-supplied spark/link candidates. It is supervised imitation. The selected neural selector averaged 5917.292 points, greedy 5592.917, scripted teamwork 5722.708 on 24 newly held-out layouts. Random motion averaged 1868.958. These are exploratory bot results, not human enjoyment measurements. The intermediate swept-scoring failure is archived in experiment-002.

The PyCharm screenshot documents the earlier experiment's audit, not a new IDE run of experiment 003. Current checks were run through command-line tools. No public deployment or submission yet. The player still needs to retest the control feel; one report is not a structured usability study.


A full tool-driven browser run completed all 1,800 steps and all three passes under echo-0.2-precision. The pointer driver scored 2,930; no JavaScript exceptions were recorded. Its wall time included background-tab throttling and is not a performance benchmark. The lobby preview is now static rather than a rapid scripted animation. The neural experiment/model was not changed by these presentation-only refinements.
