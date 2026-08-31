import { defineConfig } from 'astro/config'

import react from '@astrojs/react'
import tailwindcss from '@tailwindcss/vite'

const publicationBase = process.env.PUBLICATION_BASE || '/'
const distributionOutput = process.env.DISTRIBUTION_OUTPUT_DIR

// https://astro.build/config
export default defineConfig({
  base: publicationBase,
  outDir: distributionOutput || './dist',
  integrations: [react()],
  output: 'static',
  site: 'https://festivalarc.com',

  vite: {
    plugins: [tailwindcss()],
    server: {
      allowedHosts: ['.trycloudflare.com'],
    },
  },

})
