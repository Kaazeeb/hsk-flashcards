# HSK Flashcards v32 review notes

## Scope

This version treats the current code and Supabase schema as the new base. Legacy
migration paths for earlier persistence formats were removed from the runtime.

## Security / sync review

- The frontend still contains only the Supabase anon key, not a service-role key.
- Remote row isolation depends on Supabase RLS: every synced row must satisfy
  `user_id = auth.uid()`.
- Review/progress data is append-only in `app_review_events`; normal clients can
  read and insert, but not update/delete review history.
- Setup data is stored in `app_sync_documents` as small documents.
- Card visibility is a single compact `card_flags_bundle/current` document, not
  one remote document per card.
- Remote card identifiers are compact `idx:n` refs. Descriptive local ids are no
  longer sent to Supabase URLs or review event rows.
- Remote loads now page through all events with `.range(...)`; they no longer rely
  on the default PostgREST page size.
- Failed remote saves mark the local cache as unsynced. A later load tries to push
  that local cache before replacing it with remote data.

## Removed legacy paths

- No fallback read from `app_state_documents`.
- No fallback read from per-card `card_flags` documents.
- Progress/smart reset/import is modeled with append-only review epoch markers, not
  destructive event rewrites.
- No counter-only Smart FSRS sync fallback.
- No runtime Supabase URL/key form; the project uses hardcoded URL + anon key.

## Remaining important limitations

- Reset/import now writes an append-only `review_reset` epoch marker. Remote rebuilds
  ignore old progress/Smart events outside the active epoch instead of deleting history.
- Normal practice/test progress is still derived from counter deltas at save time.
  Smart FSRS is cleaner because it stores explicit review events.
- There is no Supabase Realtime subscription. Other devices refresh on load/focus,
  not instantly.
- The large UI controller was split into responsibility-focused `js/main-*.js` files;
  no JavaScript source file is above the 1500-line soft limit.
- The app does not yet expose a clear sync-status panel for pending/failed cloud
  saves.
