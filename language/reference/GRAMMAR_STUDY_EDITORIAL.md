# HSK 1-3 Grammar Study Editorial Source

This file documents the provenance and editorial decisions for the learner-facing
HSK Grammar page. It is not an official HSK publication and does not replace the
normative syllabus mirror.

## Ownership

- Syllabus membership and official hierarchy are based on
  `HSK_SYLLABUS_ZH.md`, cross-checked against `HSK_SYLLABUS_EN.md`.
- Grammar elements, learner titles, explanations, formulas, examples, pinyin,
  translations, target spans, and analyses are project-authored content.
- Approved rows require current review evidence in `reviews.csv`. Mechanical
  validation or runtime generation does not constitute linguistic approval.
- The normalized CSV files under `language/data/catalog/` remain the editorial
  source of truth. This document records provenance only.

## Scope

Version 1 covers every official grammar row introduced at HSK levels 1, 2, and
3: 70, 78, and 96 rows respectively. Examples must use only vocabulary and
grammar available at the lesson level or earlier. The browser receives only
complete approved content through deterministic generated level chunks.

## Pinyin Policy

- Orthographic word division follows
  [`GB/T 16159-2012`](https://openstd.samr.gov.cn/bzgk/std/newGbInfo?hcno=5645BD8DB9D8D73053AD3A2397E15E74),
  *The Basic Rules of Chinese Phonetic Alphabet Orthography*.
- Display pinyin uses NFC-normalized tone marks, normal word spacing, sentence-
  initial capitalization, and punctuation matching the Chinese utterance.
- Syllables in established lexical words are written together. Syntactically
  separate words are spaced, while a hyphen marks a productive affix boundary
  where it improves readability, including ordinal `dì-`.
- Dynamic `le`, durative `zhe`, and experiential `guo` attach to the preceding
  verb; sentence-final or modal particles remain separate. Structural particles
  are spaced according to their syntactic function.
- A monosyllabic verb or adjective and a monosyllabic complement form one pinyin
  word; the construction is spaced when either component is polysyllabic. An
  attached aspect suffix follows the resulting orthographic word.
- Neutral tones are unmarked. Erhua is written with final `r`, and an apostrophe
  separates a following `a`, `o`, or `e` syllable when the boundary would
  otherwise be unclear.
- Contextual tone changes are written for `一` and `不`: `yí` before fourth tone,
  `yì` before first, second, or third tone, `bú` before fourth tone, and neutral
  `yi`/`bu` where the construction requires it. Lexical or enumerative `yī`
  remains first tone where tone change does not apply.
- Lexical third-tone marks are retained rather than respelled for connected-
  speech third-tone sandhi.

## Source Decisions

- `hsk26-g3-012`: the extracted official source concatenates `句公斤`. The
  reviewed editorial decomposition treats `句` and `公斤` as separate measure-
  word inventory members while preserving the source cell unchanged.
- `hsk26-g3-013`: the official HSK 3 grammar inventory includes borrowed
  classifiers `碗` and `盘`, while the vocabulary syllabus introduces standalone
  `盘` at HSK 6. Reviewed HSK 3 examples therefore demonstrate `碗`; `盘` remains
  in the normalized grammar inventory without a fabricated vocabulary relation.
- `hsk26-g2-034`: blank source cells make the normalized official row inherit
  `Word classes > Particles > Basic structural types`, although `动补短语1`
  denotes a phrase type. The source row remains unchanged; learner-facing
  metadata uses an audited `Phrases` display-group override.
- `hsk26-g2-017`: the official HSK 2 grammar inventory includes `常` and `经常`,
  while the vocabulary syllabus introduces standalone `常` at HSK 3. Reviewed
  HSK 2 examples therefore demonstrate `经常`; `常` remains in the normalized
  grammar inventory without a fabricated vocabulary relation.
- `hsk26-g1-054`: the official Chinese source prints `所处+是+名词`, while the
  aligned English says `location + 是 + noun` and the standard construction uses
  a place expression. The source cell remains unchanged; the project-authored
  learner formula uses `处所 + 是 + 名词` and records the normalization.
- `hsk26-g3-021` and `hsk26-g3-022`: learner titles distinguish
  likelihood/necessity adverbs (`情态副词`) from speaker-stance/focus adverbs
  (`语气副词`) despite the duplicated English source label.
- `hsk26-g3-042`: `一般来说` remains the Chinese target; "generally speaking"
  is its English meaning only.
- `hsk26-g3-087`: learner copy describes additive escalation with
  `不但……而且……`, avoiding confusion between `递进` and progressive aspect.

## Vocabulary Coverage Exception

- `hsk26-g1-013`: the official grammar inventory requires borrowed classifier
  `杯`, but the vocabulary syllabus contains `杯子` and no standalone `杯`
  sense. The repository user explicitly authorized a narrow exception on
  2026-07-13. In reviewed examples demonstrating this point, an exact `杯`
  target with role `classifier` may remain without a `sentence_vocabulary.csv`
  row. The authorization does not create a vocabulary sense, does not map `杯`
  to `杯子`, and does not apply to any other point, level, surface, target role,
  or incidental occurrence. The reviewed policy row lives in
  `grammar_vocabulary_exceptions.csv` and is enforced mechanically.
- `hsk26-g3-023`: the official HSK 3 grammar inventory requires `不必`, while
  the vocabulary syllabus introduces standalone `不必` at HSK 4. The repository
  user's editorial-exception authorization and 2026-07-13 instruction to
  finalize are applied only to an exact reviewed `不必` target with role
  `negative_modal` demonstrating this point. It remains absent from
  `sentence_vocabulary.csv`; the policy creates no HSK 3 vocabulary sense and
  never maps or relabels the HSK 4 entry.
