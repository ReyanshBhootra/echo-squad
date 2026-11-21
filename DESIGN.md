# Design decisions

User explicitly requested Emil Kowalski's skills and avoidance of generic AI aesthetics. Read emil-design-eng/SKILL.md, animate/SKILL.md and animate/RECIPES.md from https://github.com/emilkowalski/skills on November 19, 2026.

Paper-colored outer surface, coal arena, blue player, orange first echo and gold second echo. Condensed italic display typography with restrained sans-serif interface text; monospace only for numerical/technical annotations. Native fonts make offline operation independent of external fonts. The initial screen uses a static arena preview to avoid distracting motion before play.

Motion purposes: button press = feedback, 200ms pass transition = state indication/explanation. Use transform and opacity with cubic-bezier(.23,1,.32,1). No transition-all, gratuitous page reveals or animated charts. Keyboard navigation changes are instant. Respect reduced motion and gate hover states on hover-capable fine pointers. Gameplay motion remains necessary to play; decorative trails are removed.

Tables and charts expose real experiment results. Never replace underperforming results with aspirational values. Keep descriptions of generated examples, training steps and games distinct. Real user feedback is required before claiming fun or accessibility validation.


Player feedback revision: direct 1:1 mouse positioning, a single controlled marker, no chase/inertia, no movement trails, fixed-orientation echoes and no animated opponent ring. Ghost sample interpolation preserves smooth replay without adding player latency. A short stable-contact rule affects scoring, not pointer responsiveness. Model planning is adapted to the same absolute-position interface. Previous steering claims/results belong to archived experiment-001.
