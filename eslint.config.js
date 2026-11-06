import astro from 'eslint-plugin-astro'
import react from 'eslint-plugin-react'
import tsParser from '@typescript-eslint/parser'
import globals from 'globals'

export default [
  {
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      '**/.astro/**',
      '**/.turbo/**',
      '**/.vercel/**',
      '**/.atl/**',
      '**/.pi/**',
      '**/.codegraph/**',
      '.output/**',
      '.distribution-build-*/**',
      'output/**',
      'refs/**',
      'test-results/**',
      'playwright-report/**',
      'blob-report/**',
      'playwright/.cache/**',
    ],
  },
  {
    files: ['**/*.{js,mjs,cjs,jsx,ts,tsx,astro}'],
    languageOptions: {
      globals: { ...globals.browser, ...globals.node },
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    rules: {
      'no-debugger': 'error',
    },
  },
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: { parser: tsParser },
  },
  ...astro.configs['flat/recommended'],
  {
    files: ['**/*.astro'],
    languageOptions: {
      parserOptions: { parser: tsParser },
    },
  },
  {
    files: ['**/*.{jsx,tsx}'],
    plugins: { react },
    rules: {
      'react/jsx-no-duplicate-props': 'error',
      'react/jsx-key': 'error',
    },
  },
]
