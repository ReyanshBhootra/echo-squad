# Cash Job — build0.7.0 / November22,2026

All34 Node tests pass. New coverage: one payment per bag pickup, six-second replenishment away from a camper, echo collection credit, legacy heist1 score6515/tick3248 preserved, actual objective selection and a valid suggested vault triangle. The ordinary-control integration route still escapes at tick3248, now6865points including2cashbags/$350,5armor. This fixture prioritizes the original mission and is not an optimized loot route or a human playtest. New heist2 replay reconstructs its full result; heist1 replays retain original scoring. Classic ML results/weights/raw evidence were not retrained or changed.

Changed: visible replenishing bag meshes, larger keycards, world-label texture sizing, cash feedback/target, task marker, radar and locally hosted open display fonts; new rule version. Browser-control tools remain unavailable. No claim of visual/layout/performance/offline-cache/comfort verification for this release. User screenshot confirms the previous3D district rendered but conveys dissatisfaction with its purpose/UI. It is not a current-release screenshot or a passed playtest.

# Echo Heist — November 22, 2026 / build 0.6.0

Separate 60Hz mission rules, original locally rendered 3D district, direct keyboard/dash control, recorded echoes, relay links, triangle vault/EMP and escape. Classic engine, model and raw training artifacts are preserved.

Automated: all 30 Node tests pass (23 previous + 7 heist checks). A scripted ordinary-input route completes the mission at tick 3248, score 6515, five armor remaining, two relays and open vault. Replay reconstructs identical score, tick, stats and player state. This route is an integration fixture, not a learned policy or evidence of human enjoyment. Failure boundary, caught termination, immediate stop/normalized diagonals, dash cooldown, crate collision, exact echo samples, degenerate triangles, and replay corruption/truncation/foreign-rule handling are checked. A timeout unit check isolates the final-tick boundary; it is not a full played timeout replay.

Static build packages 42 allowlisted assets; local HTML/module reference resolution checked. Three.js 0.187.0 is pinned by lockfile, served from unchanged vendored modules with MIT license. No CDN or external art assets. No neural retraining; all classic claims remain scoped to classic rules.

Browser-control tools were unavailable in this implementation session. GPU rendering, shader compatibility, audio playback, responsive layout, offline behavior of the enlarged cache, visual quality and perceived input comfort have not been verified for Heist. The earlier browser checks below apply only to classic. Actual newcomer comprehension and enjoyment remain untested. Public deployment status is recorded in outputs/HANDOFF.md after publication; a successful deployment does not establish browser QA.

## Previous classic verification

# First-run guidance and hosting build — November 21, 2026

Build0.5.0 adds first-spark guidance, per-pass countdown/progress, scoring-shape instructions and result insights. Rules/model unchanged. All23 tests pass, including actual collection at the guided target, guide removal after scoring, countdown reset at the600-tick boundary, and distinction between pickup types and pass totals. App/coach/build syntax and whitespace checks passed. Static build copies32 allowlisted runtime assets into dist; no tests, IDE files or historical research snapshots are published as static files.

Actual local-browser check: mission began Move onto the marked spark. Hold briefly with Echo01 in20s. Clicking the visible HOLD HERE spark scored10; mission changed to Keep collecting. Your route becomes Echo01, and countdown reached17s. Pause froze world tick497 with4s until echo. No formal human onboarding test or current latency benchmark is claimed. Public deployment verified on November21,2026: https://echo-squad-after-hours.alkalibutterfly8.chatgpt.site . Sites version2 uses source commit674bb4a3f381fe6fe9a6b86134d6f1d58d331d82. The entrant explicitly requested public access; the anonymous browser reached the game after access propagation. Hosted first-run start/pause/reset, compatible neural weights, Experiment003 charts/table and the saved6465-point replay all loaded. The final mission/countdown text rendered14px at clientWidth434 with matching scrollWidth434. Captured browser error log was empty. Hosted cache reported Offline cache ready, but no new network-disconnection test was performed. No hosted QA score was saved. Screenshot outside source repo: outputs/first-run-guidance.jpg.

GitHub publication verified public with MIT license: https://github.com/ReyanshBhootra/echo-squad . SUBMISSION.md, DEMO-SCRIPT.md, AI_SHOWCASE.md and PLAYTEST.md are prepared materials; there is no published demo video or confirmed registration/submission yet.

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
