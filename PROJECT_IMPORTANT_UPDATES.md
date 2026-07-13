# Important project updates

This document replaces the previous collection of granular project-review and patch notes. It keeps only changes that affect current architecture, data compatibility, deployment, or future maintenance.

## Canonical language catalog

- Chinese learning content now has a dedicated `language/` workspace and scoped `AGENTS.md`.
- The complete audited HSK syllabus is normalized into CSV sources for 11,000 vocabulary senses, 3,088 recognition hanzi, 593 grammar rows, 427 topics, 166 tasks, and 678 task capabilities.
- All current vocabulary, sentence, hanzi, and classifier data has been migrated with `legacy_unreviewed` status and deterministic runtime bindings.
- Runtime JavaScript remains compatible with the static app but is now generated and checked from the CSV catalog.
- Product presentation fields are isolated from linguistic content so language curation does not choose card direction, deck behavior, UI, or scheduling.

## 2.2.0 sentence-card coverage update

- Updated `VERSION.txt` to `2.2.0` by advancing only the middle version number from the prior `2.1.0` sentence-card update line.
- Rebuilt the sentence expansion without artificial quoted-vocabulary fallback frames such as `请写“X”。`, `请读这个词：“X”。`, or `请复习这个词：“X”。`.
- Reduced the expanded sentence set to 1,562 sentence cards, split across `sentence-cards-data-part-1.js` through `sentence-cards-data-part-7.js`.
- Updated `index.html` to load the seven sentence-card parts.
- Recomputed sentence `vocabTags` from Chinese text using longest-match vocabulary segmentation plus natural component/suffix surface coverage for `们`, `子`, `室`, `园`, and `员`.
- Added `scripts/augment_sentence_flashcards.py` for the historical direct-runtime expansion. It is now guarded by `--legacy-direct-write`; new curation uses the canonical `language/` pipeline.
- Updated `scripts/analyze_flashcards.py` so the audit reports same-level coverage, including the component/surface metric used for suffix and compound-component entries.
- Added current coverage reports under `tests/reports/`. Every vocabulary card in 1–1000 now has at least 3 same-level sentence appearances under the updated coverage metric.

## 2.0.0 cleanup

- Removed obsolete review/patch documents and replaced them with this high-signal update log plus the current technical overview.
- Updated `VERSION.txt` to `2.0.0`.
- Updated `JS_LINE_COUNTS.txt` for the current JavaScript tree.
- Replaced the old Supabase setup note with `SUPABASE.md` and a current `supabase_starter.sql`.
- Removed unused initializer/data files that are no longer loaded by `index.html`.
- Removed dead code paths for legacy custom vocabulary, legacy custom sets, document-bundle sync, and unused pinyin/stroke helpers.
- Fixed the script list so sentence data parts 4 and 5 are loaded.
- Kept the app as a static browser project with no build step.

## Current architecture decisions to preserve

- Built-in vocabulary is the only active vocabulary catalog. Remote custom-vocabulary documents must not override standard app content.
- Setup visibility is per card and per mode. It is stored in compact rows in `app_card_visibility_bits`.
- Review/progress persistence is append-only in `app_review_events`.
- Destructive progress reset is represented by a `review_reset` epoch marker. Old events remain stored but are ignored outside the active epoch.
- Vocabulary review events use compact remote refs such as `idx:123`; sentence and image events use their own card ids directly.
- Smart review uses FSRS ratings. Vocabulary uses the guided hanzi/pinyin/translation flow; sentence/study decks use flip-and-rate; image cards are scaffolded separately.
- App/business data intentionally has no offline replay queue. Failed remote writes are logged and dropped after the in-memory diff baseline advances.

## Content baseline after 2.2.0

- Vocabulary: 1,000 built-in cards.
- Sentence cards: 1,562 total across HSK 1, HSK 2, and HSK 3 sentence decks.
- Generated study cards: 1,578 total.
- Sentence/study total: 3,140 cards.
- Image-card catalog: 0 active cards until entries/assets are added.

## Supabase baseline after cleanup

Required tables:

- `profiles`
- `app_review_events`
- `app_card_visibility_bits`

Removed from active architecture:

- `app_sync_documents`
- `card_flags_bundle/current`
- remote custom vocabulary/set documents as an active source of app content
