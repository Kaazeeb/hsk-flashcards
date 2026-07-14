# Grammar Study implementation

Release: 2.5.0

## Architecture

Grammar Study is a signed-in, read-only page in the existing static application shell. `js/main-grammar-page.js` owns transient level, category, search, disclosure, loading, and retry state. It loads one generated same-origin JavaScript chunk for the selected level, validates the complete payload, caches successful loads and in-flight requests, and renders with safe DOM APIs. Runtime schema 2 carries an `appliesToZh` inventory for every pattern and explanatory note so learners can see exactly which Chinese forms a rule covers.

The browser does not read catalog CSV files. Linguistic source data remains under `language/data/catalog/`, page activation and order remain in `language/data/product_bindings/grammar_page_lessons.csv`, and `language/scripts/compile_runtime_catalog.py` generates the three lazy runtime chunks. The grammar review did not activate new sentence cards or change sentence-card bindings.

## Coverage

| Introduced level | Official rows | Lessons | Examples | Questions | Negative forms | Lessons with fewer than 3 examples |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| HSK 1 | 70/70 | 70 | 170 | 27 | 17 | 43 |
| HSK 2 | 78/78 | 78 | 221 | 25 | 25 | 42 |
| HSK 3 | 96/96 | 96 | 250 | 26 | 40 | 58 |
| **Total** | **244/244** | **244** | **641** | **78** | **82** | **143** |

The approved decomposition contains 547 grammar elements:

| Element kind | Count |
| --- | ---: |
| `category` | 18 |
| `construction` | 177 |
| `expression_system` | 2 |
| `function` | 112 |
| `inventory_member` | 228 |
| `morphology` | 10 |

All 244 grammar points, 244 lessons, 547 elements, 641 examples, 659 example-to-point analyses, 749 literal targets, and their published relations have current approval evidence. The active feature has no open editorial issue. The catalog audit still reports 8 legacy review warnings and 11 unrelated pre-existing issues; neither backlog is used by Grammar Study.

The 70 added examples and 30 lesson revisions received an independent port review. The review corrected two pedagogically weak examples, one inaccurate example analysis, and four watch-outs that treated context-dependent strings as universally ungrammatical. Seven proposed in-place rewrites of already-published HSK 3 sentences were not imported because they would have changed existing grammar entities, two active sentence cards, or an inactive historical tombstone under frozen IDs.

Question counts use Chinese question punctuation. Negative counts require an exact negative-marker vocabulary relation, plus the authorized point-scoped `不必` exception; lexicalized forms such as `不但`, `不一会儿`, `别的`, `特别`, and `差不多` do not inflate the metric.

## Editorial decisions

Two exact vocabulary exceptions are authorized:

- `hsk26-g1-013` permits `杯` only at HSK 1 when it is the `classifier` target for the approved lesson example. There is no standalone in-level vocabulary sense and no vocabulary relation is emitted.
- `hsk26-g3-023` permits `不必` only at HSK 3 when it is the `negative_modal` target for the approved lesson example. The standalone word is introduced at HSK 4 and no HSK 3 vocabulary relation is emitted.

These policies are point, level, surface-form, and target-role scoped. They do not create a general route around vocabulary review.

Known source anomalies and grouping decisions are recorded in `language/reference/GRAMMAR_STUDY_EDITORIAL.md`. In particular, the concatenated source form `句公斤` is represented as the reviewed members `句` and `公斤`; the inherited hierarchy for `hsk26-g2-034` is preserved as source metadata while learner grouping is an approved override; and the literal `所处 + 是 + 名词` source wording remains normative metadata rather than being silently rewritten.

## Runtime output

| Chunk | Source bytes | `gzip -9` artifact bytes |
| --- | ---: | ---: |
| HSK 1 | 230,879 | 39,043 |
| HSK 2 | 301,826 | 50,807 |
| HSK 3 | 350,625 | 63,213 |
| **Total lazy data** | **883,330** | **153,063** |

Grammar lesson chunks remain absent from the initial `index.html` script list and are loaded one level at a time. The gzip figures above are reproducible artifact-compression measurements, not browser encoded-response measurements.

## Verification

- Catalog audit: PASS, 0 structural errors, exact 70/78/96 coverage, 2 authorized exceptions, and runtime semantic synchronization confirmed.
- Compiler: validation and write completed for 1,000 vocabulary cards, 1,092 active sentence cards, 655 hanzi records, 268 measure-word records, and all 3 grammar chunks.
- Grammar runtime: schema 2 applicability labels are validated as non-empty and duplicate-free before rendering.
- Focused regression checks: the compiler round-trip, grammar chunk contract, pinyin validator, and standalone Grammar page controller tests passed. The full test suite was not run for this port.
- Compatibility: no sentence-card binding, runtime order, deck order, or frozen visibility index changed during this port.

Browser/manual QA, screenshots, the five-viewport matrix, browser decoded/encoded response measurements, and regression smoke tests were not completed at the user's direction. No browser-runtime, accessibility, responsive-layout, or network-timing claim is inferred from syntax checks or source inspection.
