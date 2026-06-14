// ===== Truth-recovery harness for component-nma =====
// Wires the repo's OWN runComponentNMA() engine against the known-truth DGP and
// measures, across study counts and tau2 levels:
//   - coverage of the TRUE component effects (95% CIs)
//   - coverage of TRUE relative effects (treatment rankings vs Placebo)
//   - bias in the recovered component effects
//   - tau2 recovery (estimated vs true)
//
// CRITICAL CHECK (sibling LivingNMA FE-CI bug): the engine builds RE weights
// W_re = 1/(v+tau2) and reports component CIs from vcov = (X'W_re X)^{-1}.
// We additionally compute what a PURE FIXED-EFFECT CI (W=1/v) would have given,
// to quantify how much under-coverage the FE-CI bug WOULD cause — and confirm
// the shipped engine does NOT exhibit it.

import { appState, runComponentNMA, matMul, matInverse } from './engine.mjs';
import { generateNetwork, TRUE_COMPONENTS, COMPONENT_NAMES, trueContrast } from './dgp-nma.mjs';

const Z = 1.959964;

// Re-fit a pure fixed-effect component model (W=1/v) to get FE component SEs,
// reproducing what the LivingNMA-style bug would report. Pure linear algebra,
// reusing the engine's matMul/matInverse so it is an apples-to-apples comparison.
function feComponentSEs(comparisons, components, sep) {
  const n = comparisons.length, p = components.length;
  const X = [], Wv = [];
  for (let i = 0; i < n; i++) {
    const c1 = comparisons[i].treat1 === 'Placebo' ? [] : comparisons[i].treat1.split(sep);
    const c2 = comparisons[i].treat2 === 'Placebo' ? [] : comparisons[i].treat2.split(sep);
    const row = [];
    for (let j = 0; j < p; j++) {
      row.push((c1.indexOf(components[j]) >= 0 ? 1 : 0) - (c2.indexOf(components[j]) >= 0 ? 1 : 0));
    }
    X.push(row);
    Wv.push(1 / (comparisons[i].se * comparisons[i].se)); // FE weight: 1/v only
  }
  // XtWX
  const XtWX = [];
  for (let a = 0; a < p; a++) { XtWX[a] = []; for (let b = 0; b < p; b++) {
    let s = 0; for (let i = 0; i < n; i++) s += X[i][a] * Wv[i] * X[i][b]; XtWX[a][b] = s;
  } }
  const inv = matInverse(XtWX);
  return components.map((_, j) => Math.sqrt(Math.max(0, inv[j][j])));
}

export function runCell(opts) {
  const reps = opts.reps || 400;
  let covRE = 0, covFE = 0, covRel = 0, biasSum = 0, biasN = 0;
  let tau2Sum = 0, tau2N = 0;
  let relN = 0, compN = 0;

  for (let r = 0; r < reps; r++) {
    const ds = generateNetwork({ seed: 1000 + r * 7919, nStudies: opts.nStudies, tau2: opts.tau2 });
    appState.comparisons = ds.comparisons;
    appState.separator = '+';
    appState.components = [];
    appState.treatments = [];

    const res = runComponentNMA();
    if (!res || !res.components) continue;

    const compMap = {};
    res.components.forEach(c => { compMap[c.component] = c; });

    // FE-CI counterfactual SEs (the bug)
    const feSE = feComponentSEs(ds.comparisons, res.modelFit ? COMPONENT_NAMES.slice().sort() : COMPONENT_NAMES, '+');
    const compOrder = COMPONENT_NAMES.slice().sort();

    // Component-effect coverage (RE, as shipped) and FE counterfactual
    for (let j = 0; j < compOrder.length; j++) {
      const name = compOrder[j];
      const truth = TRUE_COMPONENTS[name];
      const c = compMap[name];
      if (!c) continue;
      compN++;
      biasSum += (c.effect - truth); biasN++;
      // shipped RE Wald CI
      if (truth >= c.ciLo && truth <= c.ciHi) covRE++;
      // FE counterfactual CI centered at same estimate
      const feLo = c.effect - Z * feSE[j], feHi = c.effect + Z * feSE[j];
      if (truth >= feLo && truth <= feHi) covFE++;
    }

    // tau2 recovery
    if (res.modelFit) { tau2Sum += res.modelFit.tau2; tau2N++; }

    // Relative-effect coverage: treatment rankings (effect vs Placebo) from RE model
    if (res.rankings) {
      res.rankings.forEach(rk => {
        const truth = trueContrast(rk.treatment, 'Placebo');
        if (rk.treatment === 'Placebo') return;
        relN++;
        if (truth >= rk.ciLo && truth <= rk.ciHi) covRel++;
      });
    }
  }

  return {
    nStudies: opts.nStudies,
    tau2: opts.tau2,
    reps,
    coverage_RE_components: covRE / compN,
    coverage_FE_components: covFE / compN,
    coverage_RE_relative: covRel / relN,
    mean_bias_components: biasSum / biasN,
    mean_tau2_hat: tau2Sum / tau2N,
    true_tau2: opts.tau2,
  };
}

export function runGrid() {
  const cells = [
    { nStudies: 24, tau2: 0.00 },
    { nStudies: 24, tau2: 0.05 },
    { nStudies: 24, tau2: 0.15 },
    { nStudies: 48, tau2: 0.05 },
    { nStudies: 48, tau2: 0.15 },
  ];
  return cells.map(c => runCell({ ...c, reps: 400 }));
}

// CLI
if (process.argv[1] && process.argv[1].endsWith('harness.mjs')) {
  const rows = runGrid();
  console.log('cNMA truth-recovery grid (400 reps/cell)\n');
  console.log('nStudies tau2  | covRE_comp covFE_comp covRE_rel | bias    tau2_hat(true)');
  rows.forEach(r => {
    console.log(
      String(r.nStudies).padStart(7), String(r.tau2).padStart(5), ' | ',
      r.coverage_RE_components.toFixed(3).padStart(9),
      r.coverage_FE_components.toFixed(3).padStart(10),
      r.coverage_RE_relative.toFixed(3).padStart(9), ' | ',
      (r.mean_bias_components >= 0 ? '+' : '') + r.mean_bias_components.toFixed(3),
      ' ', r.mean_tau2_hat.toFixed(3) + '(' + r.true_tau2 + ')'
    );
  });
}
