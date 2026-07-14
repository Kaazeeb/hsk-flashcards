# HSK 3 sentence portfolio

Status: **PASS**.

## Portfolio

| Metric | Count |
| --- | ---: |
| Original legacy HSK 3 bindings | 744 |
| Current active HSK 3 cards | 550 |
| Distinct active sentences | 550 |
| Reduction | 194 (26.1%) |
| Inactive original legacy tombstones | 361 |
| Inactive curated tombstones | 19 |

## Sources

| Source | Active | Inactive |
| --- | ---: | ---: |
| `grammar-study-editorial` | 96 | 19 |
| `hsk3-sentence-portfolio-editorial` | 71 | 0 |
| `legacy-runtime` | 383 | 361 |

## Directions

| Direction | Active cards |
| --- | ---: |
| Chinese to English | 387 |
| English to Chinese | 146 |
| Chinese question and answer | 17 |

## Vocabulary

Coverage counts distinct active sentence contexts with an exact stable HSK 3 `vocab_id` relation. Duplicate active bindings for one sentence fail validation instead of inflating coverage.

| Metric | Count |
| --- | ---: |
| At least one context | 500/500 |
| At least two contexts | 500/500 |
| At least three contexts | 257/500 |
| Exact HSK 3 target/card incidences | 1373 |
| Exact HSK 3 targets per active card | 2.50 |
| Total deficit to two contexts | 0 |
| Total deficit to three contexts | 243 |
| Total surplus above three contexts | 116 |

The three-card target is best-effort: sentence quality and sense accuracy take precedence over mechanically packed examples.

### Exact coverage histogram

| Exact active contexts | Vocabulary senses |
| ---: | ---: |
| 2 | 243 |
| 3 | 227 |
| 4 | 18 |
| 5 | 4 |
| 6 | 2 |
| 7 | 1 |
| 8 | 1 |
| 9 | 1 |
| 24 | 1 |
| 25 | 1 |
| 29 | 1 |

### HSK 3 targets per card

| Exact HSK 3 targets | Active cards |
| ---: | ---: |
| 0 | 22 |
| 1 | 68 |
| 2 | 199 |
| 3 | 167 |
| 4 | 69 |
| 5 | 20 |
| 6 | 5 |

### Editorial status

| Unit | Approved | Legacy unreviewed | Other |
| --- | ---: | ---: | ---: |
| Active cards | 167 | 383 | 0 |
| Distinct exact HSK 3 contexts | 322 | 1051 | 0 |

Card status requires both sentence curation and linguistic review to match; context status comes from the exact vocabulary relation review.

Mechanical coverage does not promote retained legacy content to editorially approved status. Full per-vocabulary detail is in `hsk3-sentence-portfolio.csv`.

## Grammar

Approved exact active coverage: **96/96** official HSK 3 grammar points.

## Validation

- Active card ceiling (550): yes (550).
- Distinct active sentence IDs: yes (0 duplicated IDs).
- Unique active Chinese text: yes.
- Active open sentence issues: 0 across 0 sentences.
- Missing HSK 3 vocabulary senses: 0.
- Historical bindings remain in the product table with their original card IDs and order; removed cards are inactive tombstones.
- Mechanical coverage does not promote retained legacy content to editorially approved status.
