# HSK Flashcards Simple v34

## Smart Practice session queue fix for Again

Selecting `Again` still records the normal FSRS review event with `rating = 1` and keeps the append-only Supabase history unchanged.

The active browser session now keeps a runtime-only deferred tail for Smart due reviews. When a card is marked `Again`, that card is moved behind the other currently due cards in the active session, instead of coming back after only one different card because it is still due today.

This deferral is not persisted to Supabase. It only affects the current active study session order. Restarting Smart Practice or reloading the page rebuilds the due queue from saved FSRS state.

No Supabase schema change is required for v34.
