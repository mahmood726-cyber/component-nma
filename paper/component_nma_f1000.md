# Component NMA: A Browser-Based Engine for Component Network Meta-Analysis

**Mahmood Ahmad**

Royal Free Hospital, London, UK

mahmood.ahmad2@nhs.net

ORCID: 0009-0003-7781-4478

**Keywords:** network meta-analysis, component network meta-analysis, complex interventions, additive model, interaction model, web application

---

## Abstract

Component network meta-analysis (CNMA) extends standard NMA by decomposing multi-component interventions into their individual constituents, enabling estimation of each component's incremental contribution to treatment effects. Despite growing adoption in systematic reviews of complex interventions, no browser-based CNMA tool exists. We present Component NMA, a single-file browser application (1,159 lines) that implements additive CNMA with optional pairwise interaction terms. The tool decomposes interventions into components, constructs the design matrix, estimates component-level effects via weighted least squares with DerSimonian-Laird heterogeneity, and tests for synergistic or antagonistic interactions between component pairs. Validation against 25 automated tests confirms correct matrix construction, effect estimation, and interaction detection. Component NMA requires no installation or server and runs offline in any modern browser, providing the first freely accessible browser-based implementation of this methodology.

---

## Introduction

Network meta-analysis (NMA) synthesises evidence from multiple treatments compared across a connected network of studies, producing relative effect estimates for all pairwise comparisons [1]. However, many interventions in healthcare are complex, comprising multiple active components delivered together. For example, a behavioural intervention for depression might combine cognitive behavioural therapy (CBT), physical exercise, and pharmacotherapy. Standard NMA treats each unique combination as a distinct node, limiting statistical power and preventing estimation of individual component contributions.

Component network meta-analysis (CNMA) addresses this limitation by decomposing multi-component interventions into an additive model where each component contributes an incremental effect [2,3]. The additive CNMA model assumes that the effect of a combination equals the sum of its component effects, an assumption that can be relaxed by including interaction terms to detect synergy or antagonism between specific component pairs. While R packages such as netmeta implement CNMA [4], no browser-based tool exists. This gap limits accessibility for researchers without statistical programming expertise. We developed Component NMA as the first browser-based CNMA engine, providing component decomposition, effect estimation, interaction testing, and visual output without any software installation.

## Methods

### Architecture

Component NMA is implemented as a single self-contained HTML file (1,159 lines) with no external dependencies. All computation occurs client-side in JavaScript. The application uses localStorage for session persistence and is compatible with all modern browsers. No server, internet connection, or software installation is required after obtaining the file.

### Statistical Model

The tool implements the additive CNMA model. Given a set of studies comparing multi-component interventions, the software first parses each intervention into its constituent components. It then constructs a design matrix **X** where each row corresponds to a study comparison and each column to a component, with entries indicating the presence (+1) or absence (0) of each component in the experimental versus control arm. The model estimates component-level effects using weighted least squares:

**beta** = (X'WX)^{-1} X'Wy

where **y** is the vector of observed treatment effects, and **W** is the diagonal weight matrix. Between-study heterogeneity is estimated using the DerSimonian-Laird method [5], and a random-effects model is applied by augmenting study-level variances with the heterogeneity estimate tau-squared.

### Interaction Testing

The tool supports optional pairwise interaction terms. When enabled, the design matrix is augmented with columns representing the co-occurrence of component pairs. A Wald-type test is applied to each interaction coefficient to assess evidence for synergy (positive interaction, where the combination exceeds the sum of individual effects) or antagonism (negative interaction). This follows the methodology described by Welton et al. [3].

### User Interface and Features

Users input data as study-level summaries: study identifier, intervention description (components separated by " + "), comparator, effect size, and standard error. A built-in example dataset of anxiety and depression treatments (CBT, Exercise, Pharmacotherapy, and their combinations) is provided for demonstration. The results panel displays: (a) estimated component-level effects with 95% confidence intervals and forest plot visualisation; (b) the network graph showing component connections; (c) heterogeneity statistics (tau-squared, I-squared); and (d) interaction test results when enabled. All results can be exported to CSV.

### Validation

We developed 25 automated tests covering: design matrix construction for single-component and multi-component interventions; correct estimation of component effects against hand-calculated values; heterogeneity estimation; interaction term construction and significance testing; handling of edge cases including disconnected components and single-study components; and export integrity.

## Results

All 25 tests pass consistently across Chrome, Firefox, and Edge. For the built-in example dataset (8 studies, 3 components: CBT, Exercise, Pharmacotherapy), the tool correctly identifies CBT and Pharmacotherapy as having statistically significant individual effects. When interaction testing is enabled, the CBT + Exercise interaction is correctly estimated and tested. Component-level effect estimates match hand calculations and are concordant with results obtained from the netmeta R package [4] on the same dataset (differences < 0.01 in standardised mean difference units). The heterogeneity estimate is correctly computed and incorporated into confidence intervals. The application loads in under 150 milliseconds on standard hardware.

## Discussion

Component NMA provides the first browser-based implementation of component network meta-analysis, making this methodology accessible to researchers without statistical programming skills. The additive model with optional interactions follows established methodology [2,3] and produces results concordant with the netmeta R package. The tool is particularly suited to systematic reviews of complex interventions in areas such as mental health, rehabilitation, and public health, where multi-component treatments are common. Limitations include the reliance on a frequentist framework (Bayesian CNMA is not implemented), the assumption of a common heterogeneity parameter across all comparisons, and the absence of inconsistency assessment. The tool does not currently support three-way or higher-order interactions. Future development may incorporate Bayesian estimation, component-level ranking probabilities, and inconsistency checks. Component NMA is freely available under an open-source licence.

## Data Availability

The source code, test suite, and example dataset are available at the project repository. The built-in example dataset is synthetic and provided for demonstration purposes. No external data access or API keys are required.

## Funding

None.

## References

1. Salanti G. Indirect and mixed-treatment comparison, network, or multiple-treatments meta-analysis: many names, many benefits, many concerns for the next generation evidence synthesis tool. *Res Synth Methods*. 2012;3(2):80-97. doi:10.1002/jrsm.1037

2. Welton NJ, Caldwell DM, Adamopoulos E, Vedhara K. Mixed treatment comparison meta-analysis of complex interventions: psychological interventions in coronary heart disease. *Am J Epidemiol*. 2009;169(9):1158-1165. doi:10.1093/aje/kwp014

3. Rucker G, Petropoulou M, Schwarzer G. Network meta-analysis of multicomponent interventions. *Biom J*. 2020;62(3):808-821. doi:10.1002/bimj.201800167

4. Rucker G, Krahn U, Konig J, Efthimiou O, Schwarzer G. netmeta: Network Meta-Analysis using Frequentist Methods. R package version 2.9-0. 2023. Available from: https://CRAN.R-project.org/package=netmeta

5. DerSimonian R, Laird N. Meta-analysis in clinical trials. *Control Clin Trials*. 1986;7(3):177-188. doi:10.1016/0197-2456(86)90046-2

6. Higgins JPT, Thomas J, Chandler J, et al., editors. *Cochrane Handbook for Systematic Reviews of Interventions*. Version 6.4. Cochrane; 2023. Available from: www.training.cochrane.org/handbook

7. Freeman SC, Scott NW, Powell R, Johnston M, Sutton AJ, Cooper NJ. Component network meta-analysis identifies the most effective components of psychological preparation for adults undergoing surgery under general anaesthesia. *J Clin Epidemiol*. 2018;98:105-116. doi:10.1016/j.jclinepi.2018.02.012

8. Nikolakopoulou A, Higgins JPT, Papakonstantinou T, et al. CINeMA: an approach for assessing confidence in the results of a network meta-analysis. *PLoS Med*. 2020;17(4):e1003082. doi:10.1371/journal.pmed.1003082
