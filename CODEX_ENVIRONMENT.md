# Codex environment setup

This project is a static browser app with no JavaScript package manager, install step, or build step.

## Required tools

- Python 3.10 or newer for flashcard static-analysis scripts.
- Python PDF packages listed in `requirements.txt` for container tasks that need to read, inspect, merge, transform, or create PDF files.

## Setup

```bash
python3 --version
python3 -m pip install -r requirements.txt
```

The current flashcard static-analysis script uses only the Python standard library. The requirements file therefore contains only the additional PDF tooling needed by the container, not hidden dependencies for the existing script.

## PDF tooling

The container installs:

- `pypdf` for reading, extracting metadata/text, splitting, merging, cropping, transforming, and writing PDF files.
- `pdfplumber` for detailed text, layout, and table extraction from machine-generated PDFs.
- `reportlab` for generating new PDF documents from Python.

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
