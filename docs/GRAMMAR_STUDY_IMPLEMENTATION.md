# Grammar Study implementation

Release: 2.3.0

## Architecture

Grammar Study is a signed-in, read-only page in the existing static application shell. `js/main-grammar-page.js` owns transient level, category, search, disclosure, loading, and retry state. It loads one generated same-origin JavaScript chunk for the selected level, validates the complete payload, caches successful loads and in-flight requests, and renders with safe DOM APIs.

The browser does not read catalog CSV files. Linguistic source data remains under `language/data/catalog/`, page activation and order remain in `language/data/product_bindings/grammar_page_lessons.csv`, and `language/scripts/compile_runtime_catalog.py` generates the three lazy runtime chunks. Existing flashcard chunks remain byte-for-byte unchanged.

## Coverage

| Introduced level | Official rows | Active lessons | Examples |
| ---: | ---: | ---: | ---: |
| HSK 1 | 70/70 | 70 | 145 |
| HSK 2 | 78/78 | 78 | 201 |
| HSK 3 | 96/96 | 96 | 225 |
| **Total** | **244/244** | **244** | **571** |

The approved decomposition contains 547 grammar elements:

| Element kind | Count |
| --- | ---: |
| `category` | 18 |
| `construction` | 177 |
| `expression_system` | 2 |
| `function` | 112 |
| `inventory_member` | 228 |
| `morphology` | 10 |

All 244 grammar points, 244 lessons, 547 elements, 571 examples, and their published relations have current approval evidence. The active feature has no open editorial issue. The catalog audit still reports 8 legacy review warnings and 11 unrelated pre-existing issues; neither backlog is used by Grammar Study.

HSK 1 and HSK 2 received independent cross-review after curation. HSK 3 received a complete curator review and a focused independent sample review; this record does not claim a second complete HSK 3 editorial pass.

## Editorial decisions

Two exact vocabulary exceptions are authorized:

- `hsk26-g1-013` permits `杯` only at HSK 1 when it is the `classifier` target for the approved lesson example. There is no standalone in-level vocabulary sense and no vocabulary relation is emitted.
- `hsk26-g3-023` permits `不必` only at HSK 3 when it is the `negative_modal` target for the approved lesson example. The standalone word is introduced at HSK 4 and no HSK 3 vocabulary relation is emitted.

These policies are point, level, surface-form, and target-role scoped. They do not create a general route around vocabulary review.

Known source anomalies and grouping decisions are recorded in `language/reference/GRAMMAR_STUDY_EDITORIAL.md`. In particular, the concatenated source form `句公斤` is represented as the reviewed members `句` and `公斤`; the inherited hierarchy for `hsk26-g2-034` is preserved as source metadata while learner grouping is an approved override; and the literal `所处 + 是 + 名词` source wording remains normative metadata rather than being silently rewritten.

## Runtime output

| Chunk | Source bytes | `gzip -9` artifact bytes |
| --- | ---: | ---: |
| HSK 1 | 194,186 | 34,455 |
| HSK 2 | 268,190 | 46,668 |
| HSK 3 | 307,927 | 57,443 |
| **Total lazy data** | **770,303** | **138,566** |

The initial linked source footprint was measured with the same local HTML resource parser at 1,451,889 bytes before the feature and 1,484,614 bytes after it, a 32,725-byte increase (2.25%). Grammar lesson chunks are absent from the initial `index.html` script list. The gzip figures above are reproducible artifact-compression measurements, not browser encoded-response measurements.

## Verification

- Catalog audit: PASS, 0 structural errors, exact 70/78/96 coverage, 2 authorized exceptions, and runtime semantic synchronization confirmed.
- Compiler: validation and write completed; `--check-runtime` reported semantic equality for 1,000 vocabulary cards, 1,562 sentence cards, 655 hanzi records, 268 measure-word records, and all 3 grammar chunks.
- JavaScript: syntax checks passed for the controller, integration modules, and all three chunks. The standalone controller contract test passed.
- Python pipeline: the full 25-test run produced 24 passes and exposed one stale assertion that counted all canonical grammar examples as flashcards. The assertion was corrected to count card bindings, and that test passed independently. The full 190-second suite was not repeated after this test-only correction, following the instruction to limit further test-environment work.
- Compatibility: generated legacy flashcard chunks have no byte-level diff.

Browser/manual QA, screenshots, the five-viewport matrix, browser decoded/encoded response measurements, and regression smoke tests were not completed at the user's direction. No browser-runtime, accessibility, responsive-layout, or network-timing claim is inferred from syntax checks or source inspection.
