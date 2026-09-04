import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { publicationConfig } from '../../../../editions.config'
import { previousEditionTargets } from './previousEditions'

const componentSource = readFileSync(
  resolve(process.cwd(), 'src/components/PreviousEditions.astro'),
  'utf8',
)
const pageSource = readFileSync(
  resolve(process.cwd(), 'src/pages/index.astro'),
  'utf8',
)

const classNames = (source: string) =>
  [...source.matchAll(/class='([^']*)'/g)].flatMap((match) =>
    match[1].split(/\s+/),
  )

describe('Tailwind class migrations', () => {
  it('separates the continuous hover hit area from the animated content', () => {
    const componentClasses = classNames(componentSource)

    expect(componentSource).toContain("<nav\n  class='z-10 flex justify-center py-4'")
    expect(componentSource).toContain("<div class='group relative'>")
    expect(componentSource).toContain("tabindex='0'")
    expect(componentSource).toContain('pointer-events-none')
    expect(componentSource).toContain('group-hover:pointer-events-auto')
    expect(componentSource).toContain('group-focus-within:pointer-events-auto')
    expect(componentSource).toContain('invisible')
    expect(componentSource).toContain('group-hover:visible')
    expect(componentSource).toContain('group-focus-within:visible')
    expect(componentSource).toContain('w-max')
    expect(componentSource).toContain('translate-y-2')
    expect(componentSource).toContain('group-hover:translate-y-0')
    expect(componentSource).toContain('group-focus-within:translate-y-0')
    expect(componentSource).toContain('opacity-0')
    expect(componentSource).toContain('group-hover:opacity-100')
    expect(componentSource).toContain('group-focus-within:opacity-100')
    expect(componentSource).toContain('motion-reduce:transform-none')
    expect(componentSource).toContain('motion-reduce:transition-none')
    expect(componentSource).not.toContain('<details')
    expect(componentSource).not.toContain('<summary')
    expect(componentSource).not.toContain('[open]')
    expect(componentSource).not.toContain('<style')
    expect(componentSource).not.toContain('.editions-')
    expect(componentClasses).toContain('group')
    expect(componentClasses).not.toContain('previous-editions')
    expect(componentClasses).not.toContain('editions-dropdown')
    expect(componentClasses).not.toContain('editions-trigger')
    expect(componentClasses).not.toContain('editions-panel')
    expect(componentClasses).not.toContain('editions-panel-content')
  })

  it('removes former page selectors while keeping their Tailwind utilities', () => {
    const pageClasses = classNames(pageSource)
    const obsoleteClasses = [
      'calls-body',
      'hero',
      'hero-art',
      'hero-image',
      'deadline',
      'deadline-prefix',
      'deadline-accent',
      'section-separator',
      'applications',
      'category-grid',
      'category',
      'applications-separator',
      'bases',
    ]

    obsoleteClasses.forEach((className) => {
      expect(pageClasses).not.toContain(className)
    })
    expect(pageSource).toContain('overflow-hidden')
    expect(pageSource).toContain('aspect-[10/3]')
    expect(pageSource).toContain('text-primary')
    expect(pageSource).toContain('grid-cols-2')
    expect(pageSource).toContain('max-[640px]:grid-cols-1')
    expect(pageSource).toContain('border-primary')
    expect(pageSource).toContain('hover:bg-accent')
    expect(pageSource).not.toContain('<style')
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
