# Language catalog audit

Status: **PASS** — 0 structural errors, 8 review warnings.

A pass validates structure, references, HSK-level constraints, and binding compatibility. Runtime semantic synchronization is reported separately and a pass does not promote legacy content to approved.

Runtime semantic synchronization: **YES**.

## Inventory

| Item | Count |
| --- | ---: |
| Official vocabulary senses | 11,000 |
| Active vocabulary cards | 1,000 |
| Sentence cards | 1,562 |
| Official grammar rows | 593 |
| Official topics | 427 |
| Official tasks / capabilities | 166 / 678 |
| Official recognition hanzi | 3,088 |
| Active hanzi study records | 655 |
| Active measure-word cards | 268 |
| Generated study cards | 1,578 |
| Sentence + study cards | **3,140** |

## Coverage

Target: 3 distinct same-level sentences.

| HSK | Senses | Published surface min / avg | Published surface below | Published explicit min / avg | Published explicit below | Approved explicit below |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 1 | 300 | 3 / 7.31 | 0 | 3 / 7.31 | 0 | 300 |
| 2 | 200 | 2 / 4.34 | 1 | 0 / 4.03 | 5 | 200 |
| 3 | 500 | 3 / 4.16 | 0 | 0 / 3.87 | 9 | 500 |

Published coverage includes product-bound legacy migration content. Approved-only coverage spans the full catalog independently of product bindings and is the editorial target. Surface coverage cannot distinguish homographic senses.

### Full syllabus roadmap

| HSK band | Official senses | Product active | Not active | Below approved explicit target |
| ---: | ---: | ---: | ---: | ---: |
| 1 | 300 | 300 | 0 | 300 |
| 2 | 200 | 200 | 0 | 200 |
| 3 | 500 | 500 | 0 | 500 |
| 4 | 1000 | 0 | 1000 | 1000 |
| 5 | 1600 | 0 | 1600 | 1600 |
| 6 | 1800 | 0 | 1800 | 1800 |
| 7 | 5600 | 0 | 5600 | 5600 |

## Relationship quality

| Signal | Count |
| --- | ---: |
| Sentence-vocabulary links | 8,839 |
| Ambiguous sense links | 79 |
| Component-only links | 57 |
| Sentence-grammar links | 3,109 |
| Approved grammar links | 0 |
| Segmented token types missing explicit links | 0 |
| Missing utterance translations | 360 |
| Unreviewed coverage exceptions | 5 |

## Editorial backlog

| Catalog | Status counts |
| --- | --- |
| `vocabulary.csv` | legacy_unreviewed: 1,000, syllabus_only: 10,000 |
| `vocabulary_translations.csv` | legacy_unreviewed: 1,000 |
| `sentences.csv` | legacy_unreviewed: 1,562 |
| `sentence_translations.csv` | legacy_unreviewed: 1,562 |
| `sentence_utterance_translations.csv` | legacy_unreviewed: 1,562 |
| `sentence_utterances.csv` | legacy_unreviewed: 1,922 |
| `hanzi_readings.csv` | legacy_unreviewed: 655 |
| `measure_word_sets.csv` | legacy_unreviewed: 268 |
| `classifier_usages.csv` | legacy_unreviewed: 443 |

Open registered issues: **11**.

- `lang-0001` · `hsk2_sent_aug_dense_0083` — Translation introduces sweetness
- `lang-0002` · `hsk2_sent_aug_dense_0086` — 电影 is translated as story
- `lang-0003` · `hsk2_sent_aug_dense_0100` — Sentence needs a natural motion construction
- `lang-0004` · `hsk3_sent_aug_dense_0247` — Sentence is semantically contradictory
- `lang-0005` · `hsk3_sent_aug_dense_0241` — Coverage sentence is awkward
- `lang-0006` · `hsk3_sent_aug_dense_0295` — 起 is incomplete in this context
- `lang-0007` · `hsk3_sent_aug_dense_0304` — 收邮件 gloss is misleading
- `lang-0008` · `hanzi_706b-legacy-reading` — 火 inherits a compound gloss
- `lang-0009` · `hanzi_679c-legacy-reading` — 果 inherits a compound gloss
- `lang-0010` · `hanzi_9053-legacy-reading` — 道 inherits an unrelated word gloss
- `lang-0011` · `zh_qa_model_answers` — Q&A model answers lack utterance translations

## Validation

No structural, referential, level, or runtime-compatibility errors were found.

## Known limits

- Automatic checks do not prove grammaticality, naturalness, translation equivalence, or register.
- Cumulative dictionary segmentation proves lexical decomposability, not the intended sense of every compositional or homographic string.
- Legacy grammar labels remain candidates until mapped to official grammar IDs.
- Character glosses migrated from word-derived study cards require dedicated review.
- The English syllabus does not translate the 11,000 vocabulary entries.
