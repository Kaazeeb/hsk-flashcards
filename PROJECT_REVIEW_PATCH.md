# Patch review notes

## Objective severe fixes applied

1. **Remote reset/import resurrection fixed**
   - Added an append-only `review_reset` epoch marker in `app_review_events`.
   - Remote rebuilds now use only review/progress events from the active epoch.
   - `Reset progress`, destructive vocabulary import, built-in restore after a deck change, and JSON import now create a fresh review epoch.

2. **Wrong-card progress after deck replacement fixed**
   - Old remote events keyed as `idx:n` are no longer replayed onto a different vocabulary after a destructive deck change.
   - New progress and Smart FSRS events include the current epoch id in payloads and event ids.

3. **Stale offline cache protection improved**
   - If a local cache has unsynced changes but the remote side has a newer review epoch, the app keeps the newer remote reset/import epoch instead of pushing stale old progress back over it.

4. **DOM clearing hardened**
   - Replaced the only `innerHTML = ""` clearing helper with `replaceChildren()`.

## Refactor applied for the 1500-line soft limit

- Split the old `js/main.js` controller into responsibility-focused files:
  - `js/main-context.js`
  - `js/main-model.js`
  - `js/main-setup-view.js`
  - `js/main-study-flow.js`
  - `js/main-actions.js`
  - `js/main.js` is now only the facade exposing `main.bootstrap()`.
- Split the built-in card data into four chunks under `js/data/` and kept `hsk1-data.js` as a tiny aggregator.
- Kept the generated FSRS vendor bundle as one vendor file, but comment-stripped/transpiled it so it stays below the line limit without mixing it into app code.

## Validation performed

- Confirmed all JavaScript files are below 1500 lines.
- Ran syntax checks with `node --check` on changed app modules.
- Loaded the scripts in a VM context and confirmed the built-in deck still resolves to 1000 cards.
- Ran a stubbed bootstrap smoke test and confirmed the first card renders.
- Simulated remote reset sync and confirmed:
  - a `review_reset` event is written;
  - new progress events carry the epoch id;
  - old/stale remote events are ignored after the active reset epoch.
