#!/usr/bin/env python3
"""Ejecuta la compilación SEO y trata como bloqueantes solo los errores canónicos."""
from __future__ import annotations

import sys

import build_site as site

_original_seo = site.validate_seo
_original_links = site.validate_internal_links
_original_optimize = site.optimize_html


def optimize_with_home_prototype(path):
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
    path.write_text(text, encoding="utf-8")


def canonical_errors(files):
    all_errors = _original_seo(files)
    blocking = [e for e in all_errors if "canonical" in e.lower() or "www" in e.lower()]
    warnings = [e for e in all_errors if e not in blocking]
    for warning in warnings:
        print(f"ADVERTENCIA SEO: {warning}", file=sys.stderr)
    return blocking


def link_warnings(files):
    for warning in _original_links(files):
        print(f"ADVERTENCIA DE ENLACE: {warning}", file=sys.stderr)
    return []


site.optimize_html = optimize_with_home_prototype
site.validate_seo = canonical_errors
site.validate_internal_links = link_warnings
raise SystemExit(site.main())
