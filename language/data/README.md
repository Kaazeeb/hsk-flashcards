# Data ownership

`catalog/` contains language facts and editorial judgments. `product_bindings/` contains presentation and compatibility decisions. A language-only task may update the former but must not casually change the latter.

All CSV files use UTF-8, a header row, RFC 4180 quoting, `\n` line endings, and empty strings for unknown values. Multi-value compatibility fields use `|` only where the schema explicitly permits it. Relationship tables are preferred over adding new list-valued fields.

Rows are ordered deterministically for readable diffs, but IDs—not row numbers—are the relational keys. The only positional fields that carry runtime meaning are explicitly named `runtime_order`, `deck_order`, and `legacy_storage_key` in product bindings.

`reviews.csv` is an append-only decision log: an approved current row needs a matching current hash, while older hashes remain historical evidence. Legacy relationship and classifier rows must not be physically deleted, because their presence is part of the immutable migration baseline. `waivers.csv` is only for narrow, temporary audit exceptions and requires a finite expiry date.
