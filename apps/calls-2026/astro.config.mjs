import { defineConfig, fontProviders } from 'astro/config'
import tailwindcss from '@tailwindcss/vite'

const publicationBase = process.env.PUBLICATION_BASE || '/'
const distributionOutput = process.env.DISTRIBUTION_OUTPUT_DIR

export default defineConfig({
  base: publicationBase,
  outDir: distributionOutput || './dist',
  output: 'static',
  site: 'https://festivalarc.com',
  fonts: [
    {
      provider: fontProviders.fontsource(),
      name: 'Poppins',
      cssVariable: '--font-poppins',
      weights: [400, 700, 800],
      styles: ['normal'],
      subsets: ['latin'],
    },
  ],
  vite: {
    plugins: [tailwindcss()],
  },
})
