import { defineConfig } from 'astro/config'
import tailwind from '@astrojs/tailwind'
import react from '@astrojs/react'
import icon from 'astro-icon'

const publicationBase = process.env.PUBLICATION_BASE || '/'
const distributionOutput = process.env.DISTRIBUTION_OUTPUT_DIR

export default defineConfig({
  site: 'https://festivalarc.com',
  base: publicationBase,
  trailingSlash: 'always',
  outDir: distributionOutput || './dist',
  integrations: [
    tailwind(),
    react(),
    icon({
      include: {
        mdi: [
          'instagram', 'facebook', 'twitter', 'spotify', 'youtube',
          'soundcloud', 'web', 'bandcamp', 'video', 'email',
          'arrow-top-right-thick', 'arrow-top-left-thick',
          'arrow-right-bold', 'calendar-multiselect',
        ],
        ic: ['baseline-tiktok'],
      },
    }),
  ],
})
