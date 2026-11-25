import { experimental_AstroContainer as AstroContainer } from 'astro/container'
import { describe, expect, it } from 'vitest'
import PosterGrid from '../PosterGrid.astro'
import { categories } from '../../artists/categories'
import { createPosterSimpleLayout, type PosterSimplePlans } from '../poster-simple-layout'
import type { DayKey, PosterFilterPlans } from '../poster-filter-layout'

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
  it('projects the real home and music handoffs onto occupied, compact rows for each day', async () => {
    const container = await AstroContainer.create()
    for (const category of [undefined, categories.find(category => category.key === 'music')!]) {
      const html = await container.renderToString(PosterGrid, { props: { category } })
      const { plans, simple }: PosterFilterPlans & { simple: PosterSimplePlans } = JSON.parse(html.match(/data-poster-plans>([^<]+)/)![1])
      expect(simple).toBeDefined()
      for (const day of Object.keys(plans) as DayKey[]) for (const range of ['tablet', 'desktop'] as const) {
        const plan = plans[day]
        const layout = createPosterSimpleLayout(plan, range, plan.ids, simple[day][range])
        const paint = [...layout.artists.values(), ...layout.information.values()]
        expect(layout.rows).toBe(Math.max(...paint.map(cell => cell.row + cell.height)))
        expect(layout.artists.size).toBe(plan.ids.length)
        expect([...layout.information.keys()]).toEqual(Object.keys(plan.information[range]))
        const counts = Array.from({ length: layout.rows }, (_, row) => [...layout.artists.values()].filter(cell => cell.row === row).length)
        let remaining = plan.ids.length
        for (const [row, count] of counts.entries()) {
          const slotted = [...layout.information.values()].filter(cell => row >= cell.row && row < cell.row + cell.height)
          const free = Array.from({ length: layout.columns }, (_, col) => slotted.some(cell => col >= cell.column && col < cell.column + cell.width) ? 'x' : '.').join('')
          const capacity = (free.match(/\.\./g) ?? []).length
          expect(count).toBe(Math.min(remaining, capacity))
          remaining -= count
        }
        expect(remaining).toBe(0)
        if (category && range === 'desktop' && plan.ids.length >= 10) expect(Math.max(...counts)).toBe(5)
      }
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
