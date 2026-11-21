# Verified local checkpoint — November 19, 2026

## Automated checks

Ten Node tests passed: deterministic simulation and replay, exact teammate timing, adversarial movement bounds, single-collection scoring, geometric edge cases, action-independent seeded layouts, backpropagation sanity, model checksum, disjoint data splits and one independently reproduced held-out model evaluation. JavaScript syntax checks also passed before final formatting.

PyCharm ran scripts/audit_results.py with Python 3.12: exit code 0. It independently recomputed every exported aggregate from all 192 evaluation rows and verified the model SHA-256 and data splits. Actual screenshot is in research/jetbrains-audit.jpg.

## Browser observations

Tool-driven Chrome checks, not human playtests:

- Completed a real-time 1,800-step neural challenge through phases 0, 1, 2 and ending phase 3. Approximately 64.1 seconds including transition explanations. The procedural pointer driver scored 2,740; the neural rival scored 3,950 on arena seed 9019.
- No JavaScript exceptions in that run. Saved the score through the result form, verified the stored record and spectator update, then removed only the generated QA row.
- A callsign containing literal HTML was displayed as text, with no injected element.
- Held-out layout 9000 produced exactly 3,415 neural points in both Node and Chrome.
- Training lab rendered the actual logs, selected model and all baseline summaries; both trained and untrained checkpoint demonstrations were exercised.
- Spectator page reported the arena connected and received the local score and board.
- Escape paused the simulation; its step count remained unchanged while paused.
- Desktop focus mode fit the arena inside the viewport. A 390 × 844 emulated touch viewport had no horizontal overflow and kept the arena on screen. This is not a physical mobile-device usability test.
- Focus mode makes background controls inert and restores them on return to lobby.
- Stopped the actual development server, reloaded the page, fetched the model and rendered the lab chart successfully. An uncached request returned the service worker's 503 response while the cached model returned 200, verifying cached operation rather than relying on network emulation. Restarted the server afterward.
- The latest service-worker cache, echo-squad-v2, installed after adding downloadable figures.

## Not yet established

No real first-time player observations, voluntary replay measurements, physical booth test, two-hour endurance soak, accessibility audit, public deployment, registration or submission. The selected neural model remains below the greedy baseline and has not demonstrated useful learned cooperation. Do not describe this checkpoint as a validated winning entry.

## Reproduce core checks

Run npm test and python scripts/audit_results.py from the project folder. Run npm start and use the documented player flow for browser checks. Optional figure reproduction uses Python/Matplotlib as described in scripts/plot.py. Browser QA actions above were performed through tooling; there is no committed Playwright runner yet.
