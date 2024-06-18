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
      }
    },
    backgroundImage: {
      'hero-image': "url('hero-image.webp')",
      'snow-ball': "url('snowflake-1.png')",
      'snow-star': "url('snowflake-2.png')"
    },
    fontFamily: {
      fira: ['Fira Sans', 'sans-serif', 'system-ui'],
      climate: ['Climate Crisis', 'sans-serif', 'system-ui']
    },
    keyframes: {
      snowflakes: {
        '0%': { transform: 'scale(1) rotate(0deg)' },
        '100%': {
          transform: 'scale(1.2) rotate(20deg)'
        }
      }
    },
    animation: {
      snowflakes: 'snowflakes 200ms steps(2,end) alternate infinite'
    }
  },
  plugins: []
}
