import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const navSource = readFileSync(resolve(process.cwd(), 'src/components/Nav.astro'), 'utf8')
const tapeSource = readFileSync(resolve(process.cwd(), 'src/components/TextTape.astro'), 'utf8')

test('renders editions as a TextTape native dropdown for desktop and mobile nav', () => {
  assert.match(navSource, /<details class=['"]editions-dropdown relative['"]>/)
  assert.match(navSource, /<TextTape[^>]+element=['"]summary['"]/)
  assert.match(navSource, /publicationConfig/)
  assert.match(navSource, /publicationConfig\.archives/)
  assert.match(navSource, /editionTargets/)
  assert.match(navSource, /details:hover > \.editions-panel/)
  assert.match(navSource, /details:focus-within > \.editions-panel/)
  assert.match(navSource, /details\[open\] > \.editions-panel/)
  assert.match(navSource, /pointer-events: none/)
  assert.match(navSource, /pointer-events: auto/)
  assert.match(navSource, /<div[^>]+editions-panel[^>]*>/s)
  assert.match(navSource, /<ul[^>]+editions-panel-content[^>]*>/s)
  assert.match(navSource, /\.editions-panel[^{}]*{[^}]*top: 100%;[^}]*padding-top: 0\.5rem;[^}]*pointer-events: none;/s)
  assert.match(navSource, /\.editions-panel-content\s*{[^}]*opacity: 0;[^}]*transform: translateY\(0\.5rem\);/s)
  assert.doesNotMatch(navSource, /\.editions-panel::before/)
  assert.doesNotMatch(navSource, /\.editions-panel\s*{[^}]*transform:/s)
  assert.doesNotMatch(navSource, /<ul\s+class="editions-panel absolute/s)
  assert.match(navSource, /prefers-reduced-motion: reduce/)
})

test('allows TextTape to render an interactive summary without moving the panel', () => {
  assert.match(tapeSource, /Element === ['"]summary['"])/
  assert.match(tapeSource, /hover:skew-y-0/)
})
