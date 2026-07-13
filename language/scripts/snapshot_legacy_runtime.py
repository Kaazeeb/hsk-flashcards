#!/usr/bin/env python3
"""Create or verify the immutable semantic snapshot used by the one-time migration."""

from __future__ import annotations

import argparse
import json
import sys

from catalog_io import REFERENCE_DIR, load_runtime_cards, sha256_file

TARGET = REFERENCE_DIR / "legacy-runtime-cards.json"
EXPECTED_SNAPSHOT_SHA256 = "edbb6b1f8876abd587b6781e80317bb717be899f2e1058f8695d43c39ccf818e"


def render_current_runtime() -> str:
    payload = {
        "snapshot_version": 1,
        "repository_version": "2.2.0",
        "purpose": "Immutable pre-language-catalog migration baseline",
        "families": load_runtime_cards(),
    }
    return json.dumps(payload, ensure_ascii=False, indent=2) + "\n"


def main(argv: list[str]) -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    action = parser.add_mutually_exclusive_group()
    action.add_argument("--write", action="store_true")
    action.add_argument("--check-current", action="store_true")
    args = parser.parse_args(argv)
    if args.write:
        if TARGET.exists():
            print(f"Refusing to replace immutable snapshot: {TARGET}", file=sys.stderr)
            return 1
        TARGET.write_text(render_current_runtime(), encoding="utf-8")
        if sha256_file(TARGET) != EXPECTED_SNAPSHOT_SHA256:
            TARGET.unlink()
            print("Current runtime does not match the expected migration baseline", file=sys.stderr)
            return 1
        print(f"wrote {TARGET}")
        return 0
    if not TARGET.exists():
        print(f"Missing immutable snapshot: {TARGET}", file=sys.stderr)
        return 1
    if sha256_file(TARGET) != EXPECTED_SNAPSHOT_SHA256:
        print("Immutable migration snapshot checksum mismatch", file=sys.stderr)
        return 1
    if args.check_current and TARGET.read_text(encoding="utf-8") != render_current_runtime():
        print("Current runtime differs from the immutable migration snapshot", file=sys.stderr)
        return 1
    payload = json.loads(TARGET.read_text(encoding="utf-8"))
    counts = {name: len(rows) for name, rows in payload["families"].items()}
    print(json.dumps({"status": "ok", "counts": counts}, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv[1:]))
