# Auditoría integral de PPC Ate

## Objetivo

Profesionalizar la publicación del portal, unificar su identidad técnica y corregir las señales contradictorias que provocaban exclusiones por canonical en Google Search Console.

## Hallazgos principales

1. El dominio oficial en `CNAME`, sitemap y Open Graph era `https://ppcate.org.pe`, mientras varias etiquetas canonical declaraban `https://www.ppcate.org.pe`.
2. El sitemap se mantenía manualmente y podía omitir páginas existentes.
3. No existía una validación automática de enlaces internos, recursos, títulos, descripciones ni canonical antes del despliegue.
4. El buzón ciudadano recibía datos y archivos sin una política de privacidad visible ni consentimiento previo.
5. El despliegue publicaba todo el repositorio sin construir una versión limpia del sitio.

## Soluciones implementadas

- Dominio canónico único: `https://ppcate.org.pe`.
- Canonical y `og:url` únicos por página.
- Eliminación automática de referencias canónicas a `www`.
- Sitemap regenerado automáticamente con todas las páginas indexables.
- Validación de enlaces internos y recursos antes de publicar.
- Revisión obligatoria de título, descripción, canonical y robots.
- Página de privacidad y consentimiento en el buzón ciudadano.
- Endurecimiento de enlaces externos con `noopener noreferrer`.
- Carga diferida y decodificación asíncrona de imágenes.
- Despliegue exclusivo de la carpeta `_site`, sin archivos internos del repositorio.
- Página 404 marcada como `noindex`.

## Operación posterior a la publicación

1. Confirmar que el workflow **Auditar y desplegar PPC Ate** termine en verde.
2. En Search Console, volver a enviar `https://ppcate.org.pe/sitemap.xml`.
3. Inspeccionar la portada y 3 a 5 páginas estratégicas y solicitar indexación.
4. Iniciar la validación de la corrección del motivo «Página alternativa con etiqueta canónica adecuada».
5. No mezclar enlaces `www` y sin `www` en publicaciones, redes sociales o documentos.

## Criterio editorial

La web debe presentar diagnósticos, propuestas, actividad territorial, doctrina y canales de participación con lenguaje verificable. Las denuncias ciudadanas no se publican automáticamente ni se presentan como hechos probados sin revisión previa.
