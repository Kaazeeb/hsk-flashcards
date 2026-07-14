# HSK 1 sentence portfolio

Status: **PASS**.

## Portfolio

| Metric | Count |
| --- | ---: |
| Original legacy HSK 1 bindings | 440 |
| Current active HSK 1 cards | 310 |
| Distinct active sentences | 310 |
| Reduction | 130 (29.5%) |
| Inactive original legacy tombstones | 214 |
| Inactive curated tombstones | 0 |

## Sources

| Source | Active | Inactive |
| --- | ---: | ---: |
| `grammar-study-editorial` | 70 | 0 |
| `hsk1-sentence-portfolio-editorial` | 14 | 0 |
| `legacy-runtime` | 226 | 214 |

## Directions

| Direction | Active cards |
| --- | ---: |
| Chinese to English | 225 |
| English to Chinese | 80 |
| Chinese question and answer | 5 |

## Vocabulary

Coverage counts distinct active sentence contexts with an exact stable HSK 1 `vocab_id` relation. Duplicate active bindings for one sentence fail validation instead of inflating coverage.

| Metric | Count |
| --- | ---: |
| At least one context | 300/300 |
| At least two contexts | 300/300 |
| At least three contexts | 171/300 |
| Exact HSK 1 target/card incidences | 1490 |
| Exact HSK 1 targets per active card | 4.81 |
| Total deficit to two contexts | 0 |
| Total deficit to three contexts | 129 |
| Total surplus above three contexts | 719 |

The three-card target is best-effort: sentence quality and sense accuracy take precedence over mechanically packed examples.

### Exact coverage histogram

| Exact active contexts | Vocabulary senses |
| ---: | ---: |
| 2 | 129 |
| 3 | 62 |
| 4 | 28 |
| 5 | 16 |
| 6 | 21 |
| 7 | 6 |
| 8 | 4 |
| 9 | 7 |
| 10 | 3 |
| 11 | 1 |
| 12 | 1 |
| 13 | 1 |
| 14 | 3 |
| 15 | 1 |
| 16 | 3 |
| 17 | 2 |
| 19 | 1 |
| 20 | 1 |
| 23 | 3 |
| 24 | 2 |
| 25 | 1 |
| 28 | 1 |
| 36 | 1 |
| 37 | 1 |
| 104 | 1 |

### HSK 1 targets per card

| Exact HSK 1 targets | Active cards |
| ---: | ---: |
| 2 | 7 |
| 3 | 31 |
| 4 | 101 |
| 5 | 97 |
| 6 | 46 |
| 7 | 17 |
| 8 | 4 |
| 9 | 3 |
| 10 | 4 |

### Editorial status

| Unit | Approved | Legacy unreviewed | Other |
| --- | ---: | ---: | ---: |
| Active cards | 84 | 226 | 0 |
| Distinct exact HSK 1 contexts | 420 | 1070 | 0 |

Card status requires both sentence curation and linguistic review to match; context status comes from the exact vocabulary relation review.

Mechanical coverage does not promote retained legacy content to editorially approved status. Full per-vocabulary detail is in `hsk1-sentence-portfolio.csv`.

## Grammar

Approved exact active coverage: **70/70** official HSK 1 grammar points.

## Validation

- Active card ceiling (310): yes (310).
- Distinct active sentence IDs: yes (0 duplicated IDs).
- Unique active Chinese text: yes.
- Active open sentence issues: 0 across 0 sentences.
- Missing HSK 1 vocabulary senses: 0.
- Historical bindings remain in the product table with their original card IDs and order; removed cards are inactive tombstones.
- Mechanical coverage does not promote retained legacy content to editorially approved status.
