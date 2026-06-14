// ===== component-nma engine — VERBATIM EXTRACTION =====
// Pure numerical functions extracted from component-nma.html (lines 283-557, 632-878).
// DOM/appState stubbed below so runComponentNMA() runs headless.
// NOTHING in the math is modified.

// --- DOM stub: runComponentNMA reads $('includeInteractions').checked ---
var __INCLUDE_INTERACTIONS = false;
function $(id){
  if (id === 'includeInteractions') return { checked: __INCLUDE_INTERACTIONS };
  return null;
}

// --- appState stub (comparisons set by harness before calling runComponentNMA) ---
var appState = {
  comparisons: [],
  components: [],
  treatments: [],
  designMatrix: null,
  results: null,
  separator: '+'
};

  function normalCDF(x) {
    if (!isFinite(x)) return x > 0 ? 1 : 0;
    var a1=0.254829592,a2=-0.284496736,a3=1.421413741,a4=-1.453152027,a5=1.061405429,p=0.3275911;
    var sign = x < 0 ? -1 : 1; x = Math.abs(x)/Math.SQRT2;
    var t = 1.0/(1.0+p*x);
    var y = 1.0 - (((((a5*t+a4)*t)+a3)*t+a2)*t+a1)*t*Math.exp(-x*x);
    return 0.5*(1.0+sign*y);
  }
  function normalQuantile(p) {
    if (p<=0) return -Infinity; if (p>=1) return Infinity; if (p===0.5) return 0;
    var a=[-3.969683028665376e+01,2.209460984245205e+02,-2.759285104469687e+02,1.383577518672690e+02,-3.066479806614716e+01,2.506628277459239e+00];
    var b=[-5.447609879822406e+01,1.615858368580409e+02,-1.556989798598866e+02,6.680131188771972e+01,-1.328068155288572e+01];
    var c=[-7.784894002430293e-03,-3.223964580411365e-01,-2.400758277161838e+00,-2.549732539343734e+00,4.374664141464968e+00,2.938163982698783e+00];
    var d=[7.784695709041462e-03,3.224671290700398e-01,2.445134137142996e+00,3.754408661907416e+00];
    var pLow=0.02425,pHigh=1-pLow; var q,r;
    if (p<pLow) { q=Math.sqrt(-2*Math.log(p)); return (((((c[0]*q+c[1])*q+c[2])*q+c[3])*q+c[4])*q+c[5])/((((d[0]*q+d[1])*q+d[2])*q+d[3])*q+1); }
    else if (p<=pHigh) { q=p-0.5; r=q*q; return (((((a[0]*r+a[1])*r+a[2])*r+a[3])*r+a[4])*r+a[5])*q/(((((b[0]*r+b[1])*r+b[2])*r+b[3])*r+b[4])*r+1); }
    else { q=Math.sqrt(-2*Math.log(1-p)); return -(((((c[0]*q+c[1])*q+c[2])*q+c[3])*q+c[4])*q+c[5])/((((d[0]*q+d[1])*q+d[2])*q+d[3])*q+1); }
  }
  function fmtNum(v,dp) { if (v==null||!isFinite(v)) return '--'; return v.toFixed(dp!=null?dp:2); }
  function fmtP(p) { if (p==null||!isFinite(p)) return '--'; if (p<0.001) return '<0.001'; return p.toFixed(3); }

  // ===== CORE STATISTICAL FUNCTIONS (ported from meta-stats-core.js) =====

  function lnGamma_core(x) {
    var g = 7;
    var c = [0.99999999999980993, 676.5203681218851, -1259.1392167224028,
             771.32342877765313, -176.61502916214059, 12.507343278686905,
             -0.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7];
    if (x < 0.5) return Math.log(Math.PI / Math.sin(Math.PI * x)) - lnGamma_core(1 - x);
    x -= 1;
    var a = c[0];
    var t = x + g + 0.5;
    for (var i = 1; i < c.length; i++) a += c[i] / (x + i);
    return 0.5 * Math.log(2 * Math.PI) + (x + 0.5) * Math.log(t) - t + Math.log(a);
  }

  function regBetaI_core(x, a, b) {
    if (x <= 0) return 0;
    if (x >= 1) return 1;
    var lnBeta = lnGamma_core(a) + lnGamma_core(b) - lnGamma_core(a + b);
    var front = Math.exp(Math.log(x) * a + Math.log(1 - x) * b - lnBeta) / a;
    return front * betaCF_core(x, a, b);
  }

  function betaCF_core(x, a, b) {
    var f = 1, c2 = 1, d = 1 - (a + b) * x / (a + 1);
    if (Math.abs(d) < 1e-30) d = 1e-30;
    d = 1 / d; f = d;
    for (var m = 1; m <= 200; m++) {
      var num = m * (b - m) * x / ((a + 2 * m - 1) * (a + 2 * m));
      d = 1 + num * d; if (Math.abs(d) < 1e-30) d = 1e-30; d = 1 / d;
      c2 = 1 + num / c2; if (Math.abs(c2) < 1e-30) c2 = 1e-30;
      f *= d * c2;
      num = -(a + m) * (a + b + m) * x / ((a + 2 * m) * (a + 2 * m + 1));
      d = 1 + num * d; if (Math.abs(d) < 1e-30) d = 1e-30; d = 1 / d;
      c2 = 1 + num / c2; if (Math.abs(c2) < 1e-30) c2 = 1e-30;
      var delta = d * c2;
      f *= delta;
      if (Math.abs(delta - 1) < 1e-12) break;
    }
    return f;
  }

  function regGammaP_core(a, x) {
    if (x < 0) return 0;
    if (x === 0) return 0;
    if (x > a + 1) return 1 - regGammaQ_core(a, x);
    var sum = 1 / a, term = 1 / a;
    for (var n = 1; n < 300; n++) {
      term *= x / (a + n);
      sum += term;
      if (Math.abs(term) < 1e-14 * Math.abs(sum)) break;
    }
    return Math.exp(-x + a * Math.log(x) - lnGamma_core(a)) * sum;
  }

  function regGammaQ_core(a, x) {
    var f = x - a + 1 + 1e-30;
    var c2 = f, d = 0, delta;
    for (var m = 1; m <= 300; m++) {
      var an1 = m * (a - m);
      var an2 = x - a + 2 * m + 1;
      d = an2 + an1 * d; if (Math.abs(d) < 1e-30) d = 1e-30; d = 1 / d;
      c2 = an2 + an1 / c2; if (Math.abs(c2) < 1e-30) c2 = 1e-30;
      delta = c2 * d; f *= delta;
      if (Math.abs(delta - 1) < 1e-12) break;
    }
    return Math.exp(-x + a * Math.log(x) - lnGamma_core(a)) / f;
  }

  function chi2CDF_core(x, df) {
    if (x <= 0) return 0;
    return regGammaP_core(df / 2, x / 2);
  }

  function chi2Quantile_core(p, df) {
    var x = df * Math.pow(1 - 2 / (9 * df) + normalQuantile(p) * Math.sqrt(2 / (9 * df)), 3);
    if (x < 0.01) x = 0.01;
    for (var i = 0; i < 20; i++) {
      var cdf = chi2CDF_core(x, df);
      var pdf = Math.exp((df / 2 - 1) * Math.log(x / 2) - x / 2 - lnGamma_core(df / 2) - Math.log(2));
      if (pdf < 1e-15) break;
      var dx = (cdf - p) / pdf;
      x = Math.max(1e-10, x - dx);
      if (Math.abs(dx) < 1e-10) break;
    }
    return x;
  }

  function tPDF_core(t, df) {
    return Math.exp(lnGamma_core((df + 1) / 2) - lnGamma_core(df / 2) - 0.5 * Math.log(df * Math.PI)
           - ((df + 1) / 2) * Math.log(1 + t * t / df));
  }

  function tCDF_core(t, df) {
    var x = df / (df + t * t);
    var ib = regBetaI_core(x, df / 2, 0.5);
    return t < 0 ? 0.5 * ib : 1 - 0.5 * ib;
  }

  function tQuantile_core(p, df) {
    if (df <= 0) return NaN;
    if (df === 1) return Math.tan(Math.PI * (p - 0.5));
    if (df === 2) return (2 * p - 1) / Math.sqrt(2 * p * (1 - p));
    var zp = normalQuantile(p);
    var g1 = (zp * zp * zp + zp) / (4 * df);
    var g2 = (5 * Math.pow(zp, 5) + 16 * zp * zp * zp + 3 * zp) / (96 * df * df);
    var g3 = (3 * Math.pow(zp, 7) + 19 * Math.pow(zp, 5) + 17 * zp * zp * zp - 15 * zp) / (384 * Math.pow(df, 3));
    var t = zp + g1 + g2 + g3;
    for (var i = 0; i < 3; i++) {
      var cdf = tCDF_core(t, df);
      var pdf = tPDF_core(t, df);
      if (pdf < 1e-15) break;
      t -= (cdf - p) / pdf;
    }
    return t;
  }

  // ===== REML TAU2 ESTIMATOR (Fisher scoring) =====
  function remlTau2(yi, vi) {
    var k = yi.length;
    // Start from DL estimate
    var w = vi.map(function(v) { return v > 0 ? 1 / v : 0; });
    var sumW = 0; for (var i = 0; i < k; i++) sumW += w[i];
    var theta_fe = 0; for (var i = 0; i < k; i++) theta_fe += w[i] * yi[i]; theta_fe /= sumW;
    var Q = 0; for (var i = 0; i < k; i++) Q += w[i] * Math.pow(yi[i] - theta_fe, 2);
    var sumW2 = 0; for (var i = 0; i < k; i++) sumW2 += w[i] * w[i];
    var C = sumW - sumW2 / sumW;
    var tau2 = Math.max(0, (Q - (k - 1)) / C);

    // Fisher scoring iterations
    for (var iter = 0; iter < 100; iter++) {
      var ws = []; var sW = 0;
      for (var i = 0; i < k; i++) { ws[i] = 1 / (vi[i] + tau2); sW += ws[i]; }
      var th = 0; for (var i = 0; i < k; i++) th += ws[i] * yi[i]; th /= sW;
      var sW2 = 0, sW3 = 0, sW2r2 = 0;
      for (var i = 0; i < k; i++) {
        sW2 += ws[i] * ws[i];
        sW3 += Math.pow(ws[i], 3);
        sW2r2 += ws[i] * ws[i] * Math.pow(yi[i] - th, 2);
      }
      var score = -0.5 * sW + 0.5 * sW2 / sW + 0.5 * sW2r2;
      var info = 0.5 * (sW2 - 2 * sW3 / sW + sW2 * sW2 / (sW * sW));
      if (info < 1e-15) break;
      var tau2New = Math.max(0, tau2 + score / info);
      if (Math.abs(tau2New - tau2) < 1e-10) { tau2 = tau2New; break; }
      tau2 = tau2New;
    }
    return tau2;
  }

  // ===== HKSJ CI (with floor correction) =====
  // Floor: if Q* < k-1, HKSJ narrows below Wald — set floor max(hksjVar, waldVar)
  function hksjCI_core(theta, yi, vi, tau2, k) {
    if (k < 2) {
      var z = 1.959964;
      var se0 = Math.sqrt(1 / vi.reduce(function(a, v) { return a + 1 / v; }, 0));
      return [theta - z * se0, theta + z * se0];
    }
    var ws = []; var sumWs = 0;
    for (var i = 0; i < k; i++) { ws[i] = 1 / (vi[i] + tau2); sumWs += ws[i]; }
    var Qs = 0;
    for (var i = 0; i < k; i++) Qs += ws[i] * Math.pow(yi[i] - theta, 2);
    var hksjVar = Qs / ((k - 1) * sumWs);
    var waldVar = 1 / sumWs;
    hksjVar = Math.max(hksjVar, waldVar); // floor correction
    var seAdj = Math.sqrt(hksjVar);
    var tcrit = Math.abs(tQuantile_core(0.025, k - 1));
    return [theta - tcrit * seAdj, theta + tcrit * seAdj];
  }

  // ===== PREDICTION INTERVAL — t_{k-2}, undefined for k<3 =====
  function predictionInterval_core(theta, tau2, se, k) {
    if (k < 3) return [NaN, NaN];
    var tcrit = Math.abs(tQuantile_core(0.025, k - 2));
    var piSe = Math.sqrt(tau2 + se * se);
    return [theta - tcrit * piSe, theta + tcrit * piSe];
  }

  // ===== MATRIX OPERATIONS (pure JS, no dependencies) =====
  function matCreate(rows, cols, fill) { var m=[]; for (var i=0;i<rows;i++){m[i]=[]; for(var j=0;j<cols;j++) m[i][j]=fill||0;} return m; }
  function matTranspose(A) { var r=A.length,c=A[0].length; var T=matCreate(c,r); for(var i=0;i<r;i++) for(var j=0;j<c;j++) T[j][i]=A[i][j]; return T; }
  function matMul(A,B) { var r=A.length,k=A[0].length,c=B[0].length; var C=matCreate(r,c); for(var i=0;i<r;i++) for(var j=0;j<c;j++) { var s=0; for(var m=0;m<k;m++) s+=A[i][m]*B[m][j]; C[i][j]=s; } return C; }
  function matDiag(v) { var n=v.length; var D=matCreate(n,n); for(var i=0;i<n;i++) D[i][i]=v[i]; return D; }

  // Solve Ax = b using Gaussian elimination with partial pivoting
  function matSolve(A, b) {
    var n = A.length;
    var aug = matCreate(n, n + 1);
    for (var i = 0; i < n; i++) {
      for (var j = 0; j < n; j++) aug[i][j] = A[i][j];
      aug[i][n] = b[i][0];
    }
    for (var col = 0; col < n; col++) {
      var maxRow = col; var maxVal = Math.abs(aug[col][col]);
      for (var row = col + 1; row < n; row++) {
        if (Math.abs(aug[row][col]) > maxVal) { maxVal = Math.abs(aug[row][col]); maxRow = row; }
      }
      if (maxRow !== col) { var tmp = aug[col]; aug[col] = aug[maxRow]; aug[maxRow] = tmp; }
      if (Math.abs(aug[col][col]) < 1e-14) continue;
      for (var row = col + 1; row < n; row++) {
        var factor = aug[row][col] / aug[col][col];
        for (var j = col; j <= n; j++) aug[row][j] -= factor * aug[col][j];
      }
    }
    var x = matCreate(n, 1);
    for (var i = n - 1; i >= 0; i--) {
      var s = aug[i][n];
      for (var j = i + 1; j < n; j++) s -= aug[i][j] * x[j][0];
      x[i][0] = Math.abs(aug[i][i]) > 1e-14 ? s / aug[i][i] : 0;
    }
    return x;
  }

  // Matrix inverse using Gauss-Jordan
  function matInverse(A) {
    var n = A.length;
    var aug = matCreate(n, 2 * n);
    for (var i = 0; i < n; i++) {
      for (var j = 0; j < n; j++) aug[i][j] = A[i][j];
      aug[i][n + i] = 1;
    }
    for (var col = 0; col < n; col++) {
      var maxRow = col; var maxVal = Math.abs(aug[col][col]);
      for (var row = col + 1; row < n; row++) {
        if (Math.abs(aug[row][col]) > maxVal) { maxVal = Math.abs(aug[row][col]); maxRow = row; }
      }
      if (maxRow !== col) { var tmp = aug[col]; aug[col] = aug[maxRow]; aug[maxRow] = tmp; }
      var pivot = aug[col][col];
      if (Math.abs(pivot) < 1e-14) continue;
      for (var j = 0; j < 2 * n; j++) aug[col][j] /= pivot;
      for (var row = 0; row < n; row++) {
        if (row === col) continue;
        var factor = aug[row][col];
        for (var j = 0; j < 2 * n; j++) aug[row][j] -= factor * aug[col][j];
      }
    }
    var inv = matCreate(n, n);
    for (var i = 0; i < n; i++) for (var j = 0; j < n; j++) inv[i][j] = aug[i][n + j];
    return inv;
  }

  // ===== COMPONENT PARSING =====
  var REFERENCE_NAMES = ['placebo', 'control', 'waitlist', 'no treatment', 'usual care', 'sham', 'none'];

  function isReference(name) {
    return REFERENCE_NAMES.indexOf(name.trim().toLowerCase()) >= 0;
  }

  function parseComponents(treatName, sep) {
    if (isReference(treatName)) return [];
    return treatName.split(sep).map(function(s) { return s.trim(); }).filter(function(s) { return s.length > 0 && !isReference(s); });
  }


// ===== CORE cNMA ALGORITHM (verbatim 632-878) =====
  function runComponentNMA() {
    var comps = appState.comparisons;
    if (comps.length < 2) return null;

    var sep = appState.separator;

    // 1. Identify all unique components (excluding reference treatments)
    var compSet = {};
    for (var i = 0; i < comps.length; i++) {
      var c1 = parseComponents(comps[i].treat1, sep);
      var c2 = parseComponents(comps[i].treat2, sep);
      for (var j = 0; j < c1.length; j++) compSet[c1[j]] = true;
      for (var j = 0; j < c2.length; j++) compSet[c2[j]] = true;
    }
    var components = Object.keys(compSet).sort();
    appState.components = components;

    if (components.length === 0) return null;

    // 2. Identify all unique treatments
    var treatSet = {};
    for (var i = 0; i < comps.length; i++) {
      treatSet[comps[i].treat1] = true;
      treatSet[comps[i].treat2] = true;
    }
    appState.treatments = Object.keys(treatSet).sort();

    // 3. Build the per-comparison contrast matrix X (n x p) + optional interactions
    var includeInt = $('includeInteractions') && $('includeInteractions').checked;
    var n = comps.length;
    var p = components.length;

    // Generate interaction pairs
    var interactions = [];
    if (includeInt && p >= 2) {
      for (var a = 0; a < p; a++) {
        for (var b = a + 1; b < p; b++) {
          interactions.push([a, b, components[a] + ' x ' + components[b]]);
        }
      }
    }
    var pTotal = p + interactions.length;

    // Check identifiability: need n > pTotal
    if (pTotal >= n) {
      interactions = []; // fall back to additive if not enough data
      pTotal = p;
    }

    var allLabels = components.slice();
    for (var ix = 0; ix < interactions.length; ix++) allLabels.push(interactions[ix][2]);

    var X = matCreate(n, pTotal);
    var y = matCreate(n, 1);
    var vi = []; // sampling variances

    for (var i = 0; i < n; i++) {
      var c1 = parseComponents(comps[i].treat1, sep);
      var c2 = parseComponents(comps[i].treat2, sep);
      // Main effects
      for (var j = 0; j < p; j++) {
        var inT1 = c1.indexOf(components[j]) >= 0 ? 1 : 0;
        var inT2 = c2.indexOf(components[j]) >= 0 ? 1 : 0;
        X[i][j] = inT1 - inT2;
      }
      // Interaction terms: product of contrasts
      for (var ix = 0; ix < interactions.length; ix++) {
        var a = interactions[ix][0], b = interactions[ix][1];
        var intT1 = (c1.indexOf(components[a]) >= 0 && c1.indexOf(components[b]) >= 0) ? 1 : 0;
        var intT2 = (c2.indexOf(components[a]) >= 0 && c2.indexOf(components[b]) >= 0) ? 1 : 0;
        X[i][p + ix] = intT1 - intT2;
      }
      y[i][0] = comps[i].effect;
      vi[i] = comps[i].se * comps[i].se;
    }

    // 4. Store design matrix for display
    appState.designMatrix = { X: X, components: allLabels, interactions: interactions };

    // 5. Fixed-effect WLS first (needed for DL/REML tau² estimation)
    var W_fe = vi.map(function(v) { return v > 0 ? 1 / v : 0; });
    var feResult = fitWLS(X, y, W_fe, n, pTotal);

    // 6. DerSimonian-Laird tau² (as starting point + comparison)
    var yHat_fe = matMul(X, feResult.beta);
    var Q = 0;
    var sumW = 0, sumW2 = 0;
    for (var i = 0; i < n; i++) {
      var resid = y[i][0] - yHat_fe[i][0];
      Q += W_fe[i] * resid * resid;
      sumW += W_fe[i];
      sumW2 += W_fe[i] * W_fe[i];
    }
    var dfQ = n - pTotal;
    var C = sumW - sumW2 / sumW;
    var tau2_dl = dfQ > 0 && C > 0 ? Math.max(0, (Q - dfQ) / C) : 0;

    // 7. REML tau² via Fisher scoring (recommended)
    // For cNMA, we use residual-based REML on the model residuals
    // Extract observed effects and variances for REML
    var yi_obs = []; for (var i = 0; i < n; i++) yi_obs.push(y[i][0]);
    var tau2 = remlTau2(yi_obs, vi);

    // I² = max(0, (Q - df) / Q * 100)
    var I2 = Q > 0 ? Math.max(0, (Q - dfQ) / Q * 100) : 0;

    // 8. Random-effects WLS with W*_i = 1/(v_i + tau²)
    var W_re = vi.map(function(v) { return (v + tau2) > 0 ? 1 / (v + tau2) : 0; });
    var reResult = fitWLS(X, y, W_re, n, pTotal);

    // 9. Q-test for additive model fit (using RE residuals)
    var yHat_re = matMul(X, reResult.beta);
    var Q_re = 0;
    for (var i = 0; i < n; i++) {
      var resid = y[i][0] - yHat_re[i][0];
      Q_re += W_re[i] * resid * resid;
    }
    var qPval = dfQ > 0 ? 1 - chi2CDF_core(Q_re, dfQ) : 1;

    // 10. Component + interaction results from RE model
    // Compute Wald CI (z-based) and HKSJ CI (t-based with floor correction)
    var zCrit = normalQuantile(0.975);
    var componentResults = [];
    for (var j = 0; j < pTotal; j++) {
      var est = reResult.beta[j][0];
      var se = Math.sqrt(Math.max(0, reResult.vcov[j][j]));
      var z = se > 0 ? est / se : 0;
      var pval = 2 * (1 - normalCDF(Math.abs(z)));
      // Wald CI
      var waldLo = est - zCrit * se;
      var waldHi = est + zCrit * se;
      // HKSJ CI for this component: use per-component adjusted variance
      // For cNMA, adjust using Q*/(k-1) scaling with floor
      var hksjLo = waldLo, hksjHi = waldHi;
      if (n > 1 && dfQ > 0) {
        var hksjScale = Q_re / dfQ;
        hksjScale = Math.max(hksjScale, 1); // floor: never narrow below Wald
        var seHksj = se * Math.sqrt(hksjScale);
        var tcrit = Math.abs(tQuantile_core(0.025, dfQ));
        hksjLo = est - tcrit * seHksj;
        hksjHi = est + tcrit * seHksj;
      }
      // Prediction interval for each component: t_{k-2}
      var piLo = NaN, piHi = NaN;
      if (n >= 3 && dfQ >= 1) {
        var piDf = Math.max(1, n - pTotal - 1); // analogous to k-2 for univariate
        var tPI = Math.abs(tQuantile_core(0.025, piDf));
        var piSE = Math.sqrt(tau2 + se * se);
        piLo = est - tPI * piSE;
        piHi = est + tPI * piSE;
      }
      componentResults.push({
        component: allLabels[j],
        effect: est,
        se: se,
        ciLo: waldLo,
        ciHi: waldHi,
        hksjLo: hksjLo,
        hksjHi: hksjHi,
        piLo: piLo,
        piHi: piHi,
        z: z,
        p: pval,
        isInteraction: j >= p
      });
    }

    // 11. FE component results for comparison
    var feComponents = [];
    for (var j = 0; j < pTotal; j++) {
      var est = feResult.beta[j][0];
      var se = Math.sqrt(Math.max(0, feResult.vcov[j][j]));
      feComponents.push({ component: allLabels[j], effect: est, se: se,
        ciLo: est - zCrit * se, ciHi: est + zCrit * se });
    }

    // 12. Treatment rankings from RE model (includes interaction effects)
    var rankings = [];
    for (var t = 0; t < appState.treatments.length; t++) {
      var treat = appState.treatments[t];
      var tComps = parseComponents(treat, sep);
      // Build indicator vector for this treatment (main + interactions)
      var indicator = [];
      for (var j = 0; j < p; j++) {
        indicator.push(tComps.indexOf(components[j]) >= 0 ? 1 : 0);
      }
      for (var ix = 0; ix < interactions.length; ix++) {
        var a = interactions[ix][0], b = interactions[ix][1];
        indicator.push((indicator[a] === 1 && indicator[b] === 1) ? 1 : 0);
      }
      var pred = 0;
      var predVar = 0;
      for (var j = 0; j < pTotal; j++) {
        if (indicator[j] === 1) pred += reResult.beta[j][0];
        for (var k = 0; k < pTotal; k++) {
          if (indicator[j] === 1 && indicator[k] === 1) {
            predVar += reResult.vcov[j][k];
          }
        }
      }
      var predSE = Math.sqrt(Math.max(0, predVar));
      rankings.push({
        treatment: treat,
        components: tComps,
        effect: pred,
        se: predSE,
        ciLo: pred - zCrit * predSE,
        ciHi: pred + zCrit * predSE,
        isRef: isReference(treat)
      });
    }
    rankings.sort(function(a, b) { return a.effect - b.effect; });

    return {
      components: componentResults,
      feComponents: feComponents,
      rankings: rankings,
      modelFit: { Q: Q, Q_re: Q_re, df: dfQ, pval: qPval, n: n, p: p, pTotal: pTotal, nInteractions: interactions.length, tau2: tau2, tau2_dl: tau2_dl, tau2Method: 'REML', I2: I2 },
      beta: reResult.beta,
      vcov: reResult.vcov
    };
  }

  // Weighted least squares helper: beta = (X'WX)^{-1} X'Wy
  function fitWLS(X, y, W, n, p) {
    var Wmat = matDiag(W);
    var Xt = matTranspose(X);
    var XtW = matMul(Xt, Wmat);
    var XtWX = matMul(XtW, X);
    var XtWy = matMul(XtW, y);
    var beta = matSolve(XtWX, XtWy);
    var vcov = matInverse(XtWX);
    return { beta: beta, vcov: vcov };
  }

  // Chi-squared CDF approximation (Wilson-Hilferty)
  function chi2CDF(x, df) {
    if (df <= 0 || x < 0) return 0;
    if (df === 1) return 2 * normalCDF(Math.sqrt(x)) - 1;
    if (df === 2) return 1 - Math.exp(-x / 2);
    var z = Math.pow(x / df, 1/3) - (1 - 2 / (9 * df));
    z /= Math.sqrt(2 / (9 * df));
    return normalCDF(z);
  }

  // ===== RENDERING =====



export {
  normalCDF, normalQuantile, chi2CDF_core, tQuantile_core, remlTau2,
  matMul, matSolve, matInverse, fitWLS,
  isReference, parseComponents, runComponentNMA, appState
};
export function __setIncludeInteractions(v){ __INCLUDE_INTERACTIONS = !!v; }
