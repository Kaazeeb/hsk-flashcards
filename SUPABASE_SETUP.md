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
