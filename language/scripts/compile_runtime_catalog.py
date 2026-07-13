#!/usr/bin/env python3
"""Compile catalog CSVs into the existing static JavaScript runtime format."""

from __future__ import annotations

import argparse
import json
import os
import re
import sys
import tempfile
from collections import defaultdict
from pathlib import Path
from typing import Any

from catalog_io import (
    ALL_TABLE_FIELDS,
    PROJECT_ROOT,
    REFERENCE_DIR,
    csv_path,
    load_runtime_cards,
    pipe_split,
    read_csv,
)
from grammar_study import (
    GRAMMAR_DATA_DIR,
    check_grammar_runtime,
    compile_grammar_by_level,
    render_grammar_chunks,
)

DATA_DIR = PROJECT_ROOT / "js" / "data" / "flashcards"
PUBLISHABLE_STATUSES = {"legacy_unreviewed", "approved"}


def require_publishable(row: dict[str, str], field: str, entity_id: str) -> None:
    status = row.get(field, "")
    if status not in PUBLISHABLE_STATUSES:
        raise ValueError(
            f"Active {entity_id} has non-publishable {field}={status!r}; "
            "only legacy_unreviewed migration rows or approved rows may compile"
        )


def index_by(rows: list[dict[str, str]], key: str, table: str) -> dict[str, dict[str, str]]:
    output = {}
    for row in rows:
        value = row.get(key, "")
        if not value or value in output:
            raise ValueError(f"Missing or duplicate {key}={value!r} in {table}")
        output[value] = row
    return output


def locale_index(
    rows: list[dict[str, str]], entity_key: str, locale: str, table: str
) -> dict[str, dict[str, str]]:
    selected = [row for row in rows if row["locale"] == locale]
    return index_by(selected, entity_key, table)


def ensure_unique(rows: list[dict[str, str]], field: str, table: str) -> None:
    values = [row.get(field, "") for row in rows]
    if any(not value for value in values) or len(values) != len(set(values)):
        raise ValueError(f"{table}.{field} must be nonblank and unique")


def strict_bool(value: str, field: str, entity_id: str) -> bool:
    if value not in {"true", "false"}:
        raise ValueError(f"{entity_id} has invalid {field}={value!r}; expected true or false")
    return value == "true"


def group_by(rows: list[dict[str, str]], key: str, order_key: str) -> dict[str, list[dict[str, str]]]:
    output: dict[str, list[dict[str, str]]] = defaultdict(list)
    for row in rows:
        output[row[key]].append(row)
    for grouped in output.values():
        grouped.sort(key=lambda item: int(item[order_key]))
        actual = [int(item[order_key]) for item in grouped]
        if actual != list(range(1, len(grouped) + 1)):
            raise ValueError(f"{order_key} must be unique and contiguous within each {key}")
    return output


def load_catalog() -> dict[str, list[dict[str, str]]]:
    return {name: read_csv(csv_path(name)) for name in ALL_TABLE_FIELDS}


def compile_vocabulary(data: dict[str, list[dict[str, str]]]) -> list[dict[str, Any]]:
    vocabulary = index_by(data["vocabulary.csv"], "vocab_id", "vocabulary.csv")
    translations = locale_index(data["vocabulary_translations.csv"], "vocab_id", "en", "vocabulary_translations.csv")
    bindings = sorted(data["vocabulary_cards.csv"], key=lambda row: int(row["runtime_order"]))
    ensure_unique(bindings, "vocab_id", "vocabulary_cards.csv")
    cards = []
    for expected_order, binding in enumerate(bindings, start=1):
        if int(binding["runtime_order"]) != expected_order:
            raise ValueError("Vocabulary runtime_order must be contiguous from 1")
        vocab = vocabulary[binding["vocab_id"]]
        translation = translations.get(binding["vocab_id"])
        if not translation or not translation["text"]:
            raise ValueError(f"Missing English translation for active {binding['vocab_id']}")
        require_publishable(vocab, "curation_status", binding["vocab_id"])
        require_publishable(translation, "review_status", f"{binding['vocab_id']}:en")
        if vocab["example_zh"]:
            require_publishable(vocab, "example_review_status", f"{binding['vocab_id']}:example")
        card: dict[str, Any] = {
            "hanzi": vocab["hanzi"],
            "pinyin": vocab["pinyin"],
            "pinyinNumeric": vocab["pinyin_numeric"],
        }
        if vocab["part_of_speech_zh"]:
            card["partOfSpeech"] = vocab["part_of_speech_zh"]
        if vocab["example_zh"]:
            card["example"] = vocab["example_zh"]
        card["translation"] = translation["text"]
        if not strict_bool(binding["learn_default"], "learn_default", binding["vocab_id"]):
            card["learn"] = False
        if not strict_bool(binding["practice_default"], "practice_default", binding["vocab_id"]):
            card["practice"] = False
        cards.append(card)
    return cards


def compile_sentences(data: dict[str, list[dict[str, str]]]) -> list[dict[str, Any]]:
    sentences = index_by(data["sentences.csv"], "sentence_id", "sentences.csv")
    translations = locale_index(data["sentence_translations.csv"], "sentence_id", "en", "sentence_translations.csv")
    utterances = group_by(data["sentence_utterances.csv"], "sentence_id", "turn_order")
    vocab_links = group_by(data["sentence_vocabulary.csv"], "sentence_id", "position")
    grammar_links = group_by(data["sentence_grammar.csv"], "sentence_id", "position")
    bindings = sorted(data["sentence_cards.csv"], key=lambda row: int(row["runtime_order"]))
    ensure_unique(bindings, "card_id", "sentence_cards.csv")
    cards = []
    for expected_order, binding in enumerate(bindings, start=1):
        if int(binding["runtime_order"]) != expected_order:
            raise ValueError("Sentence runtime_order must be contiguous from 1")
        sentence_id = binding["sentence_id"]
        sentence = sentences[sentence_id]
        translation = translations.get(sentence_id)
        turns = utterances.get(sentence_id, [])
        if not translation or not turns:
            raise ValueError(f"Incomplete sentence content for {sentence_id}")
        require_publishable(sentence, "curation_status", sentence_id)
        require_publishable(sentence, "linguistic_review_status", sentence_id)
        require_publishable(translation, "review_status", f"{sentence_id}:en")
        for turn in turns:
            require_publishable(turn, "review_status", f"{sentence_id}:turn:{turn['turn_order']}")
        direction = binding["direction"]
        full_zh = sentence["full_zh"]
        english = translation["text"]
        if direction == "zh_to_en":
            if len(turns) != 1 or turns[0]["role"] != "statement":
                raise ValueError(f"zh_to_en sentence requires one statement: {sentence_id}")
            front, back = turns[0]["zh_text"], english
            if full_zh != front:
                raise ValueError(f"full_zh differs from the statement utterance: {sentence_id}")
        elif direction == "en_to_zh":
            if len(turns) != 1 or turns[0]["role"] != "statement":
                raise ValueError(f"en_to_zh sentence requires one statement: {sentence_id}")
            front, back = english, turns[0]["zh_text"]
            if full_zh != back:
                raise ValueError(f"full_zh differs from the statement utterance: {sentence_id}")
        elif direction == "zh_qa":
            roles = {row["role"]: row["zh_text"] for row in turns}
            required = {"question", "positive_answer", "negative_answer"}
            if len(turns) != 3 or set(roles) != required or binding["response_style"] != "labeled_ab_lines":
                raise ValueError(f"Unsupported Q&A structure: {sentence_id}")
            front = roles["question"]
            back = f"A：{roles['positive_answer']}\nB：{roles['negative_answer']}"
            expected_full = f"{roles['question']} {roles['positive_answer']} / {roles['negative_answer']}"
            if full_zh != expected_full:
                raise ValueError(f"full_zh differs from the Q&A utterances: {sentence_id}")
        else:
            raise ValueError(f"Unsupported direction {direction!r}")
        for link in vocab_links.get(sentence_id, []):
            require_publishable(link, "review_status", f"{sentence_id}:vocab:{link['position']}")
        for link in grammar_links.get(sentence_id, []):
            require_publishable(link, "review_status", f"{sentence_id}:grammar:{link['position']}")
        cards.append({
            "id": binding["card_id"], "level": int(sentence["level"]),
            "deckId": binding["deck_id"], "deckName": binding["deck_name"],
            "direction": direction, "front": front, "back": back,
            "chinese": full_zh, "english": english,
            "grammarTags": [
                row["legacy_tag"] for row in grammar_links.get(sentence_id, []) if row["legacy_tag"]
            ],
            "vocabTags": [row["surface_form"] for row in vocab_links.get(sentence_id, [])],
            "tags": pipe_split(binding["tags"]),
        })
    return cards


def compile_hanzi(data: dict[str, list[dict[str, str]]]) -> list[dict[str, Any]]:
    hanzi = index_by(data["hanzi.csv"], "hanzi_id", "hanzi.csv")
    readings = index_by(data["hanzi_readings.csv"], "reading_id", "hanzi_readings.csv")
    bindings = sorted(data["hanzi_cards.csv"], key=lambda row: int(row["runtime_order"]))
    ensure_unique(bindings, "card_id", "hanzi_cards.csv")
    ensure_unique(bindings, "reading_id", "hanzi_cards.csv")
    cards = []
    for expected_order, binding in enumerate(bindings, start=1):
        if int(binding["runtime_order"]) != expected_order:
            raise ValueError("Hanzi runtime_order must be contiguous from 1")
        reading = readings[binding["reading_id"]]
        require_publishable(reading, "review_status", binding["reading_id"])
        if hanzi[reading["hanzi_id"]]["curation_status"] in {"in_review", "rejected", "retired"}:
            raise ValueError(f"Active {reading['hanzi_id']} has a blocked curation_status")
        character = hanzi[reading["hanzi_id"]]["hanzi"]
        cards.append({
            "id": binding["card_id"], "level": int(binding["level"]), "hanzi": character,
            "pinyin": reading["pinyin"], "pinyinNumeric": reading["pinyin_numeric"],
            "meaning": reading["meaning_en"], "strokeAnswer": reading["stroke_sequence"],
        })
    return cards


def compile_measure_words(data: dict[str, list[dict[str, str]]]) -> list[dict[str, Any]]:
    sets = index_by(data["measure_word_sets.csv"], "measure_word_id", "measure_word_sets.csv")
    usages = group_by(data["classifier_usages.csv"], "measure_word_id", "usage_order")
    bindings = sorted(data["measure_word_cards.csv"], key=lambda row: int(row["runtime_order"]))
    ensure_unique(bindings, "card_id", "measure_word_cards.csv")
    ensure_unique(bindings, "measure_word_id", "measure_word_cards.csv")
    cards = []
    for expected_order, binding in enumerate(bindings, start=1):
        if int(binding["runtime_order"]) != expected_order:
            raise ValueError("Measure-word runtime_order must be contiguous from 1")
        item = sets[binding["measure_word_id"]]
        item_usages = usages.get(binding["measure_word_id"], [])
        if not item_usages:
            raise ValueError(f"No classifier usages for {binding['measure_word_id']}")
        require_publishable(item, "review_status", binding["measure_word_id"])
        for usage in item_usages:
            require_publishable(usage, "review_status", usage["usage_id"])
        measure_words = "; ".join(
            f"{row['classifier_hanzi']} [{row['classifier_pinyin_numeric']}]" for row in item_usages
        )
        cards.append({
            "id": binding["card_id"], "level": int(item["level"]),
            "hanzi": item["headword_hanzi"], "pinyin": item["pinyin"],
            "pinyinNumeric": item["pinyin_numeric"], "meaning": item["meaning_en"],
            "measureWords": measure_words,
        })
    return cards


def validate_catalog_input(data: dict[str, list[dict[str, str]]]) -> None:
    from audit_catalog import (
        validate_foreign_keys,
        validate_headers_and_rows,
        validate_linguistic_relations,
        validate_official_contract_and_domains,
        validate_review_governance,
        validate_schema_contract,
        validate_sources,
    )
    from grammar_study import validate_grammar_study

    errors = []
    errors.extend(validate_headers_and_rows(data))
    errors.extend(validate_schema_contract())
    errors.extend(validate_foreign_keys(data))
    errors.extend(validate_official_contract_and_domains(data))
    errors.extend(validate_sources(data))
    errors.extend(validate_review_governance(data))
    linguistic_errors, _summary = validate_linguistic_relations(data)
    errors.extend(linguistic_errors)
    grammar_errors, _grammar_summary = validate_grammar_study(data)
    errors.extend(grammar_errors)
    if errors:
        first = errors[0]
        raise ValueError(
            f"Catalog validation failed with {len(errors)} error(s); first: "
            f"{first['rule']} {first['table']} {first['entity_id']} {first['message']}"
        )


def compile_all(
    data: dict[str, list[dict[str, str]]] | None = None, *, validate: bool = True
) -> dict[str, Any]:
    data = data or load_catalog()
    if validate:
        validate_catalog_input(data)
    compiled = {
        "vocabulary": compile_vocabulary(data),
        "sentences": compile_sentences(data),
        "hanzi": compile_hanzi(data),
        "measure_words": compile_measure_words(data),
        "grammar": compile_grammar_by_level(data, validate=False),
    }
    if validate:
        validate_legacy_immutability(data, compiled)
    return compiled


def load_legacy_snapshot() -> dict[str, list[dict[str, Any]]]:
    path = REFERENCE_DIR / "legacy-runtime-cards.json"
    payload = json.loads(path.read_text(encoding="utf-8"))
    if payload.get("snapshot_version") != 1 or not isinstance(payload.get("families"), dict):
        raise ValueError("Invalid immutable legacy runtime snapshot")
    return payload["families"]


def runtime_turns(card: dict[str, Any]) -> list[tuple[str, str]]:
    direction = str(card.get("direction", ""))
    if direction in {"zh_to_en", "en_to_zh"}:
        return [("statement", str(card.get("chinese", "")))]
    if direction == "zh_qa":
        match = re.fullmatch(r"A：([^\n]+)\nB：([^\n]+)", str(card.get("back", "")))
        if not match:
            raise ValueError(f"Invalid Q&A in immutable snapshot: {card.get('id')}")
        return [
            ("question", str(card.get("front", ""))),
            ("positive_answer", match.group(1)),
            ("negative_answer", match.group(2)),
        ]
    raise ValueError(f"Unknown immutable snapshot direction: {direction}")


def legacy_value(card: dict[str, Any], key: str) -> str:
    value = card.get(key, "")
    return str(value) if value is not None else ""


def validate_legacy_immutability(
    data: dict[str, list[dict[str, str]]], compiled: dict[str, list[dict[str, Any]]]
) -> None:
    """Require approval for every content change relative to the immutable migration snapshot."""
    baseline = load_legacy_snapshot()

    vocabulary = index_by(data["vocabulary.csv"], "vocab_id", "vocabulary.csv")
    vocab_translations = locale_index(
        data["vocabulary_translations.csv"], "vocab_id", "en", "vocabulary_translations.csv"
    )
    vocab_bindings = sorted(data["vocabulary_cards.csv"], key=lambda row: int(row["runtime_order"]))
    for index, (binding, card) in enumerate(zip(vocab_bindings, compiled["vocabulary"])):
        vocab = vocabulary[binding["vocab_id"]]
        old = baseline["vocabulary"][index] if index < len(baseline["vocabulary"]) else None
        if vocab["curation_status"] == "legacy_unreviewed":
            if old is None:
                raise ValueError(f"New active {binding['vocab_id']} cannot be legacy_unreviewed")
            for key in ("hanzi", "pinyin", "pinyinNumeric", "partOfSpeech"):
                if legacy_value(card, key) != legacy_value(old, key):
                    raise ValueError(f"Legacy vocabulary drift in {binding['vocab_id']} field {key}; approve it first")
        if old is None or legacy_value(card, "example") != legacy_value(old, "example"):
            if vocab["example_review_status"] != "approved":
                raise ValueError(f"Legacy example drift in {binding['vocab_id']}; approve it first")
        translation = vocab_translations[binding["vocab_id"]]
        if translation["review_status"] == "legacy_unreviewed":
            if old is None or legacy_value(card, "translation") != legacy_value(old, "translation"):
                raise ValueError(f"Legacy translation drift in {binding['vocab_id']}; approve it first")
    for binding in vocab_bindings[len(baseline["vocabulary"]):]:
        if vocabulary[binding["vocab_id"]]["curation_status"] != "approved":
            raise ValueError(f"New active vocabulary {binding['vocab_id']} must be approved")

    sentences = index_by(data["sentences.csv"], "sentence_id", "sentences.csv")
    sentence_translations = locale_index(
        data["sentence_translations.csv"], "sentence_id", "en", "sentence_translations.csv"
    )
    utterances = group_by(data["sentence_utterances.csv"], "sentence_id", "turn_order")
    vocab_links = group_by(data["sentence_vocabulary.csv"], "sentence_id", "position")
    grammar_links = group_by(data["sentence_grammar.csv"], "sentence_id", "position")
    sentence_bindings = sorted(data["sentence_cards.csv"], key=lambda row: int(row["runtime_order"]))
    for index, (binding, card) in enumerate(zip(sentence_bindings, compiled["sentences"])):
        sentence_id = binding["sentence_id"]
        sentence = sentences[sentence_id]
        old = baseline["sentences"][index] if index < len(baseline["sentences"]) else None
        if sentence["curation_status"] == "legacy_unreviewed" or sentence["linguistic_review_status"] == "legacy_unreviewed":
            if old is None or int(sentence["level"]) != int(old.get("level") or 0) or sentence["full_zh"] != old.get("chinese"):
                raise ValueError(f"Legacy sentence drift in {sentence_id}; approve it first")
        old_turns = runtime_turns(old) if old is not None else []
        for turn in utterances.get(sentence_id, []):
            if turn["review_status"] == "legacy_unreviewed":
                position = int(turn["turn_order"]) - 1
                current = (turn["role"], turn["zh_text"])
                if position >= len(old_turns) or current != old_turns[position]:
                    raise ValueError(f"Legacy utterance drift in {sentence_id} turn {position + 1}; approve it first")
        translation = sentence_translations[sentence_id]
        if translation["review_status"] == "legacy_unreviewed":
            if old is None or translation["text"] != old.get("english"):
                raise ValueError(f"Legacy sentence translation drift in {sentence_id}; approve it first")
        for link, old_key, new_key in (
            (vocab_links.get(sentence_id, []), "vocabTags", "surface_form"),
            (grammar_links.get(sentence_id, []), "grammarTags", "legacy_tag"),
        ):
            old_values = list(old.get(old_key) or []) if old is not None else []
            if len(link) < len(old_values):
                raise ValueError(
                    f"Legacy relation deletion in {sentence_id} {old_key}; preserve the row as reviewed history"
                )
            for row in link:
                position = int(row["position"]) - 1
                if position < len(old_values) and row[new_key] != str(old_values[position]):
                    raise ValueError(f"Legacy relation drift in {sentence_id} {old_key} position {position + 1}")
                if row["review_status"] == "legacy_unreviewed" and position >= len(old_values):
                    raise ValueError(f"Legacy relation drift in {sentence_id} {old_key} position {position + 1}")
    for binding in sentence_bindings[len(baseline["sentences"]):]:
        sentence = sentences[binding["sentence_id"]]
        if sentence["curation_status"] != "approved" or sentence["linguistic_review_status"] != "approved":
            raise ValueError(f"New active sentence {binding['sentence_id']} must be approved")

    hanzi_readings = index_by(data["hanzi_readings.csv"], "reading_id", "hanzi_readings.csv")
    hanzi_bindings = sorted(data["hanzi_cards.csv"], key=lambda row: int(row["runtime_order"]))
    for index, (binding, card) in enumerate(zip(hanzi_bindings, compiled["hanzi"])):
        reading = hanzi_readings[binding["reading_id"]]
        if reading["review_status"] != "legacy_unreviewed":
            continue
        old = baseline["hanzi"][index] if index < len(baseline["hanzi"]) else None
        if old is None or any(
            legacy_value(card, key) != legacy_value(old, key)
            for key in ("hanzi", "pinyin", "pinyinNumeric", "meaning", "strokeAnswer")
        ):
            raise ValueError(f"Legacy hanzi reading drift in {binding['reading_id']}; approve it first")

    measure_sets = index_by(data["measure_word_sets.csv"], "measure_word_id", "measure_word_sets.csv")
    usages = group_by(data["classifier_usages.csv"], "measure_word_id", "usage_order")
    measure_bindings = sorted(data["measure_word_cards.csv"], key=lambda row: int(row["runtime_order"]))
    for index, (binding, card) in enumerate(zip(measure_bindings, compiled["measure_words"])):
        item = measure_sets[binding["measure_word_id"]]
        old = baseline["measure_words"][index] if index < len(baseline["measure_words"]) else None
        if item["review_status"] == "legacy_unreviewed":
            if old is None or any(
                legacy_value(card, key) != legacy_value(old, key)
                for key in ("hanzi", "pinyin", "pinyinNumeric", "meaning")
            ):
                raise ValueError(f"Legacy measure-word set drift in {binding['measure_word_id']}; approve it first")
        old_usages = [] if old is None else [part.strip() for part in str(old.get("measureWords", "")).split(";")]
        if len(usages.get(binding["measure_word_id"], [])) < len(old_usages):
            raise ValueError(
                f"Legacy classifier deletion in {binding['measure_word_id']}; preserve the row as reviewed history"
            )
        for usage in usages.get(binding["measure_word_id"], []):
            if usage["review_status"] != "legacy_unreviewed":
                continue
            position = int(usage["usage_order"]) - 1
            rendered = f"{usage['classifier_hanzi']} [{usage['classifier_pinyin_numeric']}]"
            if position >= len(old_usages) or rendered != old_usages[position]:
                raise ValueError(f"Legacy classifier drift in {usage['usage_id']}; approve it first")


def first_difference(expected: list[dict[str, Any]], actual: list[dict[str, Any]]) -> dict[str, Any] | None:
    if len(expected) != len(actual):
        return {"kind": "count", "expected": len(expected), "actual": len(actual)}
    for index, (left, right) in enumerate(zip(expected, actual), start=1):
        if left != right:
            return {"kind": "row", "index": index, "compiled": left, "runtime": right}
    return None


def check_runtime(compiled: dict[str, Any]) -> list[dict[str, Any]]:
    runtime = load_runtime_cards()
    differences = []
    for family in compiled:
        if family == "grammar":
            differences.extend(check_grammar_runtime(compiled[family]))
            continue
        difference = first_difference(compiled[family], runtime[family])
        if difference:
            differences.append({"family": family, **difference})
    return differences


def chunked(items: list[dict[str, Any]], size: int) -> list[list[dict[str, Any]]]:
    return [items[index:index + size] for index in range(0, len(items), size)]


def render_vocabulary(parts: list[list[dict[str, Any]]]) -> dict[str, str]:
    rendered = {}
    for number, cards in enumerate(parts, start=1):
        name = f"hsk1-data-part-{number}.js"
        payload = json.dumps(cards, ensure_ascii=False, indent=2)
        rendered[name] = (
            "window.HSK1_BUILTIN_CARD_PARTS = window.HSK1_BUILTIN_CARD_PARTS || [];\n"
            "window.HSK1_BUILTIN_CARD_PARTS.push(\n" + payload + "\n);\n"
        )
    return rendered


def render_object_parts(
    cards_by_part: list[list[dict[str, Any]]], *, prefix: str, global_name: str
) -> dict[str, str]:
    rendered = {}
    for number, cards in enumerate(cards_by_part, start=1):
        name = f"{prefix}-part-{number}.js"
        objects = ",\n".join(json.dumps(card, ensure_ascii=False, separators=(",", ":")) for card in cards)
        content = (
            "(function () {\n"
            f"  window.{global_name} = window.{global_name} || [];\n"
            f"  window.{global_name}.push(\n"
            f"{objects}\n"
            "  );\n"
            "})();\n"
        )
        rendered[name] = content
    return rendered


def replace_index_group(text: str, prefix: str, names: list[str]) -> str:
    pattern = re.compile(
        rf"(?:^[ \t]*<script src=\"js/data/flashcards/{re.escape(prefix)}-part-\d+\.js\"></script>\n)+",
        flags=re.M,
    )
    replacement = "".join(
        f"  <script src=\"js/data/flashcards/{name}\"></script>\n" for name in names
    )
    updated, count = pattern.subn(replacement, text, count=1)
    if count != 1:
        raise ValueError(f"Could not locate {prefix} script group in index.html")
    return updated


def atomic_write(path: Path, content: bytes) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    descriptor, temporary_name = tempfile.mkstemp(prefix=f".{path.name}.", dir=path.parent)
    temporary = Path(temporary_name)
    try:
        with os.fdopen(descriptor, "wb") as handle:
            handle.write(content)
            handle.flush()
            os.fsync(handle.fileno())
        os.replace(temporary, path)
    finally:
        if temporary.exists():
            temporary.unlink()


def write_runtime(compiled: dict[str, Any]) -> dict[str, list[str]]:
    vocabulary_rendered = render_vocabulary(chunked(compiled["vocabulary"], 200))
    sentence_rendered = render_object_parts(
        chunked(compiled["sentences"], 250), prefix="sentence-cards-data",
        global_name="HSK_SENTENCE_CARDS",
    )
    hanzi_by_level = [
        [card for card in compiled["hanzi"] if card["level"] == level]
        for level in sorted({card["level"] for card in compiled["hanzi"]})
    ]
    hanzi_rendered = render_object_parts(
        hanzi_by_level, prefix="hanzi-cards-data", global_name="HSK_HANZI_CARDS"
    )
    measure_by_level = [
        [card for card in compiled["measure_words"] if card["level"] == level]
        for level in sorted({card["level"] for card in compiled["measure_words"]})
    ]
    measure_rendered = render_object_parts(
        measure_by_level, prefix="measure-word-cards-data", global_name="HSK_MEASURE_WORD_CARDS"
    )
    eager_groups = {
        "hsk1-data": list(vocabulary_rendered),
        "sentence-cards-data": list(sentence_rendered),
        "hanzi-cards-data": list(hanzi_rendered),
        "measure-word-cards-data": list(measure_rendered),
    }
    grammar_rendered = render_grammar_chunks(compiled["grammar"])
    groups = {**eager_groups, "grammar-lessons": list(grammar_rendered)}
    rendered_files = {
        **vocabulary_rendered, **sentence_rendered, **hanzi_rendered, **measure_rendered,
    }
    index_path = PROJECT_ROOT / "index.html"
    index_text = index_path.read_text(encoding="utf-8")
    for prefix, names in eager_groups.items():
        index_text = replace_index_group(index_text, prefix, names)

    affected = {index_path}
    for prefix, names in eager_groups.items():
        affected.update(DATA_DIR.glob(f"{prefix}-part-*.js"))
        affected.update(DATA_DIR / name for name in names)
    affected.update(GRAMMAR_DATA_DIR.glob("grammar-lessons-hsk*.js"))
    affected.update(GRAMMAR_DATA_DIR / name for name in grammar_rendered)
    snapshot = {path: path.read_bytes() if path.exists() else None for path in affected}
    try:
        for name, content in rendered_files.items():
            atomic_write(DATA_DIR / name, content.encode("utf-8"))
        for name, content in grammar_rendered.items():
            atomic_write(GRAMMAR_DATA_DIR / name, content.encode("utf-8"))
        atomic_write(index_path, index_text.encode("utf-8"))
        keep = set(rendered_files)
        for path in affected:
            if path.parent == DATA_DIR and path.name not in keep and path.exists():
                path.unlink()
            if path.parent == GRAMMAR_DATA_DIR and path.name not in grammar_rendered and path.exists():
                path.unlink()
    except Exception:
        for path, original in snapshot.items():
            if original is None:
                if path.exists():
                    path.unlink()
            else:
                atomic_write(path, original)
        raise
    return groups


def main(argv: list[str]) -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    action = parser.add_mutually_exclusive_group()
    action.add_argument("--validate", action="store_true", help="Validate that the catalog is safely compilable (default).")
    action.add_argument(
        "--check-runtime", "--check", dest="check_runtime", action="store_true",
        help="Compare compiled objects with the currently committed runtime.",
    )
    action.add_argument("--write", action="store_true", help="Write runtime JS chunks and index script tags.")
    args = parser.parse_args(argv)
    try:
        data = load_catalog()
        compiled = compile_all(data)
        if args.write:
            groups = write_runtime(compiled)
            print(json.dumps({
                "status": "written",
                "counts": {family: len(cards) for family, cards in compiled.items()},
                "files": groups,
            }, ensure_ascii=False, indent=2))
            return 0
        if args.check_runtime:
            differences = check_runtime(compiled)
            if differences:
                print(json.dumps({"status": "different", "differences": differences}, ensure_ascii=False, indent=2))
                return 1
            status = "ok"
        else:
            status = "valid"
        print(json.dumps({
            "status": status, "counts": {family: len(cards) for family, cards in compiled.items()}
        }, ensure_ascii=False, indent=2))
        return 0
    except Exception as error:
        print(f"compile_runtime_catalog: {error}", file=sys.stderr)
        return 2


if __name__ == "__main__":
    raise SystemExit(main(sys.argv[1:]))
