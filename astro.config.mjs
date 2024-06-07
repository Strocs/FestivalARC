import { defineConfig } from 'astro/config'

import sitemap from '@astrojs/sitemap'
import react from '@astrojs/react'
import vercel from '@astrojs/vercel/static'
import tailwind from '@astrojs/tailwind'

// https://astro.build/config
export default defineConfig({
  integrations: [sitemap(), react(), tailwind()],
  output: 'static',
  adapter: vercel({
    webAnalytics: { enabled: true }
  })
})
