Mahmood Ahmad
Tahir Heart Institute
mahmood.ahmad2@nhs.net

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

AI Disclosure

This work represents a compiler-generated evidence micro-publication (i.e., a structured, pipeline-based synthesis output). AI is used as a constrained synthesis engine operating on structured inputs and predefined rules, rather than as an autonomous author. Deterministic components of the pipeline, together with versioned, reproducible evidence capsules (TruthCert), are designed to support transparent and auditable outputs. All results and text were reviewed and verified by the author, who takes full responsibility for the content. The workflow operationalises key transparency and reporting principles consistent with CONSORT-AI/SPIRIT-AI, including explicit input specification, predefined schemas, logged human-AI interaction, and reproducible outputs.
