// ===== Seeded known-truth Component-NMA data-generating process =====
// Additive component model with a connected multi-treatment network.
//
// KNOWN ground truth:
//   - component effects d[c] (effect of adding component c vs. its absence),
//     all relative to the reference "Placebo" (no components).
//   - the true relative effect of treatment t1 vs t2 is
//         theta_{t1,t2} = sum_c d[c] * (1[c in t1] - 1[c in t2])
//     so EVERY pairwise relative effect is known exactly from the d vector.
//   - common between-study heterogeneity variance tau2 (additive on the contrast).
//
// Output: trial-level contrasts {study, t1, t2, y, se, v} where
//   y ~ Normal( theta_{t1,t2} , tau2 + se^2 ).

// --- mulberry32 seeded PRNG ---
function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function makeNormal(rng) {
  return function (mean, sd) {
    let u = 0, v = 0;
    while (u === 0) u = rng();
    while (v === 0) v = rng();
    const z = Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
    return mean + sd * z;
  };
}

// The fixed component-effect ground truth (negative = beneficial, like the smoking demo).
export const TRUE_COMPONENTS = { A: -0.60, B: -0.40, C: -0.25 };
export const COMPONENT_NAMES = Object.keys(TRUE_COMPONENTS);

// Helper: true effect of a treatment label ("A+B", "Placebo", ...) vs Placebo.
function treatEffect(label) {
  if (label === 'Placebo') return 0;
  return label.split('+').reduce((s, c) => s + (TRUE_COMPONENTS[c] || 0), 0);
}

// True relative effect t1 vs t2 (= additive contrast).
export function trueContrast(t1, t2) {
  return treatEffect(t1) - treatEffect(t2);
}

// A connected network of treatment-vs-comparator design "slots".
// Every component appears alone vs Placebo AND in combination, giving an
// identifiable additive design (treatments far exceed components).
const NETWORK_DESIGNS = [
  ['A', 'Placebo'],
  ['B', 'Placebo'],
  ['C', 'Placebo'],
  ['A+B', 'Placebo'],
  ['A+C', 'Placebo'],
  ['B+C', 'Placebo'],
  ['A+B', 'A'],
  ['A+B', 'B'],
  ['A+C', 'C'],
  ['A+B+C', 'A+B'],
  ['A+B+C', 'Placebo'],
  ['B+C', 'C'],
];

/**
 * Generate one trial-level dataset (comparisons) from the known truth.
 * @param {object} opts
 *   seed        - PRNG seed (integer)
 *   nStudies    - number of trials (>= designs; designs are recycled)
 *   tau2        - true between-study heterogeneity variance
 *   seMin,seMax - sampling-SE range drawn uniformly per trial
 * @returns {{comparisons: Array, tau2: number, components: object}}
 */
export function generateNetwork(opts) {
  const seed = opts.seed >>> 0;
  const nStudies = opts.nStudies || 24;
  const tau2 = opts.tau2 != null ? opts.tau2 : 0.05;
  const seMin = opts.seMin != null ? opts.seMin : 0.18;
  const seMax = opts.seMax != null ? opts.seMax : 0.32;

  const rng = mulberry32(seed);
  const rnorm = makeNormal(rng);
  const comparisons = [];

  for (let i = 0; i < nStudies; i++) {
    const design = NETWORK_DESIGNS[i % NETWORK_DESIGNS.length];
    const t1 = design[0], t2 = design[1];
    const theta = trueContrast(t1, t2);
    const se = seMin + (seMax - seMin) * rng();
    const v = se * se;
    // true study mean = theta + heterogeneity deviate; observed = trueStudyMean + sampling error
    const studyMean = tau2 > 0 ? rnorm(theta, Math.sqrt(tau2)) : theta;
    const y = rnorm(studyMean, se);
    comparisons.push({
      study: 'study' + (i + 1),
      treat1: t1,
      treat2: t2,
      effect: y,
      se: se,
      v: v,
      trueContrast: theta,
    });
  }
  return { comparisons, tau2, components: { ...TRUE_COMPONENTS } };
}
