import test from 'node:test'
import assert from 'node:assert/strict'


test('uses the isolated distribution output directory', async () => {
  const output = '/tmp/festivalarc-2023-isolated-output'
  process.env.DISTRIBUTION_OUTPUT_DIR = output
  const config = await import(`../astro.config.mjs?output=${Date.now()}`)
  delete process.env.DISTRIBUTION_OUTPUT_DIR

  assert.equal(config.default.outDir, output)
})
