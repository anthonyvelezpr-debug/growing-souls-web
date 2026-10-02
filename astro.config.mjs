// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// Sitio estático de Growing Souls. El dominio vive en GoDaddy y apunta a GitHub Pages.
export default defineConfig({
  site: 'https://growingsoulspr.com',
  output: 'static',
  trailingSlash: 'always',
  // La antigua página "Oficina virtual" pasó a ser "Talleres y conferencias" (oct 2026). La ruta vieja redirige.
  redirects: {
    '/oficina-virtual/': '/talleres-y-conferencias/',
  },
  integrations: [
    sitemap({
      filter: (page) =>
        !page.includes('/agenda/gracias/') && !page.includes('/404') && !page.includes('/oficina-virtual/'),
    }),
  ],
  build: {
    inlineStylesheets: 'always',
  },
});
