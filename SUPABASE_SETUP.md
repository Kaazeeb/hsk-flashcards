# Supabase setup

1. Create a Supabase project.
2. Run `supabase_starter.sql` in the Supabase SQL Editor.
3. Ensure Email/Password auth is enabled.
4. Set the Auth Site URL / Redirect URLs to your GitHub Pages URL.
5. Deploy the static app files to GitHub Pages.

The frontend is hardcoded to the current project URL and anon key in `js/auth.js`.
Do not place a service-role key in the browser.

The current schema uses:

- `profiles`
- `app_sync_documents`
- `app_review_events`

`app_review_events` is append-only in normal app operation.

## v35 image flashcards

v35 does not require a new table for image cards. Built-in image files are served from GitHub Pages under `images/flashcards/`, and Supabase stores only small append-only events in `app_review_events`:

- `image_learn_seen`
- `image_smart_fsrs`

Run the current `supabase_starter.sql` to add the optional image review index:

```sql
create index if not exists app_review_events_user_image_deck_idx
  on public.app_review_events (user_id, set_id, occurred_at asc, created_at asc)
  where kind = 'image_smart_fsrs';
```

This index does not delete, rewrite, or reset any existing progress.
