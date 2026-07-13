#!/usr/bin/env python3
"""Bootstrap the canonical CSV catalog from the syllabus and legacy runtime data."""

from __future__ import annotations

import argparse
import csv
import hashlib
import json
import re
import sys
from collections import Counter, defaultdict
from pathlib import Path
from typing import Any

from catalog_io import (
    CATALOG_FIELDS,
    EN_SYLLABUS,
    PRODUCT_FIELDS,
    PROJECT_ROOT,
    ZH_SYLLABUS,
    csv_path,
    load_runtime_cards,
    normalize_search_text,
    pipe_join,
    read_csv,
    sha256_file,
    write_csv,
)
from syllabus_parser import parse_all

BOUND_SURFACES = {"们", "子", "室", "园", "员"}
ALLOWED_DIRECTIONS = {"zh_to_en", "en_to_zh", "zh_qa"}


def level_for_legacy_vocab(index: int) -> int:
    if index <= 300:
        return 1
    if index <= 500:
        return 2
    if index <= 1000:
        return 3
    raise ValueError(f"Unexpected active vocabulary position {index}")


def source_rows() -> list[dict[str, Any]]:
    legacy_snapshot = PROJECT_ROOT / "language" / "reference" / "legacy-runtime-cards.json"
    if not legacy_snapshot.exists():
        raise FileNotFoundError("Run snapshot_legacy_runtime.py --write before the initial bootstrap")
    return [
        {
            "source_id": "hsk26-zh", "authority": "Center for Language Education and Cooperation (中外语言交流合作中心)",
            "source_kind": "normative_syllabus", "title": "Chinese Proficiency Test Syllabus (Chinese)",
            "edition": "2025-11 / effective 2026-07", "published_at": "2025-11",
            "effective_at": "2026-07", "language": "zh-Hans",
            "path": "language/reference/HSK_SYLLABUS_ZH.md", "sha256": sha256_file(ZH_SYLLABUS),
            "notes": "Normative source for vocabulary, hanzi, grammar, topics, and tasks.",
        },
        {
            "source_id": "hsk26-en", "authority": "Center for Language Education and Cooperation; aligned audited translation",
            "source_kind": "reference_translation", "title": "Chinese Proficiency Test Syllabus (English)",
            "edition": "2025-11 / effective 2026-07", "published_at": "2025-11",
            "effective_at": "2026-07", "language": "en",
            "path": "language/reference/HSK_SYLLABUS_EN.md", "sha256": sha256_file(EN_SYLLABUS),
            "notes": "Structural and translation cross-check; its vocabulary table is not translated.",
        },
        {
            "source_id": "hsk26-zh+hsk26-en", "authority": "Center for Language Education and Cooperation; paired audited syllabus",
            "source_kind": "aligned_reference_pair", "title": "Aligned HSK syllabus pair",
            "edition": "2025-11 / effective 2026-07", "published_at": "2025-11",
            "effective_at": "2026-07", "language": "zh-Hans+en",
            "path": "language/reference/", "sha256": hashlib.sha256(
                (sha256_file(ZH_SYLLABUS) + sha256_file(EN_SYLLABUS)).encode("ascii")
            ).hexdigest(),
            "notes": "Used for aligned grammar, topic, task, and capability rows.",
        },
        {
            "source_id": "legacy-runtime", "authority": "Repository runtime snapshot",
            "source_kind": "legacy_migration", "title": "Legacy JavaScript flashcard catalog",
            "edition": "2.2.0", "published_at": "", "effective_at": "",
            "language": "zh-Hans+en", "path": "language/reference/legacy-runtime-cards.json",
            "sha256": sha256_file(legacy_snapshot),
            "notes": "Compatibility evidence only; imported fields are not linguistically approved.",
        },
    ]


def enrich_vocabulary(
    vocabulary: list[dict[str, Any]], legacy: list[dict[str, Any]]
) -> tuple[list[dict[str, Any]], list[dict[str, Any]], list[dict[str, Any]]]:
    if len(legacy) != 1000:
        raise ValueError(f"Expected 1,000 legacy vocabulary cards, found {len(legacy)}")
    translations = []
    bindings = []
    for index, card in enumerate(legacy, start=1):
        row = vocabulary[index - 1]
        if row["hanzi"] != str(card.get("hanzi", "")):
            raise ValueError(
                f"Vocabulary mismatch at {index}: syllabus={row['hanzi']!r}, runtime={card.get('hanzi')!r}"
            )
        expected_level = level_for_legacy_vocab(index)
        if int(row["level_min"]) != expected_level:
            raise ValueError(f"Vocabulary level mismatch at {index}")
        legacy_pinyin = str(card.get("pinyin", ""))
        legacy_numeric = str(card.get("pinyinNumeric", ""))
        if not legacy_pinyin or not legacy_numeric or not str(card.get("translation", "")):
            raise ValueError(f"Incomplete active vocabulary card at {index}")
        notes = []
        if normalize_search_text(legacy_pinyin) != normalize_search_text(str(row["syllabus_pinyin"])):
            notes.append("legacy pinyin differs from normalized syllabus pinyin")
        if "partOfSpeech" in card and str(card.get("partOfSpeech", "")) != str(row["syllabus_part_of_speech_zh"]):
            notes.append("legacy part of speech differs from syllabus")
        row.update({
            "pinyin": legacy_pinyin,
            "pinyin_search": normalize_search_text(legacy_pinyin),
            "pinyin_numeric": legacy_numeric,
            "part_of_speech_zh": str(card.get("partOfSpeech", "")),
            "example_zh": str(card.get("example", "")),
            "example_review_status": "legacy_unreviewed" if card.get("example") else "",
            "curation_status": "legacy_unreviewed",
            "notes": "; ".join(notes),
        })
        translations.append({
            "vocab_id": row["vocab_id"], "locale": "en", "text": str(card["translation"]),
            "review_status": "legacy_unreviewed", "source_id": "legacy-runtime", "notes": "",
        })
        bindings.append({
            "runtime_order": index, "vocab_id": row["vocab_id"],
            "legacy_storage_key": f"idx:{index - 1}",
            "learn_default": str(card.get("learn", True)).lower(),
            "practice_default": str(card.get("practice", True)).lower(),
        })
    return vocabulary, translations, bindings


def parse_qa_back(value: str, card_id: str) -> tuple[str, str]:
    match = re.fullmatch(r"A：([^\n]+)\nB：([^\n]+)", value)
    if not match:
        raise ValueError(f"Unsupported Q&A response format for {card_id}")
    return match.group(1), match.group(2)


def chinese_fragments(value: str) -> list[str]:
    return [fragment for fragment in re.findall(r"[㐀-鿿]+", value) if fragment]


def grammar_candidates(
    tag: str, level: int, grammar_rows: list[dict[str, Any]]
) -> list[str]:
    fragments = chinese_fragments(tag)
    if not fragments:
        return []
    candidates = []
    for row in grammar_rows:
        if int(row["level_min"]) > level:
            continue
        content = str(row["content_zh"])
        if any(fragment in content for fragment in fragments):
            candidates.append(str(row["grammar_point_id"]))
    return candidates


def build_sentences(
    legacy: list[dict[str, Any]], vocabulary: list[dict[str, Any]], grammar_rows: list[dict[str, Any]]
) -> dict[str, list[dict[str, Any]]]:
    by_surface: dict[str, list[dict[str, Any]]] = defaultdict(list)
    for row in vocabulary:
        by_surface[str(row["hanzi"])].append(row)

    sentences = []
    utterances = []
    utterance_translations = []
    translations = []
    vocabulary_links = []
    grammar_links = []
    bindings = []
    seen_ids: set[str] = set()
    deck_orders: Counter[str] = Counter()

    for runtime_order, card in enumerate(legacy, start=1):
        card_id = str(card.get("id", ""))
        if not card_id or card_id in seen_ids:
            raise ValueError(f"Missing or duplicate sentence ID: {card_id!r}")
        seen_ids.add(card_id)
        direction = str(card.get("direction", ""))
        if direction not in ALLOWED_DIRECTIONS:
            raise ValueError(f"Unsupported sentence direction {direction!r} for {card_id}")
        level = int(card.get("level") or 0)
        if level not in {1, 2, 3}:
            raise ValueError(f"Invalid sentence level for {card_id}")
        chinese = str(card.get("chinese", ""))
        english = str(card.get("english", ""))
        if not chinese or not english:
            raise ValueError(f"Incomplete sentence content for {card_id}")

        if direction == "zh_to_en":
            if card.get("front") != chinese or card.get("back") != english:
                raise ValueError(f"Nonstandard zh_to_en binding for {card_id}")
            utterances.append({
                "sentence_id": card_id, "turn_order": 1, "role": "statement", "zh_text": chinese,
                "pinyin": "", "review_status": "legacy_unreviewed", "notes": "",
            })
            response_style = "direction_default"
            utterance_translations.append({
                "sentence_id": card_id, "turn_order": 1, "locale": "en", "text": english,
                "review_status": "legacy_unreviewed", "source_id": "legacy-runtime", "notes": "",
            })
        elif direction == "en_to_zh":
            if card.get("front") != english or card.get("back") != chinese:
                raise ValueError(f"Nonstandard en_to_zh binding for {card_id}")
            utterances.append({
                "sentence_id": card_id, "turn_order": 1, "role": "statement", "zh_text": chinese,
                "pinyin": "", "review_status": "legacy_unreviewed", "notes": "",
            })
            response_style = "direction_default"
            utterance_translations.append({
                "sentence_id": card_id, "turn_order": 1, "locale": "en", "text": english,
                "review_status": "legacy_unreviewed", "source_id": "legacy-runtime", "notes": "",
            })
        else:
            positive, negative = parse_qa_back(str(card.get("back", "")), card_id)
            question_translation = re.fullmatch(r"(.+?) Positive/negative model answers\.", english)
            if not question_translation:
                raise ValueError(f"Unsupported Q&A English summary format for {card_id}")
            utterances.extend([
                {"sentence_id": card_id, "turn_order": 1, "role": "question",
                 "zh_text": str(card.get("front", "")), "pinyin": "",
                 "review_status": "legacy_unreviewed", "notes": ""},
                {"sentence_id": card_id, "turn_order": 2, "role": "positive_answer",
                 "zh_text": positive, "pinyin": "", "review_status": "legacy_unreviewed", "notes": ""},
                {"sentence_id": card_id, "turn_order": 3, "role": "negative_answer",
                 "zh_text": negative, "pinyin": "", "review_status": "legacy_unreviewed", "notes": ""},
            ])
            response_style = "labeled_ab_lines"
            utterance_translations.append({
                "sentence_id": card_id, "turn_order": 1, "locale": "en",
                "text": question_translation.group(1), "review_status": "legacy_unreviewed",
                "source_id": "legacy-runtime", "notes": "Model-answer translations are not present in legacy data.",
            })

        sentences.append({
            "sentence_id": card_id, "level": level, "full_zh": chinese, "topic_id": "",
            "register": "", "curation_status": "legacy_unreviewed",
            "linguistic_review_status": "legacy_unreviewed", "source_id": "legacy-runtime",
            "notes": "Migrated without full expert linguistic review.",
        })
        translations.append({
            "sentence_id": card_id, "locale": "en", "text": english,
            "review_status": "legacy_unreviewed", "source_id": "legacy-runtime", "notes": "",
        })

        for position, surface in enumerate(card.get("vocabTags") or [], start=1):
            surface = str(surface)
            candidates = by_surface.get(surface, [])
            eligible = [row for row in candidates if int(row["level_min"]) <= level]
            if len(eligible) == 1:
                vocab_id, resolution = str(eligible[0]["vocab_id"]), "exact"
            elif len(eligible) > 1:
                vocab_id, resolution = "", "ambiguous"
            elif len(candidates) == 1 and surface in BOUND_SURFACES:
                vocab_id, resolution = str(candidates[0]["vocab_id"]), "component_only"
            elif candidates:
                vocab_id, resolution = "", "out_of_level"
            else:
                vocab_id, resolution = "", "unmatched"
            vocabulary_links.append({
                "sentence_id": card_id, "position": position, "surface_form": surface,
                "vocab_id": vocab_id, "resolution_status": resolution,
                "coverage_type": "bound_surface" if surface in BOUND_SURFACES else "exact",
                "review_status": "legacy_unreviewed", "notes": "",
            })

        for position, tag in enumerate(card.get("grammarTags") or [], start=1):
            tag = str(tag)
            candidates = grammar_candidates(tag, level, grammar_rows)
            grammar_links.append({
                "sentence_id": card_id, "position": position, "legacy_tag": tag,
                "grammar_point_id": "", "candidate_grammar_point_ids": pipe_join(candidates),
                "mapping_status": "auto_candidates" if candidates else "unmapped_legacy",
                "review_status": "legacy_unreviewed", "notes": "",
            })

        deck_id = str(card.get("deckId", ""))
        deck_orders[deck_id] += 1
        bindings.append({
            "runtime_order": runtime_order, "deck_order": deck_orders[deck_id], "card_id": card_id,
            "sentence_id": card_id, "direction": direction, "deck_id": deck_id,
            "deck_name": str(card.get("deckName", "")), "response_style": response_style,
            "tags": pipe_join(card.get("tags") or []),
        })

    return {
        "sentences.csv": sentences,
        "sentence_utterances.csv": utterances,
        "sentence_translations.csv": translations,
        "sentence_utterance_translations.csv": utterance_translations,
        "sentence_vocabulary.csv": vocabulary_links,
        "sentence_grammar.csv": grammar_links,
        "sentence_cards.csv": bindings,
    }


def build_hanzi_readings(
    legacy: list[dict[str, Any]], hanzi_rows: list[dict[str, Any]]
) -> tuple[list[dict[str, Any]], list[dict[str, Any]]]:
    by_id = {str(row["hanzi_id"]): row for row in hanzi_rows}
    readings = []
    bindings = []
    seen_cards: set[str] = set()
    for runtime_order, card in enumerate(legacy, start=1):
        card_id = str(card.get("id", ""))
        if not card_id or card_id in seen_cards:
            raise ValueError(f"Missing or duplicate hanzi card ID: {card_id!r}")
        seen_cards.add(card_id)
        hanzi = str(card.get("hanzi", ""))
        if len(hanzi) != 1:
            raise ValueError(f"Hanzi study item is not one character: {card_id}")
        hanzi_id = f"hanzi_{ord(hanzi):x}"
        official = by_id.get(hanzi_id)
        if official is None:
            raise ValueError(f"Legacy hanzi is absent from syllabus: {hanzi}")
        reading_id = f"{card_id}-legacy-reading"
        notes = []
        if int(card.get("level") or 0) != int(official["recognition_level_min"]):
            notes.append(
                f"legacy level {card.get('level')} differs from syllabus recognition level "
                f"{official['recognition_level_min']}"
            )
        notes.append("Legacy meaning may be inherited from a compound word; review as a character gloss.")
        readings.append({
            "reading_id": reading_id, "hanzi_id": hanzi_id, "pinyin": str(card.get("pinyin", "")),
            "pinyin_numeric": str(card.get("pinyinNumeric", "")),
            "meaning_en": str(card.get("meaning", "")), "stroke_sequence": str(card.get("strokeAnswer", "")),
            "review_status": "legacy_unreviewed", "source_id": "legacy-runtime",
            "notes": "; ".join(notes),
        })
        bindings.append({
            "runtime_order": runtime_order, "card_id": card_id, "reading_id": reading_id,
            "level": int(card.get("level") or 0),
        })
    return readings, bindings


def split_classifiers(value: str, card_id: str) -> list[tuple[str, str]]:
    output = []
    for part in value.split(";"):
        match = re.fullmatch(r"\s*(.+?)\s*\[([^\]]+)\]\s*", part)
        if not match:
            raise ValueError(f"Malformed classifier usage for {card_id}: {part!r}")
        output.append((match.group(1), match.group(2)))
    return output


def build_measure_words(
    legacy: list[dict[str, Any]], vocabulary: list[dict[str, Any]]
) -> tuple[list[dict[str, Any]], list[dict[str, Any]], list[dict[str, Any]]]:
    sets = []
    usages = []
    bindings = []
    for runtime_order, card in enumerate(legacy, start=1):
        card_id = str(card.get("id", ""))
        match = re.fullmatch(r"measure_([123])_(\d{4})_(.+)", card_id)
        if not match:
            raise ValueError(f"Unexpected measure-word card ID: {card_id}")
        vocab_order = int(match.group(2))
        vocab = vocabulary[vocab_order - 1]
        if str(vocab["hanzi"]) != str(card.get("hanzi", "")) or match.group(3) != str(card.get("hanzi", "")):
            raise ValueError(f"Measure-word vocabulary mismatch for {card_id}")
        if int(match.group(1)) != int(card.get("level") or 0):
            raise ValueError(f"Measure-word level mismatch for {card_id}")
        sets.append({
            "measure_word_id": card_id, "level": int(card["level"]),
            "headword_vocab_id": vocab["vocab_id"], "headword_hanzi": str(card["hanzi"]),
            "pinyin": str(card.get("pinyin", "")), "pinyin_numeric": str(card.get("pinyinNumeric", "")),
            "meaning_en": str(card.get("meaning", "")), "review_status": "legacy_unreviewed",
            "source_id": "legacy-runtime", "notes": "",
        })
        for usage_order, (classifier, pinyin_numeric) in enumerate(
            split_classifiers(str(card.get("measureWords", "")), card_id), start=1
        ):
            usages.append({
                "usage_id": f"{card_id}-usage-{usage_order:02d}", "measure_word_id": card_id,
                "usage_order": usage_order, "classifier_hanzi": classifier,
                "classifier_pinyin_numeric": pinyin_numeric, "review_status": "legacy_unreviewed",
                "notes": "",
            })
        bindings.append({"runtime_order": runtime_order, "card_id": card_id, "measure_word_id": card_id})
    return sets, usages, bindings


def build_coverage_exceptions(vocabulary: list[dict[str, Any]]) -> list[dict[str, Any]]:
    by_surface: dict[str, list[dict[str, Any]]] = defaultdict(list)
    for row in vocabulary:
        if int(row["level_min"]) <= 3:
            by_surface[str(row["hanzi"])].append(row)
    output = []
    for surface in sorted(BOUND_SURFACES):
        candidates = by_surface.get(surface, [])
        if len(candidates) != 1:
            raise ValueError(f"Expected one active vocabulary sense for bound surface {surface}: {len(candidates)}")
        output.append({
            "exception_id": f"legacy-bound-{ord(surface):x}", "vocab_id": candidates[0]["vocab_id"],
            "surface_form": surface, "coverage_type": "bound_surface",
            "allowed_surface_pattern": f".*{surface}.*",
            "reason": "Migrated legacy coverage rule; natural use is normally embedded in a larger word.",
            "review_status": "legacy_unreviewed",
        })
    return output


def seed_issues() -> list[dict[str, Any]]:
    """Seed concrete problems found during migration without changing the legacy content."""
    rows = [
        ("lang-0001", "high", "sentence", "hsk2_sent_aug_dense_0083", "translation_equivalence",
         "Translation introduces sweetness", "好喝 means pleasant/good to drink; the English adds the narrower meaning 'sweet'."),
        ("lang-0002", "high", "sentence", "hsk2_sent_aug_dense_0086", "translation_equivalence",
         "电影 is translated as story", "The Chinese says movie/film, while the English says story."),
        ("lang-0003", "medium", "sentence", "hsk2_sent_aug_dense_0100", "naturalness",
         "Sentence needs a natural motion construction", "学生出房间了 is marked natural but should be reviewed against forms such as 从房间出来 or 离开房间."),
        ("lang-0004", "high", "sentence", "hsk3_sent_aug_dense_0247", "semantic_coherence",
         "Sentence is semantically contradictory", "Beer is a beverage, and placing it on a plate is an implausible default context."),
        ("lang-0005", "medium", "sentence", "hsk3_sent_aug_dense_0241", "naturalness",
         "Coverage sentence is awkward", "一斤香蕉不少 and its literal English require a more natural context or replacement."),
        ("lang-0006", "medium", "sentence", "hsk3_sent_aug_dense_0295", "naturalness",
         "起 is incomplete in this context", "他从床上起 should be reviewed against the intended 起床/起来 construction."),
        ("lang-0007", "medium", "sentence", "hsk3_sent_aug_dense_0304", "translation_equivalence",
         "收邮件 gloss is misleading", "Please collect the email is not an idiomatic equivalent; intended receive/check/collect meaning is unclear."),
        ("lang-0008", "high", "hanzi_reading", "hanzi_706b-legacy-reading", "character_gloss",
         "火 inherits a compound gloss", "The character 火 is glossed as train, apparently inherited from 火车."),
        ("lang-0009", "high", "hanzi_reading", "hanzi_679c-legacy-reading", "character_gloss",
         "果 inherits a compound gloss", "The character 果 is glossed as apple, apparently inherited from 苹果."),
        ("lang-0010", "high", "hanzi_reading", "hanzi_9053-legacy-reading", "character_gloss",
         "道 inherits an unrelated word gloss", "The character 道 is glossed as to know and requires sense-specific review."),
        ("lang-0011", "medium", "translation_backlog", "zh_qa_model_answers", "missing_translation",
         "Q&A model answers lack utterance translations", "All 180 migrated Q&A cards translate the question only; 360 positive/negative model answers need locale-keyed translations."),
    ]
    return [
        {
            "issue_id": issue_id, "severity": severity, "entity_type": entity_type,
            "entity_id": entity_id, "rule_id": rule_id, "status": "open", "summary": summary,
            "details": details, "created_at": "2026-07-12", "resolved_at": "", "notes": "",
        }
        for issue_id, severity, entity_type, entity_id, rule_id, summary, details in rows
    ]


def generate_tables() -> dict[str, list[dict[str, Any]]]:
    syllabus = parse_all()
    runtime = load_runtime_cards()
    vocabulary, vocabulary_translations, vocabulary_bindings = enrich_vocabulary(
        syllabus["vocabulary.csv"], runtime["vocabulary"]
    )
    syllabus["vocabulary.csv"] = vocabulary

    sentence_tables = build_sentences(runtime["sentences"], vocabulary, syllabus["grammar_points.csv"])
    hanzi_readings, hanzi_bindings = build_hanzi_readings(runtime["hanzi"], syllabus["hanzi.csv"])
    measure_sets, classifier_usages, measure_bindings = build_measure_words(
        runtime["measure_words"], vocabulary
    )

    tables: dict[str, list[dict[str, Any]]] = {
        "sources.csv": source_rows(),
        **syllabus,
        "vocabulary_translations.csv": vocabulary_translations,
        "hanzi_readings.csv": hanzi_readings,
        "measure_word_sets.csv": measure_sets,
        "classifier_usages.csv": classifier_usages,
        "coverage_exceptions.csv": build_coverage_exceptions(vocabulary),
        "reviews.csv": [], "issues.csv": seed_issues(), "waivers.csv": [],
        "vocabulary_cards.csv": vocabulary_bindings,
        "hanzi_cards.csv": hanzi_bindings,
        "measure_word_cards.csv": measure_bindings,
        **sentence_tables,
    }
    expected = set(CATALOG_FIELDS) | set(PRODUCT_FIELDS)
    if set(tables) != expected:
        raise AssertionError(f"Generated table set mismatch: missing={expected - set(tables)}, extra={set(tables) - expected}")
    return tables


def string_rows(rows: list[dict[str, Any]], fields: list[str]) -> list[dict[str, str]]:
    return [{field: str(row.get(field, "")) for field in fields} for row in rows]


def check_tables(tables: dict[str, list[dict[str, Any]]]) -> list[str]:
    differences = []
    for name, rows in tables.items():
        path = csv_path(name)
        fields = CATALOG_FIELDS.get(name) or PRODUCT_FIELDS[name]
        if not path.exists():
            differences.append(f"missing {path.relative_to(PROJECT_ROOT)}")
            continue
        with path.open("r", encoding="utf-8", newline="") as handle:
            reader = csv.DictReader(handle)
            actual_fields = reader.fieldnames or []
        if actual_fields != fields:
            differences.append(f"header mismatch in {path.relative_to(PROJECT_ROOT)}")
            continue
        actual = read_csv(path)
        expected = string_rows(rows, fields)
        if actual != expected:
            differences.append(
                f"content mismatch in {path.relative_to(PROJECT_ROOT)} "
                f"(expected {len(expected)} rows, found {len(actual)})"
            )
    return differences


IMMUTABLE_SYLLABUS_FIELDS: dict[str, list[str]] = {
    "vocabulary.csv": [
        "vocab_id", "syllabus_order", "level_min", "level_max", "level_raw", "additional_levels",
        "hanzi", "syllabus_form", "sense_number", "syllabus_pinyin", "syllabus_part_of_speech_zh",
        "source_id", "source_locator",
    ],
    "grammar_points.csv": [
        field for field in CATALOG_FIELDS["grammar_points.csv"] if field not in {"review_status", "notes"}
    ],
    "tasks.csv": CATALOG_FIELDS["tasks.csv"],
    "task_scenarios.csv": CATALOG_FIELDS["task_scenarios.csv"],
    "task_capabilities.csv": CATALOG_FIELDS["task_capabilities.csv"],
    "topics.csv": CATALOG_FIELDS["topics.csv"],
    "hanzi.csv": [
        field for field in CATALOG_FIELDS["hanzi.csv"] if field not in {"curation_status", "notes"}
    ],
}


def check_syllabus_contract(syllabus: dict[str, list[dict[str, Any]]]) -> list[str]:
    """Compare only immutable official-source fields, never mutable curation overlays."""
    differences = []
    for name, fields in IMMUTABLE_SYLLABUS_FIELDS.items():
        path = csv_path(name)
        if not path.exists():
            differences.append(f"missing {path.relative_to(PROJECT_ROOT)}")
            continue
        committed = read_csv(path)
        imported = syllabus[name]
        if len(committed) != len(imported):
            differences.append(f"official row count mismatch in {name}: {len(committed)} != {len(imported)}")
            continue
        for index, (actual, expected) in enumerate(zip(committed, imported), start=1):
            for field in fields:
                if str(actual.get(field, "")) != str(expected.get(field, "")):
                    differences.append(f"official field drift in {name} row {index} field {field}")
                    break
            if differences and differences[-1].startswith(f"official field drift in {name}"):
                break
    return differences


def write_tables(tables: dict[str, list[dict[str, Any]]], *, force: bool) -> None:
    existing = [csv_path(name) for name in tables if csv_path(name).exists()]
    if existing and not force:
        preview = ", ".join(path.name for path in existing[:5])
        raise FileExistsError(f"Catalog already exists ({preview}); pass --force to overwrite it")
    for name, rows in tables.items():
        fields = CATALOG_FIELDS.get(name) or PRODUCT_FIELDS[name]
        write_csv(csv_path(name), fields, rows)


def table_summary(tables: dict[str, list[dict[str, Any]]]) -> dict[str, int]:
    return {name: len(rows) for name, rows in sorted(tables.items())}


def main(argv: list[str]) -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    action = parser.add_mutually_exclusive_group()
    action.add_argument(
        "--check", action="store_true",
        help="Validate immutable syllabus fields without comparing mutable curation data (default).",
    )
    action.add_argument(
        "--compare-catalog", action="store_true",
        help="Compare every table to a fresh one-time migration (expected to fail after curation).",
    )
    action.add_argument("--write", action="store_true", help="Write the imported CSV catalog.")
    parser.add_argument("--force", action="store_true", help="Allow --write to replace existing CSVs.")
    args = parser.parse_args(argv)

    try:
        if args.write:
            tables = generate_tables()
            write_tables(tables, force=args.force)
            print(json.dumps({"status": "written", "counts": table_summary(tables)}, indent=2))
            return 0
        if args.compare_catalog:
            tables = generate_tables()
            differences = check_tables(tables)
            counts = table_summary(tables)
        else:
            syllabus = parse_all()
            differences = check_syllabus_contract(syllabus)
            counts = table_summary(syllabus)
        if differences:
            print(json.dumps({"status": "different", "differences": differences}, indent=2))
            return 1
        print(json.dumps({"status": "ok", "counts": counts}, indent=2))
        return 0
    except Exception as error:  # fail closed with one actionable message
        print(f"bootstrap_catalog: {error}", file=sys.stderr)
        return 2


if __name__ == "__main__":
    raise SystemExit(main(sys.argv[1:]))
