#!/usr/bin/env python3
"""Regression tests for syllabus import, catalog integrity, and runtime compatibility."""

from __future__ import annotations

import sys
import unittest
from copy import deepcopy
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parents[2]
SCRIPT_DIR = PROJECT_ROOT / "language" / "scripts"
sys.path.insert(0, str(SCRIPT_DIR))

from audit_catalog import (  # noqa: E402
    build_report,
    coverage_report,
    load_tables,
    validate_foreign_keys,
    validate_headers_and_rows,
    validate_linguistic_relations,
    validate_official_contract_and_domains,
    validate_review_governance,
)
from bootstrap_catalog import check_syllabus_contract  # noqa: E402
from catalog_io import load_runtime_cards, read_csv, row_hash, sha256_file  # noqa: E402
from compile_runtime_catalog import (  # noqa: E402
    check_runtime,
    compile_all,
)
from syllabus_parser import parse_all  # noqa: E402
from snapshot_legacy_runtime import EXPECTED_SNAPSHOT_SHA256, TARGET as LEGACY_SNAPSHOT  # noqa: E402
from write_schema import schema  # noqa: E402


class SyllabusParserTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls) -> None:
        cls.tables = parse_all()

    def test_expected_official_counts(self) -> None:
        self.assertEqual(len(self.tables["vocabulary.csv"]), 11000)
        self.assertEqual(len(self.tables["grammar_points.csv"]), 593)
        self.assertEqual(len(self.tables["topics.csv"]), 427)
        self.assertEqual(len(self.tables["tasks.csv"]), 166)
        self.assertEqual(len(self.tables["task_scenarios.csv"]), 3)
        self.assertEqual(len(self.tables["task_capabilities.csv"]), 678)
        self.assertEqual(len(self.tables["hanzi.csv"]), 3088)

    def test_known_topic_hierarchy_corrections(self) -> None:
        topics = self.tables["topics.csv"]
        expected = {
            (6, "地理分区"): ("自然与环境", "自然"),
            (7, "人口流动与管理"): ("国家与社会", "人口与发展"),
            (7, "中国传统文化意象及在不同文学艺术形式中的表现"): ("文化与传统", "文学艺术"),
        }
        for (level, third), hierarchy in expected.items():
            rows = [
                row for row in topics
                if int(row["level_min"]) == level and row["topic_l3_zh"] == third
            ]
            self.assertEqual(len(rows), 1)
            self.assertEqual((rows[0]["topic_l1_zh"], rows[0]["topic_l2_zh"]), hierarchy)

    def test_numbered_homographs_keep_distinct_ids(self) -> None:
        rows = [row for row in self.tables["vocabulary.csv"] if row["hanzi"] == "本"]
        self.assertGreaterEqual(len(rows), 2)
        self.assertEqual(len({row["vocab_id"] for row in rows}), len(rows))
        self.assertTrue(any(row["sense_number"] for row in rows))


class CatalogPipelineTests(unittest.TestCase):
    def test_bootstrap_checks_only_immutable_syllabus_fields(self) -> None:
        differences = check_syllabus_contract(parse_all())
        self.assertEqual(differences, [])

    def test_compiler_round_trips_runtime_semantics(self) -> None:
        compiled = compile_all()
        self.assertEqual(check_runtime(compiled), [])
        runtime = load_runtime_cards()
        self.assertEqual({name: len(rows) for name, rows in compiled.items()}, {
            "vocabulary": len(runtime["vocabulary"]),
            "sentences": len(runtime["sentences"]),
            "hanzi": len(runtime["hanzi"]),
            "measure_words": len(runtime["measure_words"]),
        })

    def test_legacy_snapshot_is_immutable(self) -> None:
        self.assertEqual(sha256_file(LEGACY_SNAPSHOT), EXPECTED_SNAPSHOT_SHA256)

    def test_product_bindings_do_not_store_front_or_back(self) -> None:
        rows = read_csv(PROJECT_ROOT / "language" / "data" / "product_bindings" / "sentence_cards.csv")
        self.assertTrue(rows)
        self.assertNotIn("front", rows[0])
        self.assertNotIn("back", rows[0])
        self.assertIn("direction", rows[0])
        self.assertIn("deck_id", rows[0])

    def test_vocabulary_legacy_positions_are_frozen(self) -> None:
        rows = read_csv(PROJECT_ROOT / "language" / "data" / "product_bindings" / "vocabulary_cards.csv")
        self.assertEqual(len(rows), len(load_runtime_cards()["vocabulary"]))
        for index, row in enumerate(rows):
            self.assertEqual(int(row["runtime_order"]), index + 1)
            self.assertEqual(row["legacy_storage_key"], f"idx:{index}")

    def test_audit_passes_without_hiding_review_backlog(self) -> None:
        report, _coverage_rows = build_report(3, None)
        self.assertEqual(report["status"], "pass")
        self.assertEqual(report["structural_error_count"], 0)
        inventory = report["inventory"]
        self.assertEqual(
            inventory["sentence_and_study_cards"],
            inventory["sentences"] + inventory["active_hanzi_study_records"] * 2
            + inventory["active_measure_word_cards"],
        )
        self.assertTrue(report["compatibility"]["runtime_semantic_match"])
        self.assertEqual(report["inventory"]["syllabus_vocabulary"], 11000)
        self.assertEqual(len(_coverage_rows), 11000)
        self.assertGreaterEqual(report["review_backlog"]["open_issues"], 0)
        self.assertGreaterEqual(report["relationships"]["approved_grammar_links"], 0)

    def test_machine_schema_matches_implementation(self) -> None:
        import json
        path = PROJECT_ROOT / "language" / "schemas" / "tables.json"
        self.assertEqual(json.loads(path.read_text(encoding="utf-8")), schema())

    def test_adversarial_invalid_domains_are_rejected(self) -> None:
        tables = load_tables()
        invalid_level = deepcopy(tables)
        invalid_level["sentences.csv"][0]["level"] = "9"
        self.assertTrue(any(
            error["rule"] == "sentence_level_domain"
            for error in validate_official_contract_and_domains(invalid_level)
        ))

        invalid_enum = deepcopy(tables)
        invalid_enum["sentence_vocabulary.csv"][0]["resolution_status"] = "banana"
        self.assertTrue(any(error["rule"] == "field_enum" for error in validate_headers_and_rows(invalid_enum)))

        invalid_source = deepcopy(tables)
        invalid_source["sentences.csv"][0]["source_id"] = "missing-source"
        self.assertTrue(any(error["rule"] == "foreign_key" for error in validate_foreign_keys(invalid_source)))

        invalid_hanzi_level = deepcopy(tables)
        invalid_hanzi_level["hanzi_cards.csv"][0]["level"] = "9"
        self.assertTrue(any(
            error["rule"] == "hanzi_card_level_domain"
            for error in validate_official_contract_and_domains(invalid_hanzi_level)
        ))

        invalid_measure_level = deepcopy(tables)
        invalid_measure_level["measure_word_sets.csv"][0]["level"] = "9"
        self.assertTrue(any(
            error["rule"] == "measure_word_level_domain"
            for error in validate_official_contract_and_domains(invalid_measure_level)
        ))

        invalid_scenario_band = deepcopy(tables)
        invalid_scenario_band["task_scenarios.csv"][0]["level_min"] = "9"
        invalid_scenario_band["task_scenarios.csv"][0]["level_max"] = "9"
        self.assertTrue(any(
            error["rule"] == "task_scenario_level_domain"
            for error in validate_official_contract_and_domains(invalid_scenario_band)
        ))

    def test_out_of_level_grammar_mapping_is_rejected(self) -> None:
        tables = load_tables()
        low_sentence = next(row for row in tables["sentences.csv"] if row["level"] == "1")
        link = next(row for row in tables["sentence_grammar.csv"] if row["sentence_id"] == low_sentence["sentence_id"])
        high_grammar = next(row for row in tables["grammar_points.csv"] if row["level_min"] == "7")
        link["grammar_point_id"] = high_grammar["grammar_point_id"]
        errors, _summary = validate_linguistic_relations(tables)
        self.assertTrue(any(error["rule"] == "grammar_level" for error in errors))

    def test_approval_requires_current_review_evidence(self) -> None:
        tables = load_tables()
        tables["sentences.csv"][0]["curation_status"] = "approved"
        tables["sentences.csv"][0]["linguistic_review_status"] = "approved"
        errors = validate_review_governance(tables)
        self.assertTrue(any(error["rule"] == "approval_evidence" for error in errors))

    def test_review_history_keeps_old_events_after_a_new_approval(self) -> None:
        tables = load_tables()
        sentence = tables["sentences.csv"][0]
        sentence["curation_status"] = "approved"
        sentence["linguistic_review_status"] = "approved"
        current_hash = row_hash(sentence, exclude={
            "review_status", "curation_status", "linguistic_review_status", "example_review_status",
        })
        base = {
            "entity_type": "sentence", "entity_id": sentence["sentence_id"],
            "from_status": "legacy_unreviewed", "to_status": "approved",
            "reviewer": "test-reviewer", "reviewer_type": "human",
            "reviewed_at": "2026-07-12", "notes": "",
        }
        tables["reviews.csv"] = [
            {"review_id": "review_old", "content_hash": "0" * 64, **base},
            {"review_id": "review_current", "content_hash": current_hash, **base},
        ]
        self.assertEqual(validate_review_governance(tables), [])

    def test_approved_coverage_is_independent_of_product_bindings(self) -> None:
        tables = load_tables()
        active_vocab_ids = {row["vocab_id"] for row in tables["vocabulary_cards.csv"]}
        vocab = next(row for row in tables["vocabulary.csv"] if row["vocab_id"] not in active_vocab_ids)
        sentence_id = "sent_test_editorial_unbound"
        tables["sentences.csv"].append({
            "sentence_id": sentence_id, "level": vocab["level_min"], "full_zh": vocab["hanzi"],
            "topic_id": "", "register": "neutral", "curation_status": "approved",
            "linguistic_review_status": "approved", "source_id": vocab["source_id"], "notes": "",
        })
        tables["sentence_vocabulary.csv"].append({
            "sentence_id": sentence_id, "position": "1", "surface_form": vocab["hanzi"],
            "vocab_id": vocab["vocab_id"], "resolution_status": "exact", "coverage_type": "exact",
            "review_status": "approved", "notes": "",
        })
        _summary, coverage_rows = coverage_report(tables, 1, None)
        coverage = next(row for row in coverage_rows if row["vocab_id"] == vocab["vocab_id"])
        self.assertFalse(coverage["product_active"])
        self.assertGreaterEqual(coverage["approved_explicit_count"], 1)

    def test_legacy_content_drift_requires_approval(self) -> None:
        tables = load_tables()
        tables["vocabulary.csv"][0]["pinyin"] = "wrong"
        with self.assertRaisesRegex(ValueError, "Legacy vocabulary drift"):
            compile_all(tables)

    def test_legacy_deletions_require_explicit_reviewed_history(self) -> None:
        tables = load_tables()

        deleted_example = deepcopy(tables)
        vocab = next(row for row in deleted_example["vocabulary.csv"] if row["example_zh"])
        vocab["example_zh"] = ""
        vocab["example_review_status"] = ""
        with self.assertRaisesRegex(ValueError, "Legacy example drift"):
            compile_all(deleted_example)

        for table, relation_name in (
            ("sentence_vocabulary.csv", "relation deletion"),
            ("sentence_grammar.csv", "relation deletion"),
        ):
            deleted_relation = deepcopy(tables)
            sentence_id = deleted_relation[table][0]["sentence_id"]
            target_rows = [row for row in deleted_relation[table] if row["sentence_id"] == sentence_id]
            last_position = max(int(row["position"]) for row in target_rows)
            deleted_relation[table] = [
                row for row in deleted_relation[table]
                if not (row["sentence_id"] == sentence_id and int(row["position"]) == last_position)
            ]
            with self.assertRaisesRegex(ValueError, relation_name):
                compile_all(deleted_relation)

        deleted_usage = deepcopy(tables)
        usage_counts = {}
        for row in deleted_usage["classifier_usages.csv"]:
            usage_counts[row["measure_word_id"]] = usage_counts.get(row["measure_word_id"], 0) + 1
        measure_word_id = next(entity_id for entity_id, count in usage_counts.items() if count > 1)
        usages = [
            row for row in deleted_usage["classifier_usages.csv"]
            if row["measure_word_id"] == measure_word_id
        ]
        last_usage_id = max(usages, key=lambda row: int(row["usage_order"]))["usage_id"]
        deleted_usage["classifier_usages.csv"] = [
            row for row in deleted_usage["classifier_usages.csv"] if row["usage_id"] != last_usage_id
        ]
        with self.assertRaisesRegex(ValueError, "Legacy classifier deletion"):
            compile_all(deleted_usage)

    def test_rejected_active_relation_does_not_compile(self) -> None:
        tables = load_tables()
        tables["sentence_vocabulary.csv"][0]["review_status"] = "rejected"
        with self.assertRaisesRegex(ValueError, "non-publishable"):
            compile_all(tables)

    def test_compiler_rejects_invalid_bindings_and_duplicates(self) -> None:
        tables = load_tables()
        invalid_bool = deepcopy(tables)
        invalid_bool["vocabulary_cards.csv"][0]["learn_default"] = "typo"
        with self.assertRaisesRegex(ValueError, "true or false"):
            compile_all(invalid_bool)

        duplicate_card = deepcopy(tables)
        duplicate_card["sentence_cards.csv"][1]["card_id"] = duplicate_card["sentence_cards.csv"][0]["card_id"]
        with self.assertRaisesRegex(ValueError, "Duplicate card_id"):
            compile_all(duplicate_card)

        duplicate_translation = deepcopy(tables)
        duplicate_translation["vocabulary_translations.csv"].append(
            dict(duplicate_translation["vocabulary_translations.csv"][0])
        )
        with self.assertRaisesRegex(ValueError, "Duplicate primary key"):
            compile_all(duplicate_translation)


if __name__ == "__main__":
    unittest.main(verbosity=2)
