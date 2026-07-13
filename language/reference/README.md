# Syllabus references

`HSK_SYLLABUS_ZH.md` is the normative 2025-11 edition, effective 2026-07. `HSK_SYLLABUS_EN.md` is its audited aligned translation and is used to cross-check hierarchy and translate task, topic, and grammar descriptions.

Important parsing constraints:

- Levels 7–9 are a single band in these documents and must not be split into three invented lists.
- The writing-hanzi list groups Levels 1–2; the body tables, not the table of contents, define the available bands.
- The English vocabulary table intentionally repeats the Chinese table and supplies no vocabulary translations.
- Three corrected topic-hierarchy shifts in the Chinese Markdown are applied explicitly by `syllabus_parser.py`; any new hierarchy mismatch fails the import.
- Vocabulary and hanzi alignment is exact, task/capability alignment is positional within structural keys, and absolute line offsets are not used as cross-language keys.

The expected checksums are enforced by the parser and also recorded in `data/catalog/sources.csv`.

`legacy-runtime-cards.json` is an immutable semantic snapshot of the four JavaScript catalogs at migration time. It lets the compiler prove that `legacy_unreviewed` content has not changed even after approved catalog revisions are published back to the runtime. Never regenerate or replace it as part of normal curation.
