# Sentence Flashcards Audit

## Metadata

| Field | Value |
| --- | --- |
| Document | Sentence flashcards audit |
| Current revision | 2026-06-29 |
| Revision author | OpenAI GPT-5.5 coding agent |
| Data location | `js/data/flashcards/` |
| Analysis command | `python3 scripts/analyze_flashcards.py --report all --low-frequency-threshold 1 --format json` |
| Vocabulary level convention | Cards 1–300 = HSK 1; cards 301–500 = HSK 2; cards 501–1000 = HSK 3 |

## Revision History

| Date | Revision | Summary |
| --- | --- | --- |
| 2026-06-29 | Initial audit | Added inventory, sentence coverage/frequency findings, inferred HSK-level coverage, quality risks, and recommended improvements after consolidating flashcard data files. |
| 2026-06-29 | Frequency audit revision | Added longest-match vocabulary segmentation so sentence coverage is cross-checked against actual Chinese sentence text instead of relying only on `vocabTags`. |

## Scope

This audit covers the built-in vocabulary and sentence flashcards loaded from `js/data/flashcards/` after consolidating all JavaScript flashcard data files into that directory.

Vocabulary cards do not store an explicit `level` field, so this report uses the project ordering convention supplied for the audit: vocabulary cards 1–300 are inferred as HSK 1, cards 301–500 are inferred as HSK 2, and cards 501–1000 are inferred as HSK 3.

## Inventory

| Card family | Count | Notes |
| --- | ---: | --- |
| Vocabulary | 1,000 | Inferred as 300 HSK 1 cards, 200 HSK 2 cards, and 500 HSK 3 cards by card order. |
| Sentence cards | 600 | 200 cards each for levels 1, 2, and 3. |
| Hanzi study cards | 655 | Static hanzi metadata cards. |
| Measure-word cards | 268 | Static measure-word metadata cards. |
| Image cards | 0 | Catalog scaffold is empty. |

Sentence-card direction balance is good: 210 Chinese-to-English cards, 210 English-to-Chinese cards, and 180 Chinese Q&A cards. Each sentence level has the same distribution: 70 Chinese-to-English, 70 English-to-Chinese, and 60 Chinese Q&A cards.

## Coverage and Frequency Findings

- All 600 sentence `vocabTags` match a vocabulary-card `hanzi` value. This means the sentence cards do not tag unknown vocabulary.
- The audit now cross-checks two coverage signals: explicit `vocabTags` and a longest-match vocabulary segmentation pass over each sentence's Chinese text. The segmentation pass builds a dictionary from vocabulary-card `hanzi` values, walks each sentence from left to right, and records the longest vocabulary word found at each character offset.
- Tag-based vocabulary coverage is incomplete: 288 of 1,000 vocabulary cards have zero tagged sentence cards, and another 178 have only one tagged sentence card.
- Segmented-text coverage is even weaker: 350 of 1,000 vocabulary cards have zero segmented sentence appearances, and another 194 have only one segmented sentence appearance.
- Tag-based counts show 534 vocabulary cards in two or more sentence cards and 383 in three or more sentence cards; segmented-text counts show 456 vocabulary cards in two or more sentence cards and 304 in three or more sentence cards.
- The median tag-based sentence count is 2, while the median segmented sentence count is 1. The difference confirms that tags sometimes overstate actual word-level sentence coverage.
- Frequency is highly skewed. Common function words and high-utility words appear very often, while many content words have no sentence support.

### Inferred level coverage

| Inferred level | Vocabulary cards | Zero tagged | Zero segmented | One segmented | Two or more segmented | Three or more segmented | Avg segmented sentence count |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| HSK 1 | 300 | 39 | 52 | 46 | 202 | 161 | 8.85 |
| HSK 2 | 200 | 33 | 50 | 41 | 109 | 79 | 2.32 |
| HSK 3 | 500 | 216 | 248 | 107 | 145 | 64 | 1.22 |

Answer to “Are all the flashcards of the level covered?”: no. Using the inferred levels, every sentence-card level has exactly 200 cards, but vocabulary coverage is uneven. HSK 1 has the strongest sentence support, HSK 2 is partially covered, and HSK 3 is under-covered. The segmentation cross-check finds 248 inferred HSK 3 vocabulary cards with no actual word-level sentence appearance, and only 64 of 500 inferred HSK 3 cards appear in at least three segmented sentence cards.

Examples of zero-segmented inferred HSK 1 vocabulary cards include `白天`, `百`, `不客气`, `大家`, `第`, `儿子`, `非常`, `好听`, `好玩儿`, `饺子`, `零`, and `哪个`.

Examples of zero-segmented inferred HSK 2 vocabulary cards include `啊`, `不好意思`, `出去`, `高中`, `个子`, `过年`, `后面`, `花`, `记得`, `开学`, and `里面`.

Examples of zero-segmented inferred HSK 3 vocabulary cards include `爱人`, `安全`, `搬家`, `半天`, `饱`, `报纸`, `比如`, `必须`, `遍`, `变成`, `表演`, and `别的`.

## Correctness and Quality Findings

The sentence set is generally usable and well structured:

- Cards have clear `front`, `back`, `chinese`, and `english` fields.
- Directions are intentionally varied, which supports both recognition and production practice.
- Q&A cards model positive and negative answers, which is pedagogically useful.
- Grammar tags cover important beginner and lower-intermediate patterns such as `吗 question`, `把`, `比 comparison`, `得 complement`, `了/没`, `在 + place`, `一边...一边`, and `不但...而且`.
- The sampled sentences are mostly natural, concise, and suitable for learner flashcards.

Issues and risks:

- Some grammar tags are inaccurate or too broad. For example, `我从小喜欢画。` is tagged with `verb reduplication`, but the sentence does not contain reduplication.
- Many `vocabTags` include component characters as well as full words, such as tagging both `学生` and `学`, or both `信用卡` and `信`/`用`/`卡`. The segmentation cross-check reduces this overcounting by preferring longer vocabulary words when the sentence text supports them.
- The current audit checks tagged coverage and static consistency, but it does not perform a complete expert linguistic review of every Chinese sentence and English translation. A human Chinese-language review is still recommended before treating the set as publication-quality.
- Vocabulary ambiguity is present by design in some cases, but the app/reporting should distinguish homographs and different parts of speech more clearly. Ambiguous entries include `只`, `地`, `得`, `过`, `还`, `长`, `会`, `点`, `站`, `花`, and `过去`.
- Image cards are referenced by the app, but the image-card catalog is empty.

## Necessary Improvements

1. Persist the inferred level as explicit `level` metadata on vocabulary cards so future reports do not depend on card ordering.
2. Add sentence cards for zero-segmented vocabulary entries, prioritizing inferred HSK 3 first because it has the largest gap, then the zero-segmented HSK 1/2 high-utility words such as `不客气`, `大家`, `非常`, `哪里`, `呢`, `你好`, `您`, `同学`, and `五`.
3. Raise the target minimum frequency to at least three segmented sentence appearances per vocabulary entry, with mixed recognition, production, and Q&A contexts. This requires the most work for inferred HSK 3, where only 64 of 500 vocabulary cards currently meet that target by segmented sentence count.
4. Separate word-level tags from character/component tags, for example with fields such as `vocabTags` and `componentTags`, so coverage reports do not overcount incidental character appearances.
5. Review grammar tags for each sentence and remove tags that are not actually exemplified by the sentence.
6. Add stable IDs or sense IDs for ambiguous vocabulary entries so sentence tags can point to the intended meaning and pronunciation.
7. Run a human linguistic review focused on naturalness, translation fidelity, learner level, and whether each sentence teaches the intended vocabulary item.
8. Add image-card entries or remove/update image-card placeholder copy if image cards are not planned.

## Reproduction

Run:

```bash
python3 scripts/analyze_flashcards.py --report all --low-frequency-threshold 1 --format json
```
