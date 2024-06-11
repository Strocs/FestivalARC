/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        primary: '#ee0175',
        secondary: '#f1f1f1',
        'accent-yellow': '#fcea0d',
        'accent-blue': '#1d70b7'
      },
      fontFamily: {
        fira: ['Fira Sans', 'sans-serif', 'system-ui'],
        climate: ['Climate Crisis', 'sans-serif', 'system-ui']
      },
      backgroundImage: {
        'hero-image': "url('/images/hero-image.webp')"
      }
    }
  },
  plugins: []
}
