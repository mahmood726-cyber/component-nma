// node --test  —  truth-recovery assertions for component-nma
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { appState, runComponentNMA } from './engine.mjs';
import { generateNetwork, TRUE_COMPONENTS } from './dgp-nma.mjs';
import { runCell } from './harness.mjs';

function fitOnce(seed, nStudies, tau2) {
  const ds = generateNetwork({ seed, nStudies, tau2 });
  appState.comparisons = ds.comparisons;
  appState.separator = '+';
  appState.components = [];
  appState.treatments = [];
  return runComponentNMA();
}

test('engine recovers true additive component effects (unbiased)', () => {
  const res = fitOnce(12345, 48, 0.05);
  const map = {};
  res.components.forEach(c => { map[c.component] = c.effect; });
  for (const name of Object.keys(TRUE_COMPONENTS)) {
    // single stochastic draw: ~2.5 per-rep SE tolerance (point recovery, not aggregate bias)
    assert.ok(Math.abs(map[name] - TRUE_COMPONENTS[name]) < 0.18,
      `${name}: est ${map[name].toFixed(3)} vs true ${TRUE_COMPONENTS[name]}`);
  }
});

test('mean bias of component effects is negligible over many reps', () => {
  const cell = runCell({ nStudies: 48, tau2: 0.05, reps: 200 });
  assert.ok(Math.abs(cell.mean_bias_components) < 0.02,
    `mean bias ${cell.mean_bias_components}`);
});

test('shipped RE component CIs achieve >=0.93 coverage at tau2=0.15 (NO FE-CI bug)', () => {
  const cell = runCell({ nStudies: 48, tau2: 0.15, reps: 300 });
  assert.ok(cell.coverage_RE_components >= 0.93,
    `RE coverage ${cell.coverage_RE_components}`);
});

test('FE-CI counterfactual UNDER-covers at tau2=0.15 (confirms RE refit is necessary)', () => {
  const cell = runCell({ nStudies: 48, tau2: 0.15, reps: 300 });
  // The pure fixed-effect CI would collapse well below nominal under heterogeneity.
  assert.ok(cell.coverage_FE_components < 0.85,
    `FE coverage unexpectedly high: ${cell.coverage_FE_components}`);
  // And the shipped RE coverage must beat the FE counterfactual by a clear margin.
  assert.ok(cell.coverage_RE_components - cell.coverage_FE_components > 0.10,
    `RE-FE gap too small: ${cell.coverage_RE_components - cell.coverage_FE_components}`);
});

test('relative-effect (treatment-vs-Placebo) CIs achieve >=0.93 coverage under heterogeneity', () => {
  const cell = runCell({ nStudies: 48, tau2: 0.15, reps: 300 });
  assert.ok(cell.coverage_RE_relative >= 0.93,
    `relative coverage ${cell.coverage_RE_relative}`);
});

test('tau2 estimate is non-negative and tracks the true value monotonically', () => {
  const lo = runCell({ nStudies: 48, tau2: 0.00, reps: 150 });
  const hi = runCell({ nStudies: 48, tau2: 0.15, reps: 150 });
  assert.ok(lo.mean_tau2_hat >= 0 && hi.mean_tau2_hat >= 0);
  assert.ok(hi.mean_tau2_hat > lo.mean_tau2_hat,
    `tau2_hat not monotone: ${lo.mean_tau2_hat} -> ${hi.mean_tau2_hat}`);
});
