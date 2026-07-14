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
    compile_sentences,
    load_legacy_snapshot,
    validate_legacy_immutability,
)
from syllabus_parser import parse_all  # noqa: E402
from snapshot_legacy_runtime import EXPECTED_SNAPSHOT_SHA256, TARGET as LEGACY_SNAPSHOT  # noqa: E402
from write_schema import schema  # noqa: E402
from grammar_study import (  # noqa: E402
    authorized_vocabulary_exception_occurrences,
    build_target_parts,
    compile_grammar_by_level,
    render_grammar_chunks,
    validate_pinyin,
    validate_grammar_study,
)
from catalog_io import GRAMMAR_STUDY_CONTENT_TABLES, GRAMMAR_STUDY_PRODUCT_TABLE  # noqa: E402


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
            "grammar": len(compiled["grammar"]),
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
        self.assertIn("active", rows[0])

    def test_sentence_binding_tombstone_preserves_historical_order(self) -> None:
        tables = load_tables()
        active = sorted(
            (row for row in tables["sentence_cards.csv"] if row["active"] == "true"),
            key=lambda row: int(row["runtime_order"]),
        )
        target = active[len(active) // 2]
        expected_ids = [row["card_id"] for row in active if row["card_id"] != target["card_id"]]
        target["active"] = "false"

        compiled_ids = [card["id"] for card in compile_sentences(tables)]
        self.assertEqual(compiled_ids, expected_ids)
        self.assertTrue(all("visibilityIndex" in card for card in compile_sentences(tables)))

    def test_legacy_sentence_binding_must_remain_as_an_immutable_tombstone(self) -> None:
        tables = load_tables()
        baseline_last_id = str(load_legacy_snapshot()["sentences"][-1]["id"])
        removed = next(row for row in tables["sentence_cards.csv"] if row["card_id"] == baseline_last_id)
        removed_order = int(removed["runtime_order"])
        removed_deck_id = removed["deck_id"]
        removed_deck_order = int(removed["deck_order"])
        tables["sentence_cards.csv"] = [
            row for row in tables["sentence_cards.csv"] if row["card_id"] != baseline_last_id
        ]
        for row in tables["sentence_cards.csv"]:
            if int(row["runtime_order"]) > removed_order:
                row["runtime_order"] = str(int(row["runtime_order"]) - 1)
            if row["deck_id"] == removed_deck_id and int(row["deck_order"]) > removed_deck_order:
                row["deck_order"] = str(int(row["deck_order"]) - 1)
        compiled = compile_all(tables, validate=False)
        with self.assertRaisesRegex(ValueError, "Missing immutable sentence card binding"):
            validate_legacy_immutability(tables, compiled)

        changed = load_tables()
        binding = next(
            row for row in changed["sentence_cards.csv"] if row["card_id"] == baseline_last_id
        )
        binding["active"] = "false"
        binding["deck_name"] += " changed"
        compiled = compile_all(changed, validate=False)
        with self.assertRaisesRegex(ValueError, "Immutable sentence binding drift"):
            validate_legacy_immutability(changed, compiled)

    def test_approved_single_question_grammar_example_can_become_a_translation_card(self) -> None:
        tables = load_tables()
        sentence_levels = {row["sentence_id"]: row["level"] for row in tables["sentences.csv"]}
        example_sentence_ids = {
            row["sentence_id"] for row in tables["grammar_lesson_examples.csv"]
        }
        question = next(
            row for row in tables["sentence_utterances.csv"]
            if row["sentence_id"] in example_sentence_ids
            and sentence_levels[row["sentence_id"]] == "3"
            and row["role"] == "question"
        )
        max_runtime_order = max(int(row["runtime_order"]) for row in tables["sentence_cards.csv"])
        max_deck_order = max(
            int(row["deck_order"])
            for row in tables["sentence_cards.csv"]
            if row["deck_id"] == "sentence_hsk3"
        )
        card_id = "scard_00000000000040008000000000000000"
        tables["sentence_cards.csv"].append({
            "runtime_order": str(max_runtime_order + 1),
            "deck_order": str(max_deck_order + 1),
            "card_id": card_id,
            "sentence_id": question["sentence_id"],
            "active": "true",
            "direction": "zh_to_en",
            "deck_id": "sentence_hsk3",
            "deck_name": "HSK 3 sentence cards — 2026 syllabus aligned",
            "response_style": "direction_default",
            "tags": "hsk3|hsk2026|sentence|zh_to_en|grammar_curated",
        })

        card = next(card for card in compile_sentences(tables) if card["id"] == card_id)
        self.assertEqual(card["front"], question["zh_text"])
        self.assertEqual(card["visibilityIndex"], max_deck_order)
        compiled = compile_all(tables, validate=False)
        validate_legacy_immutability(tables, compiled)

        translation = next(
            row for row in tables["sentence_translations.csv"]
            if row["sentence_id"] == question["sentence_id"] and row["locale"] == "en"
        )
        translation["review_status"] = "in_review"
        with self.assertRaisesRegex(ValueError, "non-publishable"):
            validate_legacy_immutability(tables, compiled)

    def test_inactive_sentence_binding_is_excluded_from_published_coverage(self) -> None:
        tables = load_tables()
        bindings_by_sentence: dict[str, list[dict[str, str]]] = {}
        for binding in tables["sentence_cards.csv"]:
            if binding["active"] == "true":
                bindings_by_sentence.setdefault(binding["sentence_id"], []).append(binding)
        sentences = {row["sentence_id"]: row for row in tables["sentences.csv"]}
        vocabulary = {row["vocab_id"]: row for row in tables["vocabulary.csv"]}
        target_link = next(
            link for link in tables["sentence_vocabulary.csv"]
            if link["vocab_id"]
            and vocabulary[link["vocab_id"]]["level_min"] == "3"
            and link["review_status"] in {"legacy_unreviewed", "approved"}
            and sentences[link["sentence_id"]]["level"] == "3"
            and link["surface_form"] in sentences[link["sentence_id"]]["full_zh"]
            and len(bindings_by_sentence.get(link["sentence_id"], [])) == 1
        )
        _summary, before_rows = coverage_report(tables, 3, 3)
        before = next(row for row in before_rows if row["vocab_id"] == target_link["vocab_id"])

        bindings_by_sentence[target_link["sentence_id"]][0]["active"] = "false"
        _summary, after_rows = coverage_report(tables, 3, 3)
        after = next(row for row in after_rows if row["vocab_id"] == target_link["vocab_id"])
        self.assertEqual(after["published_explicit_count"], before["published_explicit_count"] - 1)

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
            sum(inventory["sentence_directions"].values())
            + inventory["active_hanzi_study_records"] * 2
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
        tables["reviews.csv"].extend([
            {"review_id": "review_old", "content_hash": "0" * 64, **base},
            {"review_id": "review_current", "content_hash": current_hash, **base},
        ])
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

    def test_empty_grammar_feature_is_optional_but_partial_content_fails_closed(self) -> None:
        tables = load_tables()
        for name in (*GRAMMAR_STUDY_CONTENT_TABLES, GRAMMAR_STUDY_PRODUCT_TABLE):
            tables[name] = []
        errors, summary = validate_grammar_study(tables)
        self.assertEqual(errors, [])
        self.assertFalse(summary["enabled"])
        self.assertEqual(summary["authorized_vocabulary_exceptions"], 2)
        self.assertEqual(compile_grammar_by_level(tables), {})

        tables["grammar_lessons.csv"].append({
            "grammar_lesson_id": "glesson_00000000000040008000000000000000",
            "level_introduced": "1", "lesson_kind": "category", "title_en": "Test",
            "target_form_zh": "", "summary_en": "A test purpose.", "watch_out_en": "",
            "display_group_en": "Word classes", "display_group_basis": "official_category",
            "register": "neutral", "review_status": "in_review",
            "basis_source_id": "hsk26-zh+hsk26-en", "content_origin": "project_authored",
            "notes": "",
        })
        errors, summary = validate_grammar_study(tables)
        self.assertTrue(summary["enabled"])
        self.assertTrue(any(error["rule"] == "grammar_activation" for error in errors))
        self.assertTrue(any(error["rule"] == "grammar_primary_point_coverage" for error in errors))

    def test_clean_exact_grammar_mapping_may_omit_legacy_tag(self) -> None:
        tables = load_tables()
        sentence = next(row for row in tables["sentences.csv"] if row["level"] == "1")
        links = [
            row for row in tables["sentence_grammar.csv"]
            if row["sentence_id"] == sentence["sentence_id"]
        ]
        tables["sentence_grammar.csv"].append({
            "sentence_id": sentence["sentence_id"],
            "position": str(max(int(row["position"]) for row in links) + 1),
            "legacy_tag": "", "grammar_point_id": "hsk26-g1-001",
            "candidate_grammar_point_ids": "", "mapping_status": "mapped",
            "review_status": "in_review", "notes": "",
        })
        errors, _summary = validate_linguistic_relations(tables)
        self.assertFalse(any(error["rule"] == "new_grammar_mapping" for error in errors))
        self.assertFalse(any(error["rule"] == "legacy_grammar_tag" for error in errors))

        migrated = next(row for row in tables["sentence_grammar.csv"] if row["legacy_tag"])
        migrated["legacy_tag"] = ""
        errors, _summary = validate_linguistic_relations(tables)
        self.assertTrue(any(error["rule"] == "legacy_grammar_tag" for error in errors))

    def test_approved_sentence_vocabulary_is_occurrence_aware(self) -> None:
        tables = load_tables()
        vocab = next(row for row in tables["vocabulary.csv"] if row["hanzi"] == "我")
        sentence_id = "sent_00000000000040008000000000000000"
        tables["sentences.csv"].append({
            "sentence_id": sentence_id, "level": "1", "full_zh": "我我。", "topic_id": "",
            "register": "neutral", "curation_status": "approved",
            "linguistic_review_status": "approved", "source_id": "hsk26-zh", "notes": "",
        })
        relation = {
            "sentence_id": sentence_id, "position": "1", "surface_form": "我",
            "vocab_id": vocab["vocab_id"], "resolution_status": "exact", "coverage_type": "exact",
            "review_status": "approved", "notes": "",
        }
        tables["sentence_vocabulary.csv"].append(relation)
        errors, _summary = validate_linguistic_relations(tables)
        self.assertTrue(any(
            error["rule"] == "sentence_vocabulary_completeness" and error["entity_id"] == sentence_id
            for error in errors
        ))
        tables["sentence_vocabulary.csv"].append({**relation, "position": "2"})
        errors, _summary = validate_linguistic_relations(tables)
        self.assertFalse(any(
            error["rule"] in {"sentence_vocabulary_completeness", "sentence_vocabulary_order"}
            and error["entity_id"] == sentence_id
            for error in errors
        ))

    def test_grammar_chunk_contract_and_target_parts_are_deterministic(self) -> None:
        compiled = compile_grammar_by_level(load_tables())
        for level_payload in compiled.values():
            for lesson in level_payload["lessons"]:
                for pattern in lesson["patterns"]:
                    self.assertTrue(pattern["appliesToZh"])
                for note in lesson["notes"]:
                    self.assertTrue(note["appliesToZh"])

        payload = {
            "schemaVersion": "2", "syllabusId": "hsk-2025-11", "level": 1,
            "officialPointIds": [], "categories": [], "lessons": [],
        }
        rendered = render_grammar_chunks({1: payload})["grammar-lessons-hsk1.js"]
        self.assertEqual(rendered, render_grammar_chunks({1: payload})["grammar-lessons-hsk1.js"])
        self.assertIn("window.HSKFlashcards", rendered)
        self.assertIn('"schemaVersion": "2"', rendered)
        self.assertNotIn("<script", rendered)

        targets = [
            {
                "grammar_target_id": "gtarget_00000000000040008000000000000000",
                "target_order": "1", "target_text_zh": "在", "occurrence_number": "2",
                "target_role": "marker",
            }
        ]
        parts, errors = build_target_parts("我在家，他在学校。", targets)
        self.assertEqual(errors, [])
        self.assertEqual([part["text"] for part in parts if part["emphasized"]], ["在"])
        self.assertEqual("".join(part["text"] for part in parts), "我在家，他在学校。")

        overlapping = [
            {**targets[0], "target_order": "1", "occurrence_number": "1"},
            {
                **targets[0], "grammar_target_id": "gtarget_00000000000040008000000000000001",
                "target_order": "2", "target_text_zh": "在家", "occurrence_number": "1",
            },
        ]
        _parts, errors = build_target_parts("我在家。", overlapping)
        self.assertTrue(any(error["rule"] == "grammar_target_order" for error in errors))

    def test_grammar_pinyin_accepts_nfc_caron_vowels(self) -> None:
        self.assertIsNone(validate_pinyin("Wǒ hěn hǎo, nǐ hǎo ma?"))
        self.assertIsNone(validate_pinyin("Nǚ'ér qù lǚxíng."))
        self.assertEqual(validate_pinyin("Wo3 hen3 hao3."), "Display pinyin must use tone marks and ü rather than digits, v, or u:")

    def test_classifier_bei_exception_is_point_and_target_scoped(self) -> None:
        tables = load_tables()
        policies = tables["grammar_vocabulary_exceptions.csv"]
        self.assertEqual(len(policies), 2)
        policy = next(row for row in policies if row["surface_form"] == "杯")
        self.assertEqual(
            (policy["grammar_point_id"], policy["surface_form"], policy["level"],
             policy["required_target_role"]),
            ("hsk26-g1-013", "杯", "1", "classifier"),
        )
        self.assertNotIn("杯", {row["hanzi"] for row in tables["vocabulary.csv"]})
        bubi_policy = next(row for row in policies if row["surface_form"] == "不必")
        self.assertEqual(
            (bubi_policy["grammar_point_id"], bubi_policy["level"],
             bubi_policy["required_target_role"]),
            ("hsk26-g3-023", "3", "negative_modal"),
        )
        self.assertFalse(any(
            row["hanzi"] == "不必" and int(row["level_min"]) <= 3
            for row in tables["vocabulary.csv"]
        ))

        sentence_id = "sent_00000000000040008000000000000001"
        example_id = "gexample_00000000000040008000000000000001"
        element_id = "gelement_00000000000040008000000000000001"
        tables["sentences.csv"].append({
            "sentence_id": sentence_id, "level": "1", "full_zh": "我喝一杯茶。", "topic_id": "",
            "register": "neutral", "curation_status": "approved",
            "linguistic_review_status": "approved", "source_id": "hsk26-zh", "notes": "",
        })
        tables["grammar_lesson_examples.csv"].append({
            "grammar_example_id": example_id, "grammar_lesson_id": "test_lesson",
            "grammar_pattern_id": "", "sentence_id": sentence_id, "example_order": "1",
            "context_note_en": "", "example_kind": "primary", "review_status": "approved",
            "notes": "",
        })
        tables["grammar_example_points.csv"].append({
            "grammar_example_id": example_id, "grammar_point_id": "hsk26-g1-013",
            "grammar_element_id": element_id, "demonstration_order": "1",
            "analysis_en": "杯 classifies the serving.", "review_status": "approved", "notes": "",
        })
        target = {
            "grammar_target_id": "gtarget_00000000000040008000000000000001",
            "grammar_example_id": example_id, "grammar_element_id": element_id,
            "target_order": "1", "target_role": "classifier", "target_text_zh": "杯",
            "occurrence_number": "1", "review_status": "approved", "notes": "",
        }
        tables["grammar_example_targets.csv"].append(target)
        for position, surface in enumerate(("我", "喝", "一", "茶"), start=1):
            vocab = next(
                row for row in tables["vocabulary.csv"]
                if row["hanzi"] == surface and int(row["level_min"]) <= 1
            )
            tables["sentence_vocabulary.csv"].append({
                "sentence_id": sentence_id, "position": str(position), "surface_form": surface,
                "vocab_id": vocab["vocab_id"], "resolution_status": "exact",
                "coverage_type": "exact", "review_status": "approved", "notes": "",
            })

        authorized = authorized_vocabulary_exception_occurrences(tables)
        self.assertEqual(authorized[sentence_id]["杯"], 1)
        errors, _summary = validate_linguistic_relations(tables)
        self.assertFalse(any(
            error["entity_id"] == sentence_id and error["rule"] in {
                "sentence_lexical_segmentation", "sentence_vocabulary_completeness",
                "sentence_vocabulary_order",
            }
            for error in errors
        ))

        target["target_role"] = "constituent"
        self.assertNotIn(sentence_id, authorized_vocabulary_exception_occurrences(tables))
        errors, _summary = validate_linguistic_relations(tables)
        self.assertTrue(any(
            error["entity_id"] == sentence_id and error["rule"] == "sentence_lexical_segmentation"
            for error in errors
        ))

        unauthorized = deepcopy(tables)
        next(
            row for row in unauthorized["grammar_vocabulary_exceptions.csv"]
            if row["surface_form"] == "杯"
        )["grammar_point_id"] = "hsk26-g1-014"
        grammar_errors, _summary = validate_grammar_study(unauthorized)
        self.assertTrue(any(
            error["rule"] == "grammar_vocabulary_exception_scope" for error in grammar_errors
        ))


if __name__ == "__main__":
    unittest.main(verbosity=2)
