# HSK Flashcards technical overview

## Structure

Root files:

- `index.html`: Login, Setup, Flash cards, and Image cards views.
- `styles.css`: all current styling and mobile layout.
- `app.js`: tiny bootstrap that calls `main.bootstrap()`.
- `hsk1-data.js`: tiny aggregator for the built-in HSK 1-3 vocabulary chunks in `js/data/`.
- `fsrs-lib.js`: browser FSRS scheduler build.
- Supabase schema is maintained outside the app zip; v38 requires no schema migration.

JavaScript modules:

- `js/constants.js`: shared constants and built-in vocabulary loader.
- `js/image-cards-data.js`: built-in image-card catalog scaffold.
- `js/sentence-cards-data.js`: built-in sentence decks.
- `js/utils.js`: range/date/shuffle/card helpers.
- `js/pinyin.js`: strict pinyin numeric answer checking from hardcoded `pinyinNumeric`.
- `js/sync-codec.js`: compact remote card refs and visibility flag bundles.
- `js/auth.js`: Supabase auth and remote persistence adapter.
- `js/storage-adapters.js`: remote persistence wrapper; app data has no offline backlog.
- `js/store.js`: normalized app state and mutations.
- `js/smart-fsrs.js`: Smart FSRS scheduling, due/new queues and review events.
- `js/ui-helpers.js`: small DOM/UI helpers.
- `js/main-context.js`: shared runtime context, auth UI, and page shell.
- `js/main-model.js`: card scopes, Smart queues, schedule summaries, and stats helpers.
- `js/main-setup-view.js`: setup/review-scope rendering and shared card display helpers.
- `js/main-study-flow.js`: answer flow and flashcard renderers.
- `js/main-image-flow.js`: image-card learn/review flow.
- `js/main-actions.js`: top-level render, setup actions, event binding, and bootstrap.
- `js/main.js`: tiny facade that exposes `main.bootstrap()`.

## Current content model

- Vocabulary cards are standard built-in content only.
- Users cannot import vocabulary, create cards, or create custom vocabulary sets.
- Users can still control each built-in vocabulary card's Learn/Practice visibility in Setup.
- Sentence decks are built-in and separate from vocabulary.
- Image-card support is scaffolded through a built-in catalog and static image paths.

## Current persistence model

- Setup/config data is stored in `app_sync_documents`.
- Card visibility is stored as one compact `card_flags_bundle/current` document.
- Review/progress data is stored as append-only rows in `app_review_events`.
- Legacy custom vocabulary documents are ignored by v38.
- Legacy custom vocabulary-set documents are ignored by v38.
- Remote card ids are compact refs such as `idx:123`; long local ids are not sent through Supabase query strings.

## Smart practice

Smart uses FSRS with user feedback:

- `1` Again
- `2` Hard
- `3` Good
- `4` Easy

Vocabulary cards use the original guided flow: hanzi, typed numeric pinyin, translation, then rating.
Sentence cards use a simple flip-and-rate flow.
Image cards use a child-friendly learn/review flow.

New cards are introduced separately from scheduled due reviews. Cards only enter FSRS after the first Smart introduction/review.

## Important limitations

- There is no Supabase Realtime subscription; other devices refresh on load/focus.
- Reset creates a review epoch marker in the append-only event stream, so older review events are ignored after destructive progress resets.
- The old large main controller has been split into responsibility-focused `js/main-*.js` files.
- No full sync-status UI yet; failed remote saves are warned in the console and are not queued for offline replay.
