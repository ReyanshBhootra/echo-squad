# Experiment 001 — Can a small controller imitate teamwork?

## Actual method

Behavior cloning: a 610-parameter multilayer perceptron predicts two movement components from 16 engineered observations. A scripted controller supplies training labels. Tanh hidden/output units, squared-error loss, explicit SGD backpropagation; no ML framework or pretrained model. No reinforcement learning, insect connectome or human training dataset is involved.

The observation includes own position/velocity, relative nearest-spark position, a heuristic link endpoint, replay teammate position and short lookahead, phase, time and availability flags. Engineering that endpoint gives the learner substantial task information. Do not describe this as end-to-end learning from pixels.

Standard objective: L(theta) = mean ||pi_theta(observation) - teacher_action||² / 2. The code differentiates tanh using 1 - tanh(z)² and updates each weight by learning_rate × its gradient. This is established mathematics, not an original algorithm.

## Splits and selection

64 training layouts (1000–1063), 1,800 environment steps each, one example every four steps: 28,800 examples. Exploratory movement perturbs some expert actions to broaden visited states. Eight separate validation layouts (3000–3007), and 24 final test layouts (9000–9023). Three initialization seeds: 42, 43, 44. Twelve epochs, with checkpoints evaluated every two epochs. Select the checkpoint/run with highest validation game score, then report all runs on the test set. Epoch zero is an untrained baseline.

The example count, environment-step count and completed-episode count are different. Twelve epochs reuse the same examples. This first run generated 115,200 training-environment steps, not 115,200 games.

## First observed results

The selected checkpoint was seed 44, epoch 12. On the 24 held-out layouts:

| Controller | Mean score | Sample standard deviation |
|---|---:|---:|
| Random movement | 779.6 | 268.0 |
| Untrained seed-42 network | 211.7 | 84.8 |
| Selected trained network | 3533.1 | 518.2 |
| Greedy collector | 3952.9 | 364.6 |
| Scripted teamwork teacher | 4431.7 | 375.9 |
| Selected network with team inputs masked | 3808.5 | 390.9 |

Training improved the initial controllers, but this network does not outperform the simple greedy controller. Masking teammate information improved the selected model's mean score. We therefore do not have evidence that it learned useful cooperation. Masking at inference is an out-of-distribution sensitivity test, not a causal proof or a separately retrained no-team ablation.

Other initializations achieved different test outcomes. We keep the validation-selected model even though seed 42 scored higher on the test set, avoiding selection on held-out results. See evaluation.csv for each layout and each controller. Shared layouts make paired comparisons possible; variation across layouts is distinct from variation across training seeds. The table's standard deviations describe layout variation, not confidence intervals.

## Reproduce

From the project folder, run `node scripts/train.mjs`. It regenerates weights, raw CSV/JSON logs and the run manifest. Timing depends on hardware. `node --test tests/*.test.mjs` verifies deterministic replay, movement limits, scoring, geometry and a backpropagation sanity check. The exact simulator is imported by both browser and trainer.

## Limits and next experiment

No human usability testing has happened. Model-free simulations cannot establish enjoyment. This experiment has three initializations and a narrow layout distribution. The link-target feature is hand-engineered. Supervised validation loss need not track closed-loop game performance, and the present evidence suggests imitation/generalization limitations.

Next: examine failure trajectories and evaluate a revised controller on a new, untouched final test set if the current test results are used to guide development. Do not repeatedly tune to this test set and continue calling it untouched.

## Development record

These are digital notes written during implementation, not handwritten lab notes or a retroactive claim of manual research. The trained model and actual limitations are part of the playable training lab. Keep this document synchronized with any future experiment; do not silently overwrite historical results.
