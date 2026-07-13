#!/usr/bin/env python3
"""Shared paths, schemas, and safe parsers for the language catalog."""

from __future__ import annotations

import csv
import hashlib
import json
import re
import unicodedata
from collections.abc import Iterable
from pathlib import Path
from typing import Any

PROJECT_ROOT = Path(__file__).resolve().parents[2]
LANGUAGE_ROOT = PROJECT_ROOT / "language"
CATALOG_DIR = LANGUAGE_ROOT / "data" / "catalog"
PRODUCT_DIR = LANGUAGE_ROOT / "data" / "product_bindings"
REFERENCE_DIR = LANGUAGE_ROOT / "reference"
REPORT_DIR = LANGUAGE_ROOT / "reports"
SCHEMA_DIR = LANGUAGE_ROOT / "schemas"

ZH_SYLLABUS = REFERENCE_DIR / "HSK_SYLLABUS_ZH.md"
EN_SYLLABUS = REFERENCE_DIR / "HSK_SYLLABUS_EN.md"

CATALOG_FIELDS: dict[str, list[str]] = {
    "sources.csv": [
        "source_id", "authority", "source_kind", "title", "edition", "published_at",
        "effective_at", "language", "path", "sha256", "notes",
    ],
    "vocabulary.csv": [
        "vocab_id", "syllabus_order", "level_min", "level_max", "level_raw",
        "additional_levels", "hanzi", "syllabus_form", "sense_number", "syllabus_pinyin",
        "pinyin", "pinyin_search", "pinyin_numeric", "syllabus_part_of_speech_zh",
        "part_of_speech_zh", "example_zh", "example_review_status",
        "curation_status", "source_id", "source_locator", "notes",
    ],
    "vocabulary_translations.csv": [
        "vocab_id", "locale", "text", "review_status", "source_id", "notes",
    ],
    "grammar_points.csv": [
        "grammar_point_id", "level_min", "level_max", "row_order", "category_zh",
        "category_en", "category_name_zh", "category_name_en", "subitem_zh", "subitem_en",
        "content_zh", "content_en", "review_status", "source_id", "source_locator_zh",
        "source_locator_en", "notes",
    ],
    "grammar_point_elements.csv": [
        "grammar_element_id", "grammar_point_id", "element_order", "element_kind",
        "target_zh", "learner_gloss_en", "review_status", "basis_source_id",
        "content_origin", "notes",
    ],
    "grammar_lessons.csv": [
        "grammar_lesson_id", "level_introduced", "lesson_kind", "title_en",
        "target_form_zh", "summary_en", "watch_out_en", "display_group_en",
        "display_group_basis", "register", "review_status", "basis_source_id",
        "content_origin", "notes",
    ],
    "grammar_lesson_points.csv": [
        "grammar_lesson_id", "grammar_point_id", "relation_role", "relation_order",
        "coverage_note_en", "review_status", "notes",
    ],
    "grammar_lesson_elements.csv": [
        "grammar_lesson_id", "grammar_element_id", "relation_role", "relation_order",
        "review_status", "notes",
    ],
    "grammar_lesson_notes.csv": [
        "grammar_note_id", "grammar_lesson_id", "grammar_element_id", "note_order",
        "note_kind", "text_en", "review_status", "notes",
    ],
    "grammar_lesson_patterns.csv": [
        "grammar_pattern_id", "grammar_lesson_id", "grammar_element_id", "pattern_order",
        "label_en", "pattern", "formation_en", "usage_en", "review_status", "notes",
    ],
    "grammar_lesson_examples.csv": [
        "grammar_example_id", "grammar_lesson_id", "grammar_pattern_id", "sentence_id",
        "example_order", "context_note_en", "example_kind", "review_status", "notes",
    ],
    "grammar_example_points.csv": [
        "grammar_example_id", "grammar_point_id", "grammar_element_id",
        "demonstration_order", "analysis_en", "review_status", "notes",
    ],
    "grammar_example_targets.csv": [
        "grammar_target_id", "grammar_example_id", "grammar_element_id", "target_order",
        "target_role", "target_text_zh", "occurrence_number", "review_status", "notes",
    ],
    "grammar_vocabulary_exceptions.csv": [
        "grammar_vocab_exception_id", "grammar_point_id", "surface_form", "level",
        "required_target_role", "reason", "authorization", "review_status", "notes",
    ],
    "tasks.csv": [
        "task_id", "level_min", "level_max", "scenario_id", "task_number", "title_zh",
        "title_en", "source_id", "source_locator_zh", "source_locator_en",
    ],
    "task_scenarios.csv": [
        "scenario_id", "level_min", "level_max", "scenario_order", "title_zh", "title_en",
        "source_id", "source_locator_zh", "source_locator_en",
    ],
    "task_capabilities.csv": [
        "task_id", "capability_number", "statement_zh", "statement_en", "source_id",
        "source_locator_zh", "source_locator_en",
    ],
    "topics.csv": [
        "topic_id", "level_min", "level_max", "row_order", "topic_l1_zh", "topic_l1_en",
        "topic_l2_zh", "topic_l2_en", "topic_l3_zh", "topic_l3_en", "source_id",
        "source_locator_zh", "source_locator_en", "notes",
    ],
    "hanzi.csv": [
        "hanzi_id", "hanzi", "recognition_level_min", "recognition_level_max",
        "writing_level_min", "writing_level_max", "curation_status", "source_id",
        "source_locator", "writing_source_locator", "notes",
    ],
    "hanzi_readings.csv": [
        "reading_id", "hanzi_id", "pinyin", "pinyin_numeric", "meaning_en",
        "stroke_sequence", "review_status", "source_id", "notes",
    ],
    "sentences.csv": [
        "sentence_id", "level", "full_zh", "topic_id", "register", "curation_status",
        "linguistic_review_status", "source_id", "notes",
    ],
    "sentence_utterances.csv": [
        "sentence_id", "turn_order", "role", "zh_text", "pinyin", "review_status", "notes",
    ],
    "sentence_translations.csv": [
        "sentence_id", "locale", "text", "review_status", "source_id", "notes",
    ],
    "sentence_utterance_translations.csv": [
        "sentence_id", "turn_order", "locale", "text", "review_status", "source_id", "notes",
    ],
    "sentence_vocabulary.csv": [
        "sentence_id", "position", "surface_form", "vocab_id", "resolution_status",
        "coverage_type", "review_status", "notes",
    ],
    "sentence_grammar.csv": [
        "sentence_id", "position", "legacy_tag", "grammar_point_id",
        "candidate_grammar_point_ids", "mapping_status", "review_status", "notes",
    ],
    "measure_word_sets.csv": [
        "measure_word_id", "level", "headword_vocab_id", "headword_hanzi", "pinyin",
        "pinyin_numeric", "meaning_en", "review_status", "source_id", "notes",
    ],
    "classifier_usages.csv": [
        "usage_id", "measure_word_id", "usage_order", "classifier_hanzi",
        "classifier_pinyin_numeric", "review_status", "notes",
    ],
    "coverage_exceptions.csv": [
        "exception_id", "vocab_id", "surface_form", "coverage_type", "allowed_surface_pattern",
        "reason", "review_status",
    ],
    "reviews.csv": [
        "review_id", "entity_type", "entity_id", "content_hash", "from_status", "to_status",
        "reviewer", "reviewer_type", "reviewed_at", "notes",
    ],
    "issues.csv": [
        "issue_id", "severity", "entity_type", "entity_id", "rule_id", "status",
        "summary", "details", "created_at", "resolved_at", "notes",
    ],
    "waivers.csv": [
        "waiver_id", "rule_id", "entity_type", "entity_id", "rationale", "approved_by",
        "approved_at", "expires_at", "notes",
    ],
}

PRODUCT_FIELDS: dict[str, list[str]] = {
    "vocabulary_cards.csv": [
        "runtime_order", "vocab_id", "legacy_storage_key", "learn_default", "practice_default",
    ],
    "sentence_cards.csv": [
        "runtime_order", "deck_order", "card_id", "sentence_id", "direction", "deck_id",
        "deck_name", "response_style", "tags",
    ],
    "hanzi_cards.csv": ["runtime_order", "card_id", "reading_id", "level"],
    "measure_word_cards.csv": ["runtime_order", "card_id", "measure_word_id"],
    "grammar_page_lessons.csv": [
        "grammar_lesson_id", "active", "level_display_order", "notes",
    ],
}

ALL_TABLE_FIELDS = {**CATALOG_FIELDS, **PRODUCT_FIELDS}

VALID_STATUSES = {
    "syllabus_only", "legacy_unreviewed", "in_review", "approved", "rejected", "retired",
}

GRAMMAR_STUDY_CONTENT_TABLES = (
    "grammar_point_elements.csv",
    "grammar_lessons.csv",
    "grammar_lesson_points.csv",
    "grammar_lesson_elements.csv",
    "grammar_lesson_notes.csv",
    "grammar_lesson_patterns.csv",
    "grammar_lesson_examples.csv",
    "grammar_example_points.csv",
    "grammar_example_targets.csv",
)
GRAMMAR_STUDY_POLICY_TABLES = ("grammar_vocabulary_exceptions.csv",)
GRAMMAR_STUDY_CATALOG_TABLES = (
    *GRAMMAR_STUDY_CONTENT_TABLES,
    *GRAMMAR_STUDY_POLICY_TABLES,
)
GRAMMAR_STUDY_PRODUCT_TABLE = "grammar_page_lessons.csv"
POST_MIGRATION_CURATED_TABLES = (
    *GRAMMAR_STUDY_CATALOG_TABLES,
    GRAMMAR_STUDY_PRODUCT_TABLE,
)

LEVEL_BANDS = {
    "一": (1, 1), "二": (2, 2), "三": (3, 3), "四": (4, 4), "五": (5, 5),
    "六": (6, 6), "七—九": (7, 9), "七-九": (7, 9), "一—二": (1, 2),
    "一-二": (1, 2), "1": (1, 1), "2": (2, 2), "3": (3, 3), "4": (4, 4),
    "5": (5, 5), "6": (6, 6), "7–9": (7, 9), "7-9": (7, 9),
    "1–2": (1, 2), "1-2": (1, 2),
}


def band_code(level_min: int, level_max: int) -> str:
    return str(level_min) if level_min == level_max else f"{level_min}{level_max}"


def band_from_text(text: str) -> tuple[int, int]:
    normalized = text.strip().replace("级", "").replace("Levels", "").replace("Level", "").strip()
    normalized = normalized.replace("–", "-").replace("—", "-")
    if normalized in LEVEL_BANDS:
        return LEVEL_BANDS[normalized]
    match = re.search(r"([1-9])\s*-\s*([1-9])", normalized)
    if match:
        return int(match.group(1)), int(match.group(2))
    match = re.search(r"([1-9])", normalized)
    if match:
        value = int(match.group(1))
        return value, value
    for key, value in LEVEL_BANDS.items():
        if key in text:
            return value
    raise ValueError(f"Cannot parse HSK level band: {text!r}")


def normalize_search_text(value: str) -> str:
    return "".join(
        ch for ch in unicodedata.normalize("NFC", value).lower()
        if not ch.isspace() and ch not in {"'", "’", "-", "·"}
    )


def sha256_file(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def row_hash(row: dict[str, Any], *, exclude: Iterable[str] = ()) -> str:
    excluded = set(exclude)
    payload = {key: row[key] for key in sorted(row) if key not in excluded}
    encoded = json.dumps(payload, ensure_ascii=False, sort_keys=True, separators=(",", ":"))
    return hashlib.sha256(encoded.encode("utf-8")).hexdigest()


def write_csv(path: Path, fields: list[str], rows: Iterable[dict[str, Any]]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", encoding="utf-8", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=fields, extrasaction="raise", lineterminator="\n")
        writer.writeheader()
        for row in rows:
            writer.writerow({field: row.get(field, "") for field in fields})


def read_csv(path: Path) -> list[dict[str, str]]:
    with path.open("r", encoding="utf-8", newline="") as handle:
        return list(csv.DictReader(handle))


def csv_path(name: str) -> Path:
    if name in CATALOG_FIELDS:
        return CATALOG_DIR / name
    if name in PRODUCT_FIELDS:
        return PRODUCT_DIR / name
    raise KeyError(name)


def split_markdown_row(line: str) -> list[str]:
    stripped = line.strip()
    if not (stripped.startswith("|") and stripped.endswith("|")):
        raise ValueError(f"Not a Markdown table row: {line!r}")
    return [cell.strip() for cell in stripped[1:-1].split("|")]


def is_separator_row(cells: list[str]) -> bool:
    return bool(cells) and all(re.fullmatch(r":?-{3,}:?", cell.replace(" ", "")) for cell in cells)


def clean_markdown_cell(value: str) -> str:
    return re.sub(r"\s+", " ", value.replace("<br>", " ").replace("<br/>", " ")).strip()


def strip_js_comments(source: str) -> str:
    source = re.sub(r"/\*.*?\*/", "", source, flags=re.S)
    return re.sub(r"^\s*//.*$", "", source, flags=re.M)


def find_call_payloads(source: str, call_name: str) -> list[str]:
    payloads: list[str] = []
    needle = f"{call_name}("
    pos = 0
    while True:
        start = source.find(needle, pos)
        if start == -1:
            return payloads
        index = start + len(needle)
        depth = 1
        in_string: str | None = None
        escape = False
        while index < len(source):
            char = source[index]
            if in_string:
                if escape:
                    escape = False
                elif char == "\\":
                    escape = True
                elif char == in_string:
                    in_string = None
            else:
                if char in {'"', "'", "`"}:
                    in_string = char
                elif char == "(":
                    depth += 1
                elif char == ")":
                    depth -= 1
                    if depth == 0:
                        payloads.append(source[start + len(needle):index].strip())
                        pos = index + 1
                        break
            index += 1
        else:
            raise ValueError(f"Unclosed {call_name}(...) call")


def load_push_cards(pattern: str, call_name: str) -> list[dict[str, Any]]:
    cards: list[dict[str, Any]] = []
    matched = {path.resolve() for path in PROJECT_ROOT.glob(pattern)}
    index_text = (PROJECT_ROOT / "index.html").read_text(encoding="utf-8")
    script_sources = re.findall(r"<script\s+src=[\"']([^\"']+)[\"']", index_text)
    ordered_paths = [
        (PROJECT_ROOT / source).resolve() for source in script_sources
        if (PROJECT_ROOT / source).resolve() in matched
    ]
    if len(ordered_paths) != len(matched) or len(set(ordered_paths)) != len(matched):
        missing = sorted(str(path.relative_to(PROJECT_ROOT)) for path in matched - set(ordered_paths))
        raise ValueError(f"Runtime script order in index.html is incomplete for {pattern}: {missing}")
    part_numbers = []
    for path in ordered_paths:
        match = re.search(r"-part-(\d+)\.js$", path.name)
        if match:
            part_numbers.append(int(match.group(1)))
    if part_numbers and part_numbers != list(range(1, len(part_numbers) + 1)):
        raise ValueError(f"Runtime script parts are out of numeric order for {pattern}: {part_numbers}")
    for path in ordered_paths:
        source = strip_js_comments(path.read_text(encoding="utf-8"))
        for payload in find_call_payloads(source, call_name):
            decoded = json.loads(f"[{payload}]")
            for item in decoded:
                if isinstance(item, list):
                    cards.extend(item)
                elif isinstance(item, dict):
                    cards.append(item)
                else:
                    raise TypeError(f"Unexpected {type(item).__name__} in {path}")
    return cards


def load_runtime_cards() -> dict[str, list[dict[str, Any]]]:
    return {
        "vocabulary": load_push_cards(
            "js/data/flashcards/hsk1-data-part-*.js", "window.HSK1_BUILTIN_CARD_PARTS.push"
        ),
        "sentences": load_push_cards(
            "js/data/flashcards/sentence-cards-data-part-*.js", "window.HSK_SENTENCE_CARDS.push"
        ),
        "hanzi": load_push_cards(
            "js/data/flashcards/hanzi-cards-data-part-*.js", "window.HSK_HANZI_CARDS.push"
        ),
        "measure_words": load_push_cards(
            "js/data/flashcards/measure-word-cards-data-part-*.js", "window.HSK_MEASURE_WORD_CARDS.push"
        ),
    }


def truthy(value: Any, default: bool = False) -> bool:
    if value is None or value == "":
        return default
    if isinstance(value, bool):
        return value
    return str(value).strip().lower() in {"1", "true", "yes", "on"}


def pipe_join(values: Iterable[Any]) -> str:
    return "|".join(str(value) for value in values)


def pipe_split(value: str) -> list[str]:
    return [] if not value else value.split("|")
