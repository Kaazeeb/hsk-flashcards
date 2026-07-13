# Generated reports

Run `python3 language/scripts/audit_catalog.py --write-reports` to refresh this directory.

Reports separate mechanical errors from linguistic review backlog. A zero-error report means that IDs, references, required fields, level constraints, and compatibility contracts are structurally valid. It does not mean that every migrated sentence or translation has been expert-approved.

`grammar-study-coverage.csv` contains one row for each official HSK 1-3 grammar point. `grammar-study-coverage.md` summarizes row, category, normalized-element, lesson, example, review, and validation status. In the supported pre-curation state these reports show zero active coverage without treating missing optional content as published content.

Authorized point-scoped vocabulary omissions are shown separately in the grammar report and on the affected official-point CSV row. They are not counted as vocabulary relations.
