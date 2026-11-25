import { experimental_AstroContainer as AstroContainer } from 'astro/container'
import { describe, expect, it } from 'vitest'
import PosterGrid from '../PosterGrid.astro'
import { categories } from '../../artists/categories'
import { createPosterSimpleLayout, type PosterSimplePlans } from '../poster-simple-layout'
import type { DayKey, PosterFilterPlans } from '../poster-filter-layout'

describe('progressive day controls', () => {
  it('renders native labelled radios for every both-day scope and keeps legacy controls initially hidden', async () => {
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
      if (category && category.key !== 'stage' && category.key !== 'music') {
        expect(html).toMatch(/<fieldset[^>]*hidden[^>]*data-day-filter/)
        expect(html).not.toContain('data-poster-toolbar')
        expect(html.match(/<main[^>]*>/)?.[0]).toContain('xl:py-20')
      }
      expect(html).toContain('Filtrar artistas por día')
      expect(html.match(/type="radio"/g)).toHaveLength(3)
      expect(html).toContain('Todos'); expect(html).toContain('Sábado 28'); expect(html).toContain('Domingo 29')
      expect(html).toContain('role="status"')
    }
  })
  it.each([undefined, ...categories.filter(({ key }) => key === 'music' || key === 'stage')])('renders the in-flow presentation panel before the poster ($key)', async category => {
    const container = await AstroContainer.create()
    const html = await container.renderToString(PosterGrid, { props: { category } })
    const panel = html.match(/<fieldset[^>]*data-day-filter[^>]*>([\s\S]*?)<\/fieldset>/)!
    expect(panel.index).toBeLessThan(html.indexOf('data-poster-grid'))
    expect(panel[0]).toMatch(/\bmb-\d+\b/)
    const openingTag = panel[0].slice(0, panel[0].indexOf('>'))
    expect(openingTag).toContain('data-poster-toolbar')
    expect(openingTag).toMatch(/\sdisabled(?:\s|$)/)
    expect(openingTag).not.toMatch(/\shidden(?:\s|$)/)
    expect(html.match(/<main[^>]*>/)?.[0]).toContain('pt-3')
    if (category) expect(panel.index).toBeLessThan(html.indexOf('Ruta de navegación'))
    expect(panel[0]).not.toMatch(/\b(?:fixed|bottom-)\b/)
    expect(panel[0]).toContain('hidden md:flex')
    expect(panel[0]).toContain('md:hidden')
    expect(panel[1]).toMatch(/<label[^>]*>[\s\S]*?Ordenar por[\s\S]*?<select[^>]*data-poster-sort[^>]*>/)
    expect([...(panel[1].match(/<select[^>]*data-poster-sort[^>]*>([\s\S]*?)<\/select>/)?.[1] ?? '').matchAll(/<option value="([^"]*)"[^>]*>([^<]+)<\/option>/g)].map(match => match.slice(1))).toEqual([
      ['', 'Original'], ['time', 'Horario'], ['location', 'Escenario'],
    ])
    expect(panel[1]).toMatch(/<label[^>]*>[\s\S]*?Día[\s\S]*?<select[^>]*data-poster-day-select[^>]*>/)
    const daySelect = panel[1].match(/<select[^>]*data-poster-day-select[^>]*>([\s\S]*?)<\/select>/)?.[1] ?? ''
    expect([...daySelect.matchAll(/<option value="([^"]*)"[^>]*>([^<]+)<\/option>/g)].map(match => match.slice(1))).toEqual([
      ['all', 'Todos'], ['saturday', 'Sábado 28'], ['sunday', 'Domingo 29'],
    ])
    expect(panel[1]).toMatch(/<button[^>]*type="button"[^>]*data-poster-simple-toggle[^>]*aria-pressed="false"[^>]*>\s*<svg[^>]*aria-hidden="true"[\s\S]*?<\/svg>\s*<span[^>]*>Vista simple<\/span>\s*<\/button>/)
    expect(panel[1]).not.toContain('type="checkbox"')
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
