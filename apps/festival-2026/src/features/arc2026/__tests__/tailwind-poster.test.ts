import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const components = [
  'FestivalGrid',
  'ArtistName',
  'PosterIntro',
  'PosterInformation',
  'PosterPattern',
  'PosterDefinitions',
  'PatternTile',
] as const

describe('Tailwind poster presentation', () => {
  it.each(components)('%s has no local style block', component => {
    const source = readFileSync(new URL(`../components/${component}.astro`, import.meta.url), 'utf8')
    expect(source).not.toMatch(/<style\b/i)
  })
})
