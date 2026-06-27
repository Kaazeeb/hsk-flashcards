# Important project updates

This document replaces the previous collection of granular project-review and patch notes. It keeps only changes that affect current architecture, data compatibility, deployment, or future maintenance.

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

## Content baseline after cleanup

- Vocabulary: 1,000 built-in cards.
- Sentence cards: 600 total, split evenly across HSK 1, HSK 2, and HSK 3.
- Generated study cards: 1,578 total.
- Sentence/study total: 2,178 cards.
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
