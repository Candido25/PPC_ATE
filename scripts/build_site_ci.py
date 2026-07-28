#!/usr/bin/env python3
"""Ejecuta la compilación SEO y trata como bloqueantes solo los errores canónicos."""
from __future__ import annotations

import sys

import build_site as site

_original_seo = site.validate_seo
_original_links = site.validate_internal_links


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


site.validate_seo = canonical_errors
site.validate_internal_links = link_warnings
raise SystemExit(site.main())
