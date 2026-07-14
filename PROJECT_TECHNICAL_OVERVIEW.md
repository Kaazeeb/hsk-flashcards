# HSK Flashcards technical overview

Version: 2.5.0

## Runtime model

This is a static browser app. There is no build step, package manager, bundler, or server-side application code in this repository. `index.html` loads classic scripts in dependency order and all modules attach to the shared `window.HSKFlashcards` namespace.

Main entry path:

1. `index.html` loads the eager data, libraries, and app modules.
2. `app.js` calls `window.HSKFlashcards.main.bootstrap()`.
3. `js/main.js` forwards bootstrap to the split runtime implementation.
4. `js/main-actions.js` owns the final bootstrap, render cycle, event binding, and top-level UI actions.

Grammar lesson payloads are an exception to the eager data path: the Grammar controller loads one same-origin JavaScript chunk for the selected HSK level only when the signed-in Grammar page needs it.

## Root files

- `index.html`: page markup for auth, setup, vocabulary flashcards, review, stats, image-card panels, and the signed-in Grammar page.
- `styles.css`: all app styling and responsive/mobile layout.
- `app.js`: tiny bootstrap wrapper.
- `hsk1-data.js`: tiny aggregator marker for the split HSK vocabulary chunks under `js/data/`.
- `fsrs-lib.js`: browser FSRS scheduler build.
- `supabase_starter.sql`: current database starter script.
- `SUPABASE.md`: current Supabase schema and API-call documentation.
- `VERSION.txt`: release marker; current value is `2.5.0`.
- `JS_LINE_COUNTS.txt`: current JavaScript line-count snapshot.
- `PROJECT_IMPORTANT_UPDATES.md`: consolidated high-signal project updates only.

## JavaScript modules

Data/catalog modules:

- `js/data/flashcards/hsk1-data-part-1.js` through `js/data/flashcards/hsk1-data-part-5.js`: built-in HSK vocabulary chunks.
- `js/data/flashcards/sentence-cards-data-part-1.js` through `js/data/flashcards/sentence-cards-data-part-5.js`: built-in active sentence cards.
- `js/data/flashcards/hanzi-cards-data-part-1.js` through `js/data/flashcards/hanzi-cards-data-part-3.js`: hardcoded hanzi metadata used to generate pinyin and stroke-sequence study cards.
- `js/data/flashcards/measure-word-cards-data-part-1.js` through `js/data/flashcards/measure-word-cards-data-part-3.js`: hardcoded measure-word study-card metadata.
- `js/data/flashcards/image-cards-data.js`: image-card catalog scaffold. It is currently empty, so the app loads zero image cards until entries/assets are added.
- `js/data/grammar/grammar-lessons-hsk1.js` through `js/data/grammar/grammar-lessons-hsk3.js`: deterministic per-level Grammar Study payloads, loaded lazily rather than by the initial page script list.

Language source modules:

- `language/data/catalog/`: canonical Chinese linguistic content and normalized relationships.
- `language/data/product_bindings/`: product-owned card direction, deck, activation, and compatibility order.
- `language/reference/`: audited Chinese HSK syllabus plus its aligned English reference translation.
- `language/scripts/audit_catalog.py`: schema, reference, HSK-level, coverage, and compatibility audit.
- `language/scripts/compile_runtime_catalog.py`: deterministic compiler from CSV sources to the classic JavaScript files above, including the Grammar Study chunks.

Do not edit the generated flashcard JavaScript as the content source. Chinese-language changes start in `language/` and must follow `language/AGENTS.md`.
The compiler is an offline maintenance tool; generated JavaScript remains committed, so the browser runtime still has no build-step dependency.

Core modules:

- `js/constants.js`: shared constants and built-in catalog normalization/generation.
- `js/utils.js`: card normalization, ID helpers, ranges, dates, shuffling, and shared utility functions.
- `js/pinyin.js`: strict numeric-pinyin answer validation based on hardcoded `pinyinNumeric` fields.
- `js/visibility-bitset.js`: compact per-card Learn/Practice visibility encoding.
- `js/sync-codec.js`: compact vocabulary card reference codec for Supabase review rows.
- `js/auth.js`: Supabase Auth plus remote persistence adapter.
- `js/storage-adapters.js`: remote-first persistence wrapper with no business-data offline replay queue.
- `js/store.js`: normalized app state, migrations/normalizers, mutations, and reset handling.
- `js/smart-fsrs.js`: Smart review scheduling, FSRS rating handling, and review-event normalization.
- `js/ui-helpers.js`: small DOM helper utilities.
- `js/main-context.js`: shared runtime context, DOM references, page/auth shell helpers.
- `js/main-model.js`: derived card scopes, deck summaries, schedule summaries, and stats helpers.
- `js/main-setup-view.js`: Setup card-visibility rendering and shared flashcard display helpers.
- `js/main-study-flow.js`: vocabulary/sentence answer flow and flashcard renderers.
- `js/main-image-flow.js`: image-card learn/review flow scaffold.
- `js/main-grammar-page.js`: signed-in Grammar page controller, level/category/search state, lazy same-origin chunk loading, retry handling, strict payload validation, and safe lesson rendering.
- `js/main-actions.js`: render orchestration, setup actions, reset/navigation actions, and event binding.
- `js/main.js`: tiny facade that exposes `main.bootstrap()`.

## Current content model

- Vocabulary is built-in only: 1,000 cards loaded from the split HSK chunks.
- User-created/imported vocabulary catalogs are disabled. Legacy remote custom-vocabulary data is ignored by the current normalizer.
- Custom vocabulary sets are disabled. The standard vocabulary scope is `All cards`; per-card Learn/Practice visibility is managed in Setup.
- Sentence/study content totals 2,670 cards:
  - 1,092 active sentence cards: 310 HSK 1, 232 HSK 2, and 550 HSK 3.
  - 1,578 generated study cards.
- Sentence-card product bindings are append-only. Inactive historical bindings remain as tombstones, and each active runtime card carries its frozen historical visibility index so compact per-user visibility bits do not shift. The active projections combine 226 historical cards, 70 approved grammar examples, and 14 approved editorial sentences for HSK 1; 129 historical cards, 78 grammar examples, and 25 editorial sentences for HSK 2; and 383 historical cards, 96 grammar examples, and 71 editorial sentences for HSK 3. Exact stable-ID relations give every vocabulary sense through HSK 3 at least two distinct active contexts in its level portfolio.
- Sentence/study direction breakdown is generated from the loaded card data. Sentence cards include Chinese-to-English, English-to-Chinese, and Chinese Q&A directions; generated study cards include `hanzi_to_pinyin`, `measure_word`, and `stroke_sequence`.
- Image cards are scaffolded but the current catalog has 0 active cards.
- Grammar Study contains 244 approved lessons across HSK 1 through HSK 3: 70 HSK 1 lessons, 78 HSK 2 lessons, and 96 HSK 3 lessons. The lessons contain 547 modeled elements and 641 examples.
- Grammar compilation is deterministic. Runtime schema 2 includes exact `appliesToZh` forms for every pattern and explanatory note. The page controller validates chunk identity, ordered official grammar-point ids, primary lesson coverage, applicability arrays, and payload structure before rendering a level.
- Grammar vocabulary policy has two exact editorial exceptions only: HSK 1 `杯` in classifier use and HSK 3 `不必` in negative-modal use. Neither exception creates a broad allowance for the word, level, or element type.

## Main learning flows

Vocabulary cards support:

- Learn mode with seen-card progress.
- Practice translation.
- Practice pinyin.
- Smart FSRS review with ratings `1=Again`, `2=Hard`, `3=Good`, `4=Easy`.

Sentence/study decks support a flip-and-rate Smart flow. Image cards have a separate learn/review scaffold with a softer image spacing factor.

The signed-in Grammar page supports HSK 1, HSK 2, and HSK 3, defaulting to HSK 1. Learners can filter lessons by category, search the loaded level, and expand one lesson at a time. Grammar study is read-only and does not add review scheduling or persistence records.

## State and persistence model

The store keeps one normalized in-memory state for UI simplicity. Persistence is remote-first:

- Supabase Auth can persist its own login session.
- App/business data is not cached to `localStorage` for offline replay.
- If Supabase is unavailable, the app can continue from built-in state for the current page session, but failed app-data writes are not queued.

Remote persistence currently uses:

- `app_review_events`: append-only progress and FSRS events.
- `app_card_visibility_bits`: compact per-user Learn/Practice visibility rows.
- `profiles`: user profile metadata linked to `auth.users`.

`app_sync_documents` and the old `card_flags_bundle/current` document format are no longer part of the active app path.

## Reset and review epochs

Progress reset does not edit old review rows. Instead, the app writes a `review_reset` event with a new epoch id. Current load logic applies only events belonging to the active epoch, which keeps destructive resets deterministic while preserving an append-only review table.

## Supabase security model

The browser includes the Supabase URL and anon key. That is acceptable only because all private data isolation depends on Supabase Auth plus Row Level Security policies. The current SQL enforces that users can only read or write rows where the owner column matches `auth.uid()`.

## Operational limitations

- No Supabase Realtime subscription; other devices refresh on load/focus rather than streaming every event live.
- No business-data offline replay queue.
- No automated browser test suite is included in the repository.
- Browser/manual QA for the Grammar Study release was intentionally not completed at the user's direction. No browser transfer-size measurements or screenshot validation are claimed for this release.
- Image cards require catalog entries plus image assets before the image flow has real content.
