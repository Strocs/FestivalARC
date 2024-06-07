/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        primary: '#ee0175',
        secondary: '#f1f1f1'
      }
    },
    fontFamily: {
      secondary: ['Fira Sans', 'sans-serif']
    }
  },
  plugins: []
}
