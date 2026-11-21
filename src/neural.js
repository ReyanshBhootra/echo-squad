import { random, observe, targets, pointAction } from "./sim.js";
export const INPUTS = 16,
  HIDDEN = 32,
  OUTPUTS = 2;
export function makeModel(seed = 42) {
  const rng = random(seed),
    init = (n, scale) =>
      Array.from({ length: n }, () => (rng() * 2 - 1) * scale);
  return {
    architecture: [INPUTS, HIDDEN, OUTPUTS],
    method: "behavior-cloning-target-selection",
    w1: init(INPUTS * HIDDEN, 0.3),
    b1: Array(HIDDEN).fill(0),
    w2: init(HIDDEN * OUTPUTS, 0.15),
    b2: [0, 0],
  };
}
export function forward(m, x) {
  const h = Array(HIDDEN).fill(0),
    y = [0, 0];
  for (let j = 0; j < HIDDEN; j++) {
    let z = m.b1[j];
    for (let i = 0; i < INPUTS; i++) z += x[i] * m.w1[j * INPUTS + i];
    h[j] = Math.tanh(z);
  }
  for (let k = 0; k < 2; k++) {
    let z = m.b2[k];
    for (let j = 0; j < HIDDEN; j++) z += h[j] * m.w2[k * HIDDEN + j];
    y[k] = Math.tanh(z);
  }
  return { h, y };
}
export function predict(m, s, hideTeam = false) {
  const values = forward(m, observe(s, hideTeam)).y;
  const candidates = targets(s);
  const target =
    !hideTeam && candidates.link && values[1] > values[0]
      ? candidates.link
      : candidates.spark;
  return pointAction(target || s.p);
}
export const parameterCount = (m) =>
  m.w1.length + m.b1.length + m.w2.length + m.b2.length;
// Plain SGD backpropagation; all training math is inspectable and reproducible.
export function trainExample(m, x, target, rate = 0.008) {
  const { h, y } = forward(m, x),
    dy = y.map((v, k) => (v - target[k]) * (1 - v * v));
  const dh = h.map(
    (v, j) => (dy[0] * m.w2[j] + dy[1] * m.w2[HIDDEN + j]) * (1 - v * v),
  );
  for (let k = 0; k < 2; k++) {
    for (let j = 0; j < HIDDEN; j++)
      m.w2[k * HIDDEN + j] -= rate * dy[k] * h[j];
    m.b2[k] -= rate * dy[k];
  }
  for (let j = 0; j < HIDDEN; j++) {
    for (let i = 0; i < INPUTS; i++)
      m.w1[j * INPUTS + i] -= rate * dh[j] * x[i];
    m.b1[j] -= rate * dh[j];
  }
  return ((y[0] - target[0]) ** 2 + (y[1] - target[1]) ** 2) / 2;
}
