# HSK Flashcards Simple v38

Changes from v37:

- Removed pasted vocabulary import from Setup.
- Removed the user-facing Restore built-in vocabulary control.
- Built-in HSK vocabulary is now the only vocabulary source for every user.
- Existing remote custom vocabulary documents are ignored on load.
- The store keeps defensive no-op paths so older UI/code paths cannot replace the built-in vocabulary.
- No Supabase SQL helper files are included in this package.

Existing retained behavior:

- Users can still control built-in vocabulary visibility through Card setup Learn / Practice flags.
- Smart FSRS progress remains in `app_review_events`.
- Setup/config flags remain in `app_sync_documents`.
- Sentence decks and image deck scaffolding remain separate from vocabulary.
