# Important project updates

This document replaces the previous collection of granular project-review and patch notes. It keeps only changes that affect current architecture, data compatibility, deployment, or future maintenance.

## Canonical language catalog

- Chinese learning content now has a dedicated `language/` workspace and scoped `AGENTS.md`.
- The complete audited HSK syllabus is normalized into CSV sources for 11,000 vocabulary senses, 3,088 recognition hanzi, 593 grammar rows, 427 topics, 166 tasks, and 678 task capabilities.
- All current vocabulary, sentence, hanzi, and classifier data has been migrated with `legacy_unreviewed` status and deterministic runtime bindings.
- Runtime JavaScript remains compatible with the static app but is now generated and checked from the CSV catalog.
- Product presentation fields are isolated from linguistic content so language curation does not choose card direction, deck behavior, UI, or scheduling.

## 2.5.0 sentence portfolios and grammar review

- Updated `VERSION.txt` to `2.5.0`.
- Reduced the active HSK 1 sentence deck from 440 to 310 cards and the HSK 2 deck from 378 to 232 cards, while retaining every published binding as immutable active or inactive history.
- Selected 226 stronger historical cards, 70 approved Grammar Study examples, and 14 approved editorial sentences for HSK 1. Selected 129 stronger historical cards, 78 grammar examples, and 25 editorial sentences for HSK 2.
- Rebalanced exact stable-ID coverage so all 300 HSK 1 vocabulary senses and all 200 HSK 2 vocabulary senses have at least two distinct active contexts. The best-effort third-context counts are 171 for HSK 1 and 58 for HSK 2.
- Applied the requested direction priority after coverage and quality constraints: HSK 1 has 225 Chinese-to-English cards, 80 English-to-Chinese cards, and 5 Chinese Q&A cards; HSK 2 has 174, 56, and 2 respectively.
- Chose the 232-card quality-first HSK 2 portfolio over a 229-card relaxation that would have reintroduced seven weak cards.
- Kept 214 unselected HSK 1 historical bindings and 249 unselected HSK 2 historical bindings as inactive tombstones with frozen IDs and order.
- Added focused per-level reports covering exact vocabulary repetition, all 70/78 official grammar points, direction mix, source composition, and tombstone preservation.
- Expanded Grammar Study from 571 to 641 approved examples: 170 HSK 1, 221 HSK 2, and 250 HSK 3 examples. The reviewed catalog now has 659 example-to-point analyses and 749 literal grammar targets.
- Added runtime schema 2 applicability labels so every pattern and explanatory note identifies the exact Chinese forms it covers.
- Audited the incoming grammar review independently. Corrected ambiguous `会/能` and `可能` examples, one inaccurate `多` analysis, four overgeneralized watch-outs, and a character-based negative counter that misclassified lexicalized forms such as `不但` and `差不多`.
- Preserved seven already-published HSK 3 sentence entities instead of importing in-place semantic rewrites from the review branch. No sentence-card binding, frozen card ID, or tombstone changed during the grammar port.

## 2.4.0 HSK 3 sentence portfolio

- Updated `VERSION.txt` to `2.4.0`.
- Reduced the active HSK 3 sentence deck from 744 to 550 cards while retaining all published bindings as immutable active or inactive history.
- Selected 383 stronger historical cards, activated 96 approved Grammar Study examples covering all 96 official HSK 3 grammar points, and added 71 approved editorial sentences for weak, scarce, or unresolved vocabulary contexts.
- Rebalanced exact stable-ID coverage so all 500 HSK 3 vocabulary senses have at least two distinct active contexts; 257 have at least three. The optimizer now establishes the two-context floor before allocating third contexts, while sentence naturalness and lexical-sense accuracy remain hard editorial requirements.
- Applied the requested direction priority after coverage and quality constraints: 387 Chinese-to-English cards, 146 English-to-Chinese cards, and 17 Chinese Q&A cards in the active HSK 3 deck.
- Kept 361 unselected historical bindings and 19 superseded curated bindings as inactive tombstones with frozen IDs and order.
- Added append-only sentence-card tombstones and sparse visibility indexes so removing a card from the active runtime does not shift existing users' compact visibility bits.
- Regenerated the static runtime as six sentence-card chunks and verified catalog/runtime semantic equality.

## 2.3.0 Grammar Study page

- Updated `VERSION.txt` to `2.3.0`.
- Added a signed-in Grammar page for HSK 1, HSK 2, and HSK 3, with HSK 1 as the default level plus category filtering, search, loading/error states, and one-at-a-time lesson expansion.
- Added 244 approved lessons: 70 for HSK 1, 78 for HSK 2, and 96 for HSK 3. The curated lesson data contains 547 modeled grammar elements and 571 examples.
- Added deterministic catalog compilation to three same-origin per-level JavaScript chunks. The controller loads each level lazily, caches successful payloads, supports retry after failure, and strictly validates payload structure, ordered official grammar-point ids, and primary lesson coverage before rendering.
- Kept Chinese grammar curation in the canonical `language/` catalog and generated the runtime chunks from that source rather than treating JavaScript as an editorial surface.
- Recorded exactly two narrowly scoped editorial exceptions: HSK 1 `杯` for classifier use and HSK 3 `不必` for negative-modal use. There is no broad exception path for either term or for later-level vocabulary generally.
- Browser/manual QA was intentionally not completed at the user's direction. This release does not claim browser transfer-size measurements or screenshot validation.

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

## Content baseline after 2.5.0

- Vocabulary: 1,000 built-in cards.
- Sentence cards: 1,092 active cards across HSK 1, HSK 2, and HSK 3 sentence decks.
- Generated study cards: 1,578 total.
- Sentence/study total: 2,670 cards.
- Image-card catalog: 0 active cards until entries/assets are added.
- Grammar Study: 244 lessons, 547 elements, and 641 examples across HSK 1 through HSK 3.

## Supabase baseline after cleanup

Required tables:

- `profiles`
- `app_review_events`
- `app_card_visibility_bits`

Removed from active architecture:

- `app_sync_documents`
- `card_flags_bundle/current`
- remote custom vocabulary/set documents as an active source of app content
