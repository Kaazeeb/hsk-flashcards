# Generated reports

Run `python3 language/scripts/audit_catalog.py --write-reports` to refresh this directory.

Reports separate mechanical errors from linguistic review backlog. A zero-error report means that IDs, references, required fields, level constraints, and compatibility contracts are structurally valid. It does not mean that every migrated sentence or translation has been expert-approved.

`grammar-study-coverage.csv` contains one row for each official HSK 1-3 grammar point. `grammar-study-coverage.md` summarizes row, category, normalized-element, lesson, example, question, explicit-negative, review, and validation status. Negative counts use exact negative-marker vocabulary relations plus the authorized `不必` exception, avoiding lexical false positives such as `不但` and `差不多`. In the supported pre-curation state these reports show zero active coverage without treating missing optional content as published content.

`hsk1-sentence-portfolio.csv` through `hsk3-sentence-portfolio.csv` contain exact active-card coverage for every vocabulary sense in each supported level. The matching Markdown reports summarize portfolio size, direction priority, vocabulary repetition, official grammar coverage, and retained historical tombstones. Refresh them with `python3 language/scripts/write_hsk3_sentence_portfolio_report.py --level LEVEL --maximum-active LIMIT`.

Authorized point-scoped vocabulary omissions are shown separately in the grammar report and on the affected official-point CSV row. They are not counted as vocabulary relations.
