// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// Sitio estático de Growing Souls. El dominio vive en GoDaddy y apunta a GitHub Pages.
export default defineConfig({
  site: 'https://growingsoulspr.com',
  output: 'static',
  trailingSlash: 'always',
  integrations: [
    sitemap({
      filter: (page) => !page.includes('/agenda/gracias/') && !page.includes('/404'),
    }),
  ],
  build: {
    inlineStylesheets: 'always',
  },
});
