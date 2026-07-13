# Catalog data dictionary

The authoritative headers, required fields, types, and allowed values are defined in `tables.json` and enforced by `audit_catalog.py`.

Key design choices:

- `vocab_id` identifies a syllabus sense, not just a printed hanzi surface. Numbered syllabus forms such as `本1` retain their sense number.
- Translations are separate locale-keyed tables so adding Portuguese or another language does not change Chinese lexical identity.
- Sentence content is direction-neutral. Presentation fields live in product bindings.
- Sentence-vocabulary and sentence-grammar links are normalized relationship tables with explicit review status.
- Official grammar rows and legacy free-form grammar labels are distinct until reviewed.
- Hanzi metadata imported from word cards is unreviewed because a word gloss is not necessarily a valid character gloss.
- Coverage exceptions are limited to reviewed bound-morpheme contexts; ordinary surface variants stay in explicit vocabulary relations.
- Compatibility order is explicit and audited because current persisted progress is partly positional.

An `approved` row must have a matching current entry in the append-only `reviews.csv` history. Its `content_hash` is the SHA-256 produced by `catalog_io.row_hash()` after excluding lifecycle fields (`review_status`, `curation_status`, `linguistic_review_status`, and `example_review_status`). Earlier decisions remain valid historical events after the content changes; a new matching decision is required before the current version can be approved. Every waiver needs a finite `expires_at` date, and expired waivers never suppress audit findings.
