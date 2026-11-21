# Current direction — AFTER HOURS, build 0.4.0

The user rejected the earlier restrained presentation as boring for a game and named GTA VI as a visual reference. Current direction: original coastal-night arcade identity, cream display type, near-black plum/asphalt, cyan player, hot-pink first echo/diamonds and warm-gold second echo/cores. Original SVG city, sunset, palms and car illustration is drawn in assets/after-hours.svg; no Rockstar imagery or logos are included. Official reference reviewed: https://www.rockstargames.com/VI . This is visual inspiration, not a claim of an open-world game or Rockstar affiliation.

The main arena is full-width; the playbook is below it. The lobby is a poster with a directly accessible Let's ride action. During play the court markings remain fixed and cached. Pickups have a small pulse, team links carry moving signal dots, and collection produces brief expanding rings, flecks and rising point labels. Score feedback and pass reveals indicate actual events. No shaking camera, chasing cursor, rotating player glyph or player trail. The custom crosshair is a native browser cursor asset, not a JavaScript follower.

Effects quiet removes the added decorative motion and can be toggled from the pause screen. It is remembered locally; reduced-motion preferences override it. Gameplay movement remains necessary. Sounds remain opt-in. Cosmetic pickup streak never changes scoring, so recorded neural results/replays remain valid. The lab keeps paper panels for chart/table readability while sharing the darker outer frame.

Uses the previously requested Emil guidance: functional input stays immediate; effects explain collection, coordination and pass changes; transform/opacity for UI motion; a slow button sheen runs only in attract mode. The original brief has been revised by direct player feedback. Verify subjective enjoyment through actual playtests before claiming the redesign is fun or competitive.

## Earlier design history

# Design decisions

User explicitly requested Emil Kowalski's skills and avoidance of generic AI aesthetics. Read emil-design-eng/SKILL.md, animate/SKILL.md and animate/RECIPES.md from https://github.com/emilkowalski/skills on November 19, 2026.

Paper-colored outer surface, coal arena, blue player, orange first echo and gold second echo. Condensed italic display typography with restrained sans-serif interface text; monospace only for numerical/technical annotations. Native fonts make offline operation independent of external fonts. The initial screen uses a static arena preview to avoid distracting motion before play.

Motion purposes: button press = feedback, 200ms pass transition = state indication/explanation. Use transform and opacity with cubic-bezier(.23,1,.32,1). No transition-all, gratuitous page reveals or animated charts. Keyboard navigation changes are instant. Respect reduced motion and gate hover states on hover-capable fine pointers. Gameplay motion remains necessary to play; decorative trails are removed.

Tables and charts expose real experiment results. Never replace underperforming results with aspirational values. Keep descriptions of generated examples, training steps and games distinct. Real user feedback is required before claiming fun or accessibility validation.


Player feedback revision: direct 1:1 mouse positioning, a single controlled marker, no chase/inertia, no movement trails, fixed-orientation echoes and no animated opponent ring. Ghost sample interpolation preserves smooth replay without adding player latency. A short stable-contact rule affects scoring, not pointer responsiveness. Model planning is adapted to the same absolute-position interface. Previous steering claims/results belong to archived experiment-001.

Follow-up after continued discomfort: mouse mode now uses the native crosshair and omits the canvas player glyph, halo and YOU label. This avoids tying the visible mouse marker to requestAnimationFrame. Keyboard/touch keep the canvas player. No simulation, training or scoring change. Browser mode switching is verified; perceived comfort still needs user feedback.

Replay room follows the same paper/coal arena treatment. A native timeline seeks immediately without animated scrubbing. Imports and examples begin paused. The pass totals double as jump controls, with a quiet current-pass accent. The viewer uses PLAYER for recorded actors and clearly labels the saved neural example. No autoplay or camera motion is added.
