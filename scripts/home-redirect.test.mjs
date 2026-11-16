import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'

const config = JSON.parse(readFileSync(new URL('../vercel.json', import.meta.url), 'utf8'))

test('homepage temporarily redirects to the official festival Instagram only', () => {
  assert.deepEqual(config.redirects, [
    { source: '/', destination: 'https://www.instagram.com/festival_arc', statusCode: 302 },
  ])
})

test('existing distribution build settings remain unchanged', () => {
  assert.equal(config.buildCommand, 'pnpm build')
  assert.equal(config.outputDirectory, '.output')
  assert.equal(config.framework, null)
})
