# Auditoría técnica de PPC Ate

Fecha: 28 de julio de 2026

## Resumen ejecutivo

El sitio tiene una base funcional y contenido sustantivo, pero presenta inconsistencias SEO y de arquitectura que deben corregirse antes de intensificar la campaña digital.

## Hallazgos críticos

1. **Dominio canónico inconsistente.** El sitio se publica con `https://ppcate.org.pe`, el archivo `CNAME`, el sitemap, Open Graph y los datos estructurados usan el dominio sin `www`; sin embargo, las etiquetas `canonical` de las páginas apuntan a `https://www.ppcate.org.pe`. Esto puede provocar que Google trate las URLs del dominio principal como páginas alternativas.
2. **Sitemap incompleto.** La página `inseguridad-ate.html` existía, pero no estaba incluida en el sitemap.
3. **Ausencia de una página 404 propia.** Los enlaces erróneos no ofrecían una ruta clara de retorno y podían generar una experiencia poco profesional.
4. **Metadatos no uniformes.** Deben alinearse `canonical`, `og:url`, títulos, descripciones y datos estructurados en todas las páginas.
5. **Dependencias externas bloqueantes.** Typed.js y ScrollReveal se cargan sin `defer`; si un CDN falla, parte del JavaScript puede dejar de ejecutarse.
6. **Código CSS incrustado en páginas.** La página principal mantiene un bloque grande de estilos internos que debería migrarse a `styles.css` para facilitar mantenimiento y caché.
7. **Formulario ciudadano y datos personales.** El buzón ya admite evidencias, pero requiere aviso de privacidad, consentimiento expreso, política de retención y una descripción clara del uso de los datos.
8. **Declaraciones políticas y vigencia temporal.** Las referencias a fechas, condición de candidato y periodos deben revisarse cada vez que cambie la situación electoral para evitar contenido desactualizado.
9. **Accesibilidad.** Debe completarse la navegación móvil, estados de foco, etiquetas de formularios, contraste, textos alternativos y manejo del foco en modales.
10. **Control de calidad.** Falta un validador automático para enlaces internos, canonicals, sitemap, metadatos y archivos faltantes antes de cada despliegue.

## Correcciones aplicadas en esta rama

- Sitemap completado, normalizado y priorizado.
- Inclusión de `inseguridad-ate.html` en el sitemap.
- Creación de una página `404.html` accesible y marcada como `noindex`.
- Creación de este documento de auditoría para dejar trazabilidad técnica.

## Siguiente bloque de correcciones

- Normalizar todas las etiquetas canonical al dominio `https://ppcate.org.pe`.
- Alinear Open Graph, Twitter Cards y Schema.org por página.
- Revisar enlaces internos y documentos PDF.
- Incorporar política de privacidad y consentimiento en formularios.
- Optimizar carga de scripts, imágenes y fuentes.
- Añadir validación automática SEO y de enlaces en GitHub Actions.
- Revisar diseño responsive y accesibilidad de todas las páginas.
