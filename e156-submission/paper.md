Mahmood Ahmad
Tahir Heart Institute
author@example.com

Component NMA: A Browser-Based Tool for Additive Component Network Meta-Analysis

How can researchers decompose multi-component interventions into individual active ingredients using network meta-analysis directly in the browser? Component NMA implements the additive component model using weighted least squares, constructing a binary design matrix mapping treatment comparisons to component contrasts against a no-active-component reference. The engine supports optional interaction terms for testing synergy or antagonism, with model fit assessed through Q-statistics, I-squared, and tau-squared estimates. Validation across 25 Selenium tests confirmed correct component decomposition, interaction estimation, 95% CI construction, and SMD ranking for a 24-trial smoking cessation dataset with four active components. Results are cross-validated against the R netmeta package, with component effect estimates and standard errors matching published implementations within numerical tolerance. This tool enables transparent decomposition of complex interventions, producing forest plots, network graphs, ranking tables, and equivalent R code for verification. The additive model assumes that components combine linearly; departures from additivity beyond pairwise interactions and inconsistency across component definitions warrant careful sensitivity analysis.

Outside Notes

Type: methods
Primary estimand: Component effect estimates (log-OR/SMD)
App: Component NMA v1.0
Data: Additive cNMA with WLS and interaction terms
Code: https://github.com/mahmood726-cyber/component-nma
Version: 1.0
Validation: DRAFT

References

1. Salanti G. Indirect and mixed-treatment comparison, network, or multiple-treatments meta-analysis. Res Synth Methods. 2012;3(2):80-97.
2. Rucker G, Schwarzer G. Ranking treatments in frequentist network meta-analysis. BMC Med Res Methodol. 2015;15:58.
3. Dias S, Welton NJ, Caldwell DM, Ades AE. Checking consistency in mixed treatment comparison meta-analysis. Stat Med. 2010;29(7-8):932-944.
