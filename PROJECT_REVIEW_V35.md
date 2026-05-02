# hsk_flashcards_simple_v35

## Scope

v35 prepares the app for a new child-friendly image flashcards section without adding actual image files yet.

## Major changes

- Added a new `Image cards` page.
- Added placeholder image manifest: `js/image-cards-data.js`.
- Added image asset folder scaffold: `images/flashcards/`.
- Image files are intended to be served statically from GitHub Pages.
- Supabase stores only image card IDs, deck IDs, ratings, and review events.
- No Supabase Storage bucket is required for built-in image decks.
- No new Supabase table is required.
- Added an optional image-specific index to `supabase_starter.sql`.
- Removed the visible Test mode/tab and Test setup controls.

## Image card data format

Add records to `js/image-cards-data.js`:

```js
window.HSK_IMAGE_CARDS = [
  {
    id: "kids_animals_cat",
    deckId: "kids_animals",
    deckName: "Kids · Animals",
    imagePath: "kids/animals/cat.webp",
    hanzi: "猫",
    pinyin: "māo",
    pinyinNumeric: "mao1",
    translation: "cat",
    alt: "A simple cat illustration",
    tags: ["kids", "animals"]
  }
];
```

The matching file path is:

```text
images/flashcards/kids/animals/cat.webp
```

## Image learning behavior

- Learn mode shows image + answer.
- Learn seen state syncs through append-only events with kind `image_learn_seen`.
- Gentle FSRS mode shows image first, then answer, then a rating.
- Image FSRS events use kind `image_smart_fsrs`.
- Image FSRS uses the same FSRS library but applies a spacing factor of `0.55`, reducing future intervals for a child-friendly review cadence.
- `Again` sends the image card to the end of the current image session queue.

## Supabase impact

Existing tables are reused:

- `app_sync_documents`
- `app_review_events`

No image bytes go to Supabase. Image cards add only small event rows.

Recommended v35 SQL addition:

```sql
create index if not exists app_review_events_user_image_deck_idx
  on public.app_review_events (user_id, set_id, occurred_at asc, created_at asc)
  where kind = 'image_smart_fsrs';
```

This index does not modify progress data.

## Test mode removal

The visible Test tab, setup range row, and Test progress bar were removed. Old test progress events in Supabase are ignored by the current UI but are not deleted.

## Compatibility

- Existing HSK text cards keep their current behavior.
- Existing text FSRS events continue to replay through `smart_fsrs`.
- Existing progress is not reset by installing v35.
- The image extension is empty until image cards are added to the manifest.
