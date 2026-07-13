#!/usr/bin/env python3
"""Validate, compile, and report the reviewed HSK 1-3 grammar-study catalog."""

from __future__ import annotations

import json
import re
import unicodedata
from collections import Counter, defaultdict
from pathlib import Path
from typing import Any

from catalog_io import (
    GRAMMAR_STUDY_CATALOG_TABLES,
    GRAMMAR_STUDY_CONTENT_TABLES,
    GRAMMAR_STUDY_PRODUCT_TABLE,
    PROJECT_ROOT,
    write_csv,
)

GRAMMAR_SCHEMA_VERSION = "1"
GRAMMAR_SYLLABUS_ID = "hsk-2025-11"
GRAMMAR_DATA_DIR = PROJECT_ROOT / "js" / "data" / "grammar"
EXPECTED_POINT_COUNTS = {1: 70, 2: 78, 3: 96}
FORMULA_KINDS = {"construction", "function", "morphology"}
ABSTRACT_KINDS = {"category", "expression_system"}
AUTHORIZED_VOCABULARY_EXCEPTION_SCOPES = {
    ("hsk26-g1-013", "杯", 1, "classifier"),
    ("hsk26-g3-023", "不必", 3, "negative_modal"),
}

_UUID4_HEX = r"[0-9a-f]{12}4[0-9a-f]{3}[89ab][0-9a-f]{15}"
ID_PATTERNS = {
    "grammar_point_elements.csv": re.compile(rf"gelement_{_UUID4_HEX}"),
    "grammar_lessons.csv": re.compile(rf"glesson_{_UUID4_HEX}"),
    "grammar_lesson_notes.csv": re.compile(rf"gnote_{_UUID4_HEX}"),
    "grammar_lesson_patterns.csv": re.compile(rf"gpattern_{_UUID4_HEX}"),
    "grammar_lesson_examples.csv": re.compile(rf"gexample_{_UUID4_HEX}"),
    "grammar_example_targets.csv": re.compile(rf"gtarget_{_UUID4_HEX}"),
    "grammar_vocabulary_exceptions.csv": re.compile(rf"gvexception_{_UUID4_HEX}"),
}
ID_FIELDS = {
    "grammar_point_elements.csv": "grammar_element_id",
    "grammar_lessons.csv": "grammar_lesson_id",
    "grammar_lesson_notes.csv": "grammar_note_id",
    "grammar_lesson_patterns.csv": "grammar_pattern_id",
    "grammar_lesson_examples.csv": "grammar_example_id",
    "grammar_example_targets.csv": "grammar_target_id",
    "grammar_vocabulary_exceptions.csv": "grammar_vocab_exception_id",
}
SENTENCE_ID_PATTERN = re.compile(rf"sent_{_UUID4_HEX}")

_PINYIN_ALLOWED = re.compile(
    r"[A-Za-z"
    r"\u00c0-\u00ff\u0100-\u017f"
    r"\u01cd-\u01dc\u01f8-\u01f9"
    r"' ,.!?;:\-()\u2019\u201c\u201d\u3001\u3002\uff0c\uff01\uff1f\uff1b\uff1a]+"
)
_ENGLISH_WORD = re.compile(r"[A-Za-z]+(?:['\u2019-][A-Za-z]+)*")


def issue(rule: str, message: str, *, table: str = "", entity_id: str = "") -> dict[str, str]:
    return {"rule": rule, "table": table, "entity_id": entity_id, "message": message}


def feature_present(tables: dict[str, list[dict[str, str]]]) -> bool:
    names = (*GRAMMAR_STUDY_CONTENT_TABLES, GRAMMAR_STUDY_PRODUCT_TABLE)
    return any(tables.get(name, []) for name in names)


def _vocabulary_exception_scope(row: dict[str, str]) -> tuple[str, str, int, str]:
    return (
        row.get("grammar_point_id", ""),
        row.get("surface_form", ""),
        _integer(row, "level"),
        row.get("required_target_role", ""),
    )


def validate_grammar_vocabulary_exceptions(
    tables: dict[str, list[dict[str, str]]]
) -> list[dict[str, str]]:
    errors = []
    vocabulary_levels: dict[str, int] = {}
    for vocabulary in tables["vocabulary.csv"]:
        surface = vocabulary["hanzi"]
        vocabulary_levels[surface] = min(
            _integer(vocabulary, "level_min"), vocabulary_levels.get(surface, 99)
        )
    points = {row["grammar_point_id"]: row for row in tables["grammar_points.csv"]}
    for row in tables["grammar_vocabulary_exceptions.csv"]:
        entity_id = row["grammar_vocab_exception_id"]
        scope = _vocabulary_exception_scope(row)
        if scope not in AUTHORIZED_VOCABULARY_EXCEPTION_SCOPES:
            errors.append(issue(
                "grammar_vocabulary_exception_scope",
                "Grammar vocabulary exception is outside the explicitly authorized point/surface/level/role scope",
                table="grammar_vocabulary_exceptions.csv", entity_id=entity_id,
            ))
        if row.get("review_status") != "approved":
            errors.append(issue(
                "grammar_vocabulary_exception_approval",
                "Grammar vocabulary exceptions must be explicitly approved",
                table="grammar_vocabulary_exceptions.csv", entity_id=entity_id,
            ))
        point = points.get(row.get("grammar_point_id", ""))
        if point and _integer(point, "level_min") != _integer(row, "level"):
            errors.append(issue(
                "grammar_vocabulary_exception_level",
                "Exception level must match the official grammar point introduction level",
                table="grammar_vocabulary_exceptions.csv", entity_id=entity_id,
            ))
        if vocabulary_levels.get(row.get("surface_form", ""), 99) <= _integer(row, "level"):
            errors.append(issue(
                "grammar_vocabulary_exception_redundant",
                "An in-scope vocabulary sense now exists for this surface; retire the exception and use an exact relation",
                table="grammar_vocabulary_exceptions.csv", entity_id=entity_id,
            ))
    return errors


def authorized_vocabulary_exception_occurrences(
    tables: dict[str, list[dict[str, str]]]
) -> dict[str, Counter[str]]:
    """Return reviewed, target-specific unlinked surfaces allowed for each grammar example."""
    policies = [
        row for row in tables["grammar_vocabulary_exceptions.csv"]
        if row.get("review_status") == "approved"
        and _vocabulary_exception_scope(row) in AUTHORIZED_VOCABULARY_EXCEPTION_SCOPES
    ]
    examples = {
        row["grammar_example_id"]: row for row in tables["grammar_lesson_examples.csv"]
        if row.get("review_status") == "approved"
    }
    demonstrations = _group(tables["grammar_example_points.csv"], "grammar_example_id")
    targets = _group(tables["grammar_example_targets.csv"], "grammar_example_id")
    sentences = {row["sentence_id"]: row for row in tables["sentences.csv"]}
    authorized: dict[str, Counter[str]] = defaultdict(Counter)
    seen: set[tuple[str, str, int]] = set()
    for example_id, example in examples.items():
        sentence = sentences.get(example["sentence_id"])
        if not sentence:
            continue
        for policy in policies:
            if _integer(sentence, "level") != _integer(policy, "level"):
                continue
            demonstrated_elements = {
                row["grammar_element_id"] for row in demonstrations.get(example_id, [])
                if row.get("review_status") == "approved"
                and row.get("grammar_point_id") == policy["grammar_point_id"]
            }
            for target in targets.get(example_id, []):
                if (
                    target.get("review_status") != "approved"
                    or target.get("grammar_element_id") not in demonstrated_elements
                    or target.get("target_text_zh") != policy["surface_form"]
                    or target.get("target_role") != policy["required_target_role"]
                ):
                    continue
                occurrence = _integer(target, "occurrence_number")
                key = (sentence["sentence_id"], policy["surface_form"], occurrence)
                if occurrence > 0 and key not in seen:
                    seen.add(key)
                    authorized[sentence["sentence_id"]][policy["surface_form"]] += 1
    return authorized


def _integer(row: dict[str, str], field: str) -> int:
    try:
        return int(row.get(field, ""))
    except (TypeError, ValueError):
        return 0


def _group(
    rows: list[dict[str, str]], key: str, order: str | None = None
) -> dict[str, list[dict[str, str]]]:
    grouped: dict[str, list[dict[str, str]]] = defaultdict(list)
    for row in rows:
        grouped[row.get(key, "")].append(row)
    if order:
        for values in grouped.values():
            values.sort(key=lambda row: _integer(row, order))
    return grouped


def _contiguous(rows: list[dict[str, str]], field: str) -> bool:
    values = [_integer(row, field) for row in rows]
    return values == list(range(1, len(values) + 1))


def _word_count(text: str) -> int:
    return len(_ENGLISH_WORD.findall(text))


def _sentence_count(text: str) -> int:
    return len(re.findall(r"[.!?]+", text.strip())) or (1 if text.strip() else 0)


def validate_pinyin(pinyin: str) -> str | None:
    if not pinyin:
        return "Pinyin is required"
    if pinyin != unicodedata.normalize("NFC", pinyin):
        return "Pinyin must use NFC normalization"
    if pinyin != pinyin.strip() or re.search(r"\s{2,}", pinyin):
        return "Pinyin must use trimmed single spacing"
    if re.search(r"\d|[vV]|[uU]:", pinyin):
        return "Display pinyin must use tone marks and ü rather than digits, v, or u:"
    if not _PINYIN_ALLOWED.fullmatch(pinyin):
        return "Pinyin contains unsupported characters"
    first_letter = next((char for char in pinyin if char.isalpha()), "")
    if first_letter and first_letter != first_letter.upper():
        return "Pinyin must be capitalized at sentence start"
    return None


def normalize_pinyin_search(value: str) -> str:
    value = value.lower().replace("u:", "v").replace("ü", "v")
    decomposed = unicodedata.normalize("NFD", value)
    unmarked = "".join(char for char in decomposed if unicodedata.category(char) != "Mn")
    return " ".join(unicodedata.normalize("NFC", unmarked).split())


def target_span(text: str, target: str, occurrence_number: int) -> tuple[int, int] | None:
    starts = []
    offset = 0
    while target and offset <= len(text) - len(target):
        found = text.find(target, offset)
        if found < 0:
            break
        starts.append(found)
        offset = found + 1
    if occurrence_number < 1 or occurrence_number > len(starts):
        return None
    start = starts[occurrence_number - 1]
    return start, start + len(target)


def build_target_parts(
    zh_text: str, targets: list[dict[str, str]]
) -> tuple[list[dict[str, Any]], list[dict[str, str]]]:
    errors = []
    located: list[tuple[int, int, dict[str, str]]] = []
    for target in sorted(targets, key=lambda row: _integer(row, "target_order")):
        span = target_span(
            zh_text, target.get("target_text_zh", ""), _integer(target, "occurrence_number")
        )
        if span is None:
            errors.append(issue(
                "grammar_target_presence",
                "Target occurrence is absent from the example utterance",
                table="grammar_example_targets.csv",
                entity_id=target.get("grammar_target_id", ""),
            ))
            continue
        located.append((*span, target))
    previous_end = 0
    for start, end, target in located:
        if start < previous_end:
            errors.append(issue(
                "grammar_target_order",
                "Target segments overlap or are not ordered by their location in the utterance",
                table="grammar_example_targets.csv",
                entity_id=target.get("grammar_target_id", ""),
            ))
        previous_end = max(previous_end, end)
    if errors:
        return [], errors
    parts: list[dict[str, Any]] = []
    offset = 0
    for start, end, target in located:
        if start > offset:
            parts.append({"text": zh_text[offset:start], "emphasized": False, "role": ""})
        parts.append({
            "text": zh_text[start:end],
            "emphasized": True,
            "role": target["target_role"],
        })
        offset = end
    if offset < len(zh_text):
        parts.append({"text": zh_text[offset:], "emphasized": False, "role": ""})
    if not parts:
        parts.append({"text": zh_text, "emphasized": False, "role": ""})
    return parts, []


def _empty_summary(tables: dict[str, list[dict[str, str]]]) -> dict[str, Any]:
    official_categories = {
        str(level): len({
            row["category_zh"] for row in tables["grammar_points.csv"]
            if _integer(row, "level_min") == level and _integer(row, "level_max") == level
        })
        for level in EXPECTED_POINT_COUNTS
    }
    return {
        "enabled": False,
        "official_point_coverage": {
            str(level): {"covered": 0, "expected": count}
            for level, count in EXPECTED_POINT_COUNTS.items()
        },
        "official_category_counts": official_categories,
        "elements_by_kind": {},
        "lessons_by_level": {},
        "examples_by_level": {},
        "active_lessons": 0,
        "active_examples": 0,
        "authorized_vocabulary_exceptions": len(tables["grammar_vocabulary_exceptions.csv"]),
    }


def validate_grammar_study(
    tables: dict[str, list[dict[str, str]]]
) -> tuple[list[dict[str, str]], dict[str, Any]]:
    """Validate the complete active grammar-study closure, or accept a wholly empty baseline."""
    errors = validate_grammar_vocabulary_exceptions(tables)
    if not feature_present(tables):
        return errors, _empty_summary(tables)

    for table, pattern in ID_PATTERNS.items():
        field = ID_FIELDS[table]
        for row in tables[table]:
            if not pattern.fullmatch(row.get(field, "")):
                errors.append(issue(
                    "grammar_identity", f"{field} must use an immutable UUID4-based ID",
                    table=table, entity_id=row.get(field, ""),
                ))

    points = {row["grammar_point_id"]: row for row in tables["grammar_points.csv"]}
    in_scope = {
        point_id: row for point_id, row in points.items()
        if _integer(row, "level_min") in EXPECTED_POINT_COUNTS
        and _integer(row, "level_max") == _integer(row, "level_min")
    }
    expected_ids = {
        f"hsk26-g{level}-{order:03d}"
        for level, count in EXPECTED_POINT_COUNTS.items()
        for order in range(1, count + 1)
    }
    if set(in_scope) != expected_ids:
        errors.append(issue(
            "grammar_scope", "Grammar study requires the exact official HSK 1-3 point set",
            table="grammar_points.csv",
        ))
    for point_id, point in in_scope.items():
        if point.get("review_status") != "approved":
            errors.append(issue(
                "grammar_point_approval", "Every referenced HSK 1-3 grammar point must be approved",
                table="grammar_points.csv", entity_id=point_id,
            ))

    elements = {
        row["grammar_element_id"]: row for row in tables["grammar_point_elements.csv"]
    }
    elements_by_point = _group(tables["grammar_point_elements.csv"], "grammar_point_id", "element_order")
    for point_id in expected_ids:
        rows = elements_by_point.get(point_id, [])
        if not rows:
            errors.append(issue(
                "grammar_element_coverage", "Official point has no normalized grammar element",
                table="grammar_point_elements.csv", entity_id=point_id,
            ))
            continue
        if not _contiguous(rows, "element_order"):
            errors.append(issue(
                "grammar_element_order", "element_order must be contiguous within each official point",
                table="grammar_point_elements.csv", entity_id=point_id,
            ))
        for row in rows:
            element_id = row["grammar_element_id"]
            point = in_scope.get(point_id)
            if row.get("review_status") != "approved":
                errors.append(issue(
                    "grammar_element_approval", "In-scope grammar elements must be approved",
                    table="grammar_point_elements.csv", entity_id=element_id,
                ))
            if point and row.get("basis_source_id") != point.get("source_id"):
                errors.append(issue(
                    "grammar_element_provenance", "Element basis must match its official point source",
                    table="grammar_point_elements.csv", entity_id=element_id,
                ))
            if row.get("element_kind") not in ABSTRACT_KINDS and not row.get("target_zh"):
                errors.append(issue(
                    "grammar_element_target", "Non-abstract grammar elements require target_zh",
                    table="grammar_point_elements.csv", entity_id=element_id,
                ))

    lessons = {row["grammar_lesson_id"]: row for row in tables["grammar_lessons.csv"]}
    bindings = tables[GRAMMAR_STUDY_PRODUCT_TABLE]
    active_bindings = [row for row in bindings if row.get("active") == "true"]
    active_lesson_ids = {row["grammar_lesson_id"] for row in active_bindings}
    if not active_lesson_ids:
        errors.append(issue(
            "grammar_activation", "Nonempty grammar-study data must activate complete HSK 1-3 coverage",
            table=GRAMMAR_STUDY_PRODUCT_TABLE,
        ))
    bindings_by_level: dict[int, list[dict[str, str]]] = defaultdict(list)
    for binding in active_bindings:
        lesson = lessons.get(binding["grammar_lesson_id"])
        if not lesson:
            continue
        level = _integer(lesson, "level_introduced")
        bindings_by_level[level].append(binding)
        if level not in EXPECTED_POINT_COUNTS:
            errors.append(issue(
                "grammar_active_level", "Only HSK 1-3 lessons may be active",
                table=GRAMMAR_STUDY_PRODUCT_TABLE, entity_id=binding["grammar_lesson_id"],
            ))
        if lesson.get("review_status") != "approved":
            errors.append(issue(
                "grammar_lesson_approval", "Active grammar lessons must be approved",
                table="grammar_lessons.csv", entity_id=lesson["grammar_lesson_id"],
            ))
        if _sentence_count(lesson.get("summary_en", "")) > 2:
            errors.append(issue(
                "grammar_purpose_length", "Lesson purpose must contain no more than two sentences",
                table="grammar_lessons.csv", entity_id=lesson["grammar_lesson_id"],
            ))
    for level, rows in bindings_by_level.items():
        rows.sort(key=lambda row: _integer(row, "level_display_order"))
        if not _contiguous(rows, "level_display_order"):
            errors.append(issue(
                "grammar_display_order", "Active level_display_order must be contiguous within each level",
                table=GRAMMAR_STUDY_PRODUCT_TABLE, entity_id=str(level),
            ))

    lesson_points = tables["grammar_lesson_points.csv"]
    points_by_lesson = _group(lesson_points, "grammar_lesson_id", "relation_order")
    point_links: dict[str, list[dict[str, str]]] = defaultdict(list)
    for row in lesson_points:
        if row.get("relation_role") == "primary":
            point_links[row["grammar_point_id"]].append(row)
    for lesson_id, rows in points_by_lesson.items():
        if not _contiguous(rows, "relation_order"):
            errors.append(issue(
                "grammar_relation_order", "relation_order must be contiguous within each lesson",
                table="grammar_lesson_points.csv", entity_id=lesson_id,
            ))
    for point_id in expected_ids:
        rows = point_links.get(point_id, [])
        if len(rows) != 1:
            errors.append(issue(
                "grammar_primary_point_coverage",
                f"Official point must have exactly one primary lesson mapping; found {len(rows)}",
                table="grammar_lesson_points.csv", entity_id=point_id,
            ))
        elif rows[0]["grammar_lesson_id"] not in active_lesson_ids:
            errors.append(issue(
                "grammar_primary_point_activation", "Primary lesson mapping is not active",
                table="grammar_lesson_points.csv", entity_id=point_id,
            ))
    for lesson_id in active_lesson_ids:
        lesson = lessons.get(lesson_id)
        if not lesson:
            continue
        rows = points_by_lesson.get(lesson_id, [])
        primary = [row for row in rows if row.get("relation_role") == "primary"]
        if not primary:
            errors.append(issue(
                "grammar_lesson_orphan", "Active lesson has no primary official point",
                table="grammar_lesson_points.csv", entity_id=lesson_id,
            ))
            continue
        primary_points = [points.get(row["grammar_point_id"]) for row in primary]
        primary_points = [row for row in primary_points if row]
        levels = {_integer(row, "level_min") for row in primary_points}
        if levels != {_integer(lesson, "level_introduced")}:
            errors.append(issue(
                "grammar_primary_level", "Primary points must share the lesson introduction level",
                table="grammar_lesson_points.csv", entity_id=lesson_id,
            ))
        if any(row["grammar_point_id"] not in expected_ids for row in primary):
            errors.append(issue(
                "grammar_active_scope", "Active lessons cannot include HSK 4-9 primary points",
                table="grammar_lesson_points.csv", entity_id=lesson_id,
            ))
        for row in rows:
            if row.get("review_status") != "approved":
                errors.append(issue(
                    "grammar_mapping_approval", "Relationships consumed by active lessons must be approved",
                    table="grammar_lesson_points.csv",
                    entity_id=f"{lesson_id}:{row['grammar_point_id']}",
                ))
            related_point = points.get(row["grammar_point_id"])
            if related_point and (
                _integer(related_point, "level_min") not in EXPECTED_POINT_COUNTS
                or _integer(related_point, "level_min") > _integer(lesson, "level_introduced")
            ):
                errors.append(issue(
                    "grammar_active_scope",
                    "Active lessons may reference only HSK 1-3 points at or below the lesson level",
                    table="grammar_lesson_points.csv",
                    entity_id=f"{lesson_id}:{row['grammar_point_id']}",
                ))
        categories = {(row["category_zh"], row["category_en"]) for row in primary_points}
        if len(categories) > 1 and lesson.get("display_group_basis") == "official_category":
            errors.append(issue(
                "grammar_display_group", "Cross-category lessons require an explicit reviewed override basis",
                table="grammar_lessons.csv", entity_id=lesson_id,
            ))
        if len(categories) == 1 and lesson.get("display_group_basis") == "official_category":
            _category_zh, category_en = next(iter(categories))
            if lesson.get("display_group_en") != category_en:
                errors.append(issue(
                    "grammar_display_group", "Official display group must match the official top-level category",
                    table="grammar_lessons.csv", entity_id=lesson_id,
                ))
        source_ids = {row["source_id"] for row in primary_points}
        if lesson.get("basis_source_id") not in source_ids:
            errors.append(issue(
                "grammar_lesson_provenance", "Lesson basis must reference its primary official source",
                table="grammar_lessons.csv", entity_id=lesson_id,
            ))

    lesson_elements = tables["grammar_lesson_elements.csv"]
    elements_by_lesson = _group(lesson_elements, "grammar_lesson_id", "relation_order")
    element_links: dict[str, list[dict[str, str]]] = defaultdict(list)
    for row in lesson_elements:
        if row.get("relation_role") == "primary":
            element_links[row["grammar_element_id"]].append(row)
    for lesson_id, rows in elements_by_lesson.items():
        if not _contiguous(rows, "relation_order"):
            errors.append(issue(
                "grammar_relation_order", "relation_order must be contiguous within each lesson",
                table="grammar_lesson_elements.csv", entity_id=lesson_id,
            ))
    for element_id, element in elements.items():
        if element.get("grammar_point_id") not in expected_ids:
            continue
        rows = element_links.get(element_id, [])
        if len(rows) != 1:
            errors.append(issue(
                "grammar_primary_element_coverage",
                f"Element must have exactly one primary lesson mapping; found {len(rows)}",
                table="grammar_lesson_elements.csv", entity_id=element_id,
            ))
        elif rows[0]["grammar_lesson_id"] not in active_lesson_ids:
            errors.append(issue(
                "grammar_primary_element_activation", "Primary element mapping is not active",
                table="grammar_lesson_elements.csv", entity_id=element_id,
            ))
    point_relation_keys = {
        (row["grammar_lesson_id"], row["grammar_point_id"]): row for row in lesson_points
    }
    for lesson_id in active_lesson_ids:
        rows = elements_by_lesson.get(lesson_id, [])
        if not rows:
            errors.append(issue(
                "grammar_lesson_elements", "Active lesson has no normalized element mappings",
                table="grammar_lesson_elements.csv", entity_id=lesson_id,
            ))
        for row in rows:
            element = elements.get(row["grammar_element_id"])
            if row.get("review_status") != "approved":
                errors.append(issue(
                    "grammar_mapping_approval", "Relationships consumed by active lessons must be approved",
                    table="grammar_lesson_elements.csv",
                    entity_id=f"{lesson_id}:{row['grammar_element_id']}",
                ))
            if not element:
                continue
            point_relation = point_relation_keys.get((lesson_id, element["grammar_point_id"]))
            if not point_relation:
                errors.append(issue(
                    "grammar_mapping_consistency", "Element mapping lacks a lesson mapping to its official point",
                    table="grammar_lesson_elements.csv", entity_id=row["grammar_element_id"],
                ))
            elif row.get("relation_role") == "primary" and point_relation.get("relation_role") != "primary":
                errors.append(issue(
                    "grammar_mapping_consistency", "Primary element mapping requires a primary point mapping",
                    table="grammar_lesson_elements.csv", entity_id=row["grammar_element_id"],
                ))

    notes_by_lesson = _group(tables["grammar_lesson_notes.csv"], "grammar_lesson_id", "note_order")
    patterns_by_lesson = _group(
        tables["grammar_lesson_patterns.csv"], "grammar_lesson_id", "pattern_order"
    )
    mapped_element_keys = {
        (row["grammar_lesson_id"], row["grammar_element_id"]) for row in lesson_elements
    }
    for lesson_id in active_lesson_ids:
        lesson = lessons.get(lesson_id)
        if not lesson:
            continue
        notes = notes_by_lesson.get(lesson_id, [])
        patterns = patterns_by_lesson.get(lesson_id, [])
        if not 1 <= len(notes) <= 4:
            errors.append(issue(
                "grammar_note_count", "Active lessons require one to four How it works notes",
                table="grammar_lesson_notes.csv", entity_id=lesson_id,
            ))
        if notes and not _contiguous(notes, "note_order"):
            errors.append(issue(
                "grammar_note_order", "note_order must be contiguous within each lesson",
                table="grammar_lesson_notes.csv", entity_id=lesson_id,
            ))
        if patterns and not _contiguous(patterns, "pattern_order"):
            errors.append(issue(
                "grammar_pattern_order", "pattern_order must be contiguous within each lesson",
                table="grammar_lesson_patterns.csv", entity_id=lesson_id,
            ))
        if lesson.get("lesson_kind") in FORMULA_KINDS and not patterns:
            errors.append(issue(
                "grammar_pattern_required", "Formula-bearing lessons require at least one reviewed pattern",
                table="grammar_lesson_patterns.csv", entity_id=lesson_id,
            ))
        for table, rows in (
            ("grammar_lesson_notes.csv", notes),
            ("grammar_lesson_patterns.csv", patterns),
        ):
            for row in rows:
                entity_id = row.get("grammar_note_id") or row.get("grammar_pattern_id", "")
                if row.get("review_status") != "approved":
                    errors.append(issue(
                        "grammar_lesson_content_approval", "Active lesson content must be approved",
                        table=table, entity_id=entity_id,
                    ))
                element_id = row.get("grammar_element_id", "")
                if element_id and (lesson_id, element_id) not in mapped_element_keys:
                    errors.append(issue(
                        "grammar_mapping_consistency", "Lesson content references an unmapped element",
                        table=table, entity_id=entity_id,
                    ))
        instructional_words = _word_count(lesson.get("summary_en", ""))
        instructional_words += _word_count(lesson.get("watch_out_en", ""))
        instructional_words += sum(_word_count(row.get("text_en", "")) for row in notes)
        if instructional_words > 140:
            errors.append(issue(
                "grammar_lesson_length", "Lesson summary, notes, and Watch out exceed 140 English words",
                table="grammar_lessons.csv", entity_id=lesson_id,
            ))
        visible_zh = " ".join([
            lesson.get("target_form_zh", ""),
            *(row.get("pattern", "") for row in patterns),
        ])
        for relation in elements_by_lesson.get(lesson_id, []):
            element = elements.get(relation["grammar_element_id"])
            if (
                element and element.get("element_kind") == "inventory_member"
                and element.get("target_zh") not in visible_zh
            ):
                errors.append(issue(
                    "grammar_inventory_visibility",
                    "Every inventory member must appear in the lesson target or pattern content",
                    table="grammar_lessons.csv", entity_id=lesson_id,
                ))

    examples = {
        row["grammar_example_id"]: row for row in tables["grammar_lesson_examples.csv"]
    }
    examples_by_lesson = _group(
        tables["grammar_lesson_examples.csv"], "grammar_lesson_id", "example_order"
    )
    example_points = tables["grammar_example_points.csv"]
    points_by_example = _group(example_points, "grammar_example_id", "demonstration_order")
    targets_by_example = _group(
        tables["grammar_example_targets.csv"], "grammar_example_id", "target_order"
    )
    patterns = {
        row["grammar_pattern_id"]: row for row in tables["grammar_lesson_patterns.csv"]
    }
    sentences = {row["sentence_id"]: row for row in tables["sentences.csv"]}
    utterances = _group(tables["sentence_utterances.csv"], "sentence_id", "turn_order")
    sentence_translations = {
        (row["sentence_id"], row["locale"]): row
        for row in tables["sentence_translations.csv"]
    }
    utterance_translations = {
        (row["sentence_id"], row["turn_order"], row["locale"]): row
        for row in tables["sentence_utterance_translations.csv"]
    }
    sentence_vocab = _group(tables["sentence_vocabulary.csv"], "sentence_id", "position")
    sentence_grammar = _group(tables["sentence_grammar.csv"], "sentence_id", "position")
    exceptions = {
        (row["vocab_id"], row["surface_form"]): row
        for row in tables["coverage_exceptions.csv"]
    }
    grammar_vocabulary_policies = tables["grammar_vocabulary_exceptions.csv"]
    authorized_unlinked = authorized_vocabulary_exception_occurrences(tables)
    demonstrated_points: Counter[tuple[str, str]] = Counter()
    demonstrated_elements: Counter[tuple[str, str]] = Counter()
    for lesson_id in active_lesson_ids:
        lesson = lessons.get(lesson_id)
        if not lesson:
            continue
        lesson_examples = examples_by_lesson.get(lesson_id, [])
        if len(lesson_examples) < 2:
            errors.append(issue(
                "grammar_example_count", "Every active lesson requires at least two examples",
                table="grammar_lesson_examples.csv", entity_id=lesson_id,
            ))
        if lesson_examples and not _contiguous(lesson_examples, "example_order"):
            errors.append(issue(
                "grammar_example_order", "example_order must be contiguous within each lesson",
                table="grammar_lesson_examples.csv", entity_id=lesson_id,
            ))
        sentence_ids = [row["sentence_id"] for row in lesson_examples]
        if len(sentence_ids) != len(set(sentence_ids)):
            errors.append(issue(
                "grammar_example_duplicate", "A lesson cannot repeat the same canonical sentence",
                table="grammar_lesson_examples.csv", entity_id=lesson_id,
            ))
        for example in lesson_examples:
            example_id = example["grammar_example_id"]
            if example.get("review_status") != "approved":
                errors.append(issue(
                    "grammar_example_approval", "Active lesson examples must be approved",
                    table="grammar_lesson_examples.csv", entity_id=example_id,
                ))
            pattern_id = example.get("grammar_pattern_id", "")
            if pattern_id and patterns.get(pattern_id, {}).get("grammar_lesson_id") != lesson_id:
                errors.append(issue(
                    "grammar_example_pattern", "Example pattern must belong to the same lesson",
                    table="grammar_lesson_examples.csv", entity_id=example_id,
                ))
            sentence = sentences.get(example["sentence_id"])
            if not sentence:
                continue
            if sentence.get("source_id") != "legacy-runtime" and not SENTENCE_ID_PATTERN.fullmatch(
                sentence.get("sentence_id", "")
            ):
                errors.append(issue(
                    "grammar_sentence_identity", "New grammar examples require sent_<uuid4-hex> IDs",
                    table="sentences.csv", entity_id=sentence.get("sentence_id", ""),
                ))
            if (
                sentence.get("curation_status") != "approved"
                or sentence.get("linguistic_review_status") != "approved"
            ):
                errors.append(issue(
                    "grammar_sentence_approval", "Grammar example sentences require both approvals",
                    table="sentences.csv", entity_id=sentence["sentence_id"],
                ))
            if _integer(sentence, "level") != _integer(lesson, "level_introduced"):
                errors.append(issue(
                    "grammar_sentence_level", "Example sentence level must equal the lesson introduction level",
                    table="sentences.csv", entity_id=sentence["sentence_id"],
                ))
            turns = utterances.get(sentence["sentence_id"], [])
            if len(turns) != 1 or turns[0].get("zh_text") != sentence.get("full_zh"):
                errors.append(issue(
                    "grammar_example_utterance",
                    "Grammar examples require exactly one utterance matching the complete sentence",
                    table="sentence_utterances.csv", entity_id=sentence["sentence_id"],
                ))
            else:
                turn = turns[0]
                if turn.get("review_status") != "approved":
                    errors.append(issue(
                        "grammar_example_approval", "Grammar example utterance must be approved",
                        table="sentence_utterances.csv", entity_id=sentence["sentence_id"],
                    ))
                pinyin_error = validate_pinyin(turn.get("pinyin", ""))
                if pinyin_error:
                    errors.append(issue(
                        "grammar_example_pinyin", pinyin_error,
                        table="sentence_utterances.csv", entity_id=sentence["sentence_id"],
                    ))
                translation = sentence_translations.get((sentence["sentence_id"], "en"))
                turn_translation = utterance_translations.get(
                    (sentence["sentence_id"], turn.get("turn_order", ""), "en")
                )
                if not translation or translation.get("review_status") != "approved":
                    errors.append(issue(
                        "grammar_example_translation", "Grammar example needs an approved English translation",
                        table="sentence_translations.csv", entity_id=sentence["sentence_id"],
                    ))
                if not turn_translation or turn_translation.get("review_status") != "approved":
                    errors.append(issue(
                        "grammar_example_translation", "Grammar utterance needs an approved English translation",
                        table="sentence_utterance_translations.csv", entity_id=sentence["sentence_id"],
                    ))
                if translation and turn_translation and translation.get("text") != turn_translation.get("text"):
                    errors.append(issue(
                        "grammar_example_translation", "One-utterance sentence translations must agree",
                        table="sentence_utterance_translations.csv", entity_id=sentence["sentence_id"],
                    ))
            for link in sentence_vocab.get(sentence["sentence_id"], []):
                if link.get("review_status") != "approved" or not link.get("vocab_id"):
                    errors.append(issue(
                        "grammar_example_vocabulary", "Every lexical occurrence must have an approved sense link",
                        table="sentence_vocabulary.csv", entity_id=sentence["sentence_id"],
                    ))
                if link.get("resolution_status") == "component_only":
                    exception = exceptions.get((link.get("vocab_id", ""), link.get("surface_form", "")))
                    if not exception or exception.get("review_status") != "approved":
                        errors.append(issue(
                            "grammar_example_vocabulary", "Component coverage requires an approved exception",
                            table="sentence_vocabulary.csv", entity_id=sentence["sentence_id"],
                        ))
            for link in sentence_grammar.get(sentence["sentence_id"], []):
                if link.get("review_status") != "approved":
                    errors.append(issue(
                        "grammar_example_relation", "Grammar example relations must be approved",
                        table="sentence_grammar.csv", entity_id=sentence["sentence_id"],
                    ))

            demonstrations = points_by_example.get(example_id, [])
            if not demonstrations or not _contiguous(demonstrations, "demonstration_order"):
                errors.append(issue(
                    "grammar_demonstration_order",
                    "Every example needs contiguous point/element demonstrations",
                    table="grammar_example_points.csv", entity_id=example_id,
                ))
            demonstrated_element_ids = set()
            for demonstration in demonstrations:
                element = elements.get(demonstration["grammar_element_id"])
                point_id = demonstration["grammar_point_id"]
                element_id = demonstration["grammar_element_id"]
                demonstrated_element_ids.add(element_id)
                if demonstration.get("review_status") != "approved":
                    errors.append(issue(
                        "grammar_demonstration_approval", "Example demonstrations must be approved",
                        table="grammar_example_points.csv",
                        entity_id=f"{example_id}:{element_id}",
                    ))
                if not element or element.get("grammar_point_id") != point_id:
                    errors.append(issue(
                        "grammar_demonstration_consistency", "Demonstrated element does not belong to the point",
                        table="grammar_example_points.csv",
                        entity_id=f"{example_id}:{element_id}",
                    ))
                if (lesson_id, point_id) not in point_relation_keys or (
                    lesson_id, element_id
                ) not in mapped_element_keys:
                    errors.append(issue(
                        "grammar_demonstration_consistency",
                        "Demonstrated point and element must both be mapped to the example lesson",
                        table="grammar_example_points.csv",
                        entity_id=f"{example_id}:{element_id}",
                    ))
                if _word_count(demonstration.get("analysis_en", "")) > 45:
                    errors.append(issue(
                        "grammar_analysis_length", "Example analysis exceeds 45 English words",
                        table="grammar_example_points.csv",
                        entity_id=f"{example_id}:{element_id}",
                    ))
                exact_links = [
                    link for link in sentence_grammar.get(sentence["sentence_id"], [])
                    if link.get("grammar_point_id") == point_id
                    and link.get("mapping_status") == "mapped"
                    and link.get("review_status") == "approved"
                ]
                if not exact_links:
                    errors.append(issue(
                        "grammar_example_relation",
                        "Demonstration lacks a matching approved exact sentence_grammar relation",
                        table="sentence_grammar.csv", entity_id=sentence["sentence_id"],
                    ))
                demonstrated_points[(lesson_id, point_id)] += 1
                demonstrated_elements[(lesson_id, element_id)] += 1

            targets = targets_by_example.get(example_id, [])
            if targets and not _contiguous(targets, "target_order"):
                errors.append(issue(
                    "grammar_target_order", "target_order must be contiguous within each example",
                    table="grammar_example_targets.csv", entity_id=example_id,
                ))
            for target in targets:
                if target.get("review_status") != "approved":
                    errors.append(issue(
                        "grammar_target_approval", "Example targets must be approved",
                        table="grammar_example_targets.csv", entity_id=target["grammar_target_id"],
                    ))
                if target.get("grammar_element_id") not in demonstrated_element_ids:
                    errors.append(issue(
                        "grammar_target_consistency", "Target element is not demonstrated by the example",
                        table="grammar_example_targets.csv", entity_id=target["grammar_target_id"],
                    ))
            if turns:
                _parts, part_errors = build_target_parts(turns[0].get("zh_text", ""), targets)
                errors.extend(part_errors)
            targeted_elements = {row["grammar_element_id"] for row in targets}
            for element_id in demonstrated_element_ids:
                element = elements.get(element_id)
                if element and element.get("element_kind") not in ABSTRACT_KINDS and element_id not in targeted_elements:
                    errors.append(issue(
                        "grammar_target_required", "Non-abstract demonstrations require a literal target segment",
                        table="grammar_example_targets.csv", entity_id=f"{example_id}:{element_id}",
                    ))
            demonstrated_point_ids = {row["grammar_point_id"] for row in demonstrations}
            for policy in grammar_vocabulary_policies:
                if policy["grammar_point_id"] not in demonstrated_point_ids:
                    continue
                surface = policy["surface_form"]
                literal_count = sentence["full_zh"].count(surface)
                if literal_count and authorized_unlinked[sentence["sentence_id"]][surface] < literal_count:
                    errors.append(issue(
                        "grammar_vocabulary_exception_target",
                        "Every authorized unlinked surface occurrence must be an approved target with the required role",
                        table="grammar_example_targets.csv", entity_id=example_id,
                    ))
                if any(
                    link.get("surface_form") == surface
                    for link in sentence_vocab.get(sentence["sentence_id"], [])
                ):
                    errors.append(issue(
                        "grammar_vocabulary_exception_mapping",
                        "Authorized grammar-only surface must remain unlinked and must not be mapped to another vocabulary sense",
                        table="sentence_vocabulary.csv", entity_id=sentence["sentence_id"],
                    ))

    for point_id, rows in point_links.items():
        if point_id not in expected_ids or len(rows) != 1:
            continue
        lesson_id = rows[0]["grammar_lesson_id"]
        if demonstrated_points[(lesson_id, point_id)] < 1:
            errors.append(issue(
                "grammar_point_demonstration", "Every primary official point needs a demonstrating example",
                table="grammar_example_points.csv", entity_id=point_id,
            ))
    for element_id, rows in element_links.items():
        element = elements.get(element_id)
        if not element or element.get("grammar_point_id") not in expected_ids or len(rows) != 1:
            continue
        lesson_id = rows[0]["grammar_lesson_id"]
        required = 0
        if element.get("element_kind") in FORMULA_KINDS:
            required = 1
        elif element.get("element_kind") in ABSTRACT_KINDS:
            required = 2
        if demonstrated_elements[(lesson_id, element_id)] < required:
            errors.append(issue(
                "grammar_element_demonstration",
                f"Element kind {element.get('element_kind')} requires {required} demonstrating example(s)",
                table="grammar_example_points.csv", entity_id=element_id,
            ))

    covered_by_level = Counter()
    for point_id, rows in point_links.items():
        if point_id in in_scope and len(rows) == 1 and rows[0]["grammar_lesson_id"] in active_lesson_ids:
            covered_by_level[_integer(in_scope[point_id], "level_min")] += 1
    official_categories: dict[str, int] = {}
    for level in EXPECTED_POINT_COUNTS:
        official_categories[str(level)] = len({
            row["category_zh"] for row in in_scope.values() if _integer(row, "level_min") == level
        })
    active_examples = [
        row for row in tables["grammar_lesson_examples.csv"]
        if row["grammar_lesson_id"] in active_lesson_ids
    ]
    lesson_level_counts = Counter(
        _integer(lessons[lesson_id], "level_introduced")
        for lesson_id in active_lesson_ids if lesson_id in lessons
    )
    example_level_counts = Counter(
        _integer(lessons[row["grammar_lesson_id"]], "level_introduced")
        for row in active_examples if row["grammar_lesson_id"] in lessons
    )
    summary = {
        "enabled": True,
        "official_point_coverage": {
            str(level): {"covered": covered_by_level[level], "expected": count}
            for level, count in EXPECTED_POINT_COUNTS.items()
        },
        "official_category_counts": official_categories,
        "elements_by_kind": dict(sorted(Counter(
            row["element_kind"] for row in elements.values()
            if row.get("grammar_point_id") in expected_ids
        ).items())),
        "lessons_by_level": {str(level): lesson_level_counts[level] for level in EXPECTED_POINT_COUNTS},
        "examples_by_level": {str(level): example_level_counts[level] for level in EXPECTED_POINT_COUNTS},
        "active_lessons": len(active_lesson_ids),
        "active_examples": len(active_examples),
        "authorized_vocabulary_exceptions": len(tables["grammar_vocabulary_exceptions.csv"]),
    }
    return errors, summary


def _category_zh_for_lesson(
    lesson: dict[str, str], primary_points: list[dict[str, str]], level_points: list[dict[str, str]]
) -> str:
    matching = [
        row["category_zh"] for row in level_points
        if row["category_en"] == lesson["display_group_en"]
    ]
    if matching:
        return matching[0]
    return " / ".join(dict.fromkeys(row["category_zh"] for row in primary_points))


def compile_grammar_by_level(
    tables: dict[str, list[dict[str, str]]], *, validate: bool = True
) -> dict[int, dict[str, Any]]:
    if not feature_present(tables):
        return {}
    if validate:
        errors, _summary = validate_grammar_study(tables)
        if errors:
            first = errors[0]
            raise ValueError(
                f"Grammar study validation failed with {len(errors)} error(s); first: "
                f"{first['rule']} {first['table']} {first['entity_id']} {first['message']}"
            )

    points = {row["grammar_point_id"]: row for row in tables["grammar_points.csv"]}
    lessons = {row["grammar_lesson_id"]: row for row in tables["grammar_lessons.csv"]}
    lesson_points = _group(tables["grammar_lesson_points.csv"], "grammar_lesson_id", "relation_order")
    notes = _group(tables["grammar_lesson_notes.csv"], "grammar_lesson_id", "note_order")
    patterns = _group(tables["grammar_lesson_patterns.csv"], "grammar_lesson_id", "pattern_order")
    examples = _group(tables["grammar_lesson_examples.csv"], "grammar_lesson_id", "example_order")
    example_points = _group(tables["grammar_example_points.csv"], "grammar_example_id", "demonstration_order")
    targets = _group(tables["grammar_example_targets.csv"], "grammar_example_id", "target_order")
    sentences = {row["sentence_id"]: row for row in tables["sentences.csv"]}
    utterances = _group(tables["sentence_utterances.csv"], "sentence_id", "turn_order")
    translations = {
        (row["sentence_id"], row["locale"]): row for row in tables["sentence_translations.csv"]
    }
    active_bindings = [
        row for row in tables[GRAMMAR_STUDY_PRODUCT_TABLE] if row["active"] == "true"
    ]
    by_level: dict[int, list[dict[str, str]]] = defaultdict(list)
    for binding in active_bindings:
        level = _integer(lessons[binding["grammar_lesson_id"]], "level_introduced")
        by_level[level].append(binding)
    payloads: dict[int, dict[str, Any]] = {}
    for level in EXPECTED_POINT_COUNTS:
        bindings = sorted(by_level[level], key=lambda row: _integer(row, "level_display_order"))
        level_points = sorted(
            [row for row in points.values() if _integer(row, "level_min") == level],
            key=lambda row: _integer(row, "row_order"),
        )
        lesson_contexts = []
        for binding in bindings:
            lesson = lessons[binding["grammar_lesson_id"]]
            primary_points = [
                points[row["grammar_point_id"]] for row in lesson_points[lesson["grammar_lesson_id"]]
                if row["relation_role"] == "primary"
            ]
            lesson_contexts.append((lesson, primary_points))
        group_names = list(dict.fromkeys(lesson["display_group_en"] for lesson, _points in lesson_contexts))
        category_keys = {name: f"category-{index}" for index, name in enumerate(group_names, start=1)}
        categories = []
        for name in group_names:
            lesson, primary_points = next(
                context for context in lesson_contexts if context[0]["display_group_en"] == name
            )
            categories.append({
                "key": category_keys[name],
                "labelEn": name,
                "labelZh": _category_zh_for_lesson(lesson, primary_points, level_points),
            })
        compiled_lessons = []
        for lesson, primary_points in lesson_contexts:
            lesson_id = lesson["grammar_lesson_id"]
            compiled_examples = []
            for example in examples.get(lesson_id, []):
                sentence = sentences[example["sentence_id"]]
                turn = utterances[sentence["sentence_id"]][0]
                parts, part_errors = build_target_parts(
                    turn["zh_text"], targets.get(example["grammar_example_id"], [])
                )
                if part_errors:
                    raise ValueError(part_errors[0]["message"])
                compiled_examples.append({
                    "id": example["grammar_example_id"],
                    "zh": turn["zh_text"],
                    "pinyin": turn["pinyin"],
                    "translationEn": translations[(sentence["sentence_id"], "en")]["text"],
                    "analyses": [
                        {"textEn": row["analysis_en"]}
                        for row in example_points[example["grammar_example_id"]]
                    ],
                    "parts": parts,
                })
            primary_category_zh = _category_zh_for_lesson(lesson, primary_points, level_points)
            compiled_lessons.append({
                "id": lesson_id,
                "level": level,
                "primaryPointIds": [row["grammar_point_id"] for row in primary_points],
                "titleEn": lesson["title_en"],
                "targetFormZh": lesson["target_form_zh"],
                "categoryKey": category_keys[lesson["display_group_en"]],
                "categoryEn": lesson["display_group_en"],
                "categoryZh": primary_category_zh,
                "purposeEn": lesson["summary_en"],
                "patterns": [
                    {
                        "labelEn": row["label_en"],
                        "pattern": row["pattern"],
                        "formationEn": row["formation_en"],
                        "usageEn": row["usage_en"],
                    }
                    for row in patterns.get(lesson_id, [])
                ],
                "notes": [
                    {"kind": row["note_kind"], "textEn": row["text_en"]}
                    for row in notes.get(lesson_id, [])
                ],
                "watchOutEn": lesson["watch_out_en"],
                "examples": compiled_examples,
            })
        payloads[level] = {
            "schemaVersion": GRAMMAR_SCHEMA_VERSION,
            "syllabusId": GRAMMAR_SYLLABUS_ID,
            "level": level,
            "officialPointIds": [row["grammar_point_id"] for row in level_points],
            "categories": categories,
            "lessons": compiled_lessons,
        }
    return payloads


def render_grammar_chunks(payloads: dict[int, dict[str, Any]]) -> dict[str, str]:
    rendered = {}
    for level, payload in sorted(payloads.items()):
        filename = f"grammar-lessons-hsk{level}.js"
        encoded = json.dumps(payload, ensure_ascii=False, indent=2)
        rendered[filename] = (
            "(function () {\n"
            '  "use strict";\n'
            "  var root = window.HSKFlashcards;\n"
            f"  var payload = {encoded};\n"
            "  if (!root || typeof root !== \"object\") return;\n"
            f"  if (payload.schemaVersion !== \"{GRAMMAR_SCHEMA_VERSION}\" || "
            f"payload.syllabusId !== \"{GRAMMAR_SYLLABUS_ID}\" || "
            f"payload.level !== {level} || !Array.isArray(payload.officialPointIds) || "
            f"payload.officialPointIds.length !== {EXPECTED_POINT_COUNTS[level]} || "
            "!Array.isArray(payload.categories) || !Array.isArray(payload.lessons)) return;\n"
            "  var catalogs = root.grammarCatalogByLevel;\n"
            "  if (!catalogs || typeof catalogs !== \"object\" || Array.isArray(catalogs)) {\n"
            "    catalogs = {};\n"
            "    root.grammarCatalogByLevel = catalogs;\n"
            "  }\n"
            "  var current = catalogs[payload.level];\n"
            "  var currentValid = current && current.schemaVersion === payload.schemaVersion && "
            "current.syllabusId === payload.syllabusId && current.level === payload.level && "
            "Array.isArray(current.officialPointIds) && "
            f"current.officialPointIds.length === {EXPECTED_POINT_COUNTS[level]} && "
            "Array.isArray(current.categories) && Array.isArray(current.lessons);\n"
            "  if (currentValid) return;\n"
            "  if (current) delete catalogs[payload.level];\n"
            "  catalogs[payload.level] = payload;\n"
            "})();\n"
        )
    return rendered


def check_grammar_runtime(payloads: dict[int, dict[str, Any]]) -> list[dict[str, Any]]:
    expected = render_grammar_chunks(payloads)
    actual_paths = sorted(GRAMMAR_DATA_DIR.glob("grammar-lessons-hsk*.js"))
    actual_names = {path.name for path in actual_paths}
    expected_names = set(expected)
    differences: list[dict[str, Any]] = []
    for name in sorted(expected_names - actual_names):
        differences.append({"family": "grammar", "kind": "missing", "file": name})
    for name in sorted(actual_names - expected_names):
        differences.append({"family": "grammar", "kind": "unexpected", "file": name})
    for name in sorted(expected_names & actual_names):
        path = GRAMMAR_DATA_DIR / name
        if path.read_text(encoding="utf-8") != expected[name]:
            differences.append({"family": "grammar", "kind": "content", "file": name})
    return differences


def grammar_coverage_rows(tables: dict[str, list[dict[str, str]]]) -> list[dict[str, str]]:
    points = sorted(
        [
            row for row in tables["grammar_points.csv"]
            if _integer(row, "level_min") in EXPECTED_POINT_COUNTS
            and _integer(row, "level_min") == _integer(row, "level_max")
        ],
        key=lambda row: (_integer(row, "level_min"), _integer(row, "row_order")),
    )
    elements_by_point = _group(tables["grammar_point_elements.csv"], "grammar_point_id")
    point_links: dict[str, list[dict[str, str]]] = defaultdict(list)
    for row in tables["grammar_lesson_points.csv"]:
        if row["relation_role"] == "primary":
            point_links[row["grammar_point_id"]].append(row)
    element_primary = Counter(
        row["grammar_element_id"] for row in tables["grammar_lesson_elements.csv"]
        if row["relation_role"] == "primary"
    )
    examples = {
        row["grammar_example_id"]: row for row in tables["grammar_lesson_examples.csv"]
    }
    active = {
        row["grammar_lesson_id"] for row in tables[GRAMMAR_STUDY_PRODUCT_TABLE]
        if row["active"] == "true"
    }
    active_example_ids = {
        example_id for example_id, row in examples.items()
        if row["grammar_lesson_id"] in active
    }
    demonstrations = Counter(
        row["grammar_point_id"] for row in tables["grammar_example_points.csv"]
        if row["grammar_example_id"] in active_example_ids
    )
    vocabulary_exceptions = _group(
        tables["grammar_vocabulary_exceptions.csv"], "grammar_point_id"
    )
    rows = []
    for point in points:
        point_id = point["grammar_point_id"]
        links = point_links.get(point_id, [])
        primary_lesson_id = links[0]["grammar_lesson_id"] if len(links) == 1 else ""
        elements = elements_by_point.get(point_id, [])
        mapped_elements = sum(element_primary[row["grammar_element_id"]] == 1 for row in elements)
        complete = (
            point["review_status"] == "approved"
            and len(links) == 1
            and primary_lesson_id in active
            and bool(elements)
            and mapped_elements == len(elements)
            and demonstrations[point_id] > 0
        )
        rows.append({
            "grammar_point_id": point_id,
            "level": point["level_min"],
            "row_order": point["row_order"],
            "category_zh": point["category_zh"],
            "category_en": point["category_en"],
            "review_status": point["review_status"],
            "primary_lesson_id": primary_lesson_id,
            "primary_mapping_count": str(len(links)),
            "primary_lesson_active": "true" if primary_lesson_id in active else "false",
            "element_count": str(len(elements)),
            "primary_element_mapping_count": str(mapped_elements),
            "demonstrating_example_count": str(demonstrations[point_id]),
            "vocabulary_exception_surfaces": "|".join(
                row["surface_form"] for row in vocabulary_exceptions.get(point_id, [])
            ),
            "complete": "true" if complete else "false",
        })
    return rows


def grammar_markdown_report(
    tables: dict[str, list[dict[str, str]]], errors: list[dict[str, str]], summary: dict[str, Any]
) -> str:
    lines = [
        "# Grammar study coverage", "",
        f"Status: **{'PASS' if not errors else 'FAIL'}**.", "",
        f"Feature activation: **{'ACTIVE' if summary['enabled'] else 'EMPTY / PRE-CURATION'}**.", "",
        "## Official row coverage", "",
        "| HSK | Primary coverage | Official categories | Active lessons | Active examples |",
        "| ---: | ---: | ---: | ---: | ---: |",
    ]
    for level, expected in EXPECTED_POINT_COUNTS.items():
        coverage = summary["official_point_coverage"][str(level)]
        lines.append(
            f"| {level} | {coverage['covered']}/{expected} | "
            f"{summary.get('official_category_counts', {}).get(str(level), 0)} | "
            f"{summary.get('lessons_by_level', {}).get(str(level), 0)} | "
            f"{summary.get('examples_by_level', {}).get(str(level), 0)} |"
        )
    lines.extend(["", "## Elements", ""])
    if summary.get("elements_by_kind"):
        lines.extend(["| Kind | Count |", "| --- | ---: |"])
        for kind, count in summary["elements_by_kind"].items():
            lines.append(f"| `{kind}` | {count} |")
    else:
        lines.append("No normalized grammar elements have been curated.")
    lines.extend(["", "## Authorized vocabulary exceptions", ""])
    vocabulary_exceptions = tables["grammar_vocabulary_exceptions.csv"]
    if vocabulary_exceptions:
        for row in vocabulary_exceptions:
            lines.append(
                f"- `{row['grammar_point_id']}` / `{row['surface_form']}` / HSK {row['level']} / "
                f"target role `{row['required_target_role']}`: {row['reason']} "
                "No vocabulary relation is emitted."
            )
    else:
        lines.append("None.")
    lines.extend(["", "## Review status", ""])
    for table in (
        "grammar_points.csv", *GRAMMAR_STUDY_CATALOG_TABLES,
    ):
        relevant = tables[table]
        if table == "grammar_points.csv":
            relevant = [row for row in relevant if _integer(row, "level_min") in EXPECTED_POINT_COUNTS]
        field = "review_status"
        counts = Counter(row[field] for row in relevant)
        rendered = ", ".join(f"{status}: {count}" for status, count in sorted(counts.items())) or "none"
        lines.append(f"- `{table}`: {rendered}")
    lines.extend(["", "## Validation", ""])
    if errors:
        for item in errors:
            lines.append(
                f"- ERROR `{item['rule']}` {item['table']} {item['entity_id']}: {item['message']}"
            )
    elif summary["enabled"]:
        lines.append("Complete active HSK 1-3 row and element coverage passed mechanical validation.")
    else:
        lines.append("The optional grammar-study catalog is empty; full publication checks are dormant.")
    lines.extend([
        "", "Mechanical validation does not replace linguistic review of Chinese, pinyin, translations, or explanations.", "",
    ])
    return "\n".join(lines)


def write_grammar_reports(
    tables: dict[str, list[dict[str, str]]], report_dir: Path
) -> None:
    errors, summary = validate_grammar_study(tables)
    fields = [
        "grammar_point_id", "level", "row_order", "category_zh", "category_en",
        "review_status", "primary_lesson_id", "primary_mapping_count",
        "primary_lesson_active", "element_count", "primary_element_mapping_count",
        "demonstrating_example_count", "vocabulary_exception_surfaces", "complete",
    ]
    write_csv(report_dir / "grammar-study-coverage.csv", fields, grammar_coverage_rows(tables))
    (report_dir / "grammar-study-coverage.md").write_text(
        grammar_markdown_report(tables, errors, summary), encoding="utf-8"
    )
