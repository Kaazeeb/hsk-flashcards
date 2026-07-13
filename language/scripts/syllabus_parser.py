#!/usr/bin/env python3
"""Fail-closed parser for the audited 2025-11 / 2026-07 HSK syllabus pair."""

from __future__ import annotations

import re
from collections import Counter
from dataclasses import dataclass
from pathlib import Path
from typing import Any

from catalog_io import (
    EN_SYLLABUS,
    ZH_SYLLABUS,
    band_code,
    band_from_text,
    clean_markdown_cell,
    is_separator_row,
    normalize_search_text,
    sha256_file,
    split_markdown_row,
)

EXPECTED_ZH_SHA256 = "8aabab6087fb619f4fbc082a2af737d0024f77b107e7825c7d4fc2442bb0064f"
EXPECTED_EN_SHA256 = "cde5ba1cf4861a2ac42660280f2e2834f8f6226b7001a89f7a054f70e36d08af"

EXPECTED_VOCAB_COUNTS = {(1, 1): 300, (2, 2): 200, (3, 3): 500, (4, 4): 1000,
                         (5, 5): 1600, (6, 6): 1800, (7, 9): 5600}
EXPECTED_GRAMMAR_COUNTS = {(1, 1): 70, (2, 2): 78, (3, 3): 96, (4, 4): 95,
                           (5, 5): 70, (6, 6): 50, (7, 9): 134}
EXPECTED_TOPIC_COUNTS = {(1, 1): 30, (2, 2): 34, (3, 3): 54, (4, 4): 77,
                         (5, 5): 72, (6, 6): 68, (7, 9): 92}
EXPECTED_TOPIC_HIERARCHY_COUNTS = {
    (1, 1): (5, 15, 30), (2, 2): (5, 18, 34), (3, 3): (6, 22, 54),
    (4, 4): (7, 31, 77), (5, 5): (7, 29, 72), (6, 6): (7, 25, 68),
    (7, 9): (5, 29, 92),
}
EXPECTED_TASK_COUNTS = {(1, 1): 15, (2, 2): 17, (3, 3): 22, (4, 4): 30,
                        (5, 5): 28, (6, 6): 24, (7, 9): 30}
EXPECTED_CAPABILITY_COUNTS = {(1, 1): 59, (2, 2): 76, (3, 3): 109, (4, 4): 139,
                              (5, 5): 109, (6, 6): 97, (7, 9): 89}
EXPECTED_RECOGNITION_COUNTS = {(1, 1): 246, (2, 2): 125, (3, 3): 284, (4, 4): 441,
                               (5, 5): 431, (6, 6): 413, (7, 9): 1148}
EXPECTED_WRITING_COUNTS = {(1, 2): 100, (3, 3): 150, (4, 4): 150, (5, 5): 150,
                           (6, 6): 150, (7, 9): 500}


@dataclass(frozen=True)
class SourceLine:
    number: int
    text: str


def load_lines(path: Path) -> list[SourceLine]:
    return [SourceLine(index, text) for index, text in enumerate(
        path.read_text(encoding="utf-8").splitlines(), start=1
    )]


def assert_source_hashes() -> None:
    actual_zh = sha256_file(ZH_SYLLABUS)
    actual_en = sha256_file(EN_SYLLABUS)
    if actual_zh != EXPECTED_ZH_SHA256:
        raise ValueError(f"Unexpected Chinese syllabus checksum: {actual_zh}")
    if actual_en != EXPECTED_EN_SHA256:
        raise ValueError(f"Unexpected English syllabus checksum: {actual_en}")


def find_section(lines: list[SourceLine], heading: str, next_heading: str | None) -> list[SourceLine]:
    starts = [index for index, row in enumerate(lines) if row.text.strip() == heading]
    if len(starts) != 1:
        raise ValueError(f"Expected one {heading!r} heading, found {len(starts)}")
    start = starts[0] + 1
    if next_heading is None:
        return lines[start:]
    ends = [index for index, row in enumerate(lines[start:], start=start) if row.text.strip() == next_heading]
    if len(ends) != 1:
        raise ValueError(f"Expected one {next_heading!r} heading, found {len(ends)}")
    return lines[start:ends[0]]


def parse_level_raw(value: str) -> tuple[int, int, str]:
    primary = value.split("（", 1)[0].strip()
    level_min, level_max = band_from_text(primary)
    additions = []
    for item in re.findall(r"（([^）]+)）", value):
        item_min, item_max = band_from_text(item)
        additions.append(str(item_min) if item_min == item_max else f"{item_min}-{item_max}")
    return level_min, level_max, "|".join(additions)


def split_sense_marker(value: str) -> tuple[str, str]:
    match = re.fullmatch(r"(.+?)(\d+)", value)
    return (match.group(1), match.group(2)) if match else (value, "")


def parse_vocabulary(zh_lines: list[SourceLine], en_lines: list[SourceLine]) -> list[dict[str, Any]]:
    zh = find_section(zh_lines, "# 词汇大纲", "# 汉字大纲")
    en = find_section(en_lines, "# HSK Vocabulary Syllabus", "# HSK Hanzi Syllabus")

    def rows(section: list[SourceLine]) -> list[tuple[SourceLine, list[str]]]:
        result = []
        header_seen = False
        for source_line in section:
            if not source_line.text.strip().startswith("|"):
                continue
            cells = split_markdown_row(source_line.text)
            if cells == ["序号", "等级", "词语", "拼音", "词性"]:
                header_seen = True
                continue
            if is_separator_row(cells):
                continue
            if cells and cells[0].isdigit():
                if len(cells) != 5:
                    raise ValueError(f"Vocabulary row has {len(cells)} columns at line {source_line.number}")
                result.append((source_line, cells))
        if not header_seen:
            raise ValueError("Vocabulary header not found")
        return result

    zh_rows, en_rows = rows(zh), rows(en)
    if len(zh_rows) != 11000 or len(en_rows) != 11000:
        raise ValueError(f"Expected 11,000 vocabulary rows, got ZH={len(zh_rows)} EN={len(en_rows)}")

    output = []
    counts: Counter[tuple[int, int]] = Counter()
    for index, ((zh_line, zh_cells), (en_line, en_cells)) in enumerate(zip(zh_rows, en_rows), start=1):
        if zh_cells != en_cells:
            raise ValueError(f"Vocabulary ZH/EN mismatch at source row {index}")
        if int(zh_cells[0]) != index:
            raise ValueError(f"Vocabulary order is not sequential at {zh_cells[0]}")
        level_min, level_max, additional = parse_level_raw(zh_cells[1])
        counts[(level_min, level_max)] += 1
        hanzi, sense_number = split_sense_marker(zh_cells[2])
        output.append({
            "vocab_id": f"hsk26-v{index:05d}",
            "syllabus_order": index,
            "level_min": level_min,
            "level_max": level_max,
            "level_raw": zh_cells[1],
            "additional_levels": additional,
            "hanzi": hanzi,
            "syllabus_form": zh_cells[2],
            "sense_number": sense_number,
            "syllabus_pinyin": zh_cells[3],
            "pinyin": zh_cells[3],
            "pinyin_search": normalize_search_text(zh_cells[3]),
            "pinyin_numeric": "",
            "syllabus_part_of_speech_zh": zh_cells[4],
            "part_of_speech_zh": zh_cells[4],
            "example_zh": "",
            "example_review_status": "",
            "curation_status": "syllabus_only",
            "source_id": "hsk26-zh",
            "source_locator": f"reference/HSK_SYLLABUS_ZH.md:{zh_line.number}",
            "notes": "",
        })
    if counts != Counter(EXPECTED_VOCAB_COUNTS):
        raise ValueError(f"Unexpected vocabulary level counts: {dict(counts)}")
    return output


def parse_hierarchical_rows(
    lines: list[SourceLine],
    *,
    heading_pattern: re.Pattern[str],
    expected_header: list[str],
    stop_heading: str | None = None,
) -> dict[tuple[int, int], list[dict[str, Any]]]:
    current_band: tuple[int, int] | None = None
    saw_header = False
    result: dict[tuple[int, int], list[dict[str, Any]]] = {}
    for row in lines:
        if stop_heading and row.text.strip() == stop_heading:
            break
        heading = heading_pattern.fullmatch(row.text.strip())
        if heading:
            current_band = band_from_text(heading.group(1))
            if current_band in result:
                raise ValueError(f"Duplicate level section {current_band}")
            result[current_band] = []
            saw_header = False
            continue
        if current_band is None or not row.text.strip().startswith("|"):
            continue
        cells = split_markdown_row(row.text)
        if cells == expected_header:
            saw_header = True
            continue
        if is_separator_row(cells):
            continue
        if not saw_header:
            raise ValueError(f"Data before expected table header at line {row.number}")
        if len(cells) != len(expected_header):
            raise ValueError(f"Unexpected column count at line {row.number}")
        result[current_band].append({"line": row.number, "cells": cells})
    return result


def fill_hierarchy(rows: list[dict[str, Any]], width: int) -> list[dict[str, Any]]:
    parents = [""] * width
    output = []
    for row in rows:
        cells = list(row["cells"])
        for index in range(width):
            if cells[index]:
                parents[index] = cells[index]
                for child in range(index + 1, width):
                    parents[child] = ""
            cells[index] = parents[index]
        output.append({**row, "cells": cells})
    return output


def parse_grammar(zh_lines: list[SourceLine], en_lines: list[SourceLine]) -> list[dict[str, Any]]:
    zh_section = find_section(zh_lines, "# 语法大纲", None)
    en_section = find_section(en_lines, "# HSK Grammar Syllabus", None)
    zh_raw = parse_hierarchical_rows(
        zh_section,
        heading_pattern=re.compile(r"## HSK（(.+)）语法"),
        expected_header=["类别", "类别名称", "细目", "语法内容"],
    )
    en_raw = parse_hierarchical_rows(
        en_section,
        heading_pattern=re.compile(r"## HSK (.+?) Grammar"),
        expected_header=["Category", "Category name", "Subitem", "Grammar content"],
    )
    if set(zh_raw) != set(EXPECTED_GRAMMAR_COUNTS) or set(en_raw) != set(EXPECTED_GRAMMAR_COUNTS):
        raise ValueError("Unexpected grammar level sections")

    output = []
    for band in EXPECTED_GRAMMAR_COUNTS:
        zh_rows, en_rows = zh_raw[band], en_raw[band]
        expected = EXPECTED_GRAMMAR_COUNTS[band]
        if len(zh_rows) != expected or len(en_rows) != expected:
            raise ValueError(f"Unexpected grammar row count for {band}: {len(zh_rows)}/{len(en_rows)}")
        for index, (zh_row, en_row) in enumerate(zip(zh_rows, en_rows), start=1):
            zh_mask = [bool(cell) for cell in zh_row["cells"][:3]]
            en_mask = [bool(cell) for cell in en_row["cells"][:3]]
            if zh_mask != en_mask:
                raise ValueError(f"Grammar hierarchy mismatch for {band} row {index}")
        zh_filled, en_filled = fill_hierarchy(zh_rows, 3), fill_hierarchy(en_rows, 3)
        for index, (zh_row, en_row) in enumerate(zip(zh_filled, en_filled), start=1):
            code = band_code(*band)
            output.append({
                "grammar_point_id": f"hsk26-g{code}-{index:03d}",
                "level_min": band[0], "level_max": band[1], "row_order": index,
                "category_zh": clean_markdown_cell(zh_row["cells"][0]),
                "category_en": clean_markdown_cell(en_row["cells"][0]),
                "category_name_zh": clean_markdown_cell(zh_row["cells"][1]),
                "category_name_en": clean_markdown_cell(en_row["cells"][1]),
                "subitem_zh": clean_markdown_cell(zh_row["cells"][2]),
                "subitem_en": clean_markdown_cell(en_row["cells"][2]),
                "content_zh": clean_markdown_cell(zh_row["cells"][3]),
                "content_en": clean_markdown_cell(en_row["cells"][3]),
                "review_status": "syllabus_only", "source_id": "hsk26-zh+hsk26-en",
                "source_locator_zh": f"reference/HSK_SYLLABUS_ZH.md:{zh_row['line']}",
                "source_locator_en": f"reference/HSK_SYLLABUS_EN.md:{en_row['line']}",
                "notes": "",
            })
    return output


TOPIC_OVERRIDES: dict[tuple[tuple[int, int], str], tuple[str, str]] = {
    ((6, 6), "地理分区"): ("自然与环境", "自然"),
    ((7, 9), "人口流动与管理"): ("国家与社会", "人口与发展"),
    ((7, 9), "中国传统文化意象及在不同文学艺术形式中的表现"): ("文化与传统", "文学艺术"),
}
TOPIC_CLEAR: set[tuple[tuple[int, int], str]] = {
    ((6, 6), "自然现象"),
    ((7, 9), "教育高质量发展"),
    ((7, 9), "不同文学形式的特点和作品欣赏"),
}


def parse_topics(zh_lines: list[SourceLine], en_lines: list[SourceLine]) -> list[dict[str, Any]]:
    zh_section = find_section(zh_lines, "# 话题大纲", "# 词汇大纲")
    en_section = find_section(en_lines, "# HSK Topic Syllabus", "# HSK Vocabulary Syllabus")
    zh_raw = parse_hierarchical_rows(
        zh_section,
        heading_pattern=re.compile(r"## HSK（(.+)）话题"),
        expected_header=["一级话题", "二级话题", "三级话题"],
    )
    en_raw = parse_hierarchical_rows(
        en_section,
        heading_pattern=re.compile(r"## HSK (.+?) Topics"),
        expected_header=["First-level topic", "Second-level topic", "Third-level topic"],
    )
    if set(zh_raw) != set(EXPECTED_TOPIC_COUNTS) or set(en_raw) != set(EXPECTED_TOPIC_COUNTS):
        raise ValueError("Unexpected topic level sections")

    output = []
    for band, expected in EXPECTED_TOPIC_COUNTS.items():
        zh_rows = zh_raw.get(band, [])
        en_rows = en_raw.get(band, [])
        if not zh_rows or not en_rows:
            raise ValueError(f"Missing topic section {band}")
        if not ("个" in zh_rows[-1]["cells"][0] and "item" in en_rows[-1]["cells"][0].lower()):
            raise ValueError(f"Missing topic summary row for {band}")
        zh_summary = tuple(int(re.search(r"\d+", cell).group()) for cell in zh_rows[-1]["cells"])
        en_summary = tuple(int(re.search(r"\d+", cell).group()) for cell in en_rows[-1]["cells"])
        if zh_summary != EXPECTED_TOPIC_HIERARCHY_COUNTS[band] or en_summary != zh_summary:
            raise ValueError(f"Unexpected topic hierarchy summary for {band}: {zh_summary}/{en_summary}")
        zh_rows, en_rows = zh_rows[:-1], en_rows[:-1]
        if len(zh_rows) != expected or len(en_rows) != expected:
            raise ValueError(f"Unexpected topic count for {band}: {len(zh_rows)}/{len(en_rows)}")

        for row in zh_rows:
            trigger = clean_markdown_cell(row["cells"][2])
            if (band, trigger) in TOPIC_CLEAR:
                row["cells"][0] = ""
                if trigger != "教育高质量发展":
                    row["cells"][1] = ""
            if (band, trigger) in TOPIC_OVERRIDES:
                row["cells"][0], row["cells"][1] = TOPIC_OVERRIDES[(band, trigger)]

        for index, (zh_row, en_row) in enumerate(zip(zh_rows, en_rows), start=1):
            if [bool(cell) for cell in zh_row["cells"][:2]] != [bool(cell) for cell in en_row["cells"][:2]]:
                raise ValueError(f"Unexpected topic hierarchy mismatch for {band} row {index}")

        zh_filled, en_filled = fill_hierarchy(zh_rows, 2), fill_hierarchy(en_rows, 2)
        hierarchy_counts = (
            len({row["cells"][0] for row in zh_filled}),
            len({(row["cells"][0], row["cells"][1]) for row in zh_filled}),
            len(zh_filled),
        )
        if hierarchy_counts != EXPECTED_TOPIC_HIERARCHY_COUNTS[band]:
            raise ValueError(f"Filled topic hierarchy count mismatch for {band}: {hierarchy_counts}")
        code = band_code(*band)
        for index, (zh_row, en_row) in enumerate(zip(zh_filled, en_filled), start=1):
            output.append({
                "topic_id": f"hsk26-t{code}-{index:03d}",
                "level_min": band[0], "level_max": band[1], "row_order": index,
                "topic_l1_zh": clean_markdown_cell(zh_row["cells"][0]),
                "topic_l1_en": clean_markdown_cell(en_row["cells"][0]),
                "topic_l2_zh": clean_markdown_cell(zh_row["cells"][1]),
                "topic_l2_en": clean_markdown_cell(en_row["cells"][1]),
                "topic_l3_zh": clean_markdown_cell(zh_row["cells"][2]),
                "topic_l3_en": clean_markdown_cell(en_row["cells"][2]),
                "source_id": "hsk26-zh+hsk26-en",
                "source_locator_zh": f"reference/HSK_SYLLABUS_ZH.md:{zh_row['line']}",
                "source_locator_en": f"reference/HSK_SYLLABUS_EN.md:{en_row['line']}",
                "notes": "topic hierarchy corrected from aligned EN structure" if (band, clean_markdown_cell(zh_row["cells"][2])) in TOPIC_OVERRIDES else "",
            })
    return output


ZH_SCENARIOS = {"生活和社交场景", "工作和职业场景", "教育和学术场景"}
EN_SCENARIOS = {"Life and social scenarios", "Work and professional scenarios", "Education and academic scenarios"}
ZH_SCENARIO_NUMBERS = {"生活和社交场景": 1, "工作和职业场景": 2, "教育和学术场景": 3}
SCENARIO_TRANSLATIONS = {
    "生活和社交场景": "Life and social scenarios",
    "工作和职业场景": "Work and professional scenarios",
    "教育和学术场景": "Education and academic scenarios",
}


def parse_tasks_for_language(
    section: list[SourceLine], *, language: str
) -> dict[tuple[int, int], list[dict[str, Any]]]:
    if language == "zh":
        level_pattern = re.compile(r"## HSK（(.+)）任务")
        task_pattern = re.compile(r"### ([一二三四五六七八九十百〇零]+)、(.+)")
        scenarios = ZH_SCENARIOS
    else:
        level_pattern = re.compile(r"## HSK (.+?) Tasks")
        task_pattern = re.compile(r"### (\d+)\. (.+)")
        scenarios = EN_SCENARIOS

    result: dict[tuple[int, int], list[dict[str, Any]]] = {}
    current_band: tuple[int, int] | None = None
    current_scenario = ""
    current_scenario_line = 0
    current_task: dict[str, Any] | None = None
    unknown_h3: list[str] = []
    for row in section:
        text = row.text.strip()
        level_match = level_pattern.fullmatch(text)
        if level_match:
            current_band = band_from_text(level_match.group(1))
            if current_band in result:
                raise ValueError(f"Duplicate task level section {current_band}")
            result[current_band] = []
            current_scenario = ""
            current_scenario_line = 0
            current_task = None
            continue
        if current_band is None:
            continue
        if text.startswith("### "):
            title = text[4:]
            if title in scenarios:
                current_scenario = title
                current_scenario_line = row.number
                current_task = None
                continue
            task_match = task_pattern.fullmatch(text)
            if not task_match:
                unknown_h3.append(text)
                continue
            if language == "zh":
                expected_number = len(result[current_band]) + 1
                if chinese_number(task_match.group(1)) != expected_number:
                    raise ValueError(f"Non-sequential Chinese task number at line {row.number}")
                task_title = task_match.group(2)
            else:
                expected_number = len(result[current_band]) + 1
                if int(task_match.group(1)) != expected_number:
                    raise ValueError(f"Non-sequential English task number at line {row.number}")
                task_title = task_match.group(2)
            current_task = {
                "number": len(result[current_band]) + 1,
                "title": task_title,
                "scenario": current_scenario,
                "scenario_line": current_scenario_line,
                "line": row.number,
                "capabilities": [],
            }
            result[current_band].append(current_task)
            continue
        if text.startswith("- ") and current_task is not None:
            current_task["capabilities"].append({"line": row.number, "text": text[2:].strip()})
    if unknown_h3:
        raise ValueError(f"Unknown task H3 headings: {unknown_h3}")
    return result


def chinese_number(value: str) -> int:
    digits = {"〇": 0, "零": 0, "一": 1, "二": 2, "三": 3, "四": 4, "五": 5,
              "六": 6, "七": 7, "八": 8, "九": 9}
    if value == "十":
        return 10
    if "十" in value:
        left, right = value.split("十", 1)
        tens = digits[left] if left else 1
        ones = digits[right] if right else 0
        return tens * 10 + ones
    if len(value) == 1 and value in digits:
        return digits[value]
    raise ValueError(f"Unsupported Chinese task number: {value}")


def parse_tasks(
    zh_lines: list[SourceLine], en_lines: list[SourceLine]
) -> tuple[list[dict[str, Any]], list[dict[str, Any]], list[dict[str, Any]]]:
    zh_section = find_section(zh_lines, "# 任务大纲", "# 话题大纲")
    en_section = find_section(en_lines, "# HSK Task Syllabus", "# HSK Topic Syllabus")
    zh_tasks = parse_tasks_for_language(zh_section, language="zh")
    en_tasks = parse_tasks_for_language(en_section, language="en")
    if set(zh_tasks) != set(EXPECTED_TASK_COUNTS) or set(en_tasks) != set(EXPECTED_TASK_COUNTS):
        raise ValueError("Unexpected task level sections")
    tasks: list[dict[str, Any]] = []
    capabilities: list[dict[str, Any]] = []
    scenarios: dict[str, dict[str, Any]] = {}
    for band, expected_tasks in EXPECTED_TASK_COUNTS.items():
        zh_rows, en_rows = zh_tasks.get(band, []), en_tasks.get(band, [])
        if len(zh_rows) != expected_tasks or len(en_rows) != expected_tasks:
            raise ValueError(f"Unexpected task count for {band}: {len(zh_rows)}/{len(en_rows)}")
        capability_total = 0
        for zh_task, en_task in zip(zh_rows, en_rows):
            expected_en_scenario = SCENARIO_TRANSLATIONS.get(zh_task["scenario"], "")
            if en_task["scenario"] != expected_en_scenario:
                raise ValueError(
                    f"Task scenario mismatch for {band} task {zh_task['number']}: "
                    f"{zh_task['scenario']!r} / {en_task['scenario']!r}"
                )
            if len(zh_task["capabilities"]) != len(en_task["capabilities"]):
                raise ValueError(f"Task capability mismatch for {band} task {zh_task['number']}")
            code = band_code(*band)
            task_id = f"hsk26-task{code}-{zh_task['number']:02d}"
            scenario_id = ""
            if zh_task["scenario"]:
                scenario_id = f"hsk26-scenario{code}-{ZH_SCENARIO_NUMBERS[zh_task['scenario']]}"
                scenarios.setdefault(scenario_id, {
                    "scenario_id": scenario_id, "level_min": band[0], "level_max": band[1],
                    "scenario_order": ZH_SCENARIO_NUMBERS[zh_task["scenario"]],
                    "title_zh": zh_task["scenario"], "title_en": en_task["scenario"],
                    "source_id": "hsk26-zh+hsk26-en",
                    "source_locator_zh": f"reference/HSK_SYLLABUS_ZH.md:{zh_task['scenario_line']}",
                    "source_locator_en": f"reference/HSK_SYLLABUS_EN.md:{en_task['scenario_line']}",
                })
            tasks.append({
                "task_id": task_id, "level_min": band[0], "level_max": band[1],
                "scenario_id": scenario_id, "task_number": zh_task["number"],
                "title_zh": zh_task["title"], "title_en": en_task["title"],
                "source_id": "hsk26-zh+hsk26-en",
                "source_locator_zh": f"reference/HSK_SYLLABUS_ZH.md:{zh_task['line']}",
                "source_locator_en": f"reference/HSK_SYLLABUS_EN.md:{en_task['line']}",
            })
            for number, (zh_cap, en_cap) in enumerate(
                zip(zh_task["capabilities"], en_task["capabilities"]), start=1
            ):
                capabilities.append({
                    "task_id": task_id, "capability_number": number,
                    "statement_zh": zh_cap["text"], "statement_en": en_cap["text"],
                    "source_id": "hsk26-zh+hsk26-en",
                    "source_locator_zh": f"reference/HSK_SYLLABUS_ZH.md:{zh_cap['line']}",
                    "source_locator_en": f"reference/HSK_SYLLABUS_EN.md:{en_cap['line']}",
                })
                capability_total += 1
        if capability_total != EXPECTED_CAPABILITY_COUNTS[band]:
            raise ValueError(f"Unexpected capability count for {band}: {capability_total}")
    if len(scenarios) != 3:
        raise ValueError(f"Expected three task scenarios, found {len(scenarios)}")
    return tasks, capabilities, [scenarios[key] for key in sorted(scenarios)]


def parse_hanzi_sections(
    lines: list[SourceLine], *, language: str
) -> dict[tuple[str, tuple[int, int]], list[dict[str, Any]]]:
    if language == "zh":
        section = find_section(lines, "# 汉字大纲", "# 语法大纲")
        heading_pattern = re.compile(r"## HSK（(.+?)）(?:~（(.+?)）)?(认读字|书写字)")
        expected_header = ["序号", "汉字"]
    else:
        section = find_section(lines, "# HSK Hanzi Syllabus", "# HSK Grammar Syllabus")
        heading_pattern = re.compile(r"## HSK (.+?) (Recognition|Writing) Characters")
        expected_header = ["No.", "Hanzi"]

    result: dict[tuple[str, tuple[int, int]], list[dict[str, Any]]] = {}
    current: tuple[str, tuple[int, int]] | None = None
    header_seen = False
    for row in section:
        text = row.text.strip()
        match = heading_pattern.fullmatch(text)
        if match:
            if language == "zh":
                if match.group(2):
                    band = (band_from_text(match.group(1))[0], band_from_text(match.group(2))[1])
                else:
                    band = band_from_text(match.group(1))
                role = "recognition" if match.group(3) == "认读字" else "writing"
            else:
                band = band_from_text(match.group(1))
                role = match.group(2).lower()
            current = (role, band)
            if current in result:
                raise ValueError(f"Duplicate hanzi section {current}")
            result[current] = []
            header_seen = False
            continue
        if current is None or not text.startswith("|"):
            continue
        cells = split_markdown_row(text)
        if cells == expected_header:
            header_seen = True
            continue
        if is_separator_row(cells):
            continue
        if not header_seen or len(cells) != 2 or not cells[0].isdigit():
            raise ValueError(f"Malformed hanzi row at line {row.number}")
        expected_no = len(result[current]) + 1
        if int(cells[0]) != expected_no:
            raise ValueError(f"Non-sequential hanzi row at line {row.number}")
        if len(cells[1]) != 1:
            raise ValueError(f"Expected one hanzi codepoint at line {row.number}")
        result[current].append({"line": row.number, "hanzi": cells[1]})
    return result


def parse_hanzi(zh_lines: list[SourceLine], en_lines: list[SourceLine]) -> list[dict[str, Any]]:
    zh_sections = parse_hanzi_sections(zh_lines, language="zh")
    en_sections = parse_hanzi_sections(en_lines, language="en")
    expected_keys = {
        **{("recognition", band): count for band, count in EXPECTED_RECOGNITION_COUNTS.items()},
        **{("writing", band): count for band, count in EXPECTED_WRITING_COUNTS.items()},
    }
    if set(zh_sections) != set(expected_keys) or set(en_sections) != set(expected_keys):
        raise ValueError(f"Unexpected hanzi sections: ZH={set(zh_sections)} EN={set(en_sections)}")

    recognition: dict[str, tuple[tuple[int, int], int]] = {}
    writing: dict[str, tuple[tuple[int, int], int]] = {}
    for key, expected_count in expected_keys.items():
        zh_rows, en_rows = zh_sections[key], en_sections[key]
        if len(zh_rows) != expected_count or len(en_rows) != expected_count:
            raise ValueError(f"Unexpected hanzi count for {key}: {len(zh_rows)}/{len(en_rows)}")
        if [row["hanzi"] for row in zh_rows] != [row["hanzi"] for row in en_rows]:
            raise ValueError(f"Hanzi ZH/EN mismatch for {key}")
        target = recognition if key[0] == "recognition" else writing
        for row in zh_rows:
            if row["hanzi"] in target:
                raise ValueError(f"Duplicate {key[0]} hanzi {row['hanzi']}")
            target[row["hanzi"]] = (key[1], row["line"])
    if len(recognition) != 3088 or len(writing) != 1200:
        raise ValueError("Unexpected unique hanzi totals")
    if not set(writing).issubset(recognition):
        raise ValueError("Writing hanzi must be a subset of recognition hanzi")

    output = []
    for hanzi, (recognition_band, recognition_line) in sorted(
        recognition.items(), key=lambda item: (item[1][0][0], item[1][1])
    ):
        writing_info = writing.get(hanzi)
        output.append({
            "hanzi_id": f"hanzi_{ord(hanzi):x}", "hanzi": hanzi,
            "recognition_level_min": recognition_band[0],
            "recognition_level_max": recognition_band[1],
            "writing_level_min": writing_info[0][0] if writing_info else "",
            "writing_level_max": writing_info[0][1] if writing_info else "",
            "curation_status": "syllabus_only", "source_id": "hsk26-zh",
            "source_locator": f"reference/HSK_SYLLABUS_ZH.md:{recognition_line}",
            "writing_source_locator": (
                f"reference/HSK_SYLLABUS_ZH.md:{writing_info[1]}" if writing_info else ""
            ),
            "notes": "",
        })
    return output


def parse_all() -> dict[str, list[dict[str, Any]]]:
    assert_source_hashes()
    zh_lines, en_lines = load_lines(ZH_SYLLABUS), load_lines(EN_SYLLABUS)
    tasks, task_capabilities, task_scenarios = parse_tasks(zh_lines, en_lines)
    result = {
        "vocabulary.csv": parse_vocabulary(zh_lines, en_lines),
        "grammar_points.csv": parse_grammar(zh_lines, en_lines),
        "topics.csv": parse_topics(zh_lines, en_lines),
        "tasks.csv": tasks,
        "task_scenarios.csv": task_scenarios,
        "task_capabilities.csv": task_capabilities,
        "hanzi.csv": parse_hanzi(zh_lines, en_lines),
    }
    vocab_hanzi = {
        char for row in result["vocabulary.csv"] for char in row["hanzi"] if "㐀" <= char <= "鿿"
    }
    listed_hanzi = {row["hanzi"] for row in result["hanzi.csv"]}
    if vocab_hanzi != listed_hanzi:
        raise ValueError(
            f"Vocabulary/recognition-hanzi set mismatch: vocabulary_only={vocab_hanzi - listed_hanzi}, "
            f"hanzi_only={listed_hanzi - vocab_hanzi}"
        )
    return result
