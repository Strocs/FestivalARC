import test from 'node:test'
import assert from 'node:assert/strict'
import { mkdtempSync, readFileSync, readdirSync, rmSync } from 'node:fs'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { spawnSync } from 'node:child_process'

const build = (outputDirectory) => spawnSync('pnpm', ['build'], {
  cwd: new URL('..', import.meta.url),
  env: { ...process.env, NODE_ENV: 'development', PUBLICATION_BASE: '/ediciones/2024', DISTRIBUTION_OUTPUT_DIR: outputDirectory },
  encoding: 'utf8',
})

const htmlFiles = (root, current = root) => readdirSync(current, { withFileTypes: true }).flatMap((entry) => {
  const path = join(current, entry.name)
  return entry.isDirectory() ? htmlFiles(root, path) : path.endsWith('.html') ? [path.slice(root.length + 1)] : []
})

test('produces deterministic ARC2024 HTML without render timing attributes', () => {
  const root = mkdtempSync(join(tmpdir(), 'festivalarc-2024-determinism-'))
  const first = join(root, 'first')
  const second = join(root, 'second')
  try {
    for (const output of [first, second]) {
      const result = build(output)
      assert.equal(result.status, 0, result.stderr)
    }
    const files = htmlFiles(first).sort()
    assert.deepEqual(files, htmlFiles(second).sort())
    for (const file of files) {
      const firstHtml = readFileSync(join(first, file), 'utf8')
      const secondHtml = readFileSync(join(second, file), 'utf8')
      assert.doesNotMatch(firstHtml, /server-render-time/)
      assert.equal(secondHtml, firstHtml, file)
    }
  } finally {
    rmSync(root, { recursive: true, force: true })
    rmSync(new URL('../dist', import.meta.url), { recursive: true, force: true })
    rmSync(new URL('../.astro', import.meta.url), { recursive: true, force: true })
    rmSync(new URL('../.vercel', import.meta.url), { recursive: true, force: true })
  }
})
