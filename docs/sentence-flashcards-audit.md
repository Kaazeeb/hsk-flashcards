# Sentence Flashcards Audit

## Metadata

| Field | Value |
| --- | --- |
| Document | Sentence flashcards audit |
| Current revision | 2026-07-14 |
| Revision author | OpenAI coding agent |
| Canonical data | `language/data/catalog/` and `language/data/product_bindings/sentence_cards.csv` |
| Focused reports | `language/reports/hsk1-sentence-portfolio.md` through `hsk3-sentence-portfolio.md` |
| Report command | `python3 language/scripts/write_hsk3_sentence_portfolio_report.py --level LEVEL` |

## Revision history

| Date | Revision | Summary |
| --- | --- | --- |
| 2026-06-29 | Initial audit | Added inventory, frequency, inferred level coverage, quality risks, and recommendations. |
| 2026-07-01 | Sentence expansion | Removed quoted-word fallback frames and expanded same-level surface coverage. |
| 2026-07-14 | HSK 3 portfolio review | Reduced the active HSK 3 deck, added approved replacements and grammar examples, and measured stable vocabulary-sense coverage. |
| 2026-07-14 | HSK 1-2 portfolio review | Reduced the active HSK 1 and HSK 2 decks, added independently reviewed editorial and grammar examples, and balanced exact vocabulary-sense coverage. |

## Current inventory

| Card family | Active count | Notes |
| --- | ---: | --- |
| Vocabulary | 1,000 | 300 HSK 1, 200 HSK 2, and 500 HSK 3 cards. |
| Sentence cards | 1,092 | 310 HSK 1, 232 HSK 2, and 550 HSK 3 cards. |
| Hanzi study cards | 655 | Each record generates a pinyin and a stroke-sequence study card. |
| Measure-word cards | 268 | Generated classifier study cards. |
| Image cards | 0 | Catalog scaffold only. |

Sentence/study content totals 2,670 cards: 1,092 sentence cards and 1,578 generated study cards. The runtime sentence data is split across five generated chunks.

## HSK 1 and HSK 2 portfolios

The active HSK 1 deck was reduced from 440 to 310 cards, and the HSK 2 deck from 378 to 232 cards. The HSK 2 selection deliberately keeps three more cards than the smallest feasible relaxation because the 229-card alternative reintroduced seven weak historical cards.

| Level | Historical | Grammar examples | Editorial | Chinese to English | English to Chinese | Q&A | Vocabulary with 2+ contexts | Vocabulary with 3+ contexts |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| HSK 1 | 226 | 70 | 14 | 225 | 80 | 5 | 300/300 | 171/300 |
| HSK 2 | 129 | 78 | 25 | 174 | 56 | 2 | 200/200 | 58/200 |

All 70 official HSK 1 grammar points and all 78 official HSK 2 grammar points have an approved exact mapping in their active portfolios. The 214 unselected HSK 1 historical bindings and 249 unselected HSK 2 historical bindings remain inactive tombstones with frozen card IDs, runtime order, and deck order.

## HSK 3 portfolio

The active HSK 3 deck was reduced from 744 to 550 cards, a reduction of 194 cards or 26.1%.

| Source | Active cards |
| --- | ---: |
| Retained historical cards | 383 |
| Approved Grammar Study examples | 96 |
| Approved editorial sentences | 71 |

The direction mix follows the requested learning priority:

| Direction | Active cards |
| --- | ---: |
| Chinese to English | 387 |
| English to Chinese | 146 |
| Chinese question and answer | 17 |

All 744 historical HSK 3 bindings remain in the product table. The 361 historical cards not selected for the active deck are inactive tombstones with frozen card IDs, runtime order, and deck order. Nineteen superseded curated bindings are also retained as inactive history. New cards are appended after the historical visibility range, preventing existing compact visibility bits from shifting.

## Coverage metric

The primary portfolio metric counts distinct active cards with an exact `sentence_vocabulary.csv` relation to a stable `vocab_id` in the selected HSK level. This distinguishes numbered homographs and different readings that surface matching cannot resolve.

| Target | HSK 3 senses covered |
| --- | ---: |
| At least one active card | 500/500 |
| At least two active cards | 500/500 |
| At least three active cards | 257/500 |

Each selection establishes two distinct exact contexts for every vocabulary sense before allocating third contexts. The three-card goal remains best-effort: a sentence was not retained or created solely to raise a count when doing so produced mechanical packing, weak reference, semantic contradiction, or an unreliable homograph assignment. Each detailed CSV lists counts and active card IDs for every sense in that level.

Surface/component coverage remains available in the general catalog audit for suffix-like entries such as 室, 园, 员, and 子, but it is reported separately and is not used to claim exact sense coverage.

## Grammar coverage

The active decks contain approved exact mappings for all 70 HSK 1, 78 HSK 2, and 96 HSK 3 official grammar points. One approved Grammar Study example per point was selected as the guaranteed baseline; some cards naturally demonstrate additional approved points.

## Editorial changes

- Added 71 natural HSK 1-3-level editorial sentences: 35 initial replacements plus 36 balanced contexts for scarce senses and more efficient vocabulary pairing. The relations include explicit stable-ID distinctions for 得, 地, 过去, 还, 会, 站, 长, and 只.
- Added 14 HSK 1 and 25 HSK 2 natural editorial sentences after independent proposal and cross-review passes, concentrating new contexts on scarce senses while combining compatible vocabulary without forced phrasing.
- Removed all selected HSK 1 and HSK 2 hard rejects, weak fallback cards, and registered open issues from the active product projection.
- Removed all 76 cards on the expanded linguistic hard-reject list from the active product projection.
- Replaced weak fallback contexts for 季, 名单, 男人, 女人, and 有关 with four independently reviewed sentences rather than reactivating mechanically combined legacy cards.
- Kept all registered HSK 3 sentence issues inactive, including the contradictory, awkward, incomplete, and misleading-email examples.
- Preserved retained legacy rows as `legacy_unreviewed`; selection for product use does not falsely promote them to approved editorial content.
- Recorded new sentence, utterance, pinyin, translation, vocabulary, grammar, source, and append-only review evidence in the canonical catalog.

## Validation

The canonical audit passes with zero structural errors, and the compiler reports semantic equality between the catalog and generated runtime. Mechanical checks validate schema, references, cumulative HSK level, vocabulary occurrence order, approval hashes, immutable bindings, grammar coverage, and runtime compatibility.

These checks do not prove that every retained legacy sentence is stylistically ideal. The focused agent review removed concrete high-risk cases and replaced weak coverage bottlenecks, while the remaining historical content keeps its explicit review backlog status.

## Reproduction

```bash
python3 language/scripts/write_hsk3_sentence_portfolio_report.py --level 1 --maximum-active 310
python3 language/scripts/write_hsk3_sentence_portfolio_report.py --level 2 --maximum-active 232
python3 language/scripts/write_hsk3_sentence_portfolio_report.py --level 3 --maximum-active 550
python3 language/scripts/audit_catalog.py --write-reports
python3 language/scripts/compile_runtime_catalog.py --validate
python3 language/scripts/compile_runtime_catalog.py --check-runtime
```
