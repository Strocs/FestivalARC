import { experimental_AstroContainer as AstroContainer } from 'astro/container'
import { describe, expect, it } from 'vitest'
import PosterInformation from '../PosterInformation.astro'
import PosterIntro from '../PosterIntro.astro'
import PosterProgram from '../PosterProgram.astro'
import PosterDisciplines from '../PosterDisciplines.astro'
import { categories } from '../../artists/categories'
import { measureArtistName } from '../artist-name'
import { posterProgramPlacement, posterDisciplinesPlacement, posterIntroPlacement, posterTitleExtensionPlacement } from '../poster'

describe('PosterInformation', () => {
  it('fits whole category labels after padding and the reusable rotating arrow, without underlines', async () => {
    const container = await AstroContainer.create()
    const before = structuredClone(categories)
    const html = await container.renderToString(PosterDisciplines, { props: posterDisciplinesPlacement })
    const links = [...html.matchAll(/<a\b[\s\S]*?<\/a>/g)].map(match => match[0])
    expect(links).toHaveLength(4)
    expect(html).toContain('@container')
    expect(html).toContain('md:whitespace-nowrap')
    expect(html).not.toContain('underline')
    const fits = links.map((link, index) => {
      const path = categories[index].key === 'music' ? '/musica' : categories[index].path
      expect(link).toContain(`href="${path}"`)
      expect(link).toContain(`>${categories[index].name}</span>`)
      expect(link).toContain('focus-visible:outline-2')
      expect(link).toContain('group-hover/category:-rotate-45')
      expect(link).toContain('group-focus-visible/category:-rotate-45')
      expect(link).toContain('aria-hidden="true"')
      expect(link).toContain('focusable="false"')
      expect(link.match(/<svg\b/g)).toHaveLength(1)
      expect(link).toContain('M8 42H65L42 18H64L94 50 64 82H42L65 58H8Z')
      const fit = Number(link.match(/--category-fit:([\d.]+)/)?.[1])
      expect(fit).toBeCloseTo(0.9 / measureArtistName(categories[index].name), 6)
      // The list is unpadded on mobile and has 24px on each side from md.
      for (const [width, horizontalPadding] of [[288, 0], [384, 0], [768, 48]]) {
        const available = width - horizontalPadding
        const arrow = Math.min(80, Math.max(32, available * 0.12))
        const font = (available - arrow - 12) * fit
        expect(font * measureArtistName(categories[index].name)).toBeLessThan(available - arrow - 12)
      }
      return fit
    })
    expect(fits[0]).toBeGreaterThan(fits[3])
    expect(categories).toEqual(before)
    expect(html).toContain('100cqw-clamp(2rem,12cqw,5rem)-0.75rem')
  })

  it.each([PosterProgram, PosterDisciplines, PosterIntro])('does not invent geometry for omitted ranges', async component => {
    const container = await AstroContainer.create()
    const html = await container.renderToString(component, {
      props: { mobile: { column: 0, row: 2, width: 3, height: 1 } },
    })
    expect(html).toContain('--mobile-row:2')
    expect(html).not.toContain('--tablet-display:grid')
    expect(html).not.toContain('--desktop-display:grid')
  })

  it('passes page-authored geometry through PosterIntro without exposing its markup', async () => {
    const container = await AstroContainer.create()
    const html = await container.renderToString(PosterIntro, {
      props: {
        mobile: { column: 0, row: 3, width: 3, height: 2 },
        titleExtension: { desktop: { column: 4, row: 2, width: 1, height: 2 } },
      },
    })
    expect(html).toContain('--mobile-column:0;--mobile-row:3;--mobile-width:3;--mobile-height:2')
    expect(html).toContain('--desktop-column:4;--desktop-row:2;--desktop-width:1;--desktop-height:2')
    expect(html.match(/<h1 /g)).toHaveLength(1)
  })

  it('lets PosterIntro own the heading footprint and its adjacent empty reservation', async () => {
    const container = await AstroContainer.create()
    const html = await container.renderToString(PosterIntro, {
      props: { ...posterIntroPlacement, titleExtension: posterTitleExtensionPlacement },
    })
    expect(html.match(/class="[^"]*information-slot/g)).toHaveLength(2)
    expect(html).toContain('aria-hidden="true"')
    expect(html).toContain('--desktop-column:3;--desktop-row:1;--desktop-width:1;--desktop-height:2')
    expect(html).toContain('--mobile-column:0;--mobile-row:0;--mobile-width:4;--mobile-height:2')
    expect(html.match(/<h1\b/g)).toHaveLength(1)
    expect(html).toContain('28 y 29 de noviembre de 2026')
  })

  it.each([
    [PosterProgram, 'program', 'Programación'],
    [PosterDisciplines, 'disciplines', 'Categorías'],
  ] as const)('preserves %s accessible labelling and reserved responsive geometry', async (component, id, label) => {
    const container = await AstroContainer.create()
    const html = await container.renderToString(component, {
      props: id === 'program' ? posterProgramPlacement : posterDisciplinesPlacement,
    })
    expect(html).toContain(`aria-label="${label}"`)
    for (const [range, rect] of Object.entries(id === 'program' ? posterProgramPlacement : posterDisciplinesPlacement)) {
      expect(rect).toBeDefined()
      for (const field of ['column', 'row', 'width', 'height'] as const) {
        expect(html).toContain(`--${range}-${field}:${rect![field]}`)
      }
    }
  })

  it('accepts independent geometry overrides in content wrappers', async () => {
    const container = await AstroContainer.create()
    const html = await container.renderToString(PosterProgram, {
      props: { mobile: { column: 1, row: 3, width: 2, height: 4 } },
    })
    expect(html).toContain('--mobile-column:1;--mobile-row:3;--mobile-width:2;--mobile-height:4')
    expect(html).toContain('aria-label="Programación"')
  })

  it('renders arbitrary slot content without selecting a content kind', async () => {
    const container = await AstroContainer.create()
    const html = await container.renderToString(PosterInformation, {
      props: { mobile: { column: 0, row: 2, width: 3, height: 1 } },
      slots: { default: '<p>Contenido independiente</p>' },
    })
    expect(html).toContain('<p>Contenido independiente</p>')
    expect(html).not.toContain('Disciplinas')
    expect(html).not.toContain('Programación')
    expect(html).toContain('--mobile-column:0')
    expect(html).toContain('--mobile-row:2')
    expect(html).toContain('--mobile-width:3')
    expect(html).toContain('--mobile-height:1')
    expect(html).toContain('--tablet-display:none')
    expect(html).toContain('--desktop-display:none')
    expect(html).not.toContain('data-poster-information')
    const identified = await container.renderToString(PosterInformation, {
      props: { informationId: 'custom', mobile: { column: 0, row: 2, width: 3, height: 1 } },
      slots: { default: '<p>Contenido independiente</p>' },
    })
    expect(identified.replace(' data-poster-information="custom"', '')).toBe(html)
  })
})
