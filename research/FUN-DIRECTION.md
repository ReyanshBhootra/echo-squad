# Fun and graphics direction — November 22, 2026

Status: researched recommendation, not an implemented or deployed game mode. Public build remains 0.5.0. The entrant finds the game boring despite accepting the After Hours visual direction as closer. Treat gameplay enjoyment as unresolved; do not call it finished solely because the code and hosting work.

## What the reference actually showed

Opened https://playgta5.com/ in the in-app browser, selected Sandbox Mode and GTA V Map, and observed an actual rendered 3D street scene with buildings, a vehicle, vegetation, fences, utility wires and a minimap. Loading displayed approximately 899 MB before the scene appeared. This was a visual inspection, not a verification of the entire retail campaign, every game mode, frame rate or asset rights. No launcher, extension, certificate or external executable was installed.

A related public project describes its contents as a compiled browser-client snapshot with separate game data, not original engine source: https://github.com/gudeakhil/playgta5v2 . A browser port of existing content does not establish that its authors built a GTA-sized world from scratch. Use the reference to understand depth and world presentation; create original content for ECHO SQUAD.

NVIDIA’s official GTA V graphics guide covers lighting, shadows, reflections, ambient occlusion, material detail and world density: https://www.nvidia.com/en-us/geforce/news/grand-theft-auto-v-pc-graphics-and-performance-guide/ . Our earlier neon palette and menu illustration do not supply those qualities inside the playable arena.

## Evidence about animation and enjoyment

Kao et al., CHI 2024, preregistered online experiment n=1,699: success-dependent feedback improved the tested motivational outcomes; indiscriminate amplification could reduce them. Curiosity was the strongest enjoyment predictor and the only playtime predictor in their model. This was a particular action-RPG experiment, not proof of what ECHO SQUAD players prefer. https://people.csail.mit.edu/dkao/pdf/3613904.3642656.pdf

Pichlmair and Johansen’s survey separates physicality, amplification and support. Implication for this project: improve how actions behave and what choices they create, alongside effects. https://arxiv.org/abs/2011.09201

Lin et al.’s action-game study identified sound coherence, hit stop and camera control as potentially important impact-feedback features; it is not a universal prescription for adding screen shake. Our player previously reported dizziness, so preserve immediate controls and a stable camera. https://faculty.washington.edu/zkwen/articles/lin22features.pdf

## Diagnosis — design inference

The present game mainly rewards touching abstract items. The visual identity improved, but there is little danger, no decisive escape/win objective and limited variation in the player’s immediate decisions. The echoes are mechanically distinctive, yet often read as moving geometry rather than a crew doing something together. More decorative animation will not test those weaknesses.

## Recommended next main mode: Echo Heist

One original 3D district, one short mission, three replay passes. Target roughly 60–90 seconds of active play and a clean booth reset. Raised fixed camera keeps the current player and two echoes visible while giving buildings, characters, props and light actual depth. Use immediate WASD/arrow movement plus a dash button; preserve predictable movement and do not reintroduce mouse pursuit.

1. Scout: collect power cells while avoiding clearly signaled security attacks. The route is recorded.
2. Sync: the first echo returns. Sweep the line between you through security relays to break shields/open a route; record a complementary second route.
3. Escape: both echoes return. Enclose the vault core with the squad triangle to trigger an EMP, crack the vault and reach the exit before lockdown.

These are design targets, not completed mechanics. A meaningful success/failure state, readable threats and a tempting optional reward should create decisions: safe route versus a risky relay, early dash versus saving it, easy pickups versus positioning the final triangle. The echoes remain the essential differentiator.

## Proposed feedback hierarchy — initial tuning hypotheses

| Event | Proposed response | Purpose |
| --- | --- | --- |
| Movement/dash | Immediate displacement, responsive body pose, brief ground dust/footstep cue | Make control legible and grounded |
| Incoming attack | Clear wind-up/cone or ground marker before the hit | Give a fair opportunity to react |
| Successful link | Shield snaps, enemy/relay reacts, synchronized spark and sound | Explain exactly what the line accomplished |
| Triangle completion | Local EMP ring, vault deformation/break, loot arc and exit lights | Give the signature mechanic a dramatic payoff |
| Minor pickup | Small flash/chime | Keep major successes visually valuable |
| Damage | Brief character reaction and clear health loss | Communicate consequence without freezing input |

No global camera shake or motion blur by default. Quiet effects remains. Any hit pause should affect the struck object, not the player’s input response. Effects should scale with actual success, not fire randomly on every movement.

## Graphics target

A compact, polished 3D scene with consistent scale, contact shadows, contrasting asphalt/metal/glass surfaces, emissive signs, moving security actors and visible effects on props. Budget the scene for responsive play. Do not promise GTA-scale fidelity or an open world. Prioritize one convincing interaction over a large empty map.

## Alternatives considered

| Option | Decision |
| --- | --- |
| Add more bloom/particles to the existing collection board | Insufficient test of the missing stakes and decisions |
| Build an open-world driving sandbox | Too much world/handling scope; replay teamwork could become incidental |
| Compact 3D heist using replay links and triangles | Recommended: gives existing mechanics an understandable purpose and a memorable ending |
| Separate modes for racing, survival and heist immediately | Defer; polish one complete mission before multiplying modes |

## Preserve the actual project assets and evidence

Keep current classic 0.5.0 available during development. Its simulator, replay viewer, local leaderboard, booth reset, source history and saved experiments remain useful. Current neural metrics describe classic echo-0.2-precision only. A new heist ruleset needs a new version, compatible recording/action schema and fresh training/validation/test layouts if it gets a learned rival. Do not advertise the current model as trained for security, dash, collisions or heist objectives.

## Acceptance test before declaring success

Build one complete mission: start, all three passes, vault/escape or failure, score and retry. Observe unfamiliar players without coaching: do they understand why an echo helped, can they identify why they won/lost, do controls feel immediate, and do they voluntarily replay? Record actual observations and loading/frame-time measurements. Research suggests a hypothesis; it does not establish that this mode is fun or will win a prize.
