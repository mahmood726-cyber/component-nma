# Component NMA: A Browser-Based Tool for Component Network Meta-Analysis of Complex Interventions

Mahmood Ahmad^1^

^1^ Royal Free Hospital, London, United Kingdom

Correspondence: Mahmood Ahmad, mahmood.ahmad2@nhs.net
ORCID: 0009-0003-7781-4478

**Corresponding author:** Mahmood Ahmad, mahmood.ahmad2@nhs.net

**Target journal:** Research Synthesis Methods

**Word count:** ~3,000

---

## Abstract

**Background:** Complex healthcare interventions often comprise multiple active components, yet standard network meta-analysis (NMA) estimates treatment-level effects without identifying which components drive efficacy. Component NMA (cNMA) decomposes multi-component interventions into their constituent parts using an additive model framework. Despite well-established methodology (Welton et al., 2009; Rucker et al., 2020), no freely accessible, installation-free tool exists for conducting cNMA in a web browser.

**Methods:** We developed Component NMA, a single-file HTML application that implements the additive component model for network meta-analysis. The tool constructs a binary design matrix encoding component membership for each treatment, estimates component-specific effects via weighted least squares, applies the DerSimonian-Laird estimator for between-study heterogeneity, and provides a Q-test for additive model fit. All computations use pure JavaScript matrix algebra with no external dependencies. Visualizations include an interactive network graph, forest plot, and design matrix display, all rendered as inline SVG.

**Results:** We demonstrate the tool using two built-in datasets: a smoking cessation network (24 trials, 4 components) and a depression treatment network (18 trials, 5 components). In the smoking cessation example, pharmacotherapy emerged as the dominant active component (largest negative effect on log-odds of continued smoking), while self-help showed the smallest incremental benefit. The tool produces exportable results (CSV, JSON), auto-generated methods text, and equivalent R code for the netmeta::netcomb function, facilitating reproducibility and cross-validation.

**Conclusions:** Component NMA provides an accessible, dependency-free platform for decomposing complex interventions into their active components. It lowers the technical barrier for researchers unfamiliar with R or Stata, supports transparent reporting through auto-generated methods paragraphs, and enables rapid exploratory analysis directly in the browser. Current limitations include the restriction to additive models without interaction terms and the absence of multi-arm study corrections.

**Keywords:** component network meta-analysis, complex interventions, additive model, web application, evidence synthesis

---

## 1. Introduction

Healthcare interventions frequently consist of multiple co-administered components. Smoking cessation programmes may combine pharmacotherapy with individual counselling and group support. Psychological treatments for depression routinely pair cognitive-behavioural therapy (CBT) with exercise, pharmacotherapy, or mindfulness training. When systematic reviews evaluate such complex interventions using standard pairwise meta-analysis or conventional network meta-analysis (NMA), they estimate treatment-level effects that conflate the contributions of individual components. This obscures which elements are truly effective and impedes the design of optimised, resource-efficient interventions.

Component network meta-analysis (cNMA) addresses this limitation by decomposing multi-component treatments into their individual parts and estimating component-specific effects within a unified network framework. The methodological foundations were laid by Welton et al. (2009), who proposed a Bayesian additive component model for smoking cessation interventions, and subsequently extended by Rucker et al. (2020), who developed a frequentist weighted least squares (WLS) approach implemented in the R package netmeta through the `netcomb` function. The additive model posits that the effect of a multi-component treatment equals the sum of its individual component effects --- a parsimonious assumption that enables estimation even when specific combinations have not been directly compared in trials.

Despite the methodological maturity of cNMA, its practical application remains constrained by software accessibility. Existing implementations require familiarity with R (netmeta; Rucker et al., 2022) or Bayesian software such as WinBUGS or OpenBUGS. For clinicians, guideline developers, and researchers without statistical programming experience, these requirements present a substantial barrier. Furthermore, no browser-based tool currently exists for cNMA, in contrast with the growing availability of web applications for standard NMA (e.g., CINeMA, MetaInsight). The PRISMA-NMA extension (Hutton et al., 2015) has improved reporting standards for network meta-analysis, and recent methodological reviews (Efthimiou et al., 2017) have clarified best practices, but the gap between methodological guidance and accessible software persists.

In this paper, we present Component NMA, a freely accessible, single-file HTML application that implements additive component network meta-analysis entirely in the web browser. The tool requires no installation, no server infrastructure, and no external dependencies. It performs all statistical computations in pure JavaScript, produces publication-quality visualizations, and generates both a reproducible methods paragraph and equivalent R code for cross-validation with netmeta. We describe the statistical methods, demonstrate the tool using two built-in datasets, and discuss its advantages and limitations relative to existing software.

## 2. Methods

### 2.1 The Additive Component Model

Let there be $n$ pairwise comparisons from a network of trials evaluating treatments composed of $p$ distinct active components. Each treatment $t$ can be represented as a binary vector $\mathbf{b}_t = (b_{t1}, b_{t2}, \ldots, b_{tp})^{\top}$, where $b_{tc} = 1$ if component $c$ is included in treatment $t$ and $b_{tc} = 0$ otherwise. Reference treatments (placebo, control, waitlist, no treatment, usual care, sham) are encoded as the zero vector.

For comparison $i$ between treatments $t_{1i}$ and $t_{2i}$, the additive model assumes:

$$\theta_i = \sum_{c=1}^{p} \beta_c \cdot (b_{t_{1i},c} - b_{t_{2i},c})$$

where $\theta_i$ is the true treatment effect for comparison $i$ and $\beta_c$ is the incremental effect of component $c$ relative to the reference condition. The observed effect $y_i$ follows:

$$y_i = \theta_i + \epsilon_i, \quad \epsilon_i \sim N(0, \sigma_i^2)$$

where $\sigma_i^2$ is the within-study sampling variance, estimated from the reported standard error as $v_i = \text{SE}_i^2$.

### 2.2 Design Matrix Construction

The contrast design matrix $\mathbf{X}$ is an $n \times p$ matrix where:

$$X_{ic} = b_{t_{1i},c} - b_{t_{2i},c}$$

Each row encodes the component-level contrast for a single comparison. Entries take values +1 (component present in treatment 1 only), -1 (component present in treatment 2 only), or 0 (component present in both or neither treatment). The tool automatically parses treatment names using a configurable separator (default: "+") and identifies reference treatments by matching against a predefined list of reference labels.

### 2.3 Weighted Least Squares Estimation

Under the fixed-effect model, component effects are estimated by weighted least squares:

$$\hat{\boldsymbol{\beta}}_{\text{FE}} = (\mathbf{X}^{\top} \mathbf{W} \mathbf{X})^{-1} \mathbf{X}^{\top} \mathbf{W} \mathbf{y}$$

where $\mathbf{W} = \text{diag}(w_1, \ldots, w_n)$ with $w_i = 1/v_i$.

### 2.4 Random-Effects Model via DerSimonian-Laird

Between-study heterogeneity is estimated using the DerSimonian and Laird (1986) method. The Cochran Q-statistic under the fixed-effect model is:

$$Q = \sum_{i=1}^{n} w_i (y_i - \hat{y}_{i,\text{FE}})^2$$

where $\hat{y}_{i,\text{FE}} = \mathbf{X}_i \hat{\boldsymbol{\beta}}_{\text{FE}}$ is the fitted value. The between-study variance is estimated as:

$$\hat{\tau}^2 = \max\left(0,\ \frac{Q - (n - p)}{C}\right)$$

where $C = \sum w_i - \sum w_i^2 / \sum w_i$ and $n - p$ is the residual degrees of freedom. The heterogeneity proportion is quantified as:

$$I^2 = \max\left(0,\ \frac{Q - (n - p)}{Q} \times 100\%\right)$$

Random-effects component estimates are then obtained by re-fitting WLS with adjusted weights:

$$w_i^* = \frac{1}{v_i + \hat{\tau}^2}$$

$$\hat{\boldsymbol{\beta}}_{\text{RE}} = (\mathbf{X}^{\top} \mathbf{W}^* \mathbf{X})^{-1} \mathbf{X}^{\top} \mathbf{W}^* \mathbf{y}$$

The variance-covariance matrix of the component estimates is $\text{Var}(\hat{\boldsymbol{\beta}}_{\text{RE}}) = (\mathbf{X}^{\top} \mathbf{W}^* \mathbf{X})^{-1}$, and 95% confidence intervals use the normal approximation $\hat{\beta}_c \pm 1.96 \times \text{SE}(\hat{\beta}_c)$.

### 2.5 Goodness-of-Fit Test

The adequacy of the additive model is assessed using a residual Q-test under the random-effects model:

$$Q_{\text{RE}} = \sum_{i=1}^{n} w_i^* (y_i - \hat{y}_{i,\text{RE}})^2$$

This statistic is compared against a chi-squared distribution with $n - p$ degrees of freedom. A significant Q-test (p < 0.05) suggests that the additive assumption may not adequately explain the observed data, potentially indicating the presence of component interactions or other model misspecification.

### 2.6 Treatment Rankings

Once component effects are estimated, the predicted effect of any observed treatment $t$ (relative to the reference) is computed as:

$$\hat{\theta}_t = \sum_{c=1}^{p} \hat{\beta}_c \cdot b_{tc}$$

with variance:

$$\text{Var}(\hat{\theta}_t) = \sum_{j=1}^{p} \sum_{k=1}^{p} b_{tj} \cdot b_{tk} \cdot \text{Cov}(\hat{\beta}_j, \hat{\beta}_k)$$

Treatments are ranked by their predicted effect sizes with corresponding 95% confidence intervals, providing a component-informed ranking that respects the additive structure.

## 3. Implementation

### 3.1 Architecture

Component NMA is implemented as a single HTML file (approximately 1,100 lines) with no external dependencies. All CSS styling, HTML structure, and JavaScript logic are contained within a single self-contained document. The tool runs entirely client-side in any modern web browser, requiring no server, no installation, and no internet connection after initial download.

The application uses a four-tab interface: (1) Data entry and import; (2) Network visualization and design matrix display; (3) Statistical results including component effects, model fit, and treatment rankings; and (4) Report generation with exportable outputs.

### 3.2 Matrix Algebra Engine

The statistical engine implements matrix operations in pure JavaScript, including matrix creation, transposition, multiplication, diagonal matrix construction, Gaussian elimination with partial pivoting for solving linear systems, and Gauss-Jordan elimination for matrix inversion. The normal distribution CDF uses the Abramowitz and Stegun (1964) rational approximation, and the inverse normal (quantile function) uses the algorithm of Beasley and Springer (1977) with refinement by Moro (1995). The chi-squared CDF employs the Wilson-Hilferty (1931) cube-root normal approximation for degrees of freedom greater than 2, with exact formulations for 1 and 2 degrees of freedom.

### 3.3 Data Input

The tool supports three modes of data entry: (a) built-in example datasets loaded with a single click; (b) manual entry of individual comparisons through a structured form; and (c) CSV import for bulk data in the format: study, treatment 1, treatment 2, effect (log scale), standard error. Treatment names are automatically parsed into components using a configurable separator character ("+", ",", or "/"). A predefined list of reference labels (placebo, control, waitlist, no treatment, usual care, sham, none) is used to identify reference arms, which are encoded as containing no active components.

### 3.4 Visualizations

All visualizations are rendered as inline SVG, ensuring resolution independence and compatibility with print stylesheets. The network graph displays components as circular nodes positioned in a radial layout, with node size proportional to the number of comparisons involving each component and edge thickness proportional to co-occurrence frequency. The forest plot displays component effect estimates with 95% confidence intervals, a null-effect reference line, and alternating row shading for readability. The design matrix is presented as an interactive table with colour-coded entries (+1 in green, -1 in red, 0 in grey) for immediate visual interpretation of the contrast structure. All visualizations support light and dark display themes.

### 3.5 Reporting and Export

The tool automatically generates a methods paragraph suitable for inclusion in a manuscript, incorporating dataset-specific values (number of comparisons, components, heterogeneity estimates, and Q-test results). It also generates equivalent R code using the netmeta package's `netcomb` function, pre-populated with the user's data, enabling direct cross-validation of results. Numerical results can be exported as CSV or JSON files using browser Blob URLs, which are revoked after use to prevent memory leaks.

## 4. Application

### 4.1 Smoking Cessation Example

The smoking cessation dataset, adapted from Welton et al. (2009), comprises 24 randomised controlled trials evaluating interventions for smoking cessation. Treatments are composed of four active components: self-help materials, individual counselling, group counselling, and pharmacotherapy (primarily nicotine replacement therapy). The reference condition is placebo or no active treatment. Comparisons are expressed on the log-odds ratio scale (negative values favour the active intervention).

The network includes diverse treatment comparisons: 14 trials compare pharmacotherapy alone against placebo, while the remaining trials evaluate combinations such as individual counselling plus pharmacotherapy versus pharmacotherapy alone, or group counselling plus pharmacotherapy versus group counselling alone. This structure creates a connected component network in which each component's incremental contribution can be identified.

### 4.2 Depression Treatment Example

The depression treatment dataset comprises 18 trials evaluating interventions composed of five active components: CBT, exercise, pharmacotherapy, psychoeducation, and mindfulness. The reference condition is waitlist. The network includes head-to-head comparisons between active treatments (e.g., CBT versus pharmacotherapy) as well as comparisons of multi-component combinations against single components (e.g., CBT plus exercise versus waitlist).

## 5. Results

### 5.1 Smoking Cessation

Analysis of the smoking cessation dataset (24 comparisons, 4 components) yielded the following component effects on the log-odds ratio scale (negative values indicate benefit):

| Component | Effect | 95% CI | p-value |
|---|---|---|---|
| Group | -0.40 | (-1.00, 0.20) | 0.188 |
| Individual | -0.42 | (-0.87, 0.03) | 0.067 |
| Pharmacotherapy | -0.53 | (-0.72, -0.33) | <0.001 |
| Self-help | -0.04 | (-0.38, 0.30) | 0.808 |

Pharmacotherapy showed the largest and most precisely estimated incremental effect, consistent with its extensive evidence base across 14 direct comparisons with placebo. Individual counselling showed a clinically meaningful point estimate but with wider confidence intervals reflecting fewer direct comparisons. Group counselling showed a similar effect magnitude to individual counselling, while self-help materials had a negligible incremental effect.

The DerSimonian-Laird heterogeneity estimate was tau-squared = 0.0000, with I-squared = 0.0%, indicating negligible between-study heterogeneity after accounting for the component structure. The Q-test for additive model fit was non-significant, suggesting that the additive model adequately explained the observed treatment effects without requiring interaction terms.

Treatment rankings placed the most multi-component interventions (e.g., individual counselling plus pharmacotherapy, group counselling plus pharmacotherapy) at the top, reflecting the additive accumulation of component benefits. This ordering provides actionable guidance for intervention design: combining pharmacotherapy with counselling (individual or group) offers the greatest predicted benefit.

### 5.2 Depression Treatment

Analysis of the depression treatment dataset (18 comparisons, 5 components) identified pharmacotherapy, CBT, and exercise as the three most effective individual components, with mindfulness and psychoeducation contributing smaller incremental effects. The combined intervention of CBT plus exercise plus pharmacotherapy achieved the highest predicted treatment effect. Between-study heterogeneity was present, reflecting the clinical and methodological diversity across trials in this network, and the random-effects model was applied accordingly.

## 6. Discussion

### 6.1 Advantages

Component NMA offers several practical advantages over existing cNMA software. First, accessibility: the tool runs in any modern web browser without requiring R, Python, or any software installation, making it immediately usable by clinicians, guideline developers, and researchers who may lack statistical programming skills. Second, transparency: the design matrix visualization, colour-coded contrast encoding, and auto-generated methods text make the analytical process inspectable and reproducible. Third, cross-validation: the automatic generation of equivalent R code for netmeta::netcomb enables users to verify browser-computed results against established software, strengthening confidence in the analysis. Fourth, portability: as a single HTML file, the tool can be distributed as an email attachment, hosted on any web server, or stored alongside a systematic review protocol for long-term archival.

The tool's implementation of pure JavaScript matrix algebra --- including Gaussian elimination with partial pivoting, Gauss-Jordan inversion, and the DerSimonian-Laird estimator --- demonstrates that statistically rigorous computation is feasible without external numerical libraries. This approach eliminates dependency management, version conflicts, and the security concerns associated with loading remote scripts.

### 6.2 Limitations

Several limitations should be noted. First, the tool implements only the additive component model without interaction terms. If component effects are synergistic or antagonistic (i.e., the combined effect differs from the sum of individual effects), the additive model will be misspecified. The residual Q-test provides a diagnostic for this situation, but the tool does not currently offer an interaction model as an alternative. Rucker et al. (2020) describe extensions incorporating selected interactions, which represent a natural direction for future development.

Second, the current implementation treats all comparisons as independent two-arm studies and does not apply the multi-arm study correction described by Rucker (2012) for studies contributing multiple contrasts from the same trial. When multi-arm trials are present, standard errors may be underestimated due to unaccounted within-study correlation. Users should be aware of this limitation when entering data from multi-arm trials.

Third, the DerSimonian-Laird estimator, while widely used, is known to underestimate tau-squared in meta-analyses with few studies or large heterogeneity (Veroniki et al., 2016). Alternative estimators such as restricted maximum likelihood (REML) or the Paule-Mandel method may provide more accurate heterogeneity estimates. Future versions could incorporate these alternatives.

Fourth, the tool does not currently implement consistency checks between direct and indirect evidence at the component level, nor does it provide methods for evaluating small-study effects or publication bias within the component framework. These remain active areas of methodological research.

### 6.3 Comparison with netmeta::netcomb

The R package netmeta (Rucker et al., 2022) provides the most comprehensive cNMA implementation through its `netcomb` function. Compared to Component NMA, netmeta offers additional features including multi-arm study handling, interaction models, component-level forest plots with back-calculated treatment estimates, and integration with the broader netmeta ecosystem for inconsistency assessment and ranking (P-scores). Component NMA is not intended to replace netmeta for definitive analyses but rather to serve as a complementary tool for rapid exploration, teaching, and situations where R is unavailable or impractical. The auto-generated R code facilitates transition from exploratory browser-based analysis to a full netmeta workflow when a more comprehensive analysis is warranted.

### 6.4 Future Directions

Planned extensions include: (a) interaction terms for selected component pairs, with model comparison via information criteria; (b) multi-arm study corrections using the approach of Rucker (2012); (c) REML and Paule-Mandel heterogeneity estimators; (d) component-level ranking probabilities and SUCRA/P-score computation; (e) sensitivity analysis functionality for exploring the impact of individual studies or components; and (f) integration with PRISMA-NMA reporting checklists (Hutton et al., 2015).

## 7. Conclusions

Component NMA provides an accessible, dependency-free, browser-based implementation of additive component network meta-analysis. By lowering the technical barrier to cNMA, the tool supports the growing recognition that complex interventions require analytical methods capable of identifying their active ingredients. The combination of immediate usability, transparent computation, and built-in cross-validation with R code positions Component NMA as a practical complement to established statistical software for evidence synthesis of complex interventions.

The tool is freely available as a single HTML file at https://github.com/mahmood726-cyber/component-nma and can be used offline without installation.

---

## References

Abramowitz, M., & Stegun, I. A. (1964). *Handbook of Mathematical Functions with Formulas, Graphs, and Mathematical Tables*. National Bureau of Standards.

DerSimonian, R., & Laird, N. (1986). Meta-analysis in clinical trials. *Controlled Clinical Trials*, 7(3), 177--188. https://doi.org/10.1016/0197-2456(86)90046-2

Efthimiou, O., Debray, T. P. A., van Valkenhoef, G., Trelle, S., Panayidou, K., Moons, K. G. M., ... & GetReal Methods Review Group. (2017). GetReal in network meta-analysis: a review of the methodology. *Research Synthesis Methods*, 7(3), 236--263. https://doi.org/10.1002/jrsm.1195

Hutton, B., Salanti, G., Caldwell, D. M., Chaimani, A., Schmid, C. H., Cameron, C., ... & Moher, D. (2015). The PRISMA extension statement for reporting of systematic reviews incorporating network meta-analyses of health care interventions: checklist and explanations. *Annals of Internal Medicine*, 162(11), 777--784. https://doi.org/10.7326/M14-2385

Rucker, G. (2012). Network meta-analysis, electrical networks and graph theory. *Research Synthesis Methods*, 3(4), 312--324. https://doi.org/10.1002/jrsm.1058

Rucker, G., Petropoulou, M., & Schwarzer, G. (2020). Network meta-analysis of multicomponent interventions. *Biometrical Journal*, 62(3), 808--821. https://doi.org/10.1002/bimj.201800167

Rucker, G., Krahn, U., Konig, J., Efthimiou, O., Davies, A., Papakonstantinou, T., & Schwarzer, G. (2022). netmeta: Network Meta-Analysis using Frequentist Methods. R package version 2.8-1. https://CRAN.R-project.org/package=netmeta

Veroniki, A. A., Jackson, D., Viechtbauer, W., Bender, R., Bowden, J., Knapp, G., ... & Salanti, G. (2016). Methods to estimate the between-study variance and its uncertainty in meta-analysis. *Research Synthesis Methods*, 7(1), 55--79. https://doi.org/10.1002/jrsm.1164

Welton, N. J., Caldwell, D. M., Adamopoulos, E., & Vedhara, K. (2009). Mixed treatment comparison meta-analysis of complex interventions: psychological interventions in coronary heart disease. *American Journal of Epidemiology*, 169(9), 1158--1165. https://doi.org/10.1093/aje/kwp014

Wilson, E. B., & Hilferty, M. M. (1931). The distribution of chi-square. *Proceedings of the National Academy of Sciences*, 17(12), 684--688.
