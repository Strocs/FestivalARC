import { defineConfig, fontProviders } from 'astro/config'
import icon from 'astro-icon'
import tailwindcss from '@tailwindcss/vite'

const publicationBase = process.env.PUBLICATION_BASE || '/'
const distributionOutput = process.env.DISTRIBUTION_OUTPUT_DIR

export default defineConfig({
  base: publicationBase,
  server: {
    allowedHosts: ['ongoing-emacs-digest-improving.trycloudflare.com'],
  },
  outDir: distributionOutput || './dist',
  output: 'static',
  site: 'https://festivalarc.com',
  integrations: [
    icon({
      include: {
        lucide: ['arrow-right'],
        'simple-icons': ['instagram', 'spotify', 'x'],
      },
    }),
  ],
  fonts: [
    {
      provider: fontProviders.google(),
      name: 'Poppins',
      cssVariable: '--font-poppins',
      weights: [200, 300, 400, 600, 700, 800, 900],
      styles: ['normal'],
      subsets: ['latin'],
      display: 'swap',
    },
  ],
  vite: {
    plugins: [tailwindcss()],
  },
})
