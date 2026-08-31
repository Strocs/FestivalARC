import test from 'node:test'
import assert from 'node:assert/strict'
import { resolveAstroOutput } from './build-output.mjs'

test('uses the isolated distribution output directory', async () => {
  const output = '/tmp/festivalarc-2024-isolated-output'
  process.env.DISTRIBUTION_OUTPUT_DIR = output
  const config = await import(`../astro.config.mjs?output=${Date.now()}`)
  delete process.env.DISTRIBUTION_OUTPUT_DIR

  assert.equal(config.default.outDir, output)
})

test('uses the static Vercel output when Astro does not emit dist', () => {
  assert.equal(
    resolveAstroOutput({ distExists: false, vercelStaticExists: true }),
    '.vercel/output/static'
  )
  assert.equal(
    resolveAstroOutput({ distExists: true, vercelStaticExists: true }),
    'dist'
  )
})
