# hsk_flashcards_simple_v33

## Scope

Version v33 consolidates the strict pinyin validation and remote-only app-data persistence changes.

## Pinyin validation

- Cards now include hardcoded `pinyinNumeric` answers.
- The app no longer derives numeric pinyin from accented pinyin at runtime for built-in cards.
- Validation is direct and strict:
  - no uppercase;
  - no spaces;
  - no tone `5`;
  - neutral tone has no number;
  - `ü` is represented as `v` in `pinyinNumeric`;
  - erhua tone appears after `r`, for example `nar3`.
- Example: `可能` uses `pinyin: "kěnéng"` and `pinyinNumeric: "ke3neng2"`.

## App-data persistence

- Business/app state localStorage caching has been removed.
- Failed remote app-data writes are not queued for replay.
- If Supabase is unavailable, changes may exist only in memory for that page session and can be discarded.
- Supabase Auth session persistence is kept enabled, so users can remain logged in across reloads. This auth persistence is intentionally separate from app/business-data caching.

## Review events

- Review event IDs were shortened; they no longer embed full card text.
- Review events remain append-only.
- The active review epoch is used to filter current events.
- The included SQL adds an expression index for filtering by `payload->>'epochId'`.

## File organization

- JavaScript files remain under the soft 1500-line standard.
- Built-in vocabulary data is split across five `js/data/hsk1-data-part-*.js` files.
