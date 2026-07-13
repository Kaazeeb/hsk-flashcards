# Catalog data dictionary

The authoritative headers, required fields, types, and allowed values are defined in `tables.json` and enforced by `audit_catalog.py`.

Key design choices:

- `vocab_id` identifies a syllabus sense, not just a printed hanzi surface. Numbered syllabus forms such as `本1` retain their sense number.
- Translations are separate locale-keyed tables so adding Portuguese or another language does not change Chinese lexical identity.
- Sentence content is direction-neutral. Presentation fields live in product bindings.
- Sentence-vocabulary and sentence-grammar links are normalized relationship tables with explicit review status.
- Official grammar rows and legacy free-form grammar labels are distinct until reviewed.
- Grammar lessons map explicitly to official rows and normalized elements; primary mappings provide exact row and variant coverage without equating a syllabus row with a lesson.
- A grammar pattern may reference one element directly or remain lesson-level when it jointly realizes multiple mapped elements; its optional element foreign key must never imply only the first member of a multi-element pattern.
- Grammar examples reuse canonical sentence, utterance, translation, vocabulary, and exact grammar relations. Target spans are stored as reviewed literal occurrences and compile to safe plain-text parts.
- A grammar vocabulary exception leaves an authorized target occurrence unlinked; it never supplies a substitute `vocab_id` or relabels a later-level sense. The authorized scopes are `hsk26-g1-013` / `杯` / HSK 1 / `classifier` and `hsk26-g3-023` / `不必` / HSK 3 / `negative_modal` only.
- `grammar_page_lessons.csv` is product-owned and contains only strict activation plus contiguous per-level display order.
- Hanzi metadata imported from word cards is unreviewed because a word gloss is not necessarily a valid character gloss.
- Coverage exceptions are limited to reviewed bound-morpheme contexts; ordinary surface variants stay in explicit vocabulary relations.
- Compatibility order is explicit and audited because current persisted progress is partly positional.

An `approved` row must have a matching current entry in the append-only `reviews.csv` history. Its `content_hash` is the SHA-256 produced by `catalog_io.row_hash()` after excluding lifecycle fields (`review_status`, `curation_status`, `linguistic_review_status`, and `example_review_status`). Earlier decisions remain valid historical events after the content changes; a new matching decision is required before the current version can be approved. Every waiver needs a finite `expires_at` date, and expired waivers never suppress audit findings.

New exact `sentence_grammar.csv` rows may leave `legacy_tag` blank only when `mapping_status=mapped`, `grammar_point_id` is nonblank, and candidate IDs are blank. Migrated legacy tags remain immutable. A blank tag is never synthesized merely to satisfy runtime compatibility.
