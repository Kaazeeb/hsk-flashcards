#!/usr/bin/env python3
"""Static analysis reports for HSK Flashcards content.

Examples:
  python3 scripts/analyze_flashcards.py --report ambiguity
  python3 scripts/analyze_flashcards.py --report sentence-frequency --low-frequency-threshold 2
  python3 scripts/analyze_flashcards.py --report all --format json
"""
from __future__ import annotations

import argparse
import json
import re
import sys
from collections import Counter, defaultdict
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parents[1]

VOCAB_PATTERNS = ["js/data/hsk1-data-part-*.js"]
SENTENCE_PATTERNS = ["js/sentence-cards-data-part-*.js"]
HANZI_PATTERNS = ["js/hanzi-cards-data-part-*.js"]
MEASURE_WORD_PATTERNS = ["js/measure-word-cards-data-part-*.js"]
IMAGE_FILES = ["js/image-cards-data.js"]


def strip_js_comments(source: str) -> str:
    source = re.sub(r"/\*.*?\*/", "", source, flags=re.S)
    source = re.sub(r"^\s*//.*$", "", source, flags=re.M)
    return source


def find_call_payloads(source: str, call_name: str) -> list[str]:
    payloads: list[str] = []
    needle = f"{call_name}("
    pos = 0
    while True:
        start = source.find(needle, pos)
        if start == -1:
            return payloads
        i = start + len(needle)
        depth = 1
        in_string: str | None = None
        escape = False
        while i < len(source):
            ch = source[i]
            if in_string:
                if escape:
                    escape = False
                elif ch == "\\":
                    escape = True
                elif ch == in_string:
                    in_string = None
            else:
                if ch in {'"', "'", "`"}:
                    in_string = ch
                elif ch == "(":
                    depth += 1
                elif ch == ")":
                    depth -= 1
                    if depth == 0:
                        payloads.append(source[start + len(needle):i].strip())
                        pos = i + 1
                        break
            i += 1
        else:
            raise ValueError(f"Unclosed {call_name}(...) call")


def load_push_cards(patterns: list[str], call_name: str) -> list[dict[str, Any]]:
    cards: list[dict[str, Any]] = []
    for pattern in patterns:
        for path in sorted(ROOT.glob(pattern)):
            source = strip_js_comments(path.read_text(encoding="utf-8"))
            for payload in find_call_payloads(source, call_name):
                data = json.loads(f"[{payload}]")
                for item in data:
                    if isinstance(item, list):
                        cards.extend(item)
                    elif isinstance(item, dict):
                        cards.append(item)
                    else:
                        raise TypeError(f"Unexpected payload item in {path}: {type(item).__name__}")
    return cards


def load_image_cards() -> list[dict[str, Any]]:
    cards: list[dict[str, Any]] = []
    for rel in IMAGE_FILES:
        path = ROOT / rel
        source = strip_js_comments(path.read_text(encoding="utf-8"))
        match = re.search(r"window\.HSK_IMAGE_CARDS\s*=\s*window\.HSK_IMAGE_CARDS\s*\|\|\s*(\[[\s\S]*?\])\s*;", source)
        if match:
            cards.extend(json.loads(match.group(1)))
    return cards


def load_all() -> dict[str, list[dict[str, Any]]]:
    return {
        "vocabulary": load_push_cards(VOCAB_PATTERNS, "window.HSK1_BUILTIN_CARD_PARTS.push"),
        "sentences": load_push_cards(SENTENCE_PATTERNS, "window.HSK_SENTENCE_CARDS.push"),
        "hanzi_study": load_push_cards(HANZI_PATTERNS, "window.HSK_HANZI_CARDS.push"),
        "measure_words": load_push_cards(MEASURE_WORD_PATTERNS, "window.HSK_MEASURE_WORD_CARDS.push"),
        "images": load_image_cards(),
    }


def stable_card_id(index: int, card: dict[str, Any]) -> str:
    return str(card.get("id") or f"vocab_{index + 1:04d}_{card.get('hanzi', '')}")


def report_summary(data: dict[str, list[dict[str, Any]]]) -> dict[str, Any]:
    sentence_directions = Counter(card.get("direction", "") for card in data["sentences"])
    return {
        "counts": {name: len(cards) for name, cards in data.items()},
        "sentence_directions": dict(sorted(sentence_directions.items())),
    }


def report_ambiguity(vocab: list[dict[str, Any]]) -> dict[str, Any]:
    by_hanzi: dict[str, list[dict[str, Any]]] = defaultdict(list)
    by_hanzi_pinyin: dict[tuple[str, str], list[dict[str, Any]]] = defaultdict(list)
    exact: dict[tuple[str, str, str, str], list[dict[str, Any]]] = defaultdict(list)

    enriched = []
    for index, card in enumerate(vocab):
        row = {"index": index + 1, "id": stable_card_id(index, card), **card}
        enriched.append(row)
        hanzi = str(card.get("hanzi", ""))
        pinyin_numeric = str(card.get("pinyinNumeric") or card.get("pinyin") or "")
        by_hanzi[hanzi].append(row)
        by_hanzi_pinyin[(hanzi, pinyin_numeric)].append(row)
        exact[(hanzi, pinyin_numeric, str(card.get("partOfSpeech", "")), str(card.get("translation", "")))].append(row)

    hanzi_different_pinyin = []
    hanzi_same_pinyin_multiple_pos_or_translation = []
    exact_duplicates = []

    for hanzi, rows in sorted(by_hanzi.items()):
        pinyins = sorted({str(r.get("pinyinNumeric") or r.get("pinyin") or "") for r in rows})
        if len(rows) > 1 and len(pinyins) > 1:
            hanzi_different_pinyin.append({"hanzi": hanzi, "pinyinNumericValues": pinyins, "cards": rows})

    for (hanzi, pinyin), rows in sorted(by_hanzi_pinyin.items()):
        meanings = {(str(r.get("partOfSpeech", "")), str(r.get("translation", ""))) for r in rows}
        if len(rows) > 1 and len(meanings) > 1:
            hanzi_same_pinyin_multiple_pos_or_translation.append({"hanzi": hanzi, "pinyinNumeric": pinyin, "cards": rows})

    for (_hanzi, _pinyin, _pos, _translation), rows in sorted(exact.items()):
        if len(rows) > 1:
            exact_duplicates.append({"cards": rows})

    return {
        "hanzi_different_pinyin": hanzi_different_pinyin,
        "hanzi_same_pinyin_multiple_pos_or_translation": hanzi_same_pinyin_multiple_pos_or_translation,
        "exact_duplicates": exact_duplicates,
        "summary": {
            "hanzi_different_pinyin_groups": len(hanzi_different_pinyin),
            "hanzi_same_pinyin_multiple_pos_or_translation_groups": len(hanzi_same_pinyin_multiple_pos_or_translation),
            "exact_duplicate_groups": len(exact_duplicates),
        },
    }


def report_sentence_frequency(vocab: list[dict[str, Any]], sentences: list[dict[str, Any]], threshold: int) -> dict[str, Any]:
    tag_counts: Counter[str] = Counter()
    occurrence_counts: Counter[str] = Counter()
    sentence_examples: dict[str, list[str]] = defaultdict(list)

    for sentence in sentences:
        sentence_id = str(sentence.get("id", ""))
        chinese = str(sentence.get("chinese") or sentence.get("front") or "")
        for tag in set(sentence.get("vocabTags") or []):
            tag_counts[str(tag)] += 1
            if len(sentence_examples[str(tag)]) < 3:
                sentence_examples[str(tag)].append(sentence_id)
        for card in vocab:
            hanzi = str(card.get("hanzi", ""))
            if hanzi and hanzi in chinese:
                occurrence_counts[hanzi] += chinese.count(hanzi)

    rows = []
    for index, card in enumerate(vocab):
        hanzi = str(card.get("hanzi", ""))
        tagged = tag_counts[hanzi]
        occurrences = occurrence_counts[hanzi]
        rows.append({
            "index": index + 1,
            "id": stable_card_id(index, card),
            "hanzi": hanzi,
            "pinyinNumeric": card.get("pinyinNumeric", ""),
            "partOfSpeech": card.get("partOfSpeech", ""),
            "translation": card.get("translation", ""),
            "taggedSentenceCount": tagged,
            "chineseTextOccurrences": occurrences,
            "exampleSentenceIds": sentence_examples.get(hanzi, []),
        })

    low = [row for row in rows if row["taggedSentenceCount"] <= threshold]
    low.sort(key=lambda r: (r["taggedSentenceCount"], r["chineseTextOccurrences"], r["index"]))
    rows.sort(key=lambda r: (r["taggedSentenceCount"], r["chineseTextOccurrences"], r["index"]))

    unmatched_tags = sorted(tag for tag in tag_counts if tag not in {str(card.get("hanzi", "")) for card in vocab})
    return {
        "summary": {
            "vocabularyCards": len(vocab),
            "sentenceCards": len(sentences),
            "lowFrequencyThreshold": threshold,
            "lowFrequencyCards": len(low),
            "unmatchedSentenceVocabTags": len(unmatched_tags),
        },
        "low_frequency_cards": low,
        "all_cards_by_frequency": rows,
        "unmatched_sentence_vocab_tags": unmatched_tags,
    }


def print_markdown(results: dict[str, Any]) -> None:
    for name, result in results.items():
        print(f"# {name.replace('_', ' ').title()}\n")
        if name == "summary":
            print(json.dumps(result, ensure_ascii=False, indent=2))
        elif name == "ambiguity":
            print(json.dumps(result["summary"], ensure_ascii=False, indent=2))
            for key in ("hanzi_different_pinyin", "hanzi_same_pinyin_multiple_pos_or_translation", "exact_duplicates"):
                print(f"\n## {key}\n")
                print(json.dumps(result[key], ensure_ascii=False, indent=2))
        elif name == "sentence_frequency":
            print(json.dumps(result["summary"], ensure_ascii=False, indent=2))
            print("\n## low_frequency_cards\n")
            print(json.dumps(result["low_frequency_cards"], ensure_ascii=False, indent=2))
            print("\n## unmatched_sentence_vocab_tags\n")
            print(json.dumps(result["unmatched_sentence_vocab_tags"], ensure_ascii=False, indent=2))
        print()


def main(argv: list[str]) -> int:
    parser = argparse.ArgumentParser(description="Analyze flashcard data for ambiguity and sentence coverage.")
    parser.add_argument("--report", action="append", choices=["summary", "ambiguity", "sentence-frequency", "all"], required=True)
    parser.add_argument("--low-frequency-threshold", type=int, default=1, help="Flag vocab cards with <= this many tagged sentence appearances.")
    parser.add_argument("--format", choices=["markdown", "json"], default="markdown")
    args = parser.parse_args(argv)

    data = load_all()
    selected = set(args.report)
    if "all" in selected:
        selected = {"summary", "ambiguity", "sentence-frequency"}

    results: dict[str, Any] = {}
    if "summary" in selected:
        results["summary"] = report_summary(data)
    if "ambiguity" in selected:
        results["ambiguity"] = report_ambiguity(data["vocabulary"])
    if "sentence-frequency" in selected:
        results["sentence_frequency"] = report_sentence_frequency(data["vocabulary"], data["sentences"], args.low_frequency_threshold)

    if args.format == "json":
        print(json.dumps(results, ensure_ascii=False, indent=2))
    else:
        print_markdown(results)
    return 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv[1:]))
