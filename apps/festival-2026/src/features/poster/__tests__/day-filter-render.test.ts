import { experimental_AstroContainer as AstroContainer } from 'astro/container'
import { describe, expect, it } from 'vitest'
import PosterGrid from '../PosterGrid.astro'
import { categories } from '../../artists/categories'

describe('progressive day controls', () => {
  it('renders initially hidden native labelled radios for every both-day scope', async () => {
    const container = await AstroContainer.create()
    for (const category of [undefined, ...categories]) {
      const html = await container.renderToString(PosterGrid, { props: { category } })
      if (category?.key === 'expo') {
        expect(html).toContain('data-poster-grid')
        expect(html).toContain('Lorem ipsum dolor sit amet')
        expect(html.indexOf('id="page-title"')).toBeLessThan(html.indexOf('data-poster-grid'))
        expect(html.indexOf('Lorem ipsum')).toBeGreaterThan(html.indexOf('id="page-title"'))
        expect(html).not.toContain('data-day-filter')
        expect(html).not.toContain('<dialog')
        expect(html).not.toContain('<button')
        expect(html).not.toContain('data-event-trigger')
        expect(html).not.toContain('data-event-id')
        expect(html.match(/data-poster-artist=/g)).toHaveLength(8)
        continue
      }
      expect(html).toMatch(/<fieldset[^>]*hidden[^>]*data-day-filter/)
      expect(html).toContain('Filtrar artistas por día')
      expect(html.match(/type="radio"/g)).toHaveLength(3)
      expect(html).toContain('Todos'); expect(html).toContain('Sábado 28'); expect(html).toContain('Domingo 29')
      expect(html).toContain('role="status"')
    }
  })
  it('omits controls for empty and single-day scopes without changing canonical anchors', async () => {
    const container = await AstroContainer.create()
    for (const participants of [[], categories[1].participants.slice(0, 1)]) {
      const html = await container.renderToString(PosterGrid, { props: { category: { ...categories[1], participants } } })
      expect(html).not.toContain('data-day-filter')
      expect(html.match(/data-event-trigger/g)?.length ?? 0).toBe(participants.length)
    }
  })
})
