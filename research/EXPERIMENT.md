# Experiment 003 — Direct controls and stable target selection

## Trigger: real player feedback

The first player reported that the drone stayed behind the mouse, felt annoying, and caused dizziness. The original velocity controller deliberately capped speed and added acceleration. That was the wrong default for this mouse-driven game.

The new player marker uses the latest absolute pointer position on every rendered frame. There is no acceleration, smoothing, pursuit or residual momentum. The simulation samples those positions at 30 Hz for scoring and deterministic replay. Ghosts interpolate recorded samples for rendering. No spinning markers, trailing paths or separate opponent cursor are shown. The camera stays fixed.

## A genuine intermediate failure

An initial direct-control trial (archived in experiment-002) used swept collection. Random rapid sweeps averaged 7692.917 points, outperforming the scripted teamwork pilot's 7342.292. That exposed a scoring loophole. It was a project-specific engineering finding, not a novel scientific result.

Current rules require contact in two consecutive simulation samples (about 33–67 ms depending on input timing). The controlled marker still responds immediately. A target visibly brightens during the first contact sample before collection. This contact check applies to all controllers and replay teammates. Rule version: echo-0.2-precision. Old scores remain stored separately and do not enter this board.

## Current learning task

The 610-parameter tanh network chooses between two engine-supplied candidates: the nearest blue spark and a heuristic link endpoint. The engine moves directly to its selected candidate. It does not learn raw pointer movement, discover targets from pixels or learn the whole game from scratch. The untrained network already has that engineered planner.

The teacher labels are spark preference [1,-1] or link preference [-1,1]. Loss is mean squared preference error; optimization is explicit SGD/backpropagation. This is supervised imitation, not reinforcement learning. Masking team information also removes the link candidate, so the masking test includes a change to available actions; it does not isolate a causal neural mechanism.

## Data and selection

64 synthetic training episodes, 28,800 sampled observations, 115,200 generated environment steps, 12 epochs reusing the data, 3 weight initializations. New training seeds: 21000–21063. Validation: 23000–23007. Final evaluation: 29000–29023. These do not overlap the previous experiment's layouts. Selection used validation scores only: seed 43, epoch 4.

## Actual results

| Controller | Mean score | Sample SD | Test layouts |
|---|---:|---:|---:|
| Random movement | 1868.958 | 281.595 | 24 |
| Untrained target selector | 5420.208 | 413.502 | 24 |
| Selected neural selector | 5917.292 | 431.378 | 24 |
| Greedy collector | 5592.917 | 288.429 | 24 |
| Scripted teamwork | 5722.708 | 537.820 | 24 |
| Neural / team inputs masked | 5592.917 | 288.429 | 24 |

The selected learned selector scored higher on average than the greedy and scripted teamwork controllers on these layouts. That is an exploratory result from three initializations, not proof of general superiority or human enjoyment. Variability across layouts is separate from variability across training runs. The large untrained baseline makes clear how much capability comes from the engineered planner.

The random-controller score from the swept trial is not directly comparable as a model improvement: the scoring rules changed. Its decline under current rules documents the intended effect of the contact requirement. All current controller comparisons use identical rules and seeds.

## Reproduce and inspect

Run npm run train, npm test and python scripts/audit_results.py. The same simulator is used in the browser. Optional plots: python scripts/plot.py with the pinned plotting requirement. Model checksum, individual layout rows, all initialization results and validation curves are included. Historical experiment-001 is reproducible from Git commit 9d0115e. Intermediate experiment-002 includes simulator, neural and trainer source snapshots.

No structured first-time player study, physical booth test or scientific novelty claim. This experiment responds to one real player's control complaint; whether the revision feels good still requires that player's retest.
