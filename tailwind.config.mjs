/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        primary: '#ee0175',
        secondary: '#f1f1f1',
        'accent-yellow': '#fcea0d',
        'accent-blue': '#1d70b7',
        'day-1': '#04bfb1',
        'day-2': '#662482',
        'day-3': '#d9e021',
        'day-4': '#f29100'
      },
      fontFamily: {
        fira: ['Fira Sans', 'sans-serif', 'system-ui'],
        climate: ['Climate Crisis', 'sans-serif', 'system-ui']
      },
      backgroundImage: {
        'hero-image': "url('/images/hero-image.webp')",
        'snow-ball': "url('/images/snowflake-1.png')",
        'snow-star': "url('/images/snowflake-2.png')"
      },
      keyframes: {
        snowflakes: {
          '0%': { transform: 'translate3d(0, 0, 0) rotate(0deg)' },
          '100%': {
            transform: 'translate3d(25px, 1200px, 0px) rotate(360deg)'
          }
        }
      },
      animation: {
        snowflakes: 'snowflakes 3s linear 2s infinite'
      }
    }
  },
  plugins: []
}
