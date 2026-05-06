# Project Review V36

Base version: v35.

Important preserved local divergence:

```js
const instance = FSRS_API.fsrs({
  enable_fuzz: true,
  request_retention: 0.95
});
```

## Sentence decks

V36 adds a hardcoded sentence deck system separate from the vocabulary deck.

File:

```text
js/sentence-cards-data.js
```

The built-in sentence source contains:

- 100 base HSK 1 sentences
- 100 base HSK 2 sentences
- 100 base HSK 3 sentences

Each base sentence creates two cards:

- Chinese → English
- English → Chinese

Total sentence cards: 600.

Sentence cards are not part of `db.vocab` and are not editable through the vocabulary/set editor. They appear as separate Smart review sources:

- All sentence cards
- HSK 1 sentences
- HSK 2 sentences
- HSK 3 sentences

## Smart FSRS behavior

Vocabulary cards keep the existing Smart flow:

```text
hanzi → type exact numeric pinyin → choose translation → FSRS rating
```

Sentence cards use a simpler flow:

```text
front side → Show answer → manual FSRS rating
```

There is no pinyin input, no translation multiple choice, and no typed answer for sentence cards.

Chinese sentence sides show only hanzi, not pinyin.

## Sync / Supabase

No new table is required.

Sentence review events use the existing append-only table:

```text
app_review_events
```

New event kind:

```text
sentence_smart_fsrs
```

Recommended index added to `supabase_starter.sql`:

```sql
create index if not exists app_review_events_user_sentence_deck_idx
  on public.app_review_events (user_id, set_id, occurred_at asc, created_at asc)
  where kind = 'sentence_smart_fsrs';
```

This index does not change or delete existing progress.
