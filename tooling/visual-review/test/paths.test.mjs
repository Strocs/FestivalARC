import test from 'node:test'
import assert from 'node:assert/strict'
import { discoverPublicPages, sanitizeRoute } from '../src/paths.mjs'
import { mkdtemp, mkdir, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

test('discovers public HTML routes while excluding 404 and non-page HTML', async () => {
  const output = await mkdtemp(join(tmpdir(), 'visual-review-'))
  await mkdir(join(output, 'agenda', 'opening'), { recursive: true })
  await mkdir(join(output, '_astro'), { recursive: true })
  await mkdir(join(output, '404'), { recursive: true })
  await writeFile(join(output, 'index.html'), '<html />')
  await writeFile(join(output, 'agenda', 'index.html'), '<html />')
  await writeFile(join(output, 'agenda', 'opening', 'index.html'), '<html />')
  await writeFile(join(output, '404.html'), '<html />')
  await writeFile(join(output, '404', 'index.html'), '<html />')
  await writeFile(join(output, '_astro', 'not-a-page.html'), '<html />')
  await writeFile(join(output, 'notes.txt'), 'not html')

  assert.deepEqual(await discoverPublicPages(output), [
    { filePath: join(output, 'index.html'), route: '/' },
    { filePath: join(output, 'agenda', 'index.html'), route: '/agenda/' },
    { filePath: join(output, 'agenda', 'opening', 'index.html'), route: '/agenda/opening/' },
  ])
})

test('sanitizes routes for stable human-readable output directories', () => {
  assert.equal(sanitizeRoute('/'), 'home')
  assert.equal(sanitizeRoute('/agenda/opening/'), 'agenda--opening')
  assert.equal(sanitizeRoute('/ediciones/2024/'), 'ediciones--2024')
})
