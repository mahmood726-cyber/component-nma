# Truth-Recovery Validation — component-nma

**Engine:** component-nma.html (additive Component Network Meta-Analysis, pure-JS WLS).
**Method:** seeded known-truth additive-component network DGP -> repo's own runComponentNMA()
-> measured coverage of true component & relative effects, bias, and tau2 recovery.

## Verdict: STRONG-VALIDATION (with one minor, conservative-direction caveat)

The engine recovers the true additive component effects without bias, and -- unlike the
sibling LivingNMA engine -- it reports genuine random-effects CIs (vcov = (X' W_re X)^-1
with W_re = 1/(v+tau2)), so it does NOT exhibit the FE-CI under-coverage bug.

## How it works (verified)

runComponentNMA() builds the component design matrix X[i][j] = 1[c_j in t1] - 1[c_j in t2],
estimates tau2, then fits random-effects WLS with weights 1/(v_i + tau2). Component CIs,
treatment rankings, and their CIs all come from the RE variance-covariance matrix.

## Results (400 reps/cell; component truth A=-0.60, B=-0.40, C=-0.25)

| nStudies | true tau2 | cov RE (components) | cov FE-counterfactual | cov RE (relative) | mean bias | mean tau2_hat |
|---:|---:|---:|---:|---:|---:|---:|
| 24 | 0.00 | 0.998 | 0.938 | 0.996 | -0.001 | 0.090 |
| 24 | 0.05 | 0.997 | 0.854 | 0.991 | -0.001 | 0.140 |
| 24 | 0.15 | 0.982 | 0.698 | 0.978 | -0.001 | 0.240 |
| 48 | 0.05 | 0.990 | 0.837 | 0.989 | -0.000 | 0.138 |
| 48 | 0.15 | 0.979 | 0.691 | 0.977 | +0.000 | 0.238 |

### Key findings

1. Unbiased recovery. Mean bias of recovered component effects is <=0.001 in every cell.
2. No FE-CI bug. Shipped RE component coverage stays 0.979-0.998 across all tau2. The
   FE-CI counterfactual (W=1/v, as the sibling LivingNMA used) collapses to 0.698 at
   tau2=0.15 -- a 28-point under-coverage the engine correctly avoids.
3. Relative-effect coverage (treatment-vs-Placebo) is 0.977-0.996 -- correct.
4. Minor caveat -- tau2 over-estimated (conservative direction). tau2_hat inflated ~+0.09
   above truth (true 0 -> 0.090; true 0.15 -> 0.240). Cause: remlTau2() is univariate REML
   on raw contrasts, ignoring the additive design, so between-design effect spread is
   mis-attributed to heterogeneity (confirmed: single homogeneous design, true tau2=0,
   gives tau2_hat~0.037). Impact is SAFE: over-estimated tau2 widens RE CIs, which is why
   coverage is slightly conservative rather than anti-conservative.

## Recommendation

Ship the validation; no engine change required. Optional refinement: estimate tau2 from the
component-model RE-WLS residuals (already computed for Q_re) instead of raw contrasts, to
remove the ~+0.09 tau2 inflation and tighten CIs toward exact nominal. Accuracy refinement,
not a correctness fix.

## Files
- engine.mjs -- verbatim math + runComponentNMA() from component-nma.html, DOM/appState stubbed.
- dgp-nma.mjs -- seeded known-truth additive network DGP.
- harness.mjs -- coverage/bias/tau2 measurement + FE-CI counterfactual.
- test-truth-recovery.mjs -- node --test suite (6 assertions, all pass).
