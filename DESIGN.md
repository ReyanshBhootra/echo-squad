# Current direction — Getaway, build 0.8.0

User approved three changes: a vault-triggered chase, visible echo contribution and more district character. The alarm is an actual nine-active-second extraction window capped by lockdown, with two pursuit drones, faster telegraphed fire and a van-left failure. Green route markings avoid cover and leave the camera fixed. Static red beacons/search cones and an opt-in two-tone alarm signal the change; quiet mode removes decorative cones while retaining targeting warnings. No strobe or camera motion.

Actual cash events identify one collector and update per-crew earnings. The last three pickup messages show who helped; final results name the echoes' cash-bag earnings. Do not infer this from proximity in the renderer or invent narrative contributions. Original north-edge storefronts, canopies, road paint and brighter fill lighting provide recognizable street context without new collision blockers. Preserve the GTA-inspired open fonts and clear color roles.

Simulation/replay evidence is automated, not a human playtest. Browser/GPU/audio/layout/comfort/performance and enjoyment checks remain pending. Rules echo-heist-3, compatible old replay execution; no classic ML retraining or new performance claim.

## Previous design

# Current direction — Cash Job, build 0.7.0

User's screenshot and feedback: the courtyard feels empty, pickups lack meaning, and the interface should take cues from GTA typography/UI. Address reward clarity and continuous movement incentive together. Eight green duffel bags give $100/$250, replenishing six seconds after collection at another unoccupied location away from the crew. Blue objects become physical keycards; three still unlock the relay job. A cash counter, floating pickup value, optional $10,000 score challenge, actual crew rank, objective marker and local radar explain what to chase. Core recorded-self/line/triangle/escape mechanics stay central.

Use locally bundled OFL Bowlby One SC for chunky white outlined headings, Anton for condensed game numerals/labels, money green and job yellow. Dark square panels replace rounded glass panels. No Rockstar fonts or art are redistributed. World sign textures now fit their word width so labels don't waste most of their texture on padding. Radar and target labels are functional; pickup motion stays local and respects quiet/reduced-motion preferences. No cursor follower or moving camera added.

The screenshot is user feedback on0.6.0, not proof of0.7.0 rendering or enjoyment. Browser/GPU inspection and actual fun validation are still pending. Main heist rules are echo-heist-2 with legacy replay compatibility; classic neural evidence remains unchanged and separate.

## Earlier direction

# Current direction — Echo Heist, build 0.6.0

Approved by the user on November 22. One original 3D coastal-night district, one complete scout/sync/escape mission. Preserve ECHO SQUAD’s recorded-self teamwork: cells use points, relay shields use links, the vault uses a triangle. The new mission is separate from the classic simulator and ML benchmark. Nothing claims that classic weights learned heist mechanics.

Fixed raised perspective, instant WASD/arrows and dash remove mouse chasing. Cyan player, pink echo/relays and gold echo/vault retain meaning. Security marks intended shots before firing; physical cover and a dash offer responses. Success opens a real vault mesh, triggers an expanding EMP, activates the green van and ends with departure feedback. Local bursts attach to actual game events; no camera shake or motion blur. Procedural district meshes and textures are original, Three.js MIT code is vendored with attribution.

Quiet effects reduce GPU work and decorative animation; sound is opt-in. Native system fonts and local assets avoid CDN dependence. The full mission is tested through real control inputs and exact replay. Device rendering, performance, readability, comprehension and enjoyment remain unverified for this new mode. Need actual user feedback before claiming comfort or fun. The classic game and experiment artifacts remain accessible.

## Previous classic design

# Current direction — AFTER HOURS, build 0.5.0

The user rejected the earlier restrained presentation as boring for a game and named GTA VI as a visual reference. Current direction: original coastal-night arcade identity, cream display type, near-black plum/asphalt, cyan player, hot-pink first echo/diamonds and warm-gold second echo/cores. Original SVG city, sunset, palms and car illustration is drawn in assets/after-hours.svg; no Rockstar imagery or logos are included. Official reference reviewed: https://www.rockstargames.com/VI . This is visual inspiration, not a claim of an open-world game or Rockstar affiliation.

The main arena is full-width; the playbook is below it. The lobby is a poster with a directly accessible Let's ride action. During play the court markings remain fixed and cached. Pickups have a small pulse, team links carry moving signal dots, and collection produces brief expanding rings, flecks and rising point labels. Score feedback and pass reveals indicate actual events. No shaking camera, chasing cursor, rotating player glyph or player trail. The custom crosshair is a native browser cursor asset, not a JavaScript follower.

Effects quiet removes the added decorative motion and can be toggled from the pause screen. It is remembered locally; reduced-motion preferences override it. Gameplay movement remains necessary. Sounds remain opt-in. Cosmetic pickup streak never changes scoring, so recorded neural results/replays remain valid. The lab keeps paper panels for chart/table readability while sharing the darker outer frame.

Uses the previously requested Emil guidance: functional input stays immediate; effects explain collection, coordination and pass changes; transform/opacity for UI motion; a slow button sheen runs only in attract mode. The original brief has been revised by direct player feedback. Verify subjective enjoyment through actual playtests before claiming the redesign is fun or competitive.

First-run revision: an uncluttered mission strip sits outside the arena, with a progress bar tied directly to simulation ticks. A single static HOLD HERE marker guides the first real spark collection; it disappears after the pickup and never follows the mouse. Later missions teach line and triangle scoring. Results name actual link hits and cores, without inventing attribution to echoes or score multipliers.

## Earlier design history

# Design decisions

User explicitly requested Emil Kowalski's skills and avoidance of generic AI aesthetics. Read emil-design-eng/SKILL.md, animate/SKILL.md and animate/RECIPES.md from https://github.com/emilkowalski/skills on November 19, 2026.

Paper-colored outer surface, coal arena, blue player, orange first echo and gold second echo. Condensed italic display typography with restrained sans-serif interface text; monospace only for numerical/technical annotations. Native fonts make offline operation independent of external fonts. The initial screen uses a static arena preview to avoid distracting motion before play.

Motion purposes: button press = feedback, 200ms pass transition = state indication/explanation. Use transform and opacity with cubic-bezier(.23,1,.32,1). No transition-all, gratuitous page reveals or animated charts. Keyboard navigation changes are instant. Respect reduced motion and gate hover states on hover-capable fine pointers. Gameplay motion remains necessary to play; decorative trails are removed.

Tables and charts expose real experiment results. Never replace underperforming results with aspirational values. Keep descriptions of generated examples, training steps and games distinct. Real user feedback is required before claiming fun or accessibility validation.


Player feedback revision: direct 1:1 mouse positioning, a single controlled marker, no chase/inertia, no movement trails, fixed-orientation echoes and no animated opponent ring. Ghost sample interpolation preserves smooth replay without adding player latency. A short stable-contact rule affects scoring, not pointer responsiveness. Model planning is adapted to the same absolute-position interface. Previous steering claims/results belong to archived experiment-001.

Follow-up after continued discomfort: mouse mode now uses the native crosshair and omits the canvas player glyph, halo and YOU label. This avoids tying the visible mouse marker to requestAnimationFrame. Keyboard/touch keep the canvas player. No simulation, training or scoring change. Browser mode switching is verified; perceived comfort still needs user feedback.

Replay room follows the same paper/coal arena treatment. A native timeline seeks immediately without animated scrubbing. Imports and examples begin paused. The pass totals double as jump controls, with a quiet current-pass accent. The viewer uses PLAYER for recorded actors and clearly labels the saved neural example. No autoplay or camera motion is added.
