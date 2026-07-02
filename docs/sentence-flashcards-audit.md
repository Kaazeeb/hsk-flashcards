# Sentence Flashcards Audit

## Metadata

| Field | Value |
| --- | --- |
| Document | Sentence flashcards audit |
| Current revision | 2026-07-01 |
| Revision author | OpenAI GPT-5.5 coding agent |
| Data location | `js/data/flashcards/` |
| Analysis command | `python3 scripts/analyze_flashcards.py --report sentence-frequency --low-frequency-threshold 2 --format json` |
| Vocabulary level convention | Cards 1–300 = HSK 1; cards 301–500 = HSK 2; cards 501–1000 = HSK 3 |

## Revision history

| Date | Revision | Summary |
| --- | --- | --- |
| 2026-06-29 | Initial audit | Added inventory, sentence coverage/frequency findings, inferred HSK-level coverage, quality risks, and recommended improvements after consolidating flashcard data files. |
| 2026-06-29 | Frequency audit revision | Added longest-match vocabulary segmentation so sentence coverage is cross-checked against actual Chinese sentence text instead of relying only on `vocabTags`. |
| 2026-07-01 | Sentence coverage update | Rebuilt the sentence expansion without quoted-vocabulary fallback frames, reduced the generated sentence count, and raised every vocabulary item in cards 1–1000 to at least 3 same-level sentence appearances under the updated coverage metric. |

## Scope

This audit covers the built-in vocabulary and sentence flashcards loaded from `js/data/flashcards/`.

Vocabulary cards do not store an explicit `level` field, so this report uses the project ordering convention supplied for the audit: vocabulary cards 1–300 are inferred as HSK 1, cards 301–500 are inferred as HSK 2, and cards 501–1000 are inferred as HSK 3.

## Inventory after update

| Card family | Count | Notes |
| --- | ---: | --- |
| Vocabulary | 1,000 | Inferred as 300 HSK 1 cards, 200 HSK 2 cards, and 500 HSK 3 cards by card order. |
| Sentence cards | 1,562 | Split into `sentence-cards-data-part-1.js` through `sentence-cards-data-part-7.js`. |
| Hanzi study cards | 655 | Static hanzi metadata cards. |
| Measure-word cards | 268 | Static measure-word metadata cards. |
| Image cards | 0 | Catalog scaffold is empty. |

Sentence/study content now totals 3,047 cards: 1,562 sentence cards, 655 hanzi-to-pinyin cards, 655 stroke-sequence cards, and 268 measure-word cards.

## Coverage metric

The report uses three related signals:

1. explicit `vocabTags` stored on each sentence card;
2. longest-match segmentation over the Chinese sentence text using the 1,000-card vocabulary list;
3. component-surface coverage for entries that are unnatural or misleading when forced to appear alone: `们`, `子`, `室`, `园`, and `员`.

The third signal is deliberate. These items are best practiced in natural surface forms such as `我们`, `他们`, `桌子`, `孩子`, `教室`, `办公室`, `公园`, `花园`, and `运动员`. The previous fallback approach could force items into frames such as “read/write/review this word: X”; this update removes that pattern and counts these component/suffix entries only when they occur inside natural learner-level words.

## Before/after same-level coverage

The target is at least 3 same-level sentence appearances for every vocabulary card in its own inferred level.

| Level | Vocab cards | Original cards below 3 | Original deficit to reach 3 | Updated cards below 3 | Updated minimum | Updated average |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| HSK 1 | 300 | 184 | 415 | 0 | 3 | 7.31 |
| HSK 2 | 200 | 142 | 304 | 0 | 3 | 4.15 |
| HSK 3 | 500 | 434 | 1,040 | 0 | 3 | 3.99 |

The current `low_same_level_coverage_frequency_cards` list is empty, meaning no vocabulary card is below the threshold under the updated same-level coverage metric.

## Content changes

- Patched original sentences that used out-of-level or out-of-vocabulary items such as standalone `没`, `杯`, `瓶`, `张`, `棋`, `度`, `答案`, `矮`, `放`, `先`, and `辆` in levels where those words were not yet available.
- Recomputed `vocabTags` from the Chinese sentence text plus the explicit component-surface coverage list.
- Added a natural seed bank and a curated dense coverage bank. Dense cards intentionally combine multiple target words in one sentence where possible, reducing the number of generated cards compared with the first expansion pass.
- Removed quoted-vocabulary fallback cards and avoided patterns such as `请写“X”。`, `请读这个词：“X”。`, and `请复习这个词：“X”。`.
- Replaced character-label examples such as “the character 子 is common” with ordinary usage, for example `运动员在公园里跑步很常见。` and `这种事很常见。`.

## Remaining review notes

This update is script-validated for coverage, level alignment, unknown Chinese characters, and syntax. It is not a full expert linguistic review of all 1,562 sentences. A future human pass should still review style, translation nuance, and whether a smaller number of especially dense HSK3 cards can preserve the same coverage without making sentences too overloaded.

The main remaining edge cases are homographs and component/suffix vocabulary entries. For normal free words, strict longest-match same-level segmentation reaches the target. For `们`, `子`, `室`, `园`, and `员`, the validated target uses component-surface coverage because natural usage is usually embedded in larger words.

## Reproduction

Regenerate the sentence expansion:

```bash
python3 scripts/augment_sentence_flashcards.py
```

Run the coverage audit:

```bash
python3 scripts/analyze_flashcards.py --report sentence-frequency --low-frequency-threshold 2 --format json > tests/reports/sentence_frequency_report_after.json
```
