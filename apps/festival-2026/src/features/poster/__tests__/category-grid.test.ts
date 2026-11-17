import { experimental_AstroContainer as AstroContainer } from 'astro/container'
import { describe, expect, it } from 'vitest'
import PosterGrid from '../PosterGrid.astro'
import { categories, heroParticipants } from '../../artists/categories'
import { calculatePosterLayout } from '../poster-grid'
import { selectPosterMotifs } from '../poster-motif-distribution'
import { createCategoryTitle } from '../category-title'
import type { PosterFilterPlans } from '../poster-filter-layout'

async function render(category?: (typeof categories)[number]) {
  const container = await AstroContainer.create()
  return container.renderToString(PosterGrid, { props: category ? { category } : {} })
}

const triggerIds = (html: string) => [...html.matchAll(/data-event-id="([^"]+)"/g)].map(match => match[1])

describe('shared poster scopes', () => {
  it('omits the homepage Programación link and information slot', async () => {
    const html = await render()
    expect(html).not.toMatch(/<a\b[^>]*href="\/programacion\/?"/)
    expect(html).not.toContain('data-poster-information="program"')
  })
  it('exposes stable actual-grid hooks and narrow escaped inert plans without changing modal triggers', async () => {
    const html = await render()
    expect(html.includes('data-poster-grid')).toBe(true)
    expect([...html.matchAll(/data-poster-artist="([^"]+)"/g)].map(m => m[1])).toEqual(heroParticipants.map(p => p.id))
    const ids = [...html.matchAll(/data-poster-information="([^"]+)"/g)].map(m => m[1])
    expect(ids.sort()).toEqual(['intro', 'title-extension', 'disciplines', 'place', 'instagram', 'facebook', 'twitter'].sort())
    expect(new Set(ids).size).toBe(ids.length)
    const json = html.match(/<script type="application\/json" data-poster-plans>([\s\S]*?)<\/script>/)?.[1]
    expect(json).toBeDefined()
    const plans: PosterFilterPlans = JSON.parse(json!)
    expect(plans.available).toBe(true)
    expect(plans.plans.all.ids).toEqual(triggerIds(html))
    expect([...html.matchAll(/data-poster-motif="([^"]+)"/g)].map(m => m[1])).toEqual(plans.plans.all.motifs.map(m => m.variant))
    expect(json).not.toMatch(/description|ticketUrl|company|national|astro\/zod/)
    // Unknown day strings survive Todos but cannot terminate the inert JSON node.
    const unsafe = await render({ ...categories[2], participants: [{ ...categories[2].participants[0], date: { day: '</script><script>bad()</script>', time: '23:00' } }] })
    const unsafeJson = unsafe.match(/<script type="application\/json" data-poster-plans>([\s\S]*?)<\/script>/)?.[1]
    expect(unsafeJson).not.toContain('<')
    expect(JSON.parse(unsafeJson!).available).toBe(false)
    expect(JSON.parse(unsafeJson!).participants[0].day).toBe('</script><script>bad()</script>')
    for (const markup of [html, await render(categories[0]), unsafe]) {
      const metadata = JSON.parse(markup.match(/<script type="application\/json" data-poster-plans>([\s\S]*?)<\/script>/)![1])
      const boxes = [...markup.matchAll(/<div\b[^>]*data-poster-information="([^"]+)"[^>]*>/g)]
      for (const [range, rectangles] of Object.entries(metadata.plans.all.information) as [string, Record<string, { column: number; row: number; width: number; height: number }> ][]) {
        for (const box of boxes) {
          const rect = rectangles[box[1]]
          expect(box[0]).toContain(`--${range}-display:${rect ? 'grid' : 'none'}`)
          if (rect) expect(box[0]).toContain(`--${range}-column:${rect.column};--${range}-row:${rect.row};--${range}-width:${rect.width};--${range}-height:${rect.height}`)
        }
        expect(Object.keys(rectangles).sort()).toEqual(boxes.map(box => box[1]).filter(id => id !== 'title-extension' || range !== 'mobile').sort())
      }
    }
    expect(html).toContain('Filtrar artistas por día')
  })
  it.each([0, 1, 2, 3])('renders category %i with only its members and actual title, without absent information reservations', async index => {
    const category = categories[index]
    const html = await render(category)
    expect(triggerIds(html)).toEqual(category.participants.map(({ id }) => id))
    expect(html.match(/<dialog\b/g)).toHaveLength(1)
    expect([...html.matchAll(/data-event-template="([^"]+)"/g)].map(match => match[1])).toEqual(category.participants.map(({ id }) => id))
    expect(html.match(/<h1\b/g)).toHaveLength(1)
    expect(html).toContain(`>${category.name}</h1>`)
    expect(html.match(/information-slot/g)).toHaveLength(createCategoryTitle(category.name).information.length)
    expect(html).not.toContain('El arte de habitar la ciudad')
    expect(html).not.toContain('28.11')
    expect(html).not.toContain('https://www.instagram.com/festivalarc')
    if (category.key === 'music') expect(html).toContain('aria-label="Instagram de Niño Cohete"')
    expect(html).not.toContain('Disciplinas')
    const ids = category.participants.map(({ id }) => id)
    const title = createCategoryTitle(category.name)
    const layouts = (['desktop', 'tablet', 'mobile'] as const).map(range =>
      calculatePosterLayout(ids, range === 'desktop' ? 10 : range === 'tablet' ? 6 : 8,
        title.information.map(block => block.positions[range]!)))
    for (const [index, range] of ['desktop', 'tablet', 'mobile'].entries()) {
      expect(html).toContain(`--${range}-rows:${layouts[index].rows}`)
      for (const artist of layouts[index].artists) {
        expect(html).toContain(`--${range}-column:${artist.column};--${range}-row:${artist.row};--${range}-width:${artist.width};--${range}-height:${artist.height}`)
        expect(layouts[index].rows).toBeGreaterThanOrEqual(artist.row + artist.height)
        for (let column = artist.column; artist.row + artist.height < layouts[index].rows && column < artist.column + artist.width; column++) {
          expect(layouts[index].motifs).toContainEqual({ column, row: artist.row + artist.height, width: 1, height: 1 })
        }
      }
    }
    const motifs = selectPosterMotifs(layouts)
    expect(html.match(/class="[^"]*pattern-slot/g)).toHaveLength(motifs.length)
    expect(html).toContain('data-artist-surface')
    expect(html).toContain('aspect-[160/152]')
  })

  it('keeps an empty category to its real heading without invented events or home holes', async () => {
    const html = await render({ ...categories[2], participants: [] })
    expect(triggerIds(html)).toEqual([])
    const title = createCategoryTitle(categories[2].name)
    expect(html.match(/information-slot/g)).toHaveLength(title.information.length)
    for (const range of ['mobile', 'tablet', 'desktop'] as const) {
      expect(html).toContain(`--${range}-rows:${title.lines.length * (range === 'mobile' ? 2 : 1)}`)
    }
    expect(html).toContain('pattern-slot')
  })

  it('preserves the homepage mixed roster, title, information and original static footprints', async () => {
    const html = await render()
    expect(triggerIds(html)).toEqual(heroParticipants.map(({ id }) => id))
    expect(html.match(/<dialog\b/g)).toHaveLength(1)
    expect(html.match(/data-event-template=/g)).toHaveLength(heroParticipants.length)
    expect(html).toContain('aria-label="El arte de habitar la ciudad"')
    expect(html).toContain('--desktop-column:6;--desktop-row:5;--desktop-width:4;--desktop-height:3')
    expect(html).toContain('--mobile-column:0;--mobile-row:168;--mobile-width:8;--mobile-height:2')
    expect(html).toContain('--mobile-column:0;--mobile-row:8;--mobile-width:8;--mobile-height:2')
    expect(html).toContain('Instagram')
    expect(html.match(/data-event-trigger/g)).toHaveLength(46)
    const categoryBox = html.match(/<aside\b[^>]*aria-label="Categorías"[\s\S]*?<\/aside>/)?.[0] ?? ''
    expect(categoryBox.match(/<a\b/g)).toHaveLength(4)
    for (const category of categories) {
      expect(categoryBox).toContain(`href="${category.path}"`)
      expect(categoryBox).toContain(`>${category.name}</span>`)
    }
    // Every retained home information footprint remains represented in all ranges.
    const originalInformation = {
      desktop: [[0, 0, 3, 4], [3, 1, 1, 2], [6, 5, 4, 3], [6, 13, 3, 2], [1, 18, 3, 1], [6, 20, 3, 1], [1, 22, 3, 1]],
      tablet: [[0, 0, 3, 4], [3, 1, 1, 2], [3, 7, 3, 3], [3, 18, 3, 2], [3, 28, 3, 1], [0, 32, 3, 1], [3, 36, 3, 1]],
      mobile: [[0, 0, 4, 2], [0, 12, 4, 2], [0, 36, 4, 1], [0, 56, 4, 1], [0, 70, 4, 2], [0, 84, 4, 1]],
    }
    for (const [range, rectangles] of Object.entries(originalInformation)) {
      const information = rectangles.map(([column, row, width, height]) => {
        const scale = range === 'mobile' ? 2 : 1
        return { column: column * scale, row: row * scale, width: width * scale, height: height * scale }
      })
      const columns = range === 'desktop' ? 10 : range === 'tablet' ? 6 : 8
      const layout = calculatePosterLayout(heroParticipants.map(({ id }) => id), columns, information, [], range === 'mobile' ? 8 : 0)
      expect(html).toContain(`--${range}-rows:${layout.rows}`)
      for (const { column, row, width, height } of [...information, ...layout.artists]) {
        expect(html).toContain(`--${range}-column:${column};--${range}-row:${row};--${range}-width:${width};--${range}-height:${height}`)
      }
    }
  })
})
