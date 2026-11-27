import { experimental_AstroContainer as AstroContainer } from 'astro/container'
import { describe, expect, it } from 'vitest'
import PosterGrid from '../PosterGrid.astro'
import { categories } from '../../artists/categories'

describe('native modal offscreen decorative work', () => {
  it.each([undefined, categories[0]])('skips offscreen motif contents without changing endpoint placement or artwork in scope %s', async category => {
    const container = await AstroContainer.create()
    const html = await container.renderToString(PosterGrid, { props: { category } })
    const motifs = [...html.matchAll(/<div\b([^>]*data-poster-motif="([^"]+)"[^>]*)>([\s\S]*?)<\/div>/g)]
    expect(motifs.length).toBeGreaterThan(0)
    const plans = JSON.parse(html.match(/data-poster-plans>([\s\S]*?)<\/script>/)![1])
    expect(motifs.map(m => m[2])).toEqual(plans.plans.all.motifs.map((m: { variant: string }) => m.variant))
    for (const [, attributes, variant, contents] of motifs) {
      // Preserve the grid item's and outer SVG's natural intrinsic sizing.
      // Artwork is an isolated resource, not a live use shadow tree.
      expect(attributes).not.toContain('content-visibility:')
      expect(attributes).not.toContain('contain-intrinsic-')
      expect(contents).not.toContain('content-visibility:')
      expect(contents).toContain('background-size:100% 100%')
      expect(contents).toContain('background-repeat:no-repeat')
      expect(contents).toContain(`/patterns/${variant}.svg`)
      expect(contents).toContain('data-pattern-base="/patterns/"')
      expect(contents).toContain('aria-hidden="true"')
      expect(contents).toContain('focusable="false"')
      expect(contents).not.toMatch(/<(?:use|image|img)\b/)
      expect(attributes).toContain('aspect-[160/152]')
      expect(contents).toContain('viewBox="0 0 100 100"')
      expect(contents).not.toContain('contain-intrinsic-')
      expect(contents).not.toMatch(/(?:md|xl):\[content-visibility:visible\]/)
      expect(attributes).toContain('--mobile-row:')
      expect(attributes).toContain('--tablet-row:')
      expect(attributes).toContain('--desktop-row:')
      expect(contents).toContain('left-[-0.5px]')
      expect(contents).toContain('w-[calc(100%+1px)]')
    }
  })
})
