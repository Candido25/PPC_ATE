#!/usr/bin/env python3
"""Construye una versión publicable y audita SEO/enlaces para GitHub Pages."""
from __future__ import annotations

import html
import re
import shutil
import sys
from datetime import date
from pathlib import Path
from urllib.parse import unquote, urlparse

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "_site"
BASE_URL = "https://ppcate.org.pe"
EXCLUDED_DIRS = {".git", ".github", "scripts", "_site"}
NOINDEX_FILES = {"404.html"}


def copy_source() -> None:
    if OUT.exists():
        shutil.rmtree(OUT)
    OUT.mkdir()
    for item in ROOT.iterdir():
        if item.name in EXCLUDED_DIRS:
            continue
        destination = OUT / item.name
        if item.is_dir():
            shutil.copytree(item, destination)
        else:
            shutil.copy2(item, destination)


def canonical_for(path: Path) -> str:
    relative = path.relative_to(OUT).as_posix()
    return f"{BASE_URL}/" if relative == "index.html" else f"{BASE_URL}/{relative}"


def upsert_link(text: str, rel: str, href: str) -> str:
    pattern = re.compile(rf'<link\b(?=[^>]*\brel=["\']{re.escape(rel)}["\'])[^>]*>', re.I)
    tag = f'<link rel="{rel}" href="{html.escape(href, quote=True)}">'
    if pattern.search(text):
        return pattern.sub(tag, text, count=1)
    return text.replace("</head>", f"  {tag}\n</head>", 1)


def upsert_meta(text: str, *, name: str | None = None, prop: str | None = None, content: str) -> str:
    attr, value = ("name", name) if name else ("property", prop)
    assert value
    pattern = re.compile(rf'<meta\b(?=[^>]*\b{attr}=["\']{re.escape(value)}["\'])[^>]*>', re.I)
    tag = f'<meta {attr}="{html.escape(value, quote=True)}" content="{html.escape(content, quote=True)}">'
    if pattern.search(text):
        return pattern.sub(tag, text, count=1)
    return text.replace("</head>", f"  {tag}\n</head>", 1)


def optimize_html(path: Path) -> None:
    text = path.read_text(encoding="utf-8")
    canonical = canonical_for(path)

    text = re.sub(r'<html\b[^>]*\blang=["\'][^"\']+["\']', '<html lang="es-PE"', text, count=1, flags=re.I)
    text = re.sub(r'\s*<meta\s+name=["\']keywords["\'][^>]*>\s*', '\n', text, flags=re.I)
    text = upsert_link(text, "canonical", canonical)
    text = upsert_meta(text, prop="og:url", content=canonical)
    text = upsert_meta(text, prop="og:locale", content="es_PE")
    text = upsert_meta(text, name="twitter:card", content="summary_large_image")
    robots = "noindex, follow" if path.name in NOINDEX_FILES else "index, follow, max-image-preview:large"
    text = upsert_meta(text, name="robots", content=robots)

    # Evita que una versión www vuelva a ser declarada como principal.
    text = text.replace("https://www.ppcate.org.pe", BASE_URL)

    # Seguridad básica de enlaces externos abiertos en otra pestaña.
    def secure_external(match: re.Match[str]) -> str:
        tag = match.group(0)
        if not re.search(r'\brel=', tag, re.I):
            return tag[:-1] + ' rel="noopener noreferrer">'
        return re.sub(r'\brel=["\'][^"\']*["\']', 'rel="noopener noreferrer"', tag, count=1, flags=re.I)

    text = re.sub(r'<a\b(?=[^>]*\btarget=["\']_blank["\'])[^>]*>', secure_external, text, flags=re.I)

    # Mejora de rendimiento sin alterar el contenido visible.
    def lazy_image(match: re.Match[str]) -> str:
        tag = match.group(0)
        if re.search(r'\bloading=', tag, re.I):
            return tag
        return tag[:-1] + ' loading="lazy" decoding="async">'

    text = re.sub(r'<img\b[^>]*>', lazy_image, text, flags=re.I)

    # Consentimiento previo para el buzón y acceso a la política de privacidad.
    if 'id="reportForm"' in text and 'name="privacidad"' not in text:
        consent = (
            '<label class="privacy-consent">'
            '<input type="checkbox" name="privacidad" required> '
            'Declaro que la información remitida es veraz según mi leal saber y entender, '
            'y acepto la <a href="privacidad.html" target="_blank" rel="noopener noreferrer">política de privacidad</a>.'
            '</label>'
        )
        text = text.replace('<div class="form-actions">\n              <button class="btn green" type="submit">Enviar reporte</button>',
                            consent + '\n            <div class="form-actions">\n              <button class="btn green" type="submit">Enviar reporte</button>', 1)

    if "</footer>" in text and "privacidad.html" not in text:
        text = text.replace("</footer>", '<div class="legal-footer"><a href="privacidad.html">Privacidad y tratamiento de datos</a></div>\n  </footer>', 1)

    text = text.replace("© 2025", f"© {date.today().year}")
    path.write_text(text, encoding="utf-8")


def generate_sitemap(html_files: list[Path]) -> None:
    today = date.today().isoformat()
    entries = []
    for path in sorted(html_files):
        if path.name in NOINDEX_FILES or path.name == "privacidad.html":
            continue
        loc = canonical_for(path)
        priority = "1.0" if path.name == "index.html" else "0.8"
        entries.append(
            "  <url>\n"
            f"    <loc>{loc}</loc>\n"
            f"    <lastmod>{today}</lastmod>\n"
            "    <changefreq>weekly</changefreq>\n"
            f"    <priority>{priority}</priority>\n"
            "  </url>"
        )
    xml = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
    xml += "\n".join(entries)
    xml += "\n</urlset>\n"
    (OUT / "sitemap.xml").write_text(xml, encoding="utf-8")


def validate_internal_links(html_files: list[Path]) -> list[str]:
    errors: list[str] = []
    attr_pattern = re.compile(r'\b(?:href|src)=["\']([^"\']+)["\']', re.I)
    for path in html_files:
        text = path.read_text(encoding="utf-8")
        for raw in attr_pattern.findall(text):
            value = html.unescape(raw).strip()
            if not value or value.startswith(("#", "mailto:", "tel:", "javascript:", "data:")):
                continue
            parsed = urlparse(value)
            if parsed.scheme in {"http", "https"} or value.startswith("//"):
                continue
            local = unquote(parsed.path)
            if not local:
                continue
            target = (path.parent / local).resolve()
            try:
                target.relative_to(OUT.resolve())
            except ValueError:
                errors.append(f"{path.relative_to(OUT)}: ruta fuera del sitio: {value}")
                continue
            if local.endswith("/"):
                target = target / "index.html"
            if not target.exists():
                errors.append(f"{path.relative_to(OUT)}: enlace o recurso inexistente: {value}")
    return sorted(set(errors))


def validate_seo(html_files: list[Path]) -> list[str]:
    errors: list[str] = []
    canonicals: dict[str, str] = {}
    for path in html_files:
        text = path.read_text(encoding="utf-8")
        rel = path.relative_to(OUT).as_posix()
        if not re.search(r'<title>\s*.+?\s*</title>', text, re.I | re.S):
            errors.append(f"{rel}: falta title")
        if not re.search(r'<meta\b(?=[^>]*name=["\']description["\'])[^>]*content=["\'][^"\']{50,}["\']', text, re.I):
            errors.append(f"{rel}: falta una meta description suficientemente descriptiva")
        match = re.search(r'<link\b(?=[^>]*rel=["\']canonical["\'])[^>]*href=["\']([^"\']+)', text, re.I)
        if not match:
            errors.append(f"{rel}: falta canonical")
        else:
            canonical = match.group(1)
            expected = canonical_for(path)
            if canonical != expected:
                errors.append(f"{rel}: canonical incorrecto ({canonical}; esperado {expected})")
            if canonical in canonicals:
                errors.append(f"{rel}: canonical duplicado con {canonicals[canonical]}")
            canonicals[canonical] = rel
        if "https://www.ppcate.org.pe" in text:
            errors.append(f"{rel}: conserva referencias a www")
    return errors


def main() -> int:
    copy_source()
    html_files = sorted(OUT.rglob("*.html"))
    for path in html_files:
        optimize_html(path)
    # Recalcular por si el origen incorpora nuevas páginas.
    html_files = sorted(OUT.rglob("*.html"))
    generate_sitemap(html_files)
    (OUT / ".nojekyll").touch()

    errors = validate_seo(html_files) + validate_internal_links(html_files)
    if errors:
        print("AUDITORÍA FALLIDA:", file=sys.stderr)
        for error in errors:
            print(f"- {error}", file=sys.stderr)
        return 1
    print(f"Sitio construido correctamente: {len(html_files)} páginas HTML auditadas.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
