# HSK Flashcards technical overview

## Structure

Root files:

- `index.html`: three views (Login, Setup, Flash cards) and script loading order.
- `styles.css`: all current styling and mobile layout.
- `app.js`: tiny bootstrap that calls `main.bootstrap()`.
- `hsk1-data.js`: tiny aggregator for the built-in HSK 1-3 card chunks in `js/data/`.
- `fsrs-lib.js`: browser FSRS scheduler build.
- `supabase_starter.sql`: current Supabase schema and RLS policies.

JavaScript modules:

- `js/constants.js`: shared constants and built-in card loader.
- `js/utils.js`: CSV/range/date/shuffle/card helpers.
- `js/pinyin.js`: pinyin normalization and answer checking.
- `js/sync-codec.js`: compact remote card refs, card flag bundle, set payload codec.
- `js/auth.js`: Supabase auth and remote persistence adapter.
- `js/storage-adapters.js`: local/remote persistence switching and serialized saves.
- `js/store.js`: normalized app state and mutations.
- `js/smart-fsrs.js`: Smart FSRS scheduling, due/new queues and review events.
- `js/ui-helpers.js`: small DOM/UI helpers.
- `js/main-context.js`: shared runtime context, auth UI, and page shell.
- `js/main-model.js`: card scopes, Smart queues, schedule summaries, and stats helpers.
- `js/main-setup-view.js`: setup/review-scope rendering and shared card display helpers.
- `js/main-study-flow.js`: answer flow and flashcard renderers.
- `js/main-actions.js`: top-level render, setup actions, event binding, and bootstrap.
- `js/main.js`: tiny facade that exposes `main.bootstrap()`.

## Current persistence model

- Setup/config data is stored as granular documents in `app_sync_documents`.
- Card visibility is stored as one compact `card_flags_bundle/current` document.
- Named sets are stored as one document per set, using compact card refs.
- Review/progress data is stored as append-only rows in `app_review_events`.
- Remote card ids are compact refs such as `idx:123`; long local ids are not sent
  through Supabase query strings.

## Smart practice

Smart uses FSRS with user feedback:

- `1` Again
- `2` Hard
- `3` Good
- `4` Easy

New cards are introduced separately from scheduled due reviews. Cards only enter
FSRS after the first Smart introduction/review.

## Important limitations

- There is no Supabase Realtime subscription; other devices refresh on load/focus.
- Reset/import now creates a review epoch marker in the append-only event stream, so older review events are ignored after destructive progress/deck resets.
- Normal practice/test progress still uses counter deltas; Smart FSRS has explicit
  per-review events.
- The old large main controller has been split into responsibility-focused `js/main-*.js` files.
- No full sync-status UI yet; failed saves are marked in local metadata but only
  warnings are shown in the console.
