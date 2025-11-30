// @ts-check
import { defineConfig } from 'astro/config';

import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://www.superheroes-inc.es',
  integrations: [
    react(),
    sitemap({
      filter: (page) => !page.includes('/search-index.json'),
      changefreq: 'weekly',
      priority: 0.7,
      lastmod: new Date(),
    })
  ],
  compressHTML: true,
  build: {
    inlineStylesheets: 'auto',
  },
});