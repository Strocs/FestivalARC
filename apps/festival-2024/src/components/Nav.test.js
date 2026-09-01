import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const navSource = readFileSync(resolve(process.cwd(), 'src/components/Nav.astro'), 'utf8')

test('renders editions as a keyboard-focusable CSS dropdown for desktop and mobile nav', () => {
  assert.match(navSource, /<div class=['"]editions-dropdown relative['"]>/)
  assert.match(navSource, /<TextTape[^>]+element=['"]div['"][^>]+tabindex=['"]0['"]/)
  assert.match(navSource, /publicationConfig/)
  assert.match(navSource, /publicationConfig\.archives/)
  assert.match(navSource, /editionTargets/)
  assert.match(navSource, /\.editions-dropdown:hover > \.editions-panel/)
  assert.match(navSource, /\.editions-dropdown:focus-within > \.editions-panel/)
  assert.doesNotMatch(navSource, /<details|<summary|details\[open\]/)
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
