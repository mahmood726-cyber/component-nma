# Component NMA

Browser-based component network meta-analysis for complex multi-component interventions.

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

## Overview

Component NMA implements the additive component network meta-analysis model (Rucker et al. 2020, Welton et al. 2009) entirely in the browser. It decomposes multi-component treatments (e.g., "CBT+Exercise+Pharmacotherapy") into individual active components and estimates their independent effects using weighted least squares regression on the design matrix. An optional interaction model tests for synergistic or antagonistic effects between component pairs.

## Features

- Additive component NMA model with weighted least squares estimation
- Automatic treatment decomposition using configurable component separators
- Optional pairwise component interaction terms for testing synergy/antagonism
- Interactive network graph visualization with force-directed layout
- Forest plot of component effects versus reference (no active component)
- Component effect estimates with 95% confidence intervals, z-statistics, and p-values
- Model fit statistics (Q-statistic, I-squared, tau-squared)
- Treatment ranking table with predicted effects and CIs for all observed combinations
- Design matrix display for model transparency
- Auto-generated methods text and equivalent R code (netmeta)
- CSV import/export, JSON export
- MAIF (Meta-Analysis Interchange Format) export for cross-tool data flow
- Dark mode and print-optimized layout

## Quick Start

1. Download `component-nma.html`
2. Open in any modern browser
3. No installation, no dependencies, works offline

## Built-in Examples

- **Smoking Cessation**: 24 trials, 4 components (self-help, individual counselling, group counselling, pharmacotherapy)
- **Depression Treatment**: 18 trials, 5 components (CBT, exercise, pharmacotherapy, psychoeducation, mindfulness)

## Methods

- Additive component model: Y = X * beta + epsilon, where X is the binary design matrix mapping comparisons to component contrasts
- Weighted least squares with inverse-variance weights
- Optional interaction terms (Component_A x Component_B) added to the design matrix
- Reference category: treatments with no active components (Placebo, Control)
- Based on: Rucker G, Petropoulou M, Schwarzer G. Network meta-analysis of multicomponent interventions. Biometrical Journal. 2020;62(3):808-821.

## Screenshots

> Screenshots can be added by opening the tool and using browser screenshot.

## Validation

- 25/25 Selenium tests pass
- Methodology cross-validated against the R netmeta package (Rucker et al.)

## Export

- CSV (component effects, rankings)
- JSON (full results)
- R code (netmeta equivalent)
- Methods text (clipboard, manuscript-ready)
- MAIF (Meta-Analysis Interchange Format) for cross-tool data flow

## Citation

If you use this tool, please cite:

> Ahmad M. Component NMA: A browser-based component network meta-analysis tool for complex interventions. 2026. Available at: https://github.com/mahmood726-cyber/component-nma

## Author

**Mahmood Ahmad**
Royal Free Hospital, London, United Kingdom
ORCID: [0009-0003-7781-4478](https://orcid.org/0009-0003-7781-4478)

## License

MIT
