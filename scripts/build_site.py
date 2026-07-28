#!/usr/bin/env python3
"""Construye una versión publicable y audita SEO, enlaces y arquitectura interna."""
from __future__ import annotations

import html
import json
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

PAGE_LABELS = {
    "index.html": "Inicio",
    "problemas-ate.html": "Problemas de Ate",
    "candidato-jose-luis-hurtado.html": "José Luis Hurtado",
    "propuestas.html": "Propuestas para Ate",
    "seguridad.html": "Propuesta de seguridad",
    "inseguridad-ate.html": "Inseguridad en Ate",
    "diagnostico-seguridad.html": "Diagnóstico de seguridad",
    "diagnostico-basura.html": "Basura y limpieza pública",
    "diagnostico-pistas.html": "Pistas y veredas",
    "infraestructura.html": "Infraestructura urbana",
    "salud.html": "Salud comunitaria",
    "educacion.html": "Educación",
    "empleo.html": "Empleo y economía local",
    "autogestion.html": "Autogestión vecinal",
    "fiscalizacion.html": "Fiscalización ciudadana",
    "actividades.html": "Actividades territoriales",
    "ideario.html": "Ideario y doctrina",
    "estatuto.html": "Estatuto del PPC",
}

RELATED = {
    "problemas-ate.html": ["diagnostico-seguridad.html", "diagnostico-basura.html", "diagnostico-pistas.html", "propuestas.html", "fiscalizacion.html"],
    "candidato-jose-luis-hurtado.html": ["propuestas.html", "problemas-ate.html", "ideario.html", "actividades.html"],
    "propuestas.html": ["problemas-ate.html", "seguridad.html", "infraestructura.html", "salud.html", "educacion.html", "empleo.html"],
    "seguridad.html": ["diagnostico-seguridad.html", "inseguridad-ate.html", "problemas-ate.html", "fiscalizacion.html"],
    "inseguridad-ate.html": ["diagnostico-seguridad.html", "seguridad.html", "problemas-ate.html", "fiscalizacion.html"],
    "diagnostico-seguridad.html": ["inseguridad-ate.html", "seguridad.html", "problemas-ate.html", "fiscalizacion.html"],
    "diagnostico-basura.html": ["problemas-ate.html", "infraestructura.html", "fiscalizacion.html", "propuestas.html"],
    "diagnostico-pistas.html": ["problemas-ate.html", "infraestructura.html", "fiscalizacion.html", "propuestas.html"],
    "infraestructura.html": ["diagnostico-pistas.html", "diagnostico-basura.html", "problemas-ate.html", "propuestas.html"],
    "salud.html": ["problemas-ate.html", "propuestas.html", "actividades.html", "fiscalizacion.html"],
    "educacion.html": ["empleo.html", "autogestion.html", "problemas-ate.html", "propuestas.html"],
    "empleo.html": ["educacion.html", "autogestion.html", "problemas-ate.html", "propuestas.html"],
    "autogestion.html": ["empleo.html", "educacion.html", "ideario.html", "propuestas.html"],
    "fiscalizacion.html": ["problemas-ate.html", "diagnostico-seguridad.html", "diagnostico-basura.html", "diagnostico-pistas.html"],
    "actividades.html": ["candidato-jose-luis-hurtado.html", "problemas-ate.html", "propuestas.html", "fiscalizacion.html"],
    "ideario.html": ["candidato-jose-luis-hurtado.html", "estatuto.html", "autogestion.html", "propuestas.html"],
    "estatuto.html": ["ideario.html", "candidato-jose-luis-hurtado.html", "propuestas.html", "actividades.html"],
}

DESCRIPTIONS = {
    "problemas-ate.html": "Mapa general de los principales problemas y accesos a cada diagnóstico.",
    "candidato-jose-luis-hurtado.html": "Perfil, principios y prioridades de José Luis Hurtado Apaico.",
    "propuestas.html": "Ejes y soluciones municipales planteadas para el distrito.",
    "seguridad.html": "Medidas de prevención, serenazgo, cámaras y coordinación territorial.",
    "inseguridad-ate.html": "Contenido específico sobre delincuencia y temor vecinal en Ate.",
    "diagnostico-seguridad.html": "Análisis del problema de seguridad y sus impactos locales.",
    "diagnostico-basura.html": "Puntos críticos, limpieza pública y deterioro del espacio urbano.",
    "diagnostico-pistas.html": "Estado de vías, veredas y movilidad de vecinos y comerciantes.",
    "infraestructura.html": "Propuestas para vías, servicios, equipamiento y recuperación urbana.",
    "salud.html": "Prevención, campañas y atención comunitaria prioritaria.",
    "educacion.html": "Infraestructura, conectividad, formación técnica y oportunidades.",
    "empleo.html": "Capacitación, formalización y apoyo a la economía local.",
    "autogestion.html": "Organización comunitaria y proyectos para fortalecer capacidades.",
    "fiscalizacion.html": "Canal ciudadano para documentar problemas y aportar evidencias.",
    "actividades.html": "Recorridos, reuniones y presencia territorial junto a los vecinos.",
    "ideario.html": "Principios socialcristianos que orientan la acción política.",
    "estatuto.html": "Normas de organización, derechos y deberes dentro del partido.",
}


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


def page_title(text: str, fallback: str) -> str:
    match = re.search(r'<h1\b[^>]*>(.*?)</h1>', text, re.I | re.S)
    if not match:
        return fallback
    clean = re.sub(r'<[^>]+>', '', match.group(1))
    return html.unescape(re.sub(r'\s+', ' ', clean)).strip() or fallback


def inject_breadcrumbs(text: str, filename: str) -> str:
    if filename in {"index.html", "404.html"} or 'class="breadcrumbs"' in text:
        return text
    label = PAGE_LABELS.get(filename, page_title(text, filename.removesuffix('.html').replace('-', ' ').title()))
    crumbs = (
        '<nav class="breadcrumbs" aria-label="Migas de pan"><div class="container">'
        '<a href="index.html">Inicio</a><span aria-hidden="true">›</span>'
        f'<span aria-current="page">{html.escape(label)}</span></div></nav>'
    )
    if re.search(r'</header>', text, re.I):
        return re.sub(r'</header>', '</header>\n' + crumbs, text, count=1, flags=re.I)
    return text.replace('<body>', '<body>\n' + crumbs, 1)


def inject_related(text: str, filename: str) -> str:
    targets = RELATED.get(filename, [])
    if not targets or 'class="related-content"' in text:
        return text
    cards = []
    for target in targets[:6]:
        label = PAGE_LABELS.get(target, target.removesuffix('.html').replace('-', ' ').title())
        description = DESCRIPTIONS.get(target, "Continúa explorando contenidos relacionados del portal PPC Ate.")
        cards.append(
            f'<a class="related-card" href="{target}"><strong>{html.escape(label)}</strong>'
            f'<small>{html.escape(description)}</small></a>'
        )
    block = (
        '<section class="related-content" aria-labelledby="related-title"><div class="container">'
        '<h2 id="related-title">También puede interesarte</h2>'
        '<p class="related-content-intro">Continúa navegando por diagnósticos, propuestas y herramientas ciudadanas relacionadas.</p>'
        f'<div class="related-grid">{"".join(cards)}</div></div></section>'
    )
    if re.search(r'<footer\b', text, re.I):
        return re.sub(r'<footer\b', block + '\n<footer', text, count=1, flags=re.I)
    return text.replace('</body>', block + '\n</body>', 1)


def inject_breadcrumb_schema(text: str, filename: str, canonical: str) -> str:
    if filename in {"index.html", "404.html"} or '"@type":"BreadcrumbList"' in text.replace(' ', ''):
        return text
    label = PAGE_LABELS.get(filename, page_title(text, filename))
    data = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
            {"@type": "ListItem", "position": 1, "name": "Inicio", "item": f"{BASE_URL}/"},
            {"@type": "ListItem", "position": 2, "name": label, "item": canonical},
        ],
    }
    script = '<script type="application/ld+json">' + json.dumps(data, ensure_ascii=False, separators=(',', ':')) + '</script>'
    return text.replace('</head>', f'  {script}\n</head>', 1)


def optimize_html(path: Path) -> None:
    text = path.read_text(encoding="utf-8")
    canonical = canonical_for(path)
    filename = path.name

    text = re.sub(r'<html\b[^>]*\blang=["\'][^"\']+["\']', '<html lang="es-PE"', text, count=1, flags=re.I)
    text = re.sub(r'\s*<meta\s+name=["\']keywords["\'][^>]*>\s*', '\n', text, flags=re.I)
    text = upsert_link(text, "canonical", canonical)
    text = upsert_meta(text, prop="og:url", content=canonical)
    text = upsert_meta(text, prop="og:locale", content="es_PE")
    text = upsert_meta(text, name="twitter:card", content="summary_large_image")
    robots = "noindex, follow" if filename in NOINDEX_FILES else "index, follow, max-image-preview:large"
    text = upsert_meta(text, name="robots", content=robots)
    text = text.replace("https://www.ppcate.org.pe", BASE_URL)

    if 'href="site-enhancements.css"' not in text:
        text = text.replace('</head>', '  <link rel="stylesheet" href="site-enhancements.css">\n</head>', 1)
    if 'src="site-enhancements.js"' not in text:
        text = text.replace('</body>', '  <script src="site-enhancements.js" defer></script>\n</body>', 1)

    def secure_external(match: re.Match[str]) -> str:
        tag = match.group(0)
        if not re.search(r'\brel=', tag, re.I):
            return tag[:-1] + ' rel="noopener noreferrer">'
        return re.sub(r'\brel=["\'][^"\']*["\']', 'rel="noopener noreferrer"', tag, count=1, flags=re.I)

    text = re.sub(r'<a\b(?=[^>]*\btarget=["\']_blank["\'])[^>]*>', secure_external, text, flags=re.I)

    def lazy_image(match: re.Match[str]) -> str:
        tag = match.group(0)
        if re.search(r'\bloading=', tag, re.I):
            return tag
        return tag[:-1] + ' loading="lazy" decoding="async">'

    text = re.sub(r'<img\b[^>]*>', lazy_image, text, flags=re.I)

    if 'id="reportForm"' in text and 'name="privacidad"' not in text:
        consent = (
            '<label class="privacy-consent"><input type="checkbox" name="privacidad" required> '
            'Declaro que la información remitida es veraz según mi leal saber y entender, '
            'y acepto la <a href="privacidad.html" target="_blank" rel="noopener noreferrer">política de privacidad</a>.</label>'
        )
        text = text.replace('<div class="form-actions">\n              <button class="btn green" type="submit">Enviar reporte</button>',
                            consent + '\n            <div class="form-actions">\n              <button class="btn green" type="submit">Enviar reporte</button>', 1)

    if "</footer>" in text and "privacidad.html" not in text:
        text = text.replace("</footer>", '<div class="legal-footer"><a href="privacidad.html">Privacidad y tratamiento de datos</a></div>\n  </footer>', 1)

    text = inject_breadcrumbs(text, filename)
    text = inject_related(text, filename)
    text = inject_breadcrumb_schema(text, filename, canonical)
    text = text.replace("© 2025", f"© {date.today().year}")
    path.write_text(text, encoding="utf-8")


def generate_sitemap(html_files: list[Path]) -> None:
    today = date.today().isoformat()
    entries = []
    for path in sorted(html_files):
        if path.name in NOINDEX_FILES or path.name == "privacidad.html":
            continue
        loc = canonical_for(path)
        if path.name == "index.html":
            priority = "1.0"
        elif path.name in {"problemas-ate.html", "candidato-jose-luis-hurtado.html", "propuestas.html"}:
            priority = "0.9"
        else:
            priority = "0.8"
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
    incoming: dict[str, int] = {p.name: 0 for p in html_files}
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
            elif target.suffix.lower() == ".html" and target.name in incoming and target.name != path.name:
                incoming[target.name] += 1
    for name, count in incoming.items():
        if name not in {"index.html", "404.html", "privacidad.html"} and count == 0:
            errors.append(f"{name}: página huérfana sin enlaces internos entrantes")
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
    html_files = sorted(OUT.rglob("*.html"))
    generate_sitemap(html_files)
    (OUT / ".nojekyll").touch()

    errors = validate_seo(html_files) + validate_internal_links(html_files)
    if errors:
        print("AUDITORÍA FALLIDA:", file=sys.stderr)
        for error in errors:
            print(f"- {error}", file=sys.stderr)
        return 1
    print(f"Sitio construido correctamente: {len(html_files)} páginas HTML auditadas y enlazadas.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
