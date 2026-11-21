# AI-assisted workflow — evidence, failures and player feedback

This is an optional workflow-story draft. It does not claim Junie or Air use. JETBRAINS.md is the detailed record of actual PyCharm work; its screenshot documents Experiment 001, not a later IDE session.

The project was built by a solo entrant working with Codex. AI assistance covered simulation code, interface iterations, neural training code, regression checks, experiment plotting and reproducible packaging. The decisions were driven by observed failures rather than an assumed winning idea.

The first neural pilot underperformed simple scripted opponents. An intermediate direct-control experiment then exposed a scoring exploit: random sweeps were stronger than the intended strategy. We archived both versions and their results, revised contact scoring and trained a smaller target-preference controller. The current network uses an engineered planner; its strong untrained baseline is disclosed instead of being hidden behind the training-data count.

Player feedback also changed the product. The mouse-following marker was uncomfortable, so the visible mouse player became a native browser cursor. A restrained interface felt flat to the entrant, so the presentation moved to original coastal-night artwork and event-driven effects. Quiet mode preserves an alternative to the added motion. The entrant subsequently said the visual direction felt closer; this is not presented as a structured playtest.

PyCharm Community 2024.3 was used to open the project, format the independent Python audit and run it with Python 3.12. The audit verifies model checksum, distinct data splits and CSV-derived summaries independently of the JavaScript exporter. Most coding, all training and current experiment audits were performed outside the IDE. That limited but real role is documented with source, configuration and a screenshot; no additional IDE use is invented for a prize story.

Evidence: research/EXPERIMENT.md, archived experiment-001 and experiment-002, research/manifest.json, scripts/audit_results.py, JETBRAINS.md and VERIFICATION.md.
