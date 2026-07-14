# HSK 2 sentence portfolio

Status: **PASS**.

## Portfolio

| Metric | Count |
| --- | ---: |
| Original legacy HSK 2 bindings | 378 |
| Current active HSK 2 cards | 232 |
| Distinct active sentences | 232 |
| Reduction | 146 (38.6%) |
| Inactive original legacy tombstones | 249 |
| Inactive curated tombstones | 0 |

## Sources

| Source | Active | Inactive |
| --- | ---: | ---: |
| `grammar-study-editorial` | 78 | 0 |
| `hsk2-sentence-portfolio-editorial` | 25 | 0 |
| `legacy-runtime` | 129 | 249 |

## Directions

| Direction | Active cards |
| --- | ---: |
| Chinese to English | 174 |
| English to Chinese | 56 |
| Chinese question and answer | 2 |

## Vocabulary

Coverage counts distinct active sentence contexts with an exact stable HSK 2 `vocab_id` relation. Duplicate active bindings for one sentence fail validation instead of inflating coverage.

| Metric | Count |
| --- | ---: |
| At least one context | 200/200 |
| At least two contexts | 200/200 |
| At least three contexts | 58/200 |
| Exact HSK 2 target/card incidences | 535 |
| Exact HSK 2 targets per active card | 2.31 |
| Total deficit to two contexts | 0 |
| Total deficit to three contexts | 142 |
| Total surplus above three contexts | 77 |

The three-card target is best-effort: sentence quality and sense accuracy take precedence over mechanically packed examples.

### Exact coverage histogram

| Exact active contexts | Vocabulary senses |
| ---: | ---: |
| 2 | 142 |
| 3 | 30 |
| 4 | 11 |
| 5 | 4 |
| 6 | 2 |
| 7 | 7 |
| 8 | 3 |
| 12 | 1 |

### HSK 2 targets per card

| Exact HSK 2 targets | Active cards |
| ---: | ---: |
| 0 | 5 |
| 1 | 54 |
| 2 | 88 |
| 3 | 47 |
| 4 | 28 |
| 5 | 8 |
| 6 | 2 |

### Editorial status

| Unit | Approved | Legacy unreviewed | Other |
| --- | ---: | ---: | ---: |
| Active cards | 103 | 129 | 0 |
| Distinct exact HSK 2 contexts | 217 | 318 | 0 |

Card status requires both sentence curation and linguistic review to match; context status comes from the exact vocabulary relation review.

Mechanical coverage does not promote retained legacy content to editorially approved status. Full per-vocabulary detail is in `hsk2-sentence-portfolio.csv`.

## Grammar

Approved exact active coverage: **78/78** official HSK 2 grammar points.

## Validation

- Active card ceiling (232): yes (232).
- Distinct active sentence IDs: yes (0 duplicated IDs).
- Unique active Chinese text: yes.
- Active open sentence issues: 0 across 0 sentences.
- Missing HSK 2 vocabulary senses: 0.
- Historical bindings remain in the product table with their original card IDs and order; removed cards are inactive tombstones.
- Mechanical coverage does not promote retained legacy content to editorially approved status.
