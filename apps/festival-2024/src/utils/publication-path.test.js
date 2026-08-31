import test from 'node:test'
import assert from 'node:assert/strict'
import { existsSync } from 'node:fs'
import {
  isPublicationHome,
  publicationUrl,
  withPublicationBase,
} from './publication-path.js'

test('prefixes local routes and assets for the 2024 archive without duplication', () => {
  assert.equal(withPublicationBase('/', '/ediciones/2024'), '/ediciones/2024/')
  assert.equal(withPublicationBase('/el-festival', '/ediciones/2024'), '/ediciones/2024/el-festival')
  assert.equal(withPublicationBase('images/hero-image.webp', '/ediciones/2024'), '/ediciones/2024/images/hero-image.webp')
  assert.equal(withPublicationBase('/ediciones/2024/el-festival', '/ediciones/2024'), '/ediciones/2024/el-festival')
})

test('preserves external, mail, and fragment references', () => {
  assert.equal(withPublicationBase('https://example.com/image.png', '/ediciones/2024'), 'https://example.com/image.png')
  assert.equal(withPublicationBase('//cdn.example.com/image.png', '/ediciones/2024'), '//cdn.example.com/image.png')
  assert.equal(withPublicationBase('mailto:contacto@example.com', '/ediciones/2024'), 'mailto:contacto@example.com')
  assert.equal(withPublicationBase('#details', '/ediciones/2024'), '#details')
})

test('creates absolute metadata URLs and recognizes base-aware home paths', () => {
  assert.equal(publicationUrl('/el-festival', '/ediciones/2024', 'https://festivalarc.com'), 'https://festivalarc.com/ediciones/2024/el-festival')
  assert.equal(publicationUrl('/', '/', 'https://festivalarc.com'), 'https://festivalarc.com/')
  assert.equal(isPublicationHome('/ediciones/2024/', '/ediciones/2024'), true)
  assert.equal(isPublicationHome('/ediciones/2024/el-festival', '/ediciones/2024'), false)
})

test('keeps the authentic ARC2024 application source boundary', () => {
  assert.equal(existsSync(new URL('../components/Header.astro', import.meta.url)), true)
  assert.equal(existsSync(new URL('../data/ACTIVITIES.ts', import.meta.url)), true)
  assert.equal(existsSync(new URL('../../public/images/hero-image.webp', import.meta.url)), true)
})
