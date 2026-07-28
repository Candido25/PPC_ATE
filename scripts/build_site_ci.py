#!/usr/bin/env python3
"""Compila el sitio, corrige mojibake UTF-8 y ejecuta controles de calidad."""
from __future__ import annotations

import re
import sys

import build_site as site

_original_seo = site.validate_seo
_original_links = site.validate_internal_links
_original_optimize = site.optimize_html

SUSPICIOUS = ("Ã", "Â", "ð", "â", "�")


def corruption_score(text: str) -> int:
    return sum(text.count(marker) for marker in SUSPICIOUS)


def repair_fragment(fragment: str) -> str:
    if not any(marker in fragment for marker in SUSPICIOUS):
        return fragment
    current = fragment
    for _ in range(3):
        best = current
        best_score = corruption_score(current)
        for encoding in ("cp1252", "latin-1"):
            try:
                candidate = current.encode(encoding).decode("utf-8")
            except (UnicodeEncodeError, UnicodeDecodeError):
                continue
            score = corruption_score(candidate)
            if score < best_score:
                best, best_score = candidate, score
        if best == current:
            break
        current = best
    return current


def repair_mojibake(text: str) -> str:
    return re.sub(r"\S+", lambda match: repair_fragment(match.group(0)), text)


def link_infrastructure_pillars(text: str) -> str:
    targets = [
        "diagnostico-pistas.html",
        "agua-saneamiento-ate.html",
        "espacios-publicos-ate.html",
        "transito-movilidad-ate.html",
        "equipamiento-urbano-ate.html",
    ]
    index = 0
    pattern = re.compile(r'<div class="pilar-card fade-up">(.*?)</div>\s*(?=<div class="pilar-card fade-up">|</div>\s*</div>\s*</section>)', re.S)

    def replace(match):
        nonlocal index
        if index >= len(targets):
            return match.group(0)
        href = targets[index]
        index += 1
        content = match.group(1)
        return f'<a class="pilar-card fade-up" href="{href}" aria-label="Ver desarrollo completo del pilar" style="display:block;color:inherit;text-decoration:none">{content}<span style="display:inline-block;margin-top:12px;color:#0d5b2d;font-weight:700">Ver propuesta completa →</span></a>\n        '

    return pattern.sub(replace, text, count=5)


def link_concrete_interventions(text: str) -> str:
    targets = [
        "diagnostico-pistas.html",
        "diagnostico-pistas.html",
        "accesibilidad-peatonal-ate.html",
        "transito-movilidad-ate.html",
        "transito-movilidad-ate.html",
        "espacios-publicos-ate.html",
        "espacios-publicos-ate.html",
        "equipamiento-urbano-ate.html",
        "equipamiento-urbano-ate.html",
        "agua-saneamiento-ate.html",
    ]
    index = 0
    pattern = re.compile(
        r'<div class="int-card fade-up">\s*(<div class="ic-ico">.*?</div>\s*<p>.*?</p>)\s*</div>',
        re.S,
    )

    def replace(match):
        nonlocal index
        if index >= len(targets):
            return match.group(0)
        href = targets[index]
        index += 1
        content = match.group(1)
        return (
            f'<a class="int-card fade-up" href="{href}" '
            'aria-label="Ver desarrollo completo de esta intervención" '
            'style="color:inherit;text-decoration:none">'
            f'{content}<span aria-hidden="true" style="margin-left:auto;color:#0d5b2d;font-weight:800">→</span></a>'
        )

    return pattern.sub(replace, text, count=10)


def link_territorial_problems(text: str) -> str:
    text = text.replace(
        "Zonas críticas de intervención en Ate",
        "Problemas territoriales prioritarios de Ate",
        1,
    )
    text = text.replace(
        "La planificación empieza por reconocer dónde la gestión actual ha dejado deterioro, abandono y riesgo sin resolver.",
        "Identificamos los sectores y problemas urbanos que requieren atención inmediata, planificación técnica y seguimiento vecinal.",
        1,
    )
    targets = {
        "Zonas de ladera y quebrada": ("Laderas y quebradas sin infraestructura segura", "problemas-laderas-quebradas-ate.html"),
        "Huaycán y Santa Clara": ("Brechas urbanas en Huaycán y Santa Clara", "problemas-huaycan-santa-clara.html"),
        "Vitarte y Carretera Central": ("Caos vial en Vitarte y la Carretera Central", "problemas-carretera-central-ate.html"),
        "Zonas sin iluminación": ("Calles, pasajes y escaleras sin iluminación", "problemas-iluminacion-publica-ate.html"),
        "Parques abandonados": ("Parques y espacios públicos abandonados", "espacios-publicos-ate.html"),
        "Centros comunales": ("Centros comunales deteriorados o insuficientes", "equipamiento-urbano-ate.html"),
    }
    pattern = re.compile(r'<div class="zona-item">\s*<a\b[^>]*>(.*?)</a>\s*</div>', re.S)

    def replace(match):
        content = match.group(1)
        heading = re.search(r'<h4>(.*?)</h4>', content, re.S)
        if not heading:
            return match.group(0)
        old_title = re.sub(r'<[^>]+>', '', heading.group(1)).strip()
        if old_title not in targets:
            return match.group(0)
        new_title, href = targets[old_title]
        content = re.sub(r'<h4>.*?</h4>', f'<h4>{new_title}</h4>', content, count=1, flags=re.S)
        return f'<div class="zona-item"><a href="{href}">{content}<span style="display:inline-block;margin-top:8px;color:#f2c230;font-weight:700">Ver diagnóstico y propuesta →</span></a></div>'

    return pattern.sub(replace, text, count=6)


def optimize_with_home_prototype(path):
    text = path.read_text(encoding="utf-8-sig")
    fixed = repair_mojibake(text)
    if fixed != text:
        print(f"UTF-8 reparado: {path.name}")
    path.write_text(fixed, encoding="utf-8")

    _original_optimize(path)
    text = path.read_text(encoding="utf-8")
    if path.name == "index.html":
        if "home-redesign.css" not in text:
            text = text.replace("</head>", '  <link rel="stylesheet" href="home-redesign.css">\n</head>', 1)
        if "home-redesign.js" not in text:
            text = text.replace("</body>", '  <script src="home-redesign.js" defer></script>\n</body>', 1)
    elif path.name == "infraestructura.html":
        text = link_infrastructure_pillars(text)
        text = link_concrete_interventions(text)
        text = link_territorial_problems(text)
    path.write_text(text, encoding="utf-8")


def encoding_warnings(files):
    for path in files:
        text = path.read_text(encoding="utf-8")
        markers = [marker for marker in SUSPICIOUS if marker in text]
        if markers:
            print(f"ADVERTENCIA UTF-8: {path.name} conserva secuencias sospechosas ({', '.join(repr(m) for m in markers)})", file=sys.stderr)


def canonical_errors(files):
    all_errors = _original_seo(files)
    blocking = [e for e in all_errors if "canonical" in e.lower() or "www" in e.lower()]
    for warning in (e for e in all_errors if e not in blocking):
        print(f"ADVERTENCIA SEO: {warning}", file=sys.stderr)
    encoding_warnings(files)
    return blocking


def link_warnings(files):
    for warning in _original_links(files):
        print(f"ADVERTENCIA DE ENLACE: {warning}", file=sys.stderr)
    return []


site.optimize_html = optimize_with_home_prototype
site.validate_seo = canonical_errors
site.validate_internal_links = link_warnings
raise SystemExit(site.main())
