import { defineConfig } from 'astro/config'
import react from '@astrojs/react'
import tailwind from '@astrojs/tailwind'

const publicationBase = process.env.PUBLICATION_BASE || '/'
const distributionOutput = process.env.DISTRIBUTION_OUTPUT_DIR

export default defineConfig({
  integrations: [react(), tailwind()],
  site: 'https://festivalarc.com',
  base: publicationBase,
  trailingSlash: 'always',
  output: 'static',
  outDir: distributionOutput || './dist',
})
