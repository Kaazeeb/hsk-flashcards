#!/usr/bin/env python3
"""Validate the language catalog and report linguistic alignment/backlog metadata."""

from __future__ import annotations

import argparse
import csv
import json
import math
import re
import statistics
import sys
from collections import Counter, defaultdict
from datetime import date
from pathlib import Path
from typing import Any

from catalog_io import (
    ALL_TABLE_FIELDS,
    CATALOG_FIELDS,
    CATALOG_DIR,
    PRODUCT_DIR,
    PROJECT_ROOT,
    REPORT_DIR,
    VALID_STATUSES,
    csv_path,
    load_runtime_cards,
    pipe_split,
    read_csv,
    row_hash,
    sha256_file,
    truthy,
    write_csv,
)
from syllabus_parser import (
    EXPECTED_CAPABILITY_COUNTS,
    EXPECTED_GRAMMAR_COUNTS,
    EXPECTED_RECOGNITION_COUNTS,
    EXPECTED_TASK_COUNTS,
    EXPECTED_TOPIC_COUNTS,
    EXPECTED_VOCAB_COUNTS,
    EXPECTED_WRITING_COUNTS,
)
from grammar_study import (
    authorized_vocabulary_exception_occurrences,
    validate_grammar_study,
    write_grammar_reports,
)

PRIMARY_KEYS: dict[str, tuple[str, ...]] = {
    "sources.csv": ("source_id",),
    "vocabulary.csv": ("vocab_id",),
    "vocabulary_translations.csv": ("vocab_id", "locale"),
    "grammar_points.csv": ("grammar_point_id",),
    "grammar_point_elements.csv": ("grammar_element_id",),
    "grammar_lessons.csv": ("grammar_lesson_id",),
    "grammar_lesson_points.csv": ("grammar_lesson_id", "grammar_point_id"),
    "grammar_lesson_elements.csv": ("grammar_lesson_id", "grammar_element_id"),
    "grammar_lesson_notes.csv": ("grammar_note_id",),
    "grammar_lesson_patterns.csv": ("grammar_pattern_id",),
    "grammar_lesson_examples.csv": ("grammar_example_id",),
    "grammar_example_points.csv": ("grammar_example_id", "grammar_element_id"),
    "grammar_example_targets.csv": ("grammar_target_id",),
    "grammar_vocabulary_exceptions.csv": ("grammar_vocab_exception_id",),
    "tasks.csv": ("task_id",),
    "task_scenarios.csv": ("scenario_id",),
    "task_capabilities.csv": ("task_id", "capability_number"),
    "topics.csv": ("topic_id",),
    "hanzi.csv": ("hanzi_id",),
    "hanzi_readings.csv": ("reading_id",),
    "sentences.csv": ("sentence_id",),
    "sentence_utterances.csv": ("sentence_id", "turn_order"),
    "sentence_translations.csv": ("sentence_id", "locale"),
    "sentence_utterance_translations.csv": ("sentence_id", "turn_order", "locale"),
    "sentence_vocabulary.csv": ("sentence_id", "position"),
    "sentence_grammar.csv": ("sentence_id", "position"),
    "measure_word_sets.csv": ("measure_word_id",),
    "classifier_usages.csv": ("usage_id",),
    "coverage_exceptions.csv": ("exception_id",),
    "reviews.csv": ("review_id",),
    "issues.csv": ("issue_id",),
    "waivers.csv": ("waiver_id",),
    "vocabulary_cards.csv": ("runtime_order",),
    "sentence_cards.csv": ("runtime_order",),
    "hanzi_cards.csv": ("runtime_order",),
    "measure_word_cards.csv": ("runtime_order",),
    "grammar_page_lessons.csv": ("grammar_lesson_id",),
}

REQUIRED_FIELDS: dict[str, tuple[str, ...]] = {
    "sources.csv": ("source_id", "source_kind", "path", "sha256"),
    "vocabulary.csv": ("vocab_id", "syllabus_order", "level_min", "level_max", "hanzi",
                       "syllabus_form", "syllabus_pinyin", "pinyin", "source_id"),
    "vocabulary_translations.csv": ("vocab_id", "locale", "text", "review_status"),
    "grammar_points.csv": ("grammar_point_id", "level_min", "row_order", "category_zh", "source_id"),
    "grammar_point_elements.csv": (
        "grammar_element_id", "grammar_point_id", "element_order", "element_kind",
        "learner_gloss_en", "review_status", "basis_source_id", "content_origin",
    ),
    "grammar_lessons.csv": (
        "grammar_lesson_id", "level_introduced", "lesson_kind", "title_en", "summary_en",
        "display_group_en", "display_group_basis", "register", "review_status",
        "basis_source_id", "content_origin",
    ),
    "grammar_lesson_points.csv": (
        "grammar_lesson_id", "grammar_point_id", "relation_role", "relation_order",
        "review_status",
    ),
    "grammar_lesson_elements.csv": (
        "grammar_lesson_id", "grammar_element_id", "relation_role", "relation_order",
        "review_status",
    ),
    "grammar_lesson_notes.csv": (
        "grammar_note_id", "grammar_lesson_id", "note_order", "note_kind", "text_en",
        "review_status",
    ),
    "grammar_lesson_patterns.csv": (
        "grammar_pattern_id", "grammar_lesson_id", "pattern_order",
        "label_en", "pattern", "formation_en", "usage_en", "review_status",
    ),
    "grammar_lesson_examples.csv": (
        "grammar_example_id", "grammar_lesson_id", "sentence_id", "example_order",
        "example_kind", "review_status",
    ),
    "grammar_example_points.csv": (
        "grammar_example_id", "grammar_point_id", "grammar_element_id",
        "demonstration_order", "analysis_en", "review_status",
    ),
    "grammar_example_targets.csv": (
        "grammar_target_id", "grammar_example_id", "grammar_element_id", "target_order",
        "target_role", "target_text_zh", "occurrence_number", "review_status",
    ),
    "grammar_vocabulary_exceptions.csv": (
        "grammar_vocab_exception_id", "grammar_point_id", "surface_form", "level",
        "required_target_role", "reason", "authorization", "review_status",
    ),
    "tasks.csv": ("task_id", "level_min", "task_number", "title_zh", "title_en"),
    "task_scenarios.csv": ("scenario_id", "level_min", "scenario_order", "title_zh", "title_en"),
    "task_capabilities.csv": ("task_id", "capability_number", "statement_zh", "statement_en"),
    "topics.csv": ("topic_id", "level_min", "row_order", "topic_l3_zh", "topic_l3_en"),
    "hanzi.csv": ("hanzi_id", "hanzi", "recognition_level_min", "source_id"),
    "hanzi_readings.csv": ("reading_id", "hanzi_id", "pinyin", "pinyin_numeric",
                           "meaning_en", "stroke_sequence", "review_status"),
    "sentences.csv": ("sentence_id", "level", "full_zh", "curation_status",
                      "linguistic_review_status"),
    "sentence_utterances.csv": ("sentence_id", "turn_order", "role", "zh_text", "review_status"),
    "sentence_translations.csv": ("sentence_id", "locale", "text", "review_status"),
    "sentence_utterance_translations.csv": ("sentence_id", "turn_order", "locale", "text", "review_status"),
    "sentence_vocabulary.csv": ("sentence_id", "position", "surface_form", "resolution_status",
                                "coverage_type", "review_status"),
    "sentence_grammar.csv": ("sentence_id", "position", "mapping_status", "review_status"),
    "measure_word_sets.csv": ("measure_word_id", "level", "headword_vocab_id", "headword_hanzi",
                              "pinyin", "meaning_en", "review_status"),
    "classifier_usages.csv": ("usage_id", "measure_word_id", "usage_order", "classifier_hanzi",
                              "classifier_pinyin_numeric", "review_status"),
    "coverage_exceptions.csv": ("exception_id", "vocab_id", "surface_form", "coverage_type",
                                "reason", "review_status"),
    "vocabulary_cards.csv": ("runtime_order", "vocab_id", "legacy_storage_key"),
    "sentence_cards.csv": ("runtime_order", "deck_order", "card_id", "sentence_id", "active",
                           "direction", "deck_id", "deck_name"),
    "hanzi_cards.csv": ("runtime_order", "card_id", "reading_id", "level"),
    "measure_word_cards.csv": ("runtime_order", "card_id", "measure_word_id"),
    "grammar_page_lessons.csv": ("grammar_lesson_id", "active", "level_display_order"),
    "reviews.csv": ("review_id", "entity_type", "entity_id", "content_hash", "to_status",
                    "reviewer", "reviewer_type", "reviewed_at"),
    "issues.csv": ("issue_id", "severity", "entity_type", "entity_id", "rule_id", "status",
                   "summary", "details", "created_at"),
    "waivers.csv": ("waiver_id", "rule_id", "entity_type", "entity_id", "rationale",
                    "approved_by", "approved_at", "expires_at"),
}

FOREIGN_KEYS: list[tuple[str, str, str, str, bool]] = [
    ("vocabulary_translations.csv", "vocab_id", "vocabulary.csv", "vocab_id", False),
    ("grammar_point_elements.csv", "grammar_point_id", "grammar_points.csv", "grammar_point_id", False),
    ("grammar_point_elements.csv", "basis_source_id", "sources.csv", "source_id", False),
    ("grammar_lessons.csv", "basis_source_id", "sources.csv", "source_id", False),
    ("grammar_lesson_points.csv", "grammar_lesson_id", "grammar_lessons.csv", "grammar_lesson_id", False),
    ("grammar_lesson_points.csv", "grammar_point_id", "grammar_points.csv", "grammar_point_id", False),
    ("grammar_lesson_elements.csv", "grammar_lesson_id", "grammar_lessons.csv", "grammar_lesson_id", False),
    ("grammar_lesson_elements.csv", "grammar_element_id", "grammar_point_elements.csv", "grammar_element_id", False),
    ("grammar_lesson_notes.csv", "grammar_lesson_id", "grammar_lessons.csv", "grammar_lesson_id", False),
    ("grammar_lesson_notes.csv", "grammar_element_id", "grammar_point_elements.csv", "grammar_element_id", True),
    ("grammar_lesson_patterns.csv", "grammar_lesson_id", "grammar_lessons.csv", "grammar_lesson_id", False),
    ("grammar_lesson_patterns.csv", "grammar_element_id", "grammar_point_elements.csv", "grammar_element_id", True),
    ("grammar_lesson_examples.csv", "grammar_lesson_id", "grammar_lessons.csv", "grammar_lesson_id", False),
    ("grammar_lesson_examples.csv", "grammar_pattern_id", "grammar_lesson_patterns.csv", "grammar_pattern_id", True),
    ("grammar_lesson_examples.csv", "sentence_id", "sentences.csv", "sentence_id", False),
    ("grammar_example_points.csv", "grammar_example_id", "grammar_lesson_examples.csv", "grammar_example_id", False),
    ("grammar_example_points.csv", "grammar_point_id", "grammar_points.csv", "grammar_point_id", False),
    ("grammar_example_points.csv", "grammar_element_id", "grammar_point_elements.csv", "grammar_element_id", False),
    ("grammar_example_targets.csv", "grammar_example_id", "grammar_lesson_examples.csv", "grammar_example_id", False),
    ("grammar_example_targets.csv", "grammar_element_id", "grammar_point_elements.csv", "grammar_element_id", False),
    ("grammar_vocabulary_exceptions.csv", "grammar_point_id", "grammar_points.csv", "grammar_point_id", False),
    ("task_capabilities.csv", "task_id", "tasks.csv", "task_id", False),
    ("tasks.csv", "scenario_id", "task_scenarios.csv", "scenario_id", True),
    ("hanzi_readings.csv", "hanzi_id", "hanzi.csv", "hanzi_id", False),
    ("sentence_utterances.csv", "sentence_id", "sentences.csv", "sentence_id", False),
    ("sentence_translations.csv", "sentence_id", "sentences.csv", "sentence_id", False),
    ("sentence_utterance_translations.csv", "sentence_id", "sentences.csv", "sentence_id", False),
    ("sentence_vocabulary.csv", "sentence_id", "sentences.csv", "sentence_id", False),
    ("sentence_vocabulary.csv", "vocab_id", "vocabulary.csv", "vocab_id", True),
    ("sentence_grammar.csv", "sentence_id", "sentences.csv", "sentence_id", False),
    ("sentence_grammar.csv", "grammar_point_id", "grammar_points.csv", "grammar_point_id", True),
    ("measure_word_sets.csv", "headword_vocab_id", "vocabulary.csv", "vocab_id", False),
    ("classifier_usages.csv", "measure_word_id", "measure_word_sets.csv", "measure_word_id", False),
    ("coverage_exceptions.csv", "vocab_id", "vocabulary.csv", "vocab_id", False),
    ("vocabulary_cards.csv", "vocab_id", "vocabulary.csv", "vocab_id", False),
    ("sentence_cards.csv", "sentence_id", "sentences.csv", "sentence_id", False),
    ("hanzi_cards.csv", "reading_id", "hanzi_readings.csv", "reading_id", False),
    ("measure_word_cards.csv", "measure_word_id", "measure_word_sets.csv", "measure_word_id", False),
    ("grammar_page_lessons.csv", "grammar_lesson_id", "grammar_lessons.csv", "grammar_lesson_id", False),
    ("sentences.csv", "topic_id", "topics.csv", "topic_id", True),
]
for _table_name, _fields in CATALOG_FIELDS.items():
    if _table_name != "sources.csv" and "source_id" in _fields:
        FOREIGN_KEYS.append((_table_name, "source_id", "sources.csv", "source_id", False))


def load_tables() -> dict[str, list[dict[str, str]]]:
    return {name: read_csv(csv_path(name)) for name in ALL_TABLE_FIELDS}


def issue(rule: str, message: str, *, table: str = "", entity_id: str = "") -> dict[str, str]:
    return {"rule": rule, "table": table, "entity_id": entity_id, "message": message}


def validate_headers_and_rows(tables: dict[str, list[dict[str, str]]]) -> list[dict[str, str]]:
    errors: list[dict[str, str]] = []
    contract = json.loads((PROJECT_ROOT / "language" / "schemas" / "tables.json").read_text(encoding="utf-8"))
    enums = contract.get("enums", {})
    for name, expected_fields in ALL_TABLE_FIELDS.items():
        path = csv_path(name)
        with path.open("r", encoding="utf-8", newline="") as handle:
            reader = csv.DictReader(handle)
            actual_fields = reader.fieldnames or []
        if actual_fields != expected_fields:
            errors.append(issue("schema_header", f"Expected {expected_fields}, found {actual_fields}", table=name))
            continue
        required = REQUIRED_FIELDS.get(name, ())
        seen_keys: set[tuple[str, ...]] = set()
        key_fields = PRIMARY_KEYS[name]
        for row_number, row in enumerate(tables[name], start=2):
            entity_key = tuple(row.get(field, "") for field in key_fields)
            entity_id = "|".join(entity_key)
            if any(not value for value in entity_key):
                errors.append(issue("primary_key", f"Blank primary key at CSV row {row_number}", table=name))
            elif entity_key in seen_keys:
                errors.append(issue("primary_key", f"Duplicate primary key {entity_key}", table=name, entity_id=entity_id))
            seen_keys.add(entity_key)
            for field in required:
                if not row.get(field, ""):
                    errors.append(issue("required_field", f"Blank required field {field}", table=name, entity_id=entity_id))
            for field, value in row.items():
                if not value:
                    continue
                field_type = contract["tables"][name]["types"][field]
                if field_type == "integer":
                    try:
                        int(value)
                    except ValueError:
                        errors.append(issue("field_type", f"{field} must be an integer, found {value!r}",
                                            table=name, entity_id=entity_id))
                elif field_type == "boolean" and value not in {"true", "false"}:
                    errors.append(issue("field_type", f"{field} must be true or false, found {value!r}",
                                        table=name, entity_id=entity_id))
                elif field_type == "editorial_status" and value not in VALID_STATUSES:
                    errors.append(issue("status_enum", f"Invalid {field}={value!r}", table=name, entity_id=entity_id))
                elif field_type in enums and value not in enums[field_type]:
                    errors.append(issue("field_enum", f"Invalid {field}={value!r}", table=name, entity_id=entity_id))
    return errors


def validate_foreign_keys(tables: dict[str, list[dict[str, str]]]) -> list[dict[str, str]]:
    errors = []
    indexes: dict[tuple[str, str], set[str]] = {}
    for _from_table, _from_field, to_table, to_field, _optional in FOREIGN_KEYS:
        indexes[(to_table, to_field)] = {row[to_field] for row in tables[to_table]}
    for from_table, from_field, to_table, to_field, optional in FOREIGN_KEYS:
        target = indexes[(to_table, to_field)]
        for row in tables[from_table]:
            value = row[from_field]
            if not value and optional:
                continue
            if value not in target:
                key = "|".join(row.get(field, "") for field in PRIMARY_KEYS[from_table])
                errors.append(issue(
                    "foreign_key", f"{from_field}={value!r} does not reference {to_table}.{to_field}",
                    table=from_table, entity_id=key,
                ))
    grammar_ids = {row["grammar_point_id"] for row in tables["grammar_points.csv"]}
    for row in tables["sentence_grammar.csv"]:
        for candidate in pipe_split(row["candidate_grammar_point_ids"]):
            if candidate not in grammar_ids:
                errors.append(issue("grammar_candidate_fk", f"Unknown grammar candidate {candidate}",
                                    table="sentence_grammar.csv", entity_id=row["sentence_id"]))
    utterance_keys = {
        (row["sentence_id"], row["turn_order"]) for row in tables["sentence_utterances.csv"]
    }
    for row in tables["sentence_utterance_translations.csv"]:
        if (row["sentence_id"], row["turn_order"]) not in utterance_keys:
            errors.append(issue(
                "utterance_translation_fk", "Translation references a missing sentence utterance",
                table="sentence_utterance_translations.csv",
                entity_id=f"{row['sentence_id']}|{row['turn_order']}|{row['locale']}",
            ))
    return errors


def contiguous(values: list[int], *, start: int = 1) -> bool:
    return sorted(values) == list(range(start, start + len(values)))


def validate_official_contract_and_domains(
    tables: dict[str, list[dict[str, str]]]
) -> list[dict[str, str]]:
    errors: list[dict[str, str]] = []

    vocabulary = tables["vocabulary.csv"]
    orders = [int(row["syllabus_order"]) for row in vocabulary]
    if len(vocabulary) != 11000 or orders != list(range(1, 11001)):
        errors.append(issue("syllabus_vocabulary_order", "Official vocabulary must contain ordered rows 1-11000",
                            table="vocabulary.csv"))
    vocab_counts = Counter((int(row["level_min"]), int(row["level_max"])) for row in vocabulary)
    if vocab_counts != Counter(EXPECTED_VOCAB_COUNTS):
        errors.append(issue("syllabus_vocabulary_counts", f"Unexpected level counts: {dict(vocab_counts)}",
                            table="vocabulary.csv"))

    def validate_grouped_rows(
        table: str, expected_counts: dict[tuple[int, int], int], order_field: str
    ) -> None:
        grouped: dict[tuple[int, int], list[int]] = defaultdict(list)
        for row in tables[table]:
            grouped[(int(row["level_min"]), int(row["level_max"]))].append(int(row[order_field]))
        if {band: len(values) for band, values in grouped.items()} != expected_counts:
            errors.append(issue("syllabus_counts", f"Unexpected band counts in {table}", table=table))
        for band, values in grouped.items():
            if not contiguous(values):
                errors.append(issue("syllabus_order", f"Non-contiguous {order_field} for band {band}", table=table))

    validate_grouped_rows("grammar_points.csv", EXPECTED_GRAMMAR_COUNTS, "row_order")
    validate_grouped_rows("topics.csv", EXPECTED_TOPIC_COUNTS, "row_order")
    validate_grouped_rows("tasks.csv", EXPECTED_TASK_COUNTS, "task_number")
    scenarios = tables["task_scenarios.csv"]
    if len(scenarios) != 3 or [int(row["scenario_order"]) for row in scenarios] != [1, 2, 3]:
        errors.append(issue("syllabus_task_scenarios", "Expected the three ordered Level 7-9 scenarios",
                            table="task_scenarios.csv"))
    for row in scenarios:
        if (int(row["level_min"]), int(row["level_max"])) != (7, 9):
            errors.append(issue(
                "task_scenario_level_domain", "Official task scenarios must use the Level 7-9 band",
                table="task_scenarios.csv", entity_id=row["scenario_id"],
            ))

    task_bands = {
        row["task_id"]: (int(row["level_min"]), int(row["level_max"])) for row in tables["tasks.csv"]
    }
    capability_counts: Counter[tuple[int, int]] = Counter()
    capabilities_by_task: dict[str, list[int]] = defaultdict(list)
    for row in tables["task_capabilities.csv"]:
        if row["task_id"] in task_bands:
            capability_counts[task_bands[row["task_id"]]] += 1
        capabilities_by_task[row["task_id"]].append(int(row["capability_number"]))
    if capability_counts != Counter(EXPECTED_CAPABILITY_COUNTS):
        errors.append(issue("syllabus_capability_counts", "Unexpected task capability counts",
                            table="task_capabilities.csv"))
    for task_id, values in capabilities_by_task.items():
        if not contiguous(values):
            errors.append(issue("syllabus_order", "Non-contiguous capability numbers",
                                table="task_capabilities.csv", entity_id=task_id))

    recognition_counts = Counter(
        (int(row["recognition_level_min"]), int(row["recognition_level_max"]))
        for row in tables["hanzi.csv"]
    )
    writing_counts = Counter(
        (int(row["writing_level_min"]), int(row["writing_level_max"]))
        for row in tables["hanzi.csv"] if row["writing_level_min"]
    )
    if recognition_counts != Counter(EXPECTED_RECOGNITION_COUNTS):
        errors.append(issue("syllabus_hanzi_counts", "Unexpected recognition-hanzi counts", table="hanzi.csv"))
    if writing_counts != Counter(EXPECTED_WRITING_COUNTS):
        errors.append(issue("syllabus_hanzi_counts", "Unexpected writing-hanzi counts", table="hanzi.csv"))
    for row in tables["hanzi.csv"]:
        if len(row["hanzi"]) != 1 or row["hanzi_id"] != f"hanzi_{ord(row['hanzi']):x}":
            errors.append(issue("hanzi_identity", "hanzi_id must match the single character codepoint",
                                table="hanzi.csv", entity_id=row["hanzi_id"]))

    for row in tables["sentences.csv"]:
        if int(row["level"]) not in {1, 2, 3, 4, 5, 6, 7}:
            errors.append(issue("sentence_level_domain", "Sentence level must be 1-6 or 7 for the 7-9 band",
                                table="sentences.csv", entity_id=row["sentence_id"]))

    for row in tables["measure_word_sets.csv"]:
        if int(row["level"]) not in {1, 2, 3, 4, 5, 6, 7}:
            errors.append(issue(
                "measure_word_level_domain", "Measure-word level must be 1-6 or 7 for the 7-9 band",
                table="measure_word_sets.csv", entity_id=row["measure_word_id"],
            ))

    for row in tables["hanzi_cards.csv"]:
        if int(row["level"]) not in {1, 2, 3, 4, 5, 6, 7}:
            errors.append(issue(
                "hanzi_card_level_domain", "Hanzi-card level must be 1-6 or 7 for the 7-9 band",
                table="hanzi_cards.csv", entity_id=row["card_id"],
            ))

    for table in ("vocabulary_cards.csv", "sentence_cards.csv", "hanzi_cards.csv", "measure_word_cards.csv"):
        rows = tables[table]
        orders = [int(row["runtime_order"]) for row in rows]
        if not contiguous(orders):
            errors.append(issue("runtime_order", "runtime_order must be contiguous from 1", table=table))
    sentence_deck_orders: dict[str, list[int]] = defaultdict(list)
    for row in sorted(tables["sentence_cards.csv"], key=lambda item: int(item["runtime_order"])):
        sentence_deck_orders[row["deck_id"]].append(int(row["deck_order"]))
    for deck_id, orders in sentence_deck_orders.items():
        if orders != list(range(1, len(orders) + 1)):
            errors.append(issue(
                "deck_order", "Historical deck_order must be contiguous when tombstones are included",
                table="sentence_cards.csv", entity_id=deck_id,
            ))
    for field in ("card_id",):
        for table in ("sentence_cards.csv", "hanzi_cards.csv", "measure_word_cards.csv"):
            values = [row[field] for row in tables[table]]
            if len(values) != len(set(values)):
                errors.append(issue("runtime_identity", f"Duplicate {field}", table=table))
    return errors


def validate_review_governance(tables: dict[str, list[dict[str, str]]]) -> list[dict[str, str]]:
    errors: list[dict[str, str]] = []
    specs = [
        ("vocabulary.csv", "curation_status", "vocabulary", lambda row: row["vocab_id"]),
        ("vocabulary.csv", "example_review_status", "vocabulary_example", lambda row: row["vocab_id"]),
        ("vocabulary_translations.csv", "review_status", "vocabulary_translation",
         lambda row: f"{row['vocab_id']}:{row['locale']}"),
        ("grammar_points.csv", "review_status", "grammar_point", lambda row: row["grammar_point_id"]),
        ("grammar_point_elements.csv", "review_status", "grammar_point_element",
         lambda row: row["grammar_element_id"]),
        ("grammar_lessons.csv", "review_status", "grammar_lesson",
         lambda row: row["grammar_lesson_id"]),
        ("grammar_lesson_points.csv", "review_status", "grammar_lesson_point",
         lambda row: f"{row['grammar_lesson_id']}:{row['grammar_point_id']}"),
        ("grammar_lesson_elements.csv", "review_status", "grammar_lesson_element",
         lambda row: f"{row['grammar_lesson_id']}:{row['grammar_element_id']}"),
        ("grammar_lesson_notes.csv", "review_status", "grammar_lesson_note",
         lambda row: row["grammar_note_id"]),
        ("grammar_lesson_patterns.csv", "review_status", "grammar_lesson_pattern",
         lambda row: row["grammar_pattern_id"]),
        ("grammar_lesson_examples.csv", "review_status", "grammar_lesson_example",
         lambda row: row["grammar_example_id"]),
        ("grammar_example_points.csv", "review_status", "grammar_example_point",
         lambda row: f"{row['grammar_example_id']}:{row['grammar_element_id']}"),
        ("grammar_example_targets.csv", "review_status", "grammar_example_target",
         lambda row: row["grammar_target_id"]),
        ("grammar_vocabulary_exceptions.csv", "review_status", "grammar_vocabulary_exception",
         lambda row: row["grammar_vocab_exception_id"]),
        ("hanzi.csv", "curation_status", "hanzi", lambda row: row["hanzi_id"]),
        ("hanzi_readings.csv", "review_status", "hanzi_reading", lambda row: row["reading_id"]),
        ("sentences.csv", "curation_status", "sentence", lambda row: row["sentence_id"]),
        ("sentences.csv", "linguistic_review_status", "sentence", lambda row: row["sentence_id"]),
        ("sentence_utterances.csv", "review_status", "sentence_utterance",
         lambda row: f"{row['sentence_id']}:{row['turn_order']}"),
        ("sentence_translations.csv", "review_status", "sentence_translation",
         lambda row: f"{row['sentence_id']}:{row['locale']}"),
        ("sentence_utterance_translations.csv", "review_status", "sentence_utterance_translation",
         lambda row: f"{row['sentence_id']}:{row['turn_order']}:{row['locale']}"),
        ("sentence_vocabulary.csv", "review_status", "sentence_vocabulary",
         lambda row: f"{row['sentence_id']}:{row['position']}"),
        ("sentence_grammar.csv", "review_status", "sentence_grammar",
         lambda row: f"{row['sentence_id']}:{row['position']}"),
        ("measure_word_sets.csv", "review_status", "measure_word_set", lambda row: row["measure_word_id"]),
        ("classifier_usages.csv", "review_status", "classifier_usage", lambda row: row["usage_id"]),
        ("coverage_exceptions.csv", "review_status", "coverage_exception", lambda row: row["exception_id"]),
    ]
    entities: dict[tuple[str, str], tuple[str, dict[str, str]]] = {}
    status_fields = {"review_status", "curation_status", "linguistic_review_status", "example_review_status"}
    for table, status_field, entity_type, id_builder in specs:
        for row in tables[table]:
            entity_id = id_builder(row)
            entities[(entity_type, entity_id)] = (table, row)
            if row.get(status_field) != "approved":
                continue
            expected_hash = row_hash(row, exclude=status_fields)
            matches = [
                review for review in tables["reviews.csv"]
                if review["entity_type"] == entity_type
                and review["entity_id"] == entity_id
                and review["to_status"] == "approved"
                and review["content_hash"] == expected_hash
            ]
            if not matches:
                errors.append(issue("approval_evidence", "Approved entity lacks a current matching review event",
                                    table=table, entity_id=entity_id))
    for review in tables["reviews.csv"]:
        key = (review["entity_type"], review["entity_id"])
        if key not in entities:
            errors.append(issue("review_entity", "Review references an unknown entity",
                                table="reviews.csv", entity_id=review["review_id"]))
            continue
        if not re.fullmatch(r"[0-9a-f]{64}", review["content_hash"]):
            errors.append(issue("review_hash", "content_hash must be a lowercase SHA-256 digest",
                                table="reviews.csv", entity_id=review["review_id"]))
    return errors


def validate_sources(tables: dict[str, list[dict[str, str]]]) -> list[dict[str, str]]:
    errors = []
    for row in tables["sources.csv"]:
        relative = row["path"]
        if relative.endswith("/"):
            continue
        path = PROJECT_ROOT / relative
        if not path.exists():
            errors.append(issue("source_missing", f"Source file does not exist: {relative}",
                                table="sources.csv", entity_id=row["source_id"]))
        elif sha256_file(path) != row["sha256"]:
            errors.append(issue("source_checksum", f"Source checksum changed: {relative}",
                                table="sources.csv", entity_id=row["source_id"]))
    return errors


def validate_schema_contract() -> list[dict[str, str]]:
    path = PROJECT_ROOT / "language" / "schemas" / "tables.json"
    if not path.exists():
        return [issue("schema_contract", "language/schemas/tables.json is missing")]
    try:
        contract = json.loads(path.read_text(encoding="utf-8"))
    except json.JSONDecodeError as error:
        return [issue("schema_contract", f"Invalid schema JSON: {error}")]
    errors = []
    contract_tables = contract.get("tables", {})
    if set(contract_tables) != set(ALL_TABLE_FIELDS):
        errors.append(issue("schema_contract", "Schema table set differs from implemented table set"))
        return errors
    for name, fields in ALL_TABLE_FIELDS.items():
        entry = contract_tables[name]
        if entry.get("fields") != fields:
            errors.append(issue("schema_contract", "Field list differs from implementation", table=name))
        if entry.get("primary_key") != list(PRIMARY_KEYS[name]):
            errors.append(issue("schema_contract", "Primary key differs from implementation", table=name))
        if entry.get("required") != list(REQUIRED_FIELDS.get(name, ())):
            errors.append(issue("schema_contract", "Required fields differ from implementation", table=name))
        if set(entry.get("types", {})) != set(fields):
            errors.append(issue("schema_contract", "Type map does not cover every field", table=name))
    return errors


def validate_runtime_orders(table: str, rows: list[dict[str, str]]) -> list[dict[str, str]]:
    errors = []
    ordered = sorted(rows, key=lambda row: int(row["runtime_order"]))
    actual = [int(row["runtime_order"]) for row in ordered]
    expected = list(range(1, len(rows) + 1))
    if actual != expected:
        errors.append(issue("runtime_order", "runtime_order must be unique and contiguous from 1", table=table))
    return errors


def validate_compatibility(
    tables: dict[str, list[dict[str, str]]]
) -> tuple[list[dict[str, str]], dict[str, Any]]:
    errors = []
    runtime = load_runtime_cards()
    vocab = {row["vocab_id"]: row for row in tables["vocabulary.csv"]}
    sentences = {row["sentence_id"]: row for row in tables["sentences.csv"]}

    for name in ("vocabulary_cards.csv", "sentence_cards.csv", "hanzi_cards.csv", "measure_word_cards.csv"):
        errors.extend(validate_runtime_orders(name, tables[name]))

    vocab_bindings = sorted(tables["vocabulary_cards.csv"], key=lambda row: int(row["runtime_order"]))
    if len(vocab_bindings) != len(runtime["vocabulary"]):
        errors.append(issue("compatibility_count", "Vocabulary binding/runtime count mismatch", table="vocabulary_cards.csv"))
    for index, (binding, card) in enumerate(zip(vocab_bindings, runtime["vocabulary"]), start=1):
        if binding["legacy_storage_key"] != f"idx:{index - 1}":
            errors.append(issue("legacy_storage_key", f"Expected idx:{index - 1}", table="vocabulary_cards.csv",
                                entity_id=binding["vocab_id"]))
        if vocab[binding["vocab_id"]]["hanzi"] != str(card.get("hanzi", "")):
            errors.append(issue("compatibility_identity", f"Vocabulary surface differs at runtime order {index}",
                                table="vocabulary_cards.csv", entity_id=binding["vocab_id"]))

    historical_sentence_bindings = sorted(
        tables["sentence_cards.csv"], key=lambda row: int(row["runtime_order"])
    )
    sentence_bindings = [row for row in historical_sentence_bindings if row["active"] == "true"]
    historical_deck_counts = Counter(row["deck_id"] for row in historical_sentence_bindings)
    active_deck_counts = Counter(row["deck_id"] for row in sentence_bindings)
    if len(sentence_bindings) != len(runtime["sentences"]):
        errors.append(issue("compatibility_count", "Sentence binding/runtime count mismatch", table="sentence_cards.csv"))
    for binding, card in zip(sentence_bindings, runtime["sentences"]):
        expected_fields = {
            "card_id": str(card.get("id", "")), "direction": str(card.get("direction", "")),
            "deck_id": str(card.get("deckId", "")), "deck_name": str(card.get("deckName", "")),
            "tags": "|".join(card.get("tags") or []),
        }
        for field, expected in expected_fields.items():
            if binding[field] != expected:
                errors.append(issue("compatibility_binding", f"{field} changed from {expected!r} to {binding[field]!r}",
                                    table="sentence_cards.csv", entity_id=binding["card_id"]))
        if int(card.get("visibilityIndex", -1)) != int(binding["deck_order"]) - 1:
            errors.append(issue("visibility_index", "Runtime visibility index differs from historical deck_order",
                                table="sentence_cards.csv", entity_id=binding["card_id"]))
        if binding["sentence_id"] not in sentences:
            errors.append(issue("compatibility_binding", "Binding references missing sentence", table="sentence_cards.csv",
                                entity_id=binding["card_id"]))

    hanzi_bindings = sorted(tables["hanzi_cards.csv"], key=lambda row: int(row["runtime_order"]))
    if len(hanzi_bindings) != len(runtime["hanzi"]):
        errors.append(issue("compatibility_count", "Hanzi binding/runtime count mismatch", table="hanzi_cards.csv"))
    for binding, card in zip(hanzi_bindings, runtime["hanzi"]):
        if binding["card_id"] != str(card.get("id", "")) or int(binding["level"]) != int(card.get("level") or 0):
            errors.append(issue("compatibility_binding", "Hanzi ID or legacy level changed", table="hanzi_cards.csv",
                                entity_id=binding["card_id"]))

    measure_bindings = sorted(tables["measure_word_cards.csv"], key=lambda row: int(row["runtime_order"]))
    if len(measure_bindings) != len(runtime["measure_words"]):
        errors.append(issue("compatibility_count", "Measure-word binding/runtime count mismatch",
                            table="measure_word_cards.csv"))
    for binding, card in zip(measure_bindings, runtime["measure_words"]):
        if binding["card_id"] != str(card.get("id", "")):
            errors.append(issue("compatibility_binding", "Measure-word card ID changed",
                                table="measure_word_cards.csv", entity_id=binding["card_id"]))

    runtime_semantic_match = False
    runtime_semantic_differences: list[dict[str, Any]] = []
    try:
        from compile_runtime_catalog import compile_all, check_runtime

        compiled = compile_all(tables)
        runtime_semantic_differences = check_runtime(compiled)
        runtime_semantic_match = not runtime_semantic_differences
    except Exception as error:
        errors.append(issue("catalog_compilability", str(error)))
    summary = {
        "vocabulary_positional_bindings": len(vocab_bindings),
        "sentence_card_bindings": len(sentence_bindings),
        "historical_sentence_card_bindings": len(historical_sentence_bindings),
        "inactive_sentence_card_tombstones": len(historical_sentence_bindings) - len(sentence_bindings),
        "hanzi_card_bindings": len(hanzi_bindings),
        "measure_word_card_bindings": len(measure_bindings),
        "frozen_sentence_decks": dict(sorted(historical_deck_counts.items())),
        "active_sentence_decks": dict(sorted(active_deck_counts.items())),
        "runtime_semantic_match": runtime_semantic_match,
        "runtime_semantic_differences": [
            {key: value for key, value in difference.items() if key not in {"compiled", "runtime"}}
            for difference in runtime_semantic_differences
        ],
    }
    return errors, summary


def validate_linguistic_relations(
    tables: dict[str, list[dict[str, str]]]
) -> tuple[list[dict[str, str]], dict[str, Any]]:
    errors = []
    sentences = {row["sentence_id"]: row for row in tables["sentences.csv"]}
    vocabulary = {row["vocab_id"]: row for row in tables["vocabulary.csv"]}
    grammar = {row["grammar_point_id"]: row for row in tables["grammar_points.csv"]}
    grammar_ids = set(grammar)
    exceptions = {
        (row["vocab_id"], row["surface_form"]): row for row in tables["coverage_exceptions.csv"]
    }
    grammar_vocabulary_exceptions = authorized_vocabulary_exception_occurrences(tables)
    waivers = set()
    for row in tables["waivers.csv"]:
        try:
            active = date.fromisoformat(row["expires_at"]) >= date.today()
        except ValueError:
            active = False
            errors.append(issue("waiver_date", "expires_at must be a nonblank ISO date",
                                table="waivers.csv", entity_id=row["waiver_id"]))
        if active:
            waivers.add((row["rule_id"], row["entity_type"], row["entity_id"]))
        else:
            errors.append(issue("expired_waiver", "Expired waivers do not suppress audit rules",
                                table="waivers.csv", entity_id=row["waiver_id"]))
    resolution_counts = Counter()
    for row in tables["sentence_vocabulary.csv"]:
        resolution_counts[row["resolution_status"]] += 1
        sentence = sentences[row["sentence_id"]]
        surface = row["surface_form"]
        if surface not in sentence["full_zh"]:
            errors.append(issue("surface_presence", f"Tagged surface {surface!r} is absent from full_zh",
                                table="sentence_vocabulary.csv", entity_id=row["sentence_id"]))
        if row["resolution_status"] == "exact" and not row["vocab_id"]:
            errors.append(issue("sense_resolution", "Exact relation has no vocab_id",
                                table="sentence_vocabulary.csv", entity_id=row["sentence_id"]))
        if row["resolution_status"] == "out_of_level":
            errors.append(issue("vocabulary_level", f"Out-of-level tagged surface {surface!r}",
                                table="sentence_vocabulary.csv", entity_id=row["sentence_id"]))
        if row["vocab_id"]:
            vocab = vocabulary[row["vocab_id"]]
            if int(vocab["level_min"]) > int(sentence["level"]) and row["resolution_status"] != "component_only":
                errors.append(issue("vocabulary_level", f"{row['vocab_id']} exceeds sentence level",
                                    table="sentence_vocabulary.csv", entity_id=row["sentence_id"]))
            if vocab["hanzi"] != surface:
                errors.append(issue("sense_surface", f"Surface {surface!r} does not match {row['vocab_id']}",
                                    table="sentence_vocabulary.csv", entity_id=row["sentence_id"]))
        if row["resolution_status"] == "component_only":
            exception = exceptions.get((row["vocab_id"], surface))
            if not exception:
                errors.append(issue("coverage_exception", "component_only link has no matching exception",
                                    table="sentence_vocabulary.csv", entity_id=row["sentence_id"]))
            else:
                try:
                    pattern_matches = bool(re.fullmatch(exception["allowed_surface_pattern"], sentence["full_zh"]))
                except re.error as error:
                    pattern_matches = False
                    errors.append(issue("coverage_exception", f"Invalid allowed_surface_pattern: {error}",
                                        table="coverage_exceptions.csv", entity_id=exception["exception_id"]))
                if not pattern_matches:
                    errors.append(issue("coverage_exception", "Sentence does not match allowed_surface_pattern",
                                        table="sentence_vocabulary.csv", entity_id=row["sentence_id"]))
            if exception and exception["review_status"] not in {"legacy_unreviewed", "approved"}:
                errors.append(issue("coverage_exception", "Coverage exception is not publishable",
                                    table="sentence_vocabulary.csv", entity_id=row["sentence_id"]))

    grammar_counts = Counter(row["mapping_status"] for row in tables["sentence_grammar.csv"])
    for row in tables["sentence_grammar.csv"]:
        if row["review_status"] == "legacy_unreviewed" and not row["legacy_tag"]:
            errors.append(issue(
                "legacy_grammar_tag", "Migrated sentence-grammar rows require their immutable legacy_tag",
                table="sentence_grammar.csv", entity_id=row["sentence_id"],
            ))
        if not row["legacy_tag"] and (
            row["mapping_status"] != "mapped"
            or not row["grammar_point_id"]
            or row["candidate_grammar_point_ids"]
        ):
            errors.append(issue(
                "new_grammar_mapping",
                "A blank legacy_tag is allowed only for a clean mapped grammar_point_id relation",
                table="sentence_grammar.csv", entity_id=row["sentence_id"],
            ))
        if row["mapping_status"] == "mapped" and not row["grammar_point_id"]:
            errors.append(issue(
                "grammar_mapping_status", "mapping_status=mapped requires grammar_point_id",
                table="sentence_grammar.csv", entity_id=row["sentence_id"],
            ))
        if row["review_status"] == "approved" and not row["grammar_point_id"]:
            errors.append(issue("grammar_approval", "Approved grammar link has no grammar_point_id",
                                table="sentence_grammar.csv", entity_id=row["sentence_id"]))
        if row["grammar_point_id"] and row["grammar_point_id"] not in grammar_ids:
            errors.append(issue("grammar_reference", "Unknown grammar_point_id",
                                table="sentence_grammar.csv", entity_id=row["sentence_id"]))
        elif row["grammar_point_id"]:
            sentence_level = int(sentences[row["sentence_id"]]["level"])
            if int(grammar[row["grammar_point_id"]]["level_min"]) > sentence_level:
                errors.append(issue("grammar_level", "Grammar point exceeds the sentence HSK level",
                                    table="sentence_grammar.csv", entity_id=row["sentence_id"]))

    surface_levels: dict[str, int] = {}
    for row in vocabulary.values():
        surface = row["hanzi"]
        surface_levels[surface] = min(int(row["level_min"]), surface_levels.get(surface, 99))
    by_initial: dict[str, list[str]] = defaultdict(list)
    for surface in surface_levels:
        by_initial[surface[0]].append(surface)
    for values in by_initial.values():
        values.sort(key=lambda value: (-len(value), value))

    def segment_span(span: str, level: int, allowed_unlinked: set[str]) -> list[str] | None:
        best: list[list[str] | None] = [None] * (len(span) + 1)
        best[len(span)] = []
        for offset in range(len(span) - 1, -1, -1):
            options = []
            for surface in by_initial.get(span[offset], []):
                end = offset + len(surface)
                if surface_levels[surface] <= level and span.startswith(surface, offset) and best[end] is not None:
                    options.append([surface, *best[end]])
            for surface in sorted(allowed_unlinked, key=lambda value: (-len(value), value)):
                end = offset + len(surface)
                if span.startswith(surface, offset) and best[end] is not None:
                    options.append([surface, *best[end]])
            if options:
                best[offset] = max(options, key=lambda option: (sum(len(token) ** 2 for token in option), -len(option)))
        return best[0]

    sentence_links: dict[str, list[dict[str, str]]] = defaultdict(list)
    for row in tables["sentence_vocabulary.csv"]:
        sentence_links[row["sentence_id"]].append(row)
    untagged_token_claims = 0
    for sentence_id, sentence in sentences.items():
        sentence_level = int(sentence["level"])
        segmented_tokens: list[str] = []
        failed_spans = []
        for match in re.finditer(r"[㐀-鿿]+", sentence["full_zh"]):
            segmented = segment_span(
                match.group(0), sentence_level,
                set(grammar_vocabulary_exceptions.get(sentence_id, Counter())),
            )
            if segmented is None:
                failed_spans.append(match.group(0))
            else:
                segmented_tokens.extend(segmented)
        if failed_spans and (
            "sentence_lexical_segmentation", "sentence", sentence_id
        ) not in waivers:
            errors.append(issue(
                "sentence_lexical_segmentation",
                f"Chinese text cannot be fully segmented with cumulative HSK <= {sentence_level}: {failed_spans}",
                table="sentences.csv", entity_id=sentence_id,
            ))
        exact_links = [
            row for row in sorted(
                sentence_links.get(sentence_id, []), key=lambda item: int(item["position"])
            )
            if row["resolution_status"] == "exact"
        ]
        is_approved = sentence["curation_status"] == "approved" or sentence["linguistic_review_status"] == "approved"
        if is_approved:
            segmented_counts = Counter(segmented_tokens)
            segmented_counts -= grammar_vocabulary_exceptions.get(sentence_id, Counter())
            linked_counts = Counter(row["surface_form"] for row in exact_links)
            missing_counts = segmented_counts - linked_counts
            extra_counts = linked_counts - segmented_counts
            missing = sorted(missing_counts.elements())
            extras = sorted(extra_counts.elements())
            untagged_token_claims += sum(missing_counts.values())
        else:
            linked_surfaces = {
                row["surface_form"] for row in sentence_links.get(sentence_id, [])
            }
            missing = sorted(set(segmented_tokens) - linked_surfaces)
            extras = []
            untagged_token_claims += len(missing)
        if is_approved and missing:
            errors.append(issue("sentence_vocabulary_completeness", f"Approved sentence lacks occurrence links for {missing}",
                                table="sentences.csv", entity_id=sentence_id))
        if is_approved and extras:
            errors.append(issue(
                "sentence_vocabulary_completeness",
                f"Approved sentence has excess or overlapping exact links for {extras}",
                table="sentences.csv", entity_id=sentence_id,
            ))
        if is_approved and not missing and not extras:
            linked_order = [row["surface_form"] for row in exact_links]
            exception_counts = grammar_vocabulary_exceptions.get(sentence_id, Counter()).copy()
            expected_order = []
            for token in segmented_tokens:
                if exception_counts[token] > 0:
                    exception_counts[token] -= 1
                else:
                    expected_order.append(token)
            if linked_order != expected_order:
                errors.append(issue(
                    "sentence_vocabulary_order",
                    "Approved sentence vocabulary positions must follow lexical occurrence order",
                    table="sentences.csv", entity_id=sentence_id,
                ))

    utterances_by_sentence: dict[str, list[dict[str, str]]] = defaultdict(list)
    for row in tables["sentence_utterances.csv"]:
        utterances_by_sentence[row["sentence_id"]].append(row)
    sentence_translations = {
        (row["sentence_id"], row["locale"]): row for row in tables["sentence_translations.csv"]
    }
    utterance_translations = {
        (row["sentence_id"], row["turn_order"], row["locale"]): row
        for row in tables["sentence_utterance_translations.csv"]
    }
    grammar_by_sentence: dict[str, list[dict[str, str]]] = defaultdict(list)
    for row in tables["sentence_grammar.csv"]:
        grammar_by_sentence[row["sentence_id"]].append(row)
    for sentence_id, sentence in sentences.items():
        approved = sentence["curation_status"] == "approved" or sentence["linguistic_review_status"] == "approved"
        if not approved:
            continue
        if sentence["curation_status"] != "approved" or sentence["linguistic_review_status"] != "approved":
            errors.append(issue("sentence_approval", "Both sentence statuses must be approved together",
                                table="sentences.csv", entity_id=sentence_id))
        translation = sentence_translations.get((sentence_id, "en"))
        if not translation or translation["review_status"] != "approved":
            errors.append(issue("sentence_approval", "Approved sentence needs an approved English translation",
                                table="sentences.csv", entity_id=sentence_id))
        for turn in utterances_by_sentence.get(sentence_id, []):
            if turn["review_status"] != "approved":
                errors.append(issue("sentence_approval", "Approved sentence has an unapproved utterance",
                                    table="sentences.csv", entity_id=sentence_id))
            translated_turn = utterance_translations.get((sentence_id, turn["turn_order"], "en"))
            if not translated_turn or translated_turn["review_status"] != "approved":
                errors.append(issue("sentence_approval", "Approved sentence lacks an approved utterance translation",
                                    table="sentences.csv", entity_id=sentence_id))
        for link in sentence_links.get(sentence_id, []):
            if link["review_status"] != "approved" or not link["vocab_id"]:
                errors.append(issue("sentence_approval", "Approved sentence has an unresolved/unapproved vocabulary link",
                                    table="sentences.csv", entity_id=sentence_id))
            if link["resolution_status"] == "component_only":
                exception = exceptions.get((link["vocab_id"], link["surface_form"]))
                if not exception or exception["review_status"] != "approved":
                    errors.append(issue("sentence_approval", "Approved sentence uses an unapproved component exception",
                                        table="sentences.csv", entity_id=sentence_id))
        for link in grammar_by_sentence.get(sentence_id, []):
            if link["review_status"] != "approved":
                errors.append(issue("sentence_approval", "Approved sentence has an unapproved grammar link",
                                    table="sentences.csv", entity_id=sentence_id))
            if not link["grammar_point_id"] and link["mapping_status"] != "non_grammar_label":
                errors.append(issue("sentence_approval", "Approved grammar label is neither mapped nor classified non-grammar",
                                    table="sentences.csv", entity_id=sentence_id))

    active_vocab_ids = {row["vocab_id"] for row in tables["vocabulary_cards.csv"]}
    translated_vocab = {
        row["vocab_id"] for row in tables["vocabulary_translations.csv"]
        if row["locale"] == "en" and row["text"]
    }
    for vocab_id in sorted(active_vocab_ids - translated_vocab):
        errors.append(issue("active_translation", "Active vocabulary lacks English translation",
                            table="vocabulary_translations.csv", entity_id=vocab_id))

    for row in tables["hanzi_readings.csv"]:
        if not row["stroke_sequence"] or any(char not in "12345" for char in row["stroke_sequence"]):
            errors.append(issue("stroke_sequence", "Stroke sequence must contain only 1-5",
                                table="hanzi_readings.csv", entity_id=row["reading_id"]))

    summary = {
        "sentence_vocabulary_links": len(tables["sentence_vocabulary.csv"]),
        "vocabulary_resolution_status": dict(sorted(resolution_counts.items())),
        "sentence_grammar_links": len(tables["sentence_grammar.csv"]),
        "grammar_mapping_status": dict(sorted(grammar_counts.items())),
        "approved_grammar_links": sum(row["review_status"] == "approved" for row in tables["sentence_grammar.csv"]),
        "untagged_segmented_token_types": untagged_token_claims,
        "missing_utterance_translations": len(tables["sentence_utterances.csv"]) - len(
            [row for row in tables["sentence_utterance_translations.csv"] if row["locale"] == "en"]
        ),
    }
    return errors, summary


def segment_surfaces(text: str, surfaces: set[str]) -> set[str]:
    max_length = max((len(surface) for surface in surfaces), default=0)
    tokens: set[str] = set()
    index = 0
    while index < len(text):
        match = ""
        for length in range(min(max_length, len(text) - index), 0, -1):
            candidate = text[index:index + length]
            if candidate in surfaces:
                match = candidate
                break
        if match:
            tokens.add(match)
            index += len(match)
        else:
            index += 1
    return tokens


def stats(values: list[int]) -> dict[str, Any]:
    ordered = sorted(values)
    if not ordered:
        return {"min": 0, "median": 0, "p95": 0, "max": 0, "average": 0}
    p95_index = max(0, math.ceil(len(ordered) * 0.95) - 1)
    return {
        "min": min(ordered), "median": statistics.median(ordered), "p95": ordered[p95_index],
        "max": max(ordered), "average": round(sum(ordered) / len(ordered), 2),
    }


def coverage_report(
    tables: dict[str, list[dict[str, str]]], threshold: int, selected_level: int | None
) -> tuple[dict[str, Any], list[dict[str, Any]]]:
    vocabulary = {row["vocab_id"]: row for row in tables["vocabulary.csv"]}
    active_ids = [row["vocab_id"] for row in sorted(
        tables["vocabulary_cards.csv"], key=lambda item: int(item["runtime_order"])
    )]
    active_id_set = set(active_ids)
    all_active_rows = [vocabulary[vocab_id] for vocab_id in active_ids]
    active_surfaces_by_level: dict[int, set[str]] = defaultdict(set)
    for row in all_active_rows:
        active_surfaces_by_level[int(row["level_min"])].add(row["hanzi"])
    syllabus_surfaces_by_level: dict[int, set[str]] = defaultdict(set)
    for row in vocabulary.values():
        syllabus_surfaces_by_level[int(row["level_min"])].add(row["hanzi"])
    syllabus_rows = list(vocabulary.values())
    if selected_level is not None:
        syllabus_rows = [row for row in syllabus_rows if int(row["level_min"]) == selected_level]
    bound_surfaces_by_level: dict[int, set[str]] = defaultdict(set)
    for row in tables["coverage_exceptions.csv"]:
        bound_surfaces_by_level[int(vocabulary[row["vocab_id"]]["level_min"])].add(row["surface_form"])
    sentences = {row["sentence_id"]: row for row in tables["sentences.csv"]}
    bound_sentence_ids = {
        row["sentence_id"] for row in tables["sentence_cards.csv"] if row["active"] == "true"
    }
    published_sentence_ids = {
        sentence_id for sentence_id in bound_sentence_ids
        if sentences[sentence_id]["curation_status"] in {"legacy_unreviewed", "approved"}
        and sentences[sentence_id]["linguistic_review_status"] in {"legacy_unreviewed", "approved"}
    }
    approved_sentence_ids = {
        sentence_id for sentence_id, sentence in sentences.items()
        if sentence["curation_status"] == "approved"
        and sentence["linguistic_review_status"] == "approved"
    }

    surface_sentence_ids: dict[tuple[int, str], set[str]] = defaultdict(set)
    approved_surface_sentence_ids: dict[tuple[int, str], set[str]] = defaultdict(set)
    for sentence_id in published_sentence_ids:
        sentence = sentences[sentence_id]
        level = int(sentence["level"])
        if selected_level is not None and level != selected_level:
            continue
        tokens = segment_surfaces(sentence["full_zh"], active_surfaces_by_level[level])
        tokens.update(
            surface for surface in bound_surfaces_by_level[level] if surface in sentence["full_zh"]
        )
        for surface in tokens:
            surface_sentence_ids[(level, surface)].add(sentence_id)

    for sentence_id in approved_sentence_ids:
        sentence = sentences[sentence_id]
        level = int(sentence["level"])
        if selected_level is not None and level != selected_level:
            continue
        tokens = segment_surfaces(sentence["full_zh"], syllabus_surfaces_by_level[level])
        tokens.update(
            surface for surface in bound_surfaces_by_level[level] if surface in sentence["full_zh"]
        )
        for surface in tokens:
            approved_surface_sentence_ids[(level, surface)].add(sentence_id)

    explicit_sentence_ids: dict[str, set[str]] = defaultdict(set)
    approved_explicit_sentence_ids: dict[str, set[str]] = defaultdict(set)
    for link in tables["sentence_vocabulary.csv"]:
        vocab_id = link["vocab_id"]
        if not vocab_id or vocab_id not in vocabulary:
            continue
        sentence = sentences[link["sentence_id"]]
        vocab = vocabulary[vocab_id]
        if int(sentence["level"]) != int(vocab["level_min"]):
            continue
        if (
            link["surface_form"] in sentence["full_zh"]
            and link["sentence_id"] in published_sentence_ids
            and vocab_id in active_id_set
            and link["review_status"] in {"legacy_unreviewed", "approved"}
        ):
            explicit_sentence_ids[vocab_id].add(sentence["sentence_id"])
        if (
            link["surface_form"] in sentence["full_zh"]
            and link["sentence_id"] in approved_sentence_ids
            and link["review_status"] == "approved"
        ):
            approved_explicit_sentence_ids[vocab_id].add(sentence["sentence_id"])

    rows = []
    for vocab in syllabus_rows:
        level = int(vocab["level_min"])
        product_active = vocab["vocab_id"] in active_id_set
        surface_count = len(surface_sentence_ids[(level, vocab["hanzi"])]) if product_active else 0
        explicit_count = len(explicit_sentence_ids[vocab["vocab_id"]]) if product_active else 0
        approved_surface_count = len(approved_surface_sentence_ids[(level, vocab["hanzi"])])
        approved_explicit_count = len(approved_explicit_sentence_ids[vocab["vocab_id"]])
        rows.append({
            "vocab_id": vocab["vocab_id"], "level": level, "hanzi": vocab["hanzi"],
            "sense_number": vocab["sense_number"], "product_active": product_active,
            "published_surface_count": surface_count, "published_explicit_count": explicit_count,
            "approved_surface_count": approved_surface_count,
            "approved_explicit_count": approved_explicit_count,
            "published_surface_target_met": surface_count >= threshold,
            "published_explicit_target_met": explicit_count >= threshold,
            "approved_surface_target_met": approved_surface_count >= threshold,
            "approved_explicit_target_met": approved_explicit_count >= threshold,
            "curation_status": vocab["curation_status"],
        })

    active_level_summary = {}
    syllabus_level_summary = {}
    for level in sorted({int(row["level"]) for row in rows}):
        level_rows = [row for row in rows if int(row["level"]) == level]
        active_level_rows = [row for row in level_rows if row["product_active"]]
        surface_values = [int(row["published_surface_count"]) for row in active_level_rows]
        explicit_values = [int(row["published_explicit_count"]) for row in active_level_rows]
        approved_surface_values = [int(row["approved_surface_count"]) for row in active_level_rows]
        approved_explicit_values = [int(row["approved_explicit_count"]) for row in active_level_rows]
        if active_level_rows:
            active_level_summary[str(level)] = {
                "vocabulary_senses": len(active_level_rows),
                "surface": {
                    **stats(surface_values), "below_target": sum(value < threshold for value in surface_values)
                },
                "explicit_sense_links": {
                    **stats(explicit_values), "below_target": sum(value < threshold for value in explicit_values)
                },
                "approved_surface": {
                    **stats(approved_surface_values),
                    "below_target": sum(value < threshold for value in approved_surface_values),
                },
                "approved_explicit_sense_links": {
                    **stats(approved_explicit_values),
                    "below_target": sum(value < threshold for value in approved_explicit_values),
                },
            }
        syllabus_level_summary[str(level)] = {
            "syllabus_senses": len(level_rows),
            "product_active_senses": len(active_level_rows),
            "not_active_in_product": len(level_rows) - len(active_level_rows),
            "below_published_surface_target": sum(not row["published_surface_target_met"] for row in level_rows),
            "approved_surface": {
                **stats([int(row["approved_surface_count"]) for row in level_rows]),
                "below_target": sum(not row["approved_surface_target_met"] for row in level_rows),
            },
            "approved_explicit_sense_links": {
                **stats([int(row["approved_explicit_count"]) for row in level_rows]),
                "below_target": sum(not row["approved_explicit_target_met"] for row in level_rows),
            },
            "below_approved_explicit_target": sum(not row["approved_explicit_target_met"] for row in level_rows),
        }
    active_rows = [row for row in rows if row["product_active"]]
    return {
        "target_distinct_same_level_sentences": threshold,
        "surface_metric": "published product-bound legacy/approved sentences; longest active-vocabulary match plus declared bound-surface exceptions",
        "explicit_metric": "published product-bound sentence_vocabulary links with a stable vocab_id",
        "approved_metric": "all approved catalog sentences and approved sentence_vocabulary links, independent of product bindings",
        "levels": active_level_summary,
        "syllabus_levels": syllabus_level_summary,
        "syllabus_senses_not_active": sum(not row["product_active"] for row in rows),
        "low_surface_coverage": [row for row in active_rows if not row["published_surface_target_met"]],
        "low_explicit_sense_coverage": [row for row in active_rows if not row["published_explicit_target_met"]],
        "low_approved_explicit_sense_coverage": [
            row for row in rows if not row["approved_explicit_target_met"]
        ],
    }, rows


def inventory(tables: dict[str, list[dict[str, str]]], selected_level: int | None) -> dict[str, Any]:
    sentence_rows = tables["sentences.csv"]
    sentence_bindings = [row for row in tables["sentence_cards.csv"] if row["active"] == "true"]
    if selected_level is not None:
        selected_ids = {row["sentence_id"] for row in sentence_rows if int(row["level"]) == selected_level}
        sentence_rows = [row for row in sentence_rows if row["sentence_id"] in selected_ids]
        sentence_bindings = [row for row in sentence_bindings if row["sentence_id"] in selected_ids]
    vocabulary_rows = tables["vocabulary.csv"]
    active_vocab_ids = {row["vocab_id"] for row in tables["vocabulary_cards.csv"]}
    vocab_by_id = {row["vocab_id"]: row for row in tables["vocabulary.csv"]}
    if selected_level is not None:
        vocabulary_rows = [row for row in vocabulary_rows if int(row["level_min"]) == selected_level]
        active_vocab_ids = {
            vocab_id for vocab_id in active_vocab_ids
            if int(vocab_by_id[vocab_id]["level_min"]) == selected_level
        }
    vocab_counts = Counter(int(row["level_min"]) for row in vocabulary_rows)
    active_counts = Counter(int(vocab_by_id[vocab_id]["level_min"]) for vocab_id in active_vocab_ids)
    sentence_counts = Counter(int(row["level"]) for row in sentence_rows)
    direction_counts = Counter(row["direction"] for row in sentence_bindings)
    sentence_total = len(sentence_bindings)
    hanzi_bindings = tables["hanzi_cards.csv"]
    measure_bindings = tables["measure_word_cards.csv"]
    if selected_level is not None:
        hanzi_bindings = [row for row in hanzi_bindings if int(row["level"]) == selected_level]
        measure_levels = {row["measure_word_id"]: int(row["level"]) for row in tables["measure_word_sets.csv"]}
        measure_bindings = [
            row for row in measure_bindings if measure_levels[row["measure_word_id"]] == selected_level
        ]
    hanzi_total = len(hanzi_bindings)
    measure_total = len(measure_bindings)
    return {
        "syllabus_vocabulary": len(vocabulary_rows),
        "syllabus_vocabulary_by_level": {str(key): value for key, value in sorted(vocab_counts.items())},
        "active_vocabulary": len(active_vocab_ids),
        "active_vocabulary_by_level": {str(key): value for key, value in sorted(active_counts.items())},
        "sentences": len(sentence_rows),
        "sentences_by_level": {str(key): value for key, value in sorted(sentence_counts.items())},
        "sentence_directions": dict(sorted(direction_counts.items())),
        "syllabus_grammar_rows": len(tables["grammar_points.csv"]),
        "syllabus_topics": len(tables["topics.csv"]),
        "syllabus_tasks": len(tables["tasks.csv"]),
        "syllabus_task_scenarios": len(tables["task_scenarios.csv"]),
        "syllabus_task_capabilities": len(tables["task_capabilities.csv"]),
        "syllabus_hanzi": len(tables["hanzi.csv"]),
        "active_hanzi_study_records": hanzi_total,
        "active_measure_word_cards": measure_total,
        "generated_study_cards": hanzi_total * 2 + measure_total,
        "sentence_and_study_cards": sentence_total + hanzi_total * 2 + measure_total,
    }


def review_backlog(tables: dict[str, list[dict[str, str]]], coverage: dict[str, Any]) -> dict[str, Any]:
    status_counts: dict[str, dict[str, int]] = {}
    for table, field in [
        ("vocabulary.csv", "curation_status"),
        ("vocabulary_translations.csv", "review_status"),
        ("sentences.csv", "linguistic_review_status"),
        ("sentence_translations.csv", "review_status"),
        ("sentence_utterance_translations.csv", "review_status"),
        ("sentence_utterances.csv", "review_status"),
        ("hanzi_readings.csv", "review_status"),
        ("measure_word_sets.csv", "review_status"),
        ("classifier_usages.csv", "review_status"),
    ]:
        status_counts[table] = dict(sorted(Counter(row[field] for row in tables[table]).items()))
    open_issues = [row for row in tables["issues.csv"] if row["status"] == "open"]
    return {
        "statuses": status_counts,
        "ambiguous_sentence_vocabulary_links": sum(
            row["resolution_status"] == "ambiguous" for row in tables["sentence_vocabulary.csv"]
        ),
        "component_only_links": sum(
            row["resolution_status"] == "component_only" for row in tables["sentence_vocabulary.csv"]
        ),
        "unapproved_grammar_links": sum(
            row["review_status"] != "approved" for row in tables["sentence_grammar.csv"]
        ),
        "unreviewed_coverage_exceptions": sum(
            row["review_status"] != "approved" for row in tables["coverage_exceptions.csv"]
        ),
        "low_explicit_sense_coverage": len(coverage["low_explicit_sense_coverage"]),
        "low_approved_explicit_sense_coverage": len(coverage["low_approved_explicit_sense_coverage"]),
        "syllabus_senses_not_active": coverage["syllabus_senses_not_active"],
        "missing_utterance_translations": len(tables["sentence_utterances.csv"]) - len(
            [row for row in tables["sentence_utterance_translations.csv"] if row["locale"] == "en"]
        ),
        "open_issues": len(open_issues),
        "open_issue_details": [
            {key: row[key] for key in ("issue_id", "severity", "entity_type", "entity_id", "summary")}
            for row in open_issues
        ],
    }


def build_report(threshold: int, selected_level: int | None) -> tuple[dict[str, Any], list[dict[str, Any]]]:
    tables = load_tables()
    errors = []
    errors.extend(validate_headers_and_rows(tables))
    errors.extend(validate_schema_contract())
    errors.extend(validate_foreign_keys(tables))
    errors.extend(validate_official_contract_and_domains(tables))
    errors.extend(validate_sources(tables))
    errors.extend(validate_review_governance(tables))
    compatibility_errors, compatibility = validate_compatibility(tables)
    relation_errors, relationships = validate_linguistic_relations(tables)
    grammar_errors, grammar_study = validate_grammar_study(tables)
    errors.extend(compatibility_errors)
    errors.extend(relation_errors)
    errors.extend(grammar_errors)
    coverage, coverage_rows = coverage_report(tables, threshold, selected_level)
    backlog = review_backlog(tables, coverage)
    warnings = [
        {
            "rule": "legacy_review_backlog",
            "message": f"{backlog['statuses']['sentences.csv'].get('legacy_unreviewed', 0)} sentences remain legacy_unreviewed.",
        },
        {
            "rule": "ambiguous_sense_links",
            "message": f"{backlog['ambiguous_sentence_vocabulary_links']} sentence-vocabulary links are ambiguous by sense.",
        },
        {
            "rule": "grammar_mapping_backlog",
            "message": f"{backlog['unapproved_grammar_links']} grammar links still require syllabus mapping review.",
        },
        {
            "rule": "explicit_coverage_backlog",
            "message": f"{backlog['low_explicit_sense_coverage']} active vocabulary senses are below the explicit-link target.",
        },
        {
            "rule": "approved_coverage_backlog",
            "message": f"{backlog['low_approved_explicit_sense_coverage']} official syllabus senses are below the approved-only target.",
        },
        {
            "rule": "syllabus_roadmap",
            "message": f"{backlog['syllabus_senses_not_active']} official syllabus senses are outside the current product scope.",
        },
        {
            "rule": "utterance_translation_backlog",
            "message": f"{backlog['missing_utterance_translations']} utterances lack English translations.",
        },
        {
            "rule": "open_editorial_issues",
            "message": f"{backlog['open_issues']} concrete editorial issues are registered as open.",
        },
    ]
    if not compatibility["runtime_semantic_match"]:
        warnings.append({
            "rule": "runtime_semantic_drift",
            "message": "The catalog is valid but its compiled content is not synchronized with the committed runtime.",
        })
    return {
        "status": "pass" if not errors else "fail",
        "scope_level": selected_level or "all",
        "structural_error_count": len(errors),
        "warning_count": len(warnings),
        "inventory": inventory(tables, selected_level),
        "compatibility": compatibility,
        "relationships": relationships,
        "grammar_study": grammar_study,
        "coverage": coverage,
        "review_backlog": backlog,
        "errors": errors,
        "warnings": warnings,
        "interpretation": (
            "A pass validates structure, references, HSK-level constraints, and binding compatibility. "
            "Runtime semantic synchronization is reported separately and a pass does not promote legacy content to approved."
        ),
    }, coverage_rows


def markdown_report(report: dict[str, Any]) -> str:
    inv = report["inventory"]
    lines = [
        "# Language catalog audit", "",
        f"Status: **{report['status'].upper()}** — {report['structural_error_count']} structural errors, "
        f"{report['warning_count']} review warnings.", "",
        report["interpretation"], "",
        f"Runtime semantic synchronization: **{'YES' if report['compatibility']['runtime_semantic_match'] else 'NO'}**.", "",
        "## Inventory", "",
        "| Item | Count |", "| --- | ---: |",
        f"| Official vocabulary senses | {inv['syllabus_vocabulary']:,} |",
        f"| Active vocabulary cards | {inv['active_vocabulary']:,} |",
        f"| Sentence cards | {inv['sentences']:,} |",
        f"| Official grammar rows | {inv['syllabus_grammar_rows']:,} |",
        f"| Official topics | {inv['syllabus_topics']:,} |",
        f"| Official tasks / capabilities | {inv['syllabus_tasks']:,} / {inv['syllabus_task_capabilities']:,} |",
        f"| Official recognition hanzi | {inv['syllabus_hanzi']:,} |",
        f"| Active hanzi study records | {inv['active_hanzi_study_records']:,} |",
        f"| Active measure-word cards | {inv['active_measure_word_cards']:,} |",
        f"| Generated study cards | {inv['generated_study_cards']:,} |",
        f"| Sentence + study cards | **{inv['sentence_and_study_cards']:,}** |",
        "", "## Coverage", "",
        f"Target: {report['coverage']['target_distinct_same_level_sentences']} distinct same-level sentences.", "",
        "| HSK | Senses | Published surface min / avg | Published surface below | Published explicit min / avg | Published explicit below | Approved explicit below |",
        "| ---: | ---: | ---: | ---: | ---: | ---: | ---: |",
    ]
    for level, summary in report["coverage"]["levels"].items():
        surface = summary["surface"]
        explicit = summary["explicit_sense_links"]
        approved_explicit = summary["approved_explicit_sense_links"]
        lines.append(
            f"| {level} | {summary['vocabulary_senses']} | {surface['min']} / {surface['average']} | "
            f"{surface['below_target']} | {explicit['min']} / {explicit['average']} | {explicit['below_target']} | "
            f"{approved_explicit['below_target']} |"
        )
    rel = report["relationships"]
    backlog = report["review_backlog"]
    lines.extend([
        "", "Published coverage includes product-bound legacy migration content. Approved-only coverage spans the full "
        "catalog independently of product bindings and is the editorial target. Surface coverage cannot distinguish "
        "homographic senses.", "",
        "### Full syllabus roadmap", "",
        "| HSK band | Official senses | Product active | Not active | Below approved explicit target |",
        "| ---: | ---: | ---: | ---: | ---: |",
    ])
    for level, summary in report["coverage"]["syllabus_levels"].items():
        lines.append(
            f"| {level} | {summary['syllabus_senses']} | {summary['product_active_senses']} | "
            f"{summary['not_active_in_product']} | {summary['below_approved_explicit_target']} |"
        )
    lines.extend([
        "", "## Relationship quality", "",
        "| Signal | Count |", "| --- | ---: |",
        f"| Sentence-vocabulary links | {rel['sentence_vocabulary_links']:,} |",
        f"| Ambiguous sense links | {backlog['ambiguous_sentence_vocabulary_links']:,} |",
        f"| Component-only links | {backlog['component_only_links']:,} |",
        f"| Sentence-grammar links | {rel['sentence_grammar_links']:,} |",
        f"| Approved grammar links | {rel['approved_grammar_links']:,} |",
        f"| Segmented token types missing explicit links | {rel['untagged_segmented_token_types']:,} |",
        f"| Missing utterance translations | {rel['missing_utterance_translations']:,} |",
        f"| Unreviewed coverage exceptions | {backlog['unreviewed_coverage_exceptions']:,} |",
        "", "## Grammar study", "",
        f"Feature activation: **{'ACTIVE' if report['grammar_study']['enabled'] else 'EMPTY / PRE-CURATION'}**.", "",
        f"Authorized point-scoped vocabulary exceptions: **{report['grammar_study'].get('authorized_vocabulary_exceptions', 0)}**. These create no vocabulary relation.", "",
        "| HSK | Primary official-point coverage | Active lessons | Active examples |",
        "| ---: | ---: | ---: | ---: |",
    ])
    for level in ("1", "2", "3"):
        grammar = report["grammar_study"]
        point = grammar["official_point_coverage"][level]
        lines.append(
            f"| {level} | {point['covered']}/{point['expected']} | "
            f"{grammar.get('lessons_by_level', {}).get(level, 0)} | "
            f"{grammar.get('examples_by_level', {}).get(level, 0)} |"
        )
    lines.extend([
        "", "## Editorial backlog", "",
        "| Catalog | Status counts |", "| --- | --- |",
    ])
    for table, counts in backlog["statuses"].items():
        rendered = ", ".join(f"{status}: {count:,}" for status, count in counts.items())
        lines.append(f"| `{table}` | {rendered} |")
    lines.extend(["", f"Open registered issues: **{backlog['open_issues']}**.", ""])
    for item in backlog["open_issue_details"]:
        lines.append(f"- `{item['issue_id']}` · `{item['entity_id']}` — {item['summary']}")
    lines.extend(["", "## Validation", ""])
    if report["errors"]:
        for item in report["errors"]:
            lines.append(f"- ERROR `{item['rule']}` {item['table']} {item['entity_id']}: {item['message']}")
    else:
        lines.append("No structural, referential, level, or runtime-compatibility errors were found.")
    lines.extend(["", "## Known limits", "",
                  "- Automatic checks do not prove grammaticality, naturalness, translation equivalence, or register.",
                  "- Cumulative dictionary segmentation proves lexical decomposability, not the intended sense of every compositional or homographic string.",
                  "- Legacy grammar labels remain candidates until mapped to official grammar IDs.",
                  "- Character glosses migrated from word-derived study cards require dedicated review.",
                  "- The English syllabus does not translate the 11,000 vocabulary entries.", ""])
    return "\n".join(lines)


def write_reports(report: dict[str, Any], coverage_rows: list[dict[str, Any]]) -> None:
    REPORT_DIR.mkdir(parents=True, exist_ok=True)
    (REPORT_DIR / "catalog-audit.json").write_text(
        json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
    )
    (REPORT_DIR / "catalog-audit.md").write_text(markdown_report(report), encoding="utf-8")
    fields = [
        "vocab_id", "level", "hanzi", "sense_number", "product_active",
        "published_surface_count", "published_explicit_count", "approved_surface_count",
        "approved_explicit_count", "published_surface_target_met", "published_explicit_target_met",
        "approved_surface_target_met", "approved_explicit_target_met", "curation_status",
    ]
    write_csv(REPORT_DIR / "vocabulary-coverage.csv", fields, coverage_rows)
    write_grammar_reports(load_tables(), REPORT_DIR)


def main(argv: list[str]) -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--level", type=int, choices=range(1, 8),
        help="Limit reporting to HSK 1-6 or use 7 for the indivisible 7-9 syllabus band.",
    )
    parser.add_argument("--coverage-target", type=int, default=3)
    parser.add_argument("--format", choices=["markdown", "json"], default="markdown")
    parser.add_argument("--write-reports", action="store_true")
    args = parser.parse_args(argv)
    try:
        report, coverage_rows = build_report(args.coverage_target, args.level)
        if args.write_reports:
            write_reports(report, coverage_rows)
        if args.format == "json":
            print(json.dumps(report, ensure_ascii=False, indent=2))
        else:
            print(markdown_report(report))
        return 0 if report["status"] == "pass" else 1
    except Exception as error:
        print(f"audit_catalog: {error}", file=sys.stderr)
        return 2


if __name__ == "__main__":
    raise SystemExit(main(sys.argv[1:]))
