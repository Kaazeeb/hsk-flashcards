#!/usr/bin/env python3
"""Generate/check the machine-readable CSV table contract."""

from __future__ import annotations

import argparse
import json
import sys

from audit_catalog import PRIMARY_KEYS, REQUIRED_FIELDS
from catalog_io import ALL_TABLE_FIELDS, PRODUCT_FIELDS, SCHEMA_DIR, VALID_STATUSES

DESCRIPTIONS = {
    "sources.csv": "Provenance and checksums for normative, reference, and legacy inputs.",
    "vocabulary.csv": "One row per official HSK vocabulary sense; active legacy metadata is retained as unreviewed.",
    "vocabulary_translations.csv": "Locale-keyed vocabulary translations.",
    "grammar_points.csv": "Aligned official grammar rows with filled hierarchy.",
    "tasks.csv": "Official communicative tasks.",
    "task_scenarios.csv": "Official Level 7-9 life, work, and academic task scenarios.",
    "task_capabilities.csv": "Atomic can-do bullets linked to tasks.",
    "topics.csv": "Official third-level topics with their filled hierarchy.",
    "hanzi.csv": "Official recognition and writing levels for each hanzi.",
    "hanzi_readings.csv": "Curated or migrated reading, gloss, and stroke-sequence records.",
    "sentences.csv": "Direction-neutral sentence/example entities.",
    "sentence_utterances.csv": "Ordered statements, questions, and model answers belonging to a sentence/example.",
    "sentence_translations.csv": "Locale-keyed translations of sentence/example entities.",
    "sentence_utterance_translations.csv": "Locale-keyed translations of individual statements, questions, and answers.",
    "sentence_vocabulary.csv": "Sense-aware sentence-to-vocabulary relationships.",
    "sentence_grammar.csv": "Sentence-to-syllabus-grammar relationships and legacy mapping candidates.",
    "measure_word_sets.csv": "Headword-level classifier study content.",
    "classifier_usages.csv": "Normalized classifier choices belonging to a measure-word set.",
    "coverage_exceptions.csv": "Explicit bound-morpheme coverage rules with allowed-context patterns.",
    "reviews.csv": "Append-only editorial review decisions.",
    "issues.csv": "Tracked linguistic or data-quality issues.",
    "waivers.csv": "Explicit, time-bounded exceptions to audit rules.",
    "vocabulary_cards.csv": "Product-owned active vocabulary order and legacy positional keys.",
    "sentence_cards.csv": "Product-owned sentence direction, deck, order, and runtime identity.",
    "hanzi_cards.csv": "Product-owned active hanzi study bindings.",
    "measure_word_cards.csv": "Product-owned active classifier-card bindings.",
}

INTEGER_FIELDS = {
    "syllabus_order", "level_min", "level_max", "row_order", "task_number",
    "capability_number", "recognition_level_min", "recognition_level_max",
    "writing_level_min", "writing_level_max", "level", "turn_order", "position",
    "usage_order", "runtime_order", "deck_order", "scenario_order",
}
BOOLEAN_FIELDS = {"learn_default", "practice_default"}
EDITORIAL_STATUS_FIELDS = {
    "review_status", "curation_status", "linguistic_review_status", "example_review_status",
    "from_status", "to_status",
}
ENUM_FIELD_TYPES = {
    "direction": "sentence_direction",
    "resolution_status": "resolution_status",
    "coverage_type": "coverage_type",
    "mapping_status": "mapping_status",
    "role": "utterance_role",
    "response_style": "response_style",
    "reviewer_type": "reviewer_type",
}


def type_for(table: str, field: str) -> str:
    if field in INTEGER_FIELDS:
        return "integer"
    if field in BOOLEAN_FIELDS:
        return "boolean"
    if field in EDITORIAL_STATUS_FIELDS:
        return "editorial_status"
    if field in ENUM_FIELD_TYPES:
        return ENUM_FIELD_TYPES[field]
    if table == "issues.csv" and field == "severity":
        return "issue_severity"
    if table == "issues.csv" and field == "status":
        return "issue_status"
    return "string"


def schema() -> dict:
    tables = {}
    for name, fields in ALL_TABLE_FIELDS.items():
        owner = "product_runtime" if name in PRODUCT_FIELDS else "language_content"
        tables[name] = {
            "path": f"language/data/{'product_bindings' if name in PRODUCT_FIELDS else 'catalog'}/{name}",
            "owner": owner,
            "description": DESCRIPTIONS[name],
            "primary_key": list(PRIMARY_KEYS[name]),
            "required": list(REQUIRED_FIELDS.get(name, ())),
            "fields": fields,
            "types": {field: type_for(name, field) for field in fields},
        }
    return {
        "schema_version": 1,
        "encoding": "UTF-8",
        "dialect": {"delimiter": ",", "line_ending": "LF", "quoting": "RFC 4180", "null": ""},
        "list_separator": "|",
        "list_fields": ["additional_levels", "candidate_grammar_point_ids", "tags"],
        "enums": {
            "editorial_status": sorted(VALID_STATUSES),
            "sentence_direction": ["en_to_zh", "zh_qa", "zh_to_en"],
            "resolution_status": ["ambiguous", "component_only", "exact", "out_of_level", "unmatched"],
            "coverage_type": ["bound_surface", "exact"],
            "mapping_status": ["auto_candidates", "mapped", "non_grammar_label", "unmapped_legacy"],
            "utterance_role": ["negative_answer", "positive_answer", "question", "statement"],
            "response_style": ["direction_default", "labeled_ab_lines"],
            "reviewer_type": ["agent", "human"],
            "issue_severity": ["critical", "high", "medium", "low"],
            "issue_status": ["open", "resolved", "wont_fix"],
        },
        "tables": tables,
    }


def main(argv: list[str]) -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    action = parser.add_mutually_exclusive_group()
    action.add_argument("--check", action="store_true")
    action.add_argument("--write", action="store_true")
    args = parser.parse_args(argv)
    target = SCHEMA_DIR / "tables.json"
    rendered = json.dumps(schema(), ensure_ascii=False, indent=2) + "\n"
    if args.write:
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_text(rendered, encoding="utf-8")
        print(f"wrote {target}")
        return 0
    if not target.exists() or target.read_text(encoding="utf-8") != rendered:
        print("schema contract is missing or stale", file=sys.stderr)
        return 1
    print("schema contract is current")
    return 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv[1:]))
