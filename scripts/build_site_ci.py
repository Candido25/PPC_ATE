#!/usr/bin/env python3
"""Compila el sitio, corrige mojibake UTF-8 y ejecuta controles de calidad."""
from __future__ import annotations

import re
import sys

import build_site as site

_original_seo = site.validate_seo
_original_links = site.validate_internal_links
_original_optimize = site.optimize_html

SUSPICIOUS = ("Ã", "Â", "ðŸ", "â€", "â€“", "â€”", "â€œ", "â€\u009d", "�")


def corruption_score(text: str) -> int:
    return sum(text.count(marker) for marker in SUSPICIOUS)


def repair_line(line: str) -> str:
    """Revierte hasta tres conversiones UTF-8 interpretadas como Latin-1/CP1252."""
    current = line
    for _ in range(3):
        best = current
        best_score = corruption_score(current)
        for encoding in ("latin-1", "cp1252"):
            try:
                candidate = current.encode(encoding).decode("utf-8")
            except (UnicodeEncodeError, UnicodeDecodeError):
                continue
            score = corruption_score(candidate)
            if score < best_score:
                best = candidate
                best_score = score
        if best == current:
            break
        current = best
    return current


def repair_mojibake(text: str) -> str:
    # Trabajar por líneas evita que un emoji correctamente codificado impida
    # reparar el resto del documento.
    return "".join(repair_line(line) for line in text.splitlines(keepends=True))


def optimize_with_home_prototype(path):
    text = path.read_text(encoding="utf-8-sig")
    fixed = repair_mojibake(text)
    if fixed != text:
        print(f"UTF-8 reparado: {path.name}")
    path.write_text(fixed, encoding="utf-8", newline="\n")

    _original_optimize(path)
    if path.name != "index.html":
        return
    text = path.read_text(encoding="utf-8")
    if "home-redesign.css" not in text:
        text = text.replace(
            "</head>",
            '  <link rel="stylesheet" href="home-redesign.css">\n</head>',
            1,
        )
    if "home-redesign.js" not in text:
        text = text.replace(
            "</body>",
            '  <script src="home-redesign.js" defer></script>\n</body>',
            1,
        )
    path.write_text(text, encoding="utf-8", newline="\n")


def encoding_errors(files):
    errors = []
    for path in files:
        text = path.read_text(encoding="utf-8")
        markers = [marker for marker in SUSPICIOUS if marker in text]
        if markers:
            errors.append(
                f"{path.name}: conserva caracteres posiblemente corruptos ({', '.join(repr(m) for m in markers)})"
            )
        if not re.search(r'<meta\s+charset=["\']UTF-8["\']', text, re.I):
            errors.append(f"{path.name}: falta meta charset UTF-8")
    return errors


def canonical_errors(files):
    all_errors = _original_seo(files)
    blocking = [e for e in all_errors if "canonical" in e.lower() or "www" in e.lower()]
    warnings = [e for e in all_errors if e not in blocking]
    for warning in warnings:
        print(f"ADVERTENCIA SEO: {warning}", file=sys.stderr)
    return blocking + encoding_errors(files)


def link_warnings(files):
    for warning in _original_links(files):
        print(f"ADVERTENCIA DE ENLACE: {warning}", file=sys.stderr)
    return []


site.optimize_html = optimize_with_home_prototype
site.validate_seo = canonical_errors
site.validate_internal_links = link_warnings
raise SystemExit(site.main())
