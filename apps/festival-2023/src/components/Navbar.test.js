import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const navbarSource = readFileSync(resolve(process.cwd(), 'src/components/Navbar.astro'), 'utf8')

test('places a base-aware editions dropdown between sections and locations', () => {
  assert.match(navbarSource, /<li class=['"]editions-dropdown relative['"]>/)
  assert.match(navbarSource, /<div[^>]+editions-trigger[^>]+tabindex=['"]0['"][^>]*>\s*EDICIONES\s*<\/div>/s)
  assert.match(navbarSource, /publicationConfig/)
  assert.match(navbarSource, /publicationConfig\.archives/)
  assert.match(navbarSource, /editionTargets/)
  assert.match(navbarSource, /publicationBase/)
  assert.match(navbarSource, /href={target\.href}/)
  assert.match(navbarSource, /\.editions-dropdown:hover > \.editions-panel/)
  assert.match(navbarSource, /\.editions-dropdown:focus-within > \.editions-panel/)
  assert.doesNotMatch(navbarSource, /<details|<summary|details\[open\]/)
  assert.match(navbarSource, /pointer-events: none/)
  assert.match(navbarSource, /pointer-events: auto/)
  assert.match(navbarSource, /<div[^>]+editions-panel[^>]*>/s)
  assert.match(navbarSource, /<ul[^>]+editions-panel-content[^>]*>/s)
  assert.match(navbarSource, /\.editions-panel[^{}]*{[^}]*top: 100%;[^}]*padding-top: 0\.5rem;[^}]*pointer-events: none;/s)
  assert.match(navbarSource, /\.editions-panel-content\s*{[^}]*opacity: 0;[^}]*transform: translateY\(0\.5rem\);/s)
  assert.doesNotMatch(navbarSource, /\.editions-panel::before/)
  assert.doesNotMatch(navbarSource, /\.editions-panel\s*{[^}]*transform:/s)
  assert.doesNotMatch(navbarSource, /<ul\s+class="editions-panel grid/s)
  assert.match(navbarSource, /prefers-reduced-motion: reduce/)
  assert.match(navbarSource, /sections\.map\([\s\S]*<li class=['"]editions-dropdown relative['"]>[\s\S]*<\/ul>/)
})
