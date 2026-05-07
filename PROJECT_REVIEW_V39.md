# Project Review V39

## Sentence deck rebuild

V39 replaces the hardcoded sentence deck with 600 sentence cards:

- HSK 1: 200 cards
- HSK 2: 200 cards
- HSK 3: 200 cards

Card types:

- Chinese -> English: 180 total
- English -> Chinese: 180 total
- Chinese question -> Chinese answer: 240 total

The sentence deck remains separate from the vocabulary deck. Sentence cards still use the flip + manual FSRS rating flow.

## Vocabulary control

The sentence text was validated against the app's built-in HSK 1-3 vocabulary boundaries:

- HSK 1 cards use only the first 300 built-in vocabulary items.
- HSK 2 cards use only the first 500 built-in vocabulary items.
- HSK 3 cards use only the full 1000 built-in vocabulary items.

Chinese question-answer cards show hanzi only on both sides.

## Code changes

- Added support for sentence direction `zh_qa`.
- Updated labels to display `Chinese question -> Chinese answer`.
- Kept vocabulary, image, setup, auth, and review event storage behavior unchanged.

## Validation

- node --check passed for all JavaScript files.
- Built-in vocabulary count: 1000.
- Sentence card count: 600.
- Sentence card counts by level: 200 / 200 / 200.
- Sentence card counts by direction: 180 zh_to_en, 180 en_to_zh, 240 zh_qa.
- All Chinese sentence fronts/backs passed dictionary segmentation against the allowed HSK vocabulary for their level.
