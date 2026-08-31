import { defineConfig } from 'astro/config'
import tailwind from '@astrojs/tailwind'
import react from '@astrojs/react'

const publicationBase = process.env.PUBLICATION_BASE || '/'
const distributionOutput = process.env.DISTRIBUTION_OUTPUT_DIR

export default defineConfig({
  site: 'https://festivalarc.com',
  base: publicationBase,
  trailingSlash: 'always',
  outDir: distributionOutput || './dist',
  integrations: [tailwind(), react()],
})
