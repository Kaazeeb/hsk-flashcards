#!/usr/bin/env python3
"""Write focused coverage reports for an active HSK sentence portfolio."""

from __future__ import annotations

import argparse
import csv
from collections import Counter, defaultdict

from catalog_io import CATALOG_DIR, PRODUCT_DIR, REPORT_DIR, read_csv


def strict_bool(value: str) -> bool:
    if value == "true":
        return True
    if value == "false":
        return False
    raise ValueError(f"Expected true or false, found {value!r}")


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--level", type=int, choices=(1, 2, 3), default=3)
    parser.add_argument("--maximum-active", type=int)
    args = parser.parse_args()
    level = args.level
    maximum_active = args.maximum_active or {1: 330, 2: 240, 3: 560}[level]
    deck_id = f"sentence_hsk{level}"
    report_stem = f"hsk{level}-sentence-portfolio"

    vocabulary = read_csv(CATALOG_DIR / "vocabulary.csv")
    grammar = read_csv(CATALOG_DIR / "grammar_points.csv")
    sentences = read_csv(CATALOG_DIR / "sentences.csv")
    sentence_vocabulary = read_csv(CATALOG_DIR / "sentence_vocabulary.csv")
    sentence_grammar = read_csv(CATALOG_DIR / "sentence_grammar.csv")
    issues = read_csv(CATALOG_DIR / "issues.csv")
    bindings = read_csv(PRODUCT_DIR / "sentence_cards.csv")

    sentence_by_id = {row["sentence_id"]: row for row in sentences}
    level_bindings = [row for row in bindings if row["deck_id"] == deck_id]
    active = [row for row in level_bindings if strict_bool(row["active"])]
    inactive = [row for row in level_bindings if not strict_bool(row["active"])]
    active_bindings_by_sentence: dict[str, list[dict[str, str]]] = defaultdict(list)
    for binding in active:
        active_bindings_by_sentence[binding["sentence_id"]].append(binding)
    active_sentence_ids = {row["sentence_id"] for row in active}
    active_chinese = [sentence_by_id[row["sentence_id"]]["full_zh"] for row in active]

    level_vocabulary = sorted(
        [row for row in vocabulary if row["level_min"] == str(level)],
        key=lambda row: int(row["syllabus_order"]),
    )
    level_vocabulary_ids = {row["vocab_id"] for row in level_vocabulary}

    exact_targets_by_sentence: dict[str, set[str]] = defaultdict(set)
    exact_sentence_ids_by_vocab: dict[str, set[str]] = defaultdict(set)
    link_statuses_by_context: dict[tuple[str, str], set[str]] = defaultdict(set)
    for row in sentence_vocabulary:
        vocab_id = row["vocab_id"]
        if row["resolution_status"] != "exact" or vocab_id not in level_vocabulary_ids:
            continue
        sentence_id = row["sentence_id"]
        exact_targets_by_sentence[sentence_id].add(vocab_id)
        exact_sentence_ids_by_vocab[vocab_id].add(sentence_id)
        link_statuses_by_context[(vocab_id, sentence_id)].add(row["review_status"])

    open_issue_rows = [
        row
        for row in issues
        if row["status"] == "open"
        and row["entity_type"] == "sentence"
        and row["entity_id"] in active_sentence_ids
    ]
    open_issue_ids_by_sentence: dict[str, set[str]] = defaultdict(set)
    for row in open_issue_rows:
        open_issue_ids_by_sentence[row["entity_id"]].add(row["issue_id"])

    vocabulary_rows = []
    for row in level_vocabulary:
        vocab_id = row["vocab_id"]
        sentence_ids = sorted(exact_sentence_ids_by_vocab[vocab_id] & active_sentence_ids)
        card_ids = sorted(
            binding["card_id"]
            for sentence_id in sentence_ids
            for binding in active_bindings_by_sentence[sentence_id]
        )
        approved_context_count = 0
        legacy_context_count = 0
        other_context_count = 0
        for sentence_id in sentence_ids:
            statuses = link_statuses_by_context[(vocab_id, sentence_id)]
            if "approved" in statuses:
                approved_context_count += 1
            elif "legacy_unreviewed" in statuses:
                legacy_context_count += 1
            else:
                other_context_count += 1
        context_count = len(sentence_ids)
        open_issue_ids = sorted({
            issue_id
            for sentence_id in sentence_ids
            for issue_id in open_issue_ids_by_sentence[sentence_id]
        })
        vocabulary_rows.append(
            {
                "vocab_id": vocab_id,
                "syllabus_form": row["syllabus_form"],
                "hanzi": row["hanzi"],
                "pinyin": row["pinyin"],
                "part_of_speech_zh": row["part_of_speech_zh"],
                "active_exact_sentence_count": context_count,
                "active_exact_card_count": len(card_ids),
                "approved_active_context_count": approved_context_count,
                "legacy_unreviewed_active_context_count": legacy_context_count,
                "other_active_context_count": other_context_count,
                "deficit_to_2": max(0, 2 - context_count),
                "deficit_to_3": max(0, 3 - context_count),
                "surplus_above_3": max(0, context_count - 3),
                "at_least_one": context_count >= 1,
                "at_least_two": context_count >= 2,
                "at_least_three": context_count >= 3,
                "active_open_issue_count": len(open_issue_ids),
                "active_open_issue_ids": "|".join(open_issue_ids),
                "active_sentence_ids": "|".join(sentence_ids),
                "active_card_ids": "|".join(card_ids),
            }
        )

    level_grammar_ids = {
        row["grammar_point_id"]
        for row in grammar
        if row["level_min"] == str(level)
    }
    covered_grammar_ids = {
        row["grammar_point_id"]
        for row in sentence_grammar
        if row["sentence_id"] in active_sentence_ids
        and row["mapping_status"] == "mapped"
        and row["review_status"] == "approved"
        and row["grammar_point_id"] in level_grammar_ids
    }

    active_source_counts = Counter(
        sentence_by_id[row["sentence_id"]]["source_id"] for row in active
    )
    inactive_source_counts = Counter(
        sentence_by_id[row["sentence_id"]]["source_id"] for row in inactive
    )
    direction_counts = Counter(row["direction"] for row in active)
    coverage_histogram = Counter(
        row["active_exact_sentence_count"] for row in vocabulary_rows
    )
    targets_per_card_histogram = Counter(
        len(exact_targets_by_sentence[binding["sentence_id"]]) for binding in active
    )
    total_target_incidences = sum(
        target_count * card_count
        for target_count, card_count in targets_per_card_histogram.items()
    )
    target_density = total_target_incidences / len(active) if active else 0.0
    deficit_to_two = sum(row["deficit_to_2"] for row in vocabulary_rows)
    deficit_to_three = sum(row["deficit_to_3"] for row in vocabulary_rows)
    surplus_above_three = sum(row["surplus_above_3"] for row in vocabulary_rows)
    context_review_counts = Counter(
        {
            "approved": sum(
                row["approved_active_context_count"] for row in vocabulary_rows
            ),
            "legacy_unreviewed": sum(
                row["legacy_unreviewed_active_context_count"]
                for row in vocabulary_rows
            ),
            "other": sum(row["other_active_context_count"] for row in vocabulary_rows),
        }
    )
    card_review_counts: Counter[str] = Counter()
    for binding in active:
        sentence = sentence_by_id[binding["sentence_id"]]
        statuses = {
            sentence["curation_status"],
            sentence["linguistic_review_status"],
        }
        if statuses == {"approved"}:
            card_review_counts["approved"] += 1
        elif statuses == {"legacy_unreviewed"}:
            card_review_counts["legacy_unreviewed"] += 1
        else:
            card_review_counts["other"] += 1

    covered_once = sum(row["at_least_one"] for row in vocabulary_rows)
    covered_twice = sum(row["at_least_two"] for row in vocabulary_rows)
    covered_three = sum(row["at_least_three"] for row in vocabulary_rows)
    missing = [row for row in vocabulary_rows if not row["at_least_one"]]
    grammar_missing = sorted(level_grammar_ids - covered_grammar_ids)
    unique_chinese = len(active_chinese) == len(set(active_chinese))
    duplicate_sentence_ids = sorted(
        sentence_id
        for sentence_id, sentence_bindings in active_bindings_by_sentence.items()
        if len(sentence_bindings) > 1
    )
    unique_sentences = not duplicate_sentence_ids
    active_open_issue_ids = sorted({row["issue_id"] for row in open_issue_rows})
    active_open_issue_sentence_ids = sorted(
        {row["entity_id"] for row in open_issue_rows}
    )
    original_legacy_bindings = [
        row
        for row in level_bindings
        if sentence_by_id[row["sentence_id"]]["source_id"] == "legacy-runtime"
    ]
    inactive_original_legacy = sum(
        sentence_by_id[row["sentence_id"]]["source_id"] == "legacy-runtime"
        for row in inactive
    )
    inactive_curated = len(inactive) - inactive_original_legacy
    passed = (
        len(active) <= maximum_active
        and covered_twice == len(level_vocabulary)
        and len(covered_grammar_ids) == len(level_grammar_ids)
        and not active_open_issue_ids
        and unique_chinese
        and unique_sentences
    )

    REPORT_DIR.mkdir(parents=True, exist_ok=True)
    csv_path = REPORT_DIR / f"{report_stem}.csv"
    with csv_path.open("w", encoding="utf-8", newline="") as handle:
        writer = csv.DictWriter(
            handle,
            fieldnames=list(vocabulary_rows[0]),
            lineterminator="\n",
        )
        writer.writeheader()
        writer.writerows(vocabulary_rows)

    old_count = len(original_legacy_bindings)
    reduction = old_count - len(active)
    reduction_percent = reduction / old_count * 100 if old_count else 0.0
    lines = [
        f"# HSK {level} sentence portfolio",
        "",
        f"Status: **{'PASS' if passed else 'FAIL'}**.",
        "",
        "## Portfolio",
        "",
        "| Metric | Count |",
        "| --- | ---: |",
        f"| Original legacy HSK {level} bindings | {old_count} |",
        f"| Current active HSK {level} cards | {len(active)} |",
        f"| Distinct active sentences | {len(active_sentence_ids)} |",
        f"| Reduction | {reduction} ({reduction_percent:.1f}%) |",
        f"| Inactive original legacy tombstones | {inactive_original_legacy} |",
        f"| Inactive curated tombstones | {inactive_curated} |",
        "",
        "## Sources",
        "",
        "| Source | Active | Inactive |",
        "| --- | ---: | ---: |",
    ]
    lines.extend(
        f"| `{source_id}` | {active_source_counts[source_id]} | {inactive_source_counts[source_id]} |"
        for source_id in sorted(active_source_counts.keys() | inactive_source_counts.keys())
    )
    lines.extend(
        [
            "",
            "## Directions",
            "",
            "| Direction | Active cards |",
            "| --- | ---: |",
            f"| Chinese to English | {direction_counts['zh_to_en']} |",
            f"| English to Chinese | {direction_counts['en_to_zh']} |",
            f"| Chinese question and answer | {direction_counts['zh_qa']} |",
            "",
            "## Vocabulary",
            "",
            f"Coverage counts distinct active sentence contexts with an exact stable HSK {level} `vocab_id` relation. Duplicate active bindings for one sentence fail validation instead of inflating coverage.",
            "",
            "| Metric | Count |",
            "| --- | ---: |",
            f"| At least one context | {covered_once}/{len(level_vocabulary)} |",
            f"| At least two contexts | {covered_twice}/{len(level_vocabulary)} |",
            f"| At least three contexts | {covered_three}/{len(level_vocabulary)} |",
            f"| Exact HSK {level} target/card incidences | {total_target_incidences} |",
            f"| Exact HSK {level} targets per active card | {target_density:.2f} |",
            f"| Total deficit to two contexts | {deficit_to_two} |",
            f"| Total deficit to three contexts | {deficit_to_three} |",
            f"| Total surplus above three contexts | {surplus_above_three} |",
            "",
            "The three-card target is best-effort: sentence quality and sense accuracy take precedence over mechanically packed examples.",
            "",
            "### Exact coverage histogram",
            "",
            "| Exact active contexts | Vocabulary senses |",
            "| ---: | ---: |",
        ]
    )
    lines.extend(
        f"| {context_count} | {coverage_histogram[context_count]} |"
        for context_count in sorted(coverage_histogram)
    )
    lines.extend(
        [
            "",
            f"### HSK {level} targets per card",
            "",
            f"| Exact HSK {level} targets | Active cards |",
            "| ---: | ---: |",
        ]
    )
    lines.extend(
        f"| {target_count} | {targets_per_card_histogram[target_count]} |"
        for target_count in sorted(targets_per_card_histogram)
    )
    lines.extend(
        [
            "",
            "### Editorial status",
            "",
            "| Unit | Approved | Legacy unreviewed | Other |",
            "| --- | ---: | ---: | ---: |",
            f"| Active cards | {card_review_counts['approved']} | {card_review_counts['legacy_unreviewed']} | {card_review_counts['other']} |",
            f"| Distinct exact HSK {level} contexts | {context_review_counts['approved']} | {context_review_counts['legacy_unreviewed']} | {context_review_counts['other']} |",
            "",
            "Card status requires both sentence curation and linguistic review to match; context status comes from the exact vocabulary relation review.",
            "",
            f"Mechanical coverage does not promote retained legacy content to editorially approved status. Full per-vocabulary detail is in `{report_stem}.csv`.",
            "",
            "## Grammar",
            "",
            f"Approved exact active coverage: **{len(covered_grammar_ids)}/{len(level_grammar_ids)}** official HSK {level} grammar points.",
            "",
        ]
    )
    if grammar_missing:
        lines.append("Missing points: " + ", ".join(f"`{value}`" for value in grammar_missing) + ".")
        lines.append("")
    lines.extend(
        [
            "## Validation",
            "",
            f"- Active card ceiling ({maximum_active}): {'yes' if len(active) <= maximum_active else 'no'} ({len(active)}).",
            f"- Distinct active sentence IDs: {'yes' if unique_sentences else 'no'} ({len(duplicate_sentence_ids)} duplicated IDs).",
            f"- Unique active Chinese text: {'yes' if unique_chinese else 'no'}.",
            f"- Active open sentence issues: {len(active_open_issue_ids)} across {len(active_open_issue_sentence_ids)} sentences.",
            f"- Missing HSK {level} vocabulary senses: {len(missing)}.",
            "- Historical bindings remain in the product table with their original card IDs and order; removed cards are inactive tombstones.",
            "- Mechanical coverage does not promote retained legacy content to editorially approved status.",
            "",
        ]
    )
    if active_open_issue_ids:
        lines.insert(
            len(lines) - 3,
            "- Active open issue IDs: "
            + ", ".join(f"`{issue_id}`" for issue_id in active_open_issue_ids)
            + ".",
        )
    (REPORT_DIR / f"{report_stem}.md").write_text(
        "\n".join(lines), encoding="utf-8"
    )
    print(
        f"HSK{level} portfolio: active={len(active)} "
        f"vocab=({covered_once},{covered_twice},{covered_three}) "
        f"grammar={len(covered_grammar_ids)}/{len(level_grammar_ids)} "
        f"status={'PASS' if passed else 'FAIL'}"
    )


if __name__ == "__main__":
    main()
