# First-run guidance and hosting build — November 21, 2026

Build0.5.0 adds first-spark guidance, per-pass countdown/progress, scoring-shape instructions and result insights. Rules/model unchanged. All23 tests pass, including actual collection at the guided target, guide removal after scoring, countdown reset at the600-tick boundary, and distinction between pickup types and pass totals. App/coach/build syntax and whitespace checks passed. Static build copies32 allowlisted runtime assets into dist; no tests, IDE files or historical research snapshots are published as static files.

Actual local-browser check: mission began Move onto the marked spark. Hold briefly with Echo01 in20s. Clicking the visible HOLD HERE spark scored10; mission changed to Keep collecting. Your route becomes Echo01, and countdown reached17s. Pause froze world tick497 with4s until echo. No formal human onboarding test or current latency benchmark is claimed. Deployment result is recorded in outputs/HANDOFF.md after publication.

Earlier verification follows.

# After Hours — November 21, 2026

Build 0.4.0 is a presentation revision: original illustrated lobby, dark neon court, cached static floor, glowing targets/links, localized pickup effects, score feedback, pass reveals and cosmetic pickup streak. Simulation rules, training and model artifacts are unchanged. Quiet effects is available in both lobby and pause screen; local preference persistence was added after the browser run. Synthesized pickup chimes are opt-in; no listening test is claimed.

All20 Node tests and app/renderer syntax checks passed. Existing native-pointer renderer regression and exact held-out model reproduction still pass. No additional training/evaluation performed.

Actual in-app browser: checked the narrow layout at clientWidth419 with scrollWidth419; quiet toggle set body.quiet-effects and computed button pseudo-element animationName none. Checked desktop breakpoint1280x800: Let's ride bottom702.75 pixels and no horizontal overflow. Temporary viewport override was reset. Native cursor CSS loaded assets/crosshair.svg with hotspot16,16 and crosshair fallback. Pause-screen quiet toggle and resume worked. A normal-control run completed all1800 steps/three passes: score965, splits0/250/715; pass reveals and cosmetic streak were observed. Watch this run then opened the paused replay and recalculated965; seeking to frame1800 showed965. No browser console errors in the captured log. This closes the prior full-run replay-handoff verification gap. No leaderboard row was saved. Lab loaded the same Experiment003 results successfully.

Full-page lobby screenshot: outputs/after-hours-lobby.jpg (outside source repo). These are tool-driven checks, not a human enjoyment or comfort test. The user subsequently selected Visual direction feels closer. No corresponding confirmation of game enjoyment or comfort has been received. No public deployment, registration, submission or new server-off offline test is claimed. The new CSS/SVG assets are included in service-worker cachev6.

Earlier verification follows.

# Replay room — November 21, 2026

Build 0.3.0 adds a separate replay viewer, result-screen Watch this run action, local file import and a saved neural-controller example. The engine validates schema/rules, seed, complete bounded routes, and scores; rebuilds all 1,800 simulation steps; and uses two-second snapshots for backward seeking. No training or simulation rules changed.

All 20 Node tests passed, including route/target/score/ghost reproduction around both pass boundaries and completion; seeking backward then resuming; malformed/oversized/foreign files; score tampering; and stripping unknown imported metadata. App, replay engine/viewer and export script syntax checks passed.

Actual in-app browser observations: example loaded paused with total 6465 and pass totals 960/1655/3850; pass-three jump showed 40 seconds and 2615 running points; timeline completion showed 60 seconds and 6465; playback from frame1799 stopped naturally at1800 with Watch again; local JSON import reset to the beginning; importing research/manifest.json showed an invalid-seed error without losing the valid replay. Full-page preview saved outside the source repo at outputs/replay-room.jpg.

Limit: a fresh end-to-end finished-game → Watch this run browser journey was attempted but not completed. The in-app browser throttled the game clock heavily during a normal-control run, which later reached its existing inactivity reset. The exported-run engine path is tested; no full-run browser handoff, new mobile test or current server-off offline test is claimed. New replay assets are included in the service-worker cache list. Human comfort with the native cursor is still unconfirmed.

Earlier evidence follows.

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
