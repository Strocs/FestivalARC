import { defineConfig } from 'astro/config'
const publicationBase = process.env.PUBLICATION_BASE || '/'
const distributionOutput = process.env.DISTRIBUTION_OUTPUT_DIR

export default defineConfig({
  base: publicationBase,
  outDir: distributionOutput || './dist',
  output: 'static',
  site: 'https://festivalarc.com',
})
