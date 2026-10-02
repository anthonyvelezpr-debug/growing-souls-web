// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// Sitio estático de Growing Souls. El dominio vive en GoDaddy y apunta a GitHub Pages.
export default defineConfig({
  site: 'https://growingsoulspr.com',
  output: 'static',
  trailingSlash: 'always',
  // Rutas antiguas que redirigen (oct 2026): "Oficina virtual" pasó a ser "Talleres y conferencias" y
  // "Cómo trabajo" pasó a ser "Misión y visión" (pedido de la Dra.).
  redirects: {
    '/oficina-virtual/': '/talleres-y-conferencias/',
    '/como-trabajo/': '/mision-y-vision/',
  },
  integrations: [
    sitemap({
      filter: (page) =>
        !page.includes('/agenda/gracias/') &&
        !page.includes('/404') &&
        !page.includes('/oficina-virtual/') &&
        !page.includes('/como-trabajo/'),
    }),
  ],
  build: {
    inlineStylesheets: 'always',
  },
});
