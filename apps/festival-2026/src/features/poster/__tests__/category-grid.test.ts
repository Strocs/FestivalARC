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
  it('renders the original homepage intro and 4×2 opening tiles before hydration', async () => {
    const html = await render()
    const intro = html.match(/<div\b[^>]*data-poster-information="intro"[^>]*>/)?.[0]
    expect(intro).toContain('--mobile-column:0;--mobile-row:0;--mobile-width:8;--mobile-height:4')
    const tiles = [...html.matchAll(/<div\b[^>]*data-poster-motif="[^"]+"[^>]*>/g)].map(([tag]) => tag)
    const opening = tiles.filter(tag => tag.includes('--mobile-display:block') && /--mobile-row:[0-7];/.test(tag))
    expect(opening).toHaveLength(8)
    for (const row of [4, 6]) for (const column of [0, 2, 4, 6]) {
      expect(opening.some(tag => tag.includes(`--mobile-column:${column};--mobile-row:${row};--mobile-width:2;--mobile-height:2`))).toBe(true)
    }
  })
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
    expect(ids).toEqual([...new Set(ids)])
    expect(ids.length).toBeGreaterThan(0)
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
  it.each(['market', 'expo'] as const)('renders the %s heading, venue and escaped introduction before the grid', async key => {
    const category = categories.find(category => category.key === key)!
    const html = await render({ ...category, description: '<em>Fixture introduction</em>' })
    const header = html.match(/<header\b[^>]*>[\s\S]*?<\/header>/)?.[0] ?? ''
    const heading = header.match(/<h1[^>]*id="page-title"[^>]*>([\s\S]*?)<\/h1>/)?.[1] ?? ''
    expect(heading.replace(/<[^>]+>/g, '').trim()).toBe(category.name)
    expect(header).toMatch(/<\/h1>\s*<p[^>]*font-bold[^>]*>[^<\s][^<]*<\/p>/)
    expect(header).toMatch(/<\/p>\s*<p[^>]*>&lt;em&gt;Fixture introduction&lt;\/em&gt;<\/p>/)
    expect(html.indexOf(header)).toBeLessThan(html.indexOf('data-poster-grid'))
  })

  it.each([0, 1, 2, 3])('renders category %i with only its members and actual title, without absent information reservations', async index => {
    const category = categories[index]
    const html = await render(category)
    const performerCategory = category.key === 'music' || category.key === 'stage'
    const expectedTriggers = category.participants
      .filter(({ description, socialLinks, website }) => performerCategory || description?.trim() || socialLinks?.instagram?.length || socialLinks?.spotify || website)
      .map(({ id }) => id)
    expect(triggerIds(html)).toEqual(expectedTriggers)
    expect(html.match(/<dialog\b/g) ?? []).toHaveLength(expectedTriggers.length ? 1 : 0)
    expect([...html.matchAll(/data-event-template="([^"]+)"/g)].map(match => match[1])).toEqual(expectedTriggers)
    expect(html.match(/<h1\b/g)).toHaveLength(1)
    if (!performerCategory) {
      const heading = html.match(/<h1\b[\s\S]*?<\/h1>/)?.[0] ?? ''
      expect(heading).toContain('text-primary')
      expect(heading).toContain('text-accent')
    } else {
      expect(html).toContain(`>${category.name}</h1>`)
    }
    const title = performerCategory ? createCategoryTitle(category.name) : { information: [] }
    expect(html.match(/information-slot/g) ?? []).toHaveLength(title.information.length)
    expect(html).not.toMatch(/data-poster-information="(?:intro|place|socials|disciplines)"/)
    const ids = category.participants.map(({ id }) => id)
    expect([...html.matchAll(/data-poster-artist="([^"]+)"/g)].map(match => match[1])).toEqual(ids)
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
    const category = categories.find(category => category.key === 'expo')!
    const html = await render({ ...category, participants: [] })
    expect(triggerIds(html)).toEqual([])
    expect(html.match(/information-slot/g) ?? []).toHaveLength(0)
    const heading = html.match(/<h1[^>]*id="page-title"[^>]*>([\s\S]*?)<\/h1>/)?.[1] ?? ''
    expect(heading.replace(/<[^>]+>/g, '').trim()).toBe(category.name)
    expect(html).not.toContain('pattern-slot')
  })

  it('preserves the homepage mixed roster, title, information and original static footprints', async () => {
    const html = await render()
    expect(triggerIds(html)).toEqual(heroParticipants.map(({ id }) => id))
    expect(html.match(/<dialog\b/g)).toHaveLength(1)
    expect(html.match(/data-event-template=/g)).toHaveLength(heroParticipants.length)
    expect(html).toMatch(/<h1\b[^>]*id="page-title"[^>]*aria-label="[^"]+"/)
    expect(html).toContain('--desktop-column:6;--desktop-row:5;--desktop-width:4;--desktop-height:3')
    expect(html).toMatch(/--mobile-column:\d+;--mobile-row:\d+;--mobile-width:\d+;--mobile-height:\d+/)
    expect(html).toContain('Instagram')
    expect(html.match(/data-event-trigger/g)).toHaveLength(heroParticipants.length)
    const categoryBox = html.match(/<aside\b[^>]*aria-label="Categorías"[\s\S]*?<\/aside>/)?.[0] ?? ''
    expect(categoryBox.match(/<a\b/g)).toHaveLength(4)
    for (const category of categories) {
      expect(categoryBox).toContain(`href="${category.key === 'music' ? '/musica' : category.path}"`)
      expect(categoryBox).toContain(`>${category.name}</span>`)
    }
    // Every retained home information footprint remains represented in all ranges.
    const plans = JSON.parse(html.match(/<script type="application\/json" data-poster-plans>([\s\S]*?)<\/script>/)![1])
    expect(plans.plans.all.ids).toEqual(triggerIds(html))
    expect(plans.plans.all.information.mobile).toBeDefined()
  })
})
