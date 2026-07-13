#!/usr/bin/env python3
"""Print the canonical content hash for one catalog row before recording a review."""

from __future__ import annotations

import argparse
import json
import sys

from catalog_io import CATALOG_FIELDS, CATALOG_DIR, read_csv, row_hash

LIFECYCLE_FIELDS = {
    "review_status", "curation_status", "linguistic_review_status", "example_review_status",
}


def main(argv: list[str]) -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--table", required=True, choices=sorted(CATALOG_FIELDS))
    parser.add_argument(
        "--key", action="append", required=True, metavar="FIELD=VALUE",
        help="Repeat for composite keys, for example --key sentence_id=x --key position=1.",
    )
    args = parser.parse_args(argv)
    criteria = {}
    for item in args.key:
        if "=" not in item:
            parser.error(f"Invalid --key {item!r}; expected FIELD=VALUE")
        field, value = item.split("=", 1)
        if field not in CATALOG_FIELDS[args.table]:
            parser.error(f"Unknown field {field!r} for {args.table}")
        criteria[field] = value
    rows = [
        row for row in read_csv(CATALOG_DIR / args.table)
        if all(row[field] == value for field, value in criteria.items())
    ]
    if len(rows) != 1:
        print(f"Expected one matching row, found {len(rows)}", file=sys.stderr)
        return 1
    print(json.dumps({
        "table": args.table,
        "keys": criteria,
        "content_hash": row_hash(rows[0], exclude=LIFECYCLE_FIELDS),
    }, ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv[1:]))
