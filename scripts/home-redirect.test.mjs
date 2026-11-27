import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'

const config = JSON.parse(readFileSync(new URL('../vercel.json', import.meta.url), 'utf8'))

const pkg = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'))

test('the homepage uses static rewrites rather than a redirect', () => {
  assert.equal(config.redirects, undefined)
  assert.equal(config.rewrites.filter(({ source }) => source === '/').length, 9)
})

test('Vercel selects a dedicated distribution profile without changing local build or preview', () => {
  assert.equal(config.buildCommand, 'pnpm build:vercel')
  assert.equal(pkg.scripts['build:vercel'], 'pnpm --filter @festivalarc/distribution build --vercel')
  assert.equal(pkg.scripts.build, 'pnpm --filter @festivalarc/distribution build')
  assert.equal(pkg.scripts.preview, 'python3 -m http.server 4173 --directory .output')
  assert.equal(config.outputDirectory, '.output')
  assert.equal(config.framework, null)
})
