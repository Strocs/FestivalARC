import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { publicationConfig } from '../../../../editions.config'
import { previousEditionTargets } from './previousEditions'

const componentSource = readFileSync(
  resolve(process.cwd(), 'src/components/PreviousEditions.astro'),
  'utf8',
)

describe('previous edition targets', () => {
  it('separates the continuous hover hit area from the animated content', () => {
      expect(componentSource).toContain("<div class='editions-dropdown group relative'>")
      expect(componentSource).toContain("class='editions-trigger")
      expect(componentSource).toContain("tabindex='0'")
    expect(componentSource).toMatch(/<div\s+class=\'[^\']*editions-panel[^\']*\'>/)
    expect(componentSource).toMatch(/<ul\s+class=\'[^\']*editions-panel-content[^\']*\'>/)
      expect(componentSource).toContain('.editions-dropdown:hover > .editions-panel')
      expect(componentSource).toContain('.editions-dropdown:focus-within > .editions-panel')
      expect(componentSource).not.toContain('<details')
      expect(componentSource).not.toContain('<summary')
      expect(componentSource).not.toContain('[open]')
    expect(componentSource).toContain('pointer-events: none')
    expect(componentSource).toContain('pointer-events: auto')
    expect(componentSource).toMatch(/\.editions-panel[^{}]*{[^}]*top: 100%;[^}]*padding-top: 0\.5rem;[^}]*pointer-events: none;/s)
    expect(componentSource).toMatch(/\.editions-panel-content\s*{[^}]*opacity: 0;[^}]*transform: translateY\(0\.5rem\);/s)
    expect(componentSource).toContain('prefers-reduced-motion: reduce')
    expect(componentSource).not.toContain('.editions-panel::before')
    expect(componentSource).not.toMatch(/\.editions-panel\s*{[^}]*transform:/s)
    expect(componentSource).not.toContain('<ul class=\'editions-panel absolute')
    expect(componentSource).not.toContain('<script')
  })

  it('derives sorted labels and links from the publication configuration', () => {
    const targets = previousEditionTargets(publicationConfig)
    const archiveYears = [...publicationConfig.archives]
      .map(({ year }) => year)
      .sort((left, right) => right - left)

    const expectedTargets = [...publicationConfig.archives]
      .sort((left, right) => right.year - left.year)
      .map(({ year, base }) => ({
        year,
        label: `ARC ${year}`,
        href: `${base}/`,
      }))

    expect(targets).toEqual(expectedTargets)
    expect(targets.map(({ year }) => year)).toEqual(archiveYears)
    expect(targets.some(({ year }) => year === publicationConfig.active.year)).toBe(false)
  })
})
