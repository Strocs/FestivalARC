import { experimental_AstroContainer as AstroContainer } from 'astro/container'
import { describe, expect, it } from 'vitest'
import PosterGrid from '../PosterGrid.astro'
import { categories, heroParticipants } from '../../artists/categories'
import { calculatePosterLayout } from '../poster-grid'
import { selectPosterMotifs } from '../poster-motif-distribution'

async function render(category?: (typeof categories)[number]) {
  const container = await AstroContainer.create()
  return container.renderToString(PosterGrid, { props: category ? { category } : {} })
}

const triggerIds = (html: string) => [...html.matchAll(/data-event-id="([^"]+)"/g)].map(match => match[1])

describe('shared poster scopes', () => {
  it.each([0, 1, 2, 3])('renders category %i with only its members and actual title, without absent information reservations', async index => {
    const category = categories[index]
    const html = await render(category)
    expect(triggerIds(html)).toEqual(category.participants.map(({ id }) => id))
    expect(html.match(/<dialog\b/g)).toHaveLength(1)
    expect([...html.matchAll(/data-event-template="([^"]+)"/g)].map(match => match[1])).toEqual(category.participants.map(({ id }) => id))
    expect(html.match(/<h1\b/g)).toHaveLength(1)
    expect(html).toContain(`>${category.name}</h1>`)
    expect(html.match(/information-slot/g)).toHaveLength(1)
    expect(html).not.toContain('El arte de habitar la ciudad')
    expect(html).not.toContain('28.11')
    expect(html).not.toContain('Instagram')
    expect(html).not.toContain('Disciplinas')
    const ids = category.participants.map(({ id }) => id)
    const layouts = [calculatePosterLayout(ids, 10, [{ column: 0, row: 0, width: 4, height: 4 }]), calculatePosterLayout(ids, 6, [{ column: 0, row: 0, width: 3, height: 4 }]), calculatePosterLayout(ids, 4, [{ column: 0, row: 0, width: 4, height: 2 }])]
    for (const [index, range] of ['desktop', 'tablet', 'mobile'].entries()) {
      expect(html).toContain(`--${range}-rows:${layouts[index].rows}`)
      // Tablet/desktop start beside the real title, not below a full-width band.
      const first = layouts[index].artists[0]
      expect(first).toMatchObject(range === 'mobile' ? { column: 0, row: 2 } : { column: 4, row: 0 })
      for (const artist of layouts[index].artists) {
        expect(html).toContain(`--${range}-column:${artist.column};--${range}-row:${artist.row};--${range}-width:${artist.width};--${range}-height:1`)
        const title = { column: 0, row: 0, width: range === 'desktop' ? 4 : range === 'tablet' ? 3 : 4, height: range === 'mobile' ? 2 : 4 }
        expect(artist.column >= title.width || artist.row >= title.height).toBe(true)
        expect(layouts[index].rows).toBeGreaterThanOrEqual(artist.row + 2)
        for (let column = artist.column; column < artist.column + artist.width; column++) {
          expect(layouts[index].motifs).toContainEqual({ column, row: artist.row + 1, width: 1, height: 1 })
        }
      }
      expect(layouts[index].motifs.some(cell => cell.row === 0 && cell.column >= (range === 'desktop' ? 4 : 3))).toBe(range !== 'mobile')
    }
    const motifs = selectPosterMotifs(layouts)
    expect(html.match(/class="[^"]*pattern-slot/g)).toHaveLength(motifs.length)
    expect(html).toContain('data-artist-surface')
    expect(html).toContain('aspect-[160/152]')
  })

  it('keeps an empty category to its real heading without invented events or home holes', async () => {
    const html = await render({ ...categories[2], participants: [] })
    expect(triggerIds(html)).toEqual([])
    expect(html.match(/information-slot/g)).toHaveLength(1)
    expect(html).toContain('--mobile-rows:2')
    for (const range of ['tablet', 'desktop']) expect(html).toContain(`--${range}-rows:4`)
    expect(html).toContain('pattern-slot') // real adjacent cells still receive motifs
    expect(html).toContain('--desktop-width:4;--desktop-height:4')
    expect(html).toContain('--tablet-width:3;--tablet-height:4')
  })

  it('preserves the homepage mixed roster, title, information and original static footprints', async () => {
    const html = await render()
    expect(triggerIds(html)).toEqual(heroParticipants.map(({ id }) => id))
    expect(html.match(/<dialog\b/g)).toHaveLength(1)
    expect(html.match(/data-event-template=/g)).toHaveLength(heroParticipants.length)
    expect(html).toContain('aria-label="El arte de habitar la ciudad"')
    expect(html).toContain('--desktop-column:6;--desktop-row:5;--desktop-width:4;--desktop-height:3')
    expect(html).toContain('--mobile-column:0;--mobile-row:84;--mobile-width:4;--mobile-height:1')
    expect(html).toContain('--mobile-column:0;--mobile-row:4;--mobile-width:4;--mobile-height:1')
    expect(html).toContain('Instagram')
    expect(html.match(/data-event-trigger/g)).toHaveLength(46)
    const categoryBox = html.match(/<aside\b[^>]*aria-label="Categorías"[\s\S]*?<\/aside>/)?.[0] ?? ''
    expect(categoryBox.match(/<a\b/g)).toHaveLength(4)
    for (const category of categories) {
      expect(categoryBox).toContain(`href="${category.path}"`)
      expect(categoryBox).toContain(`>${category.name}</span>`)
    }
    // Every original home information footprint remains represented in all ranges.
    const originalInformation = {
      desktop: [[0, 0, 3, 4], [3, 1, 1, 2], [0, 9, 3, 1], [6, 5, 4, 3], [6, 13, 3, 2], [1, 18, 3, 1], [6, 20, 3, 1], [1, 22, 3, 1]],
      tablet: [[0, 0, 3, 4], [3, 1, 1, 2], [0, 11, 3, 1], [3, 7, 3, 3], [3, 18, 3, 2], [3, 28, 3, 1], [0, 32, 3, 1], [3, 36, 3, 1]],
      mobile: [[0, 0, 4, 2], [0, 22, 4, 1], [0, 12, 4, 2], [0, 36, 4, 1], [0, 56, 4, 1], [0, 70, 4, 2], [0, 84, 4, 1]],
    }
    for (const [range, rectangles] of Object.entries(originalInformation)) {
      const information = rectangles.map(([column, row, width, height]) => ({ column, row, width, height }))
      const columns = range === 'desktop' ? 10 : range === 'tablet' ? 6 : 4
      const layout = calculatePosterLayout(heroParticipants.map(({ id }) => id), columns, information, [], range === 'mobile' ? 4 : 0)
      expect(html).toContain(`--${range}-rows:${layout.rows}`)
      for (const { column, row, width, height } of [...information, ...layout.artists]) {
        expect(html).toContain(`--${range}-column:${column};--${range}-row:${row};--${range}-width:${width};--${range}-height:${height}`)
      }
    }
  })
})
