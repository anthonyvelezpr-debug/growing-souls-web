# Growing Souls · sitio web

Sitio estático de Growing Souls (Dra. Melanie Acevedo Vélez, PsyD). Astro, sin frameworks de UI, fuentes autoalojadas, sin analítica de terceros.

## Comandos

```bash
npm install
npm run dev            # desarrollo en http://localhost:4321 (muestra marcas de verificación y borradores)
npm run build          # producción en dist/
npm run build:strict   # producción + falla si queda copy pendiente de verificación
npm run build:preview  # copia con rutas relativas en dist-preview/ (vista previa)
```

## Publicación

Cada push a `main` construye el sitio y lo publica en GitHub Pages (`.github/workflows/deploy.yml`). El dominio `growingsoulspr.com` vive en GoDaddy y apunta a GitHub Pages; `public/CNAME` fija el dominio.

## Dónde está cada cosa

- `src/data/site.ts`: nombre, contacto, recursos en crisis, navegación. Los datos marcados `TODO VERIFICAR` se confirman antes del lanzamiento definitivo.
- `src/styles/tokens.css`: colores del manual de marca y tipografía. Para pasar a The Seasons, cambiar `--font-serif` y añadir el `@font-face` en `global.css`.
- `src/content/journal/`: artículos del Growing Journal en Markdown (`draft: true` no se publica).
- `src/components/Verify.astro`: marca copy pendiente. En producción no se ve; `npm run build:strict` lo cuenta.
- `src/assets/melanie/`: fotografías (se optimizan en el build).
