# Codex environment setup

This project is a static browser app with no JavaScript package manager, install step, or build step.

## Required tools

- Python 3.10 or newer for flashcard static-analysis scripts.

## Setup

```bash
python3 --version
```

No `pip install` command is required for the current scripts because they use only the Python standard library.

## Useful checks

```bash
python3 scripts/analyze_flashcards.py --report summary
python3 scripts/analyze_flashcards.py --report ambiguity
python3 scripts/analyze_flashcards.py --report sentence-frequency --low-frequency-threshold 1
```

## Local app run

```bash
python3 -m http.server 8000
```

Open `http://localhost:8000/index.html` in a browser.
