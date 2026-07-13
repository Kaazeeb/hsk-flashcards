# Data ownership

`catalog/` contains language facts and editorial judgments. `product_bindings/` contains presentation and compatibility decisions. A language-only task may update the former but must not casually change the latter.

All CSV files use UTF-8, a header row, RFC 4180 quoting, `\n` line endings, and empty strings for unknown values. Multi-value compatibility fields use `|` only where the schema explicitly permits it. Relationship tables are preferred over adding new list-valued fields.

Rows are ordered deterministically for readable diffs, but IDs—not row numbers—are the relational keys. The only positional fields that carry runtime meaning are explicitly named `runtime_order`, `deck_order`, and `legacy_storage_key` in product bindings.

`reviews.csv` is an append-only decision log: an approved current row needs a matching current hash, while older hashes remain historical evidence. Legacy relationship and classifier rows must not be physically deleted, because their presence is part of the immutable migration baseline. `waivers.csv` is only for narrow, temporary audit exceptions and requires a finite expiry date.

Grammar-study content keeps official rows, pedagogical decompositions, lessons, notes, patterns, canonical examples, analyses, and target spans in separate reviewed tables. The product binding contains only activation and per-level order. These post-migration curation tables are never regenerated or overwritten by `bootstrap_catalog.py`.

`grammar_vocabulary_exceptions.csv` records exceptional official grammar-inventory surfaces that lack a standalone vocabulary sense at or below the grammar point's introduction level. It is reviewed policy evidence, not a vocabulary relation. The validator accepts only explicitly allowlisted point/surface/level/target-role scopes and requires the matching occurrence to be a reviewed grammar-example target; a later-level sense is never relabeled.
