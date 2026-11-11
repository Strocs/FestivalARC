import { experimental_AstroContainer as AstroContainer } from 'astro/container'
import { describe, expect, it } from 'vitest'
import PosterInformation from '../PosterInformation.astro'
import PosterIntro from '../PosterIntro.astro'
import PosterProgram from '../PosterProgram.astro'
import PosterDisciplines from '../PosterDisciplines.astro'
import { posterProgramPlacement, posterDisciplinesPlacement, posterIntroPlacement, posterTitleExtensionPlacement } from '../poster'

describe('PosterInformation', () => {
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
    expect(html).toContain('--mobile-column:0;--mobile-row:0;--mobile-width:3;--mobile-height:2')
    expect(html.match(/<h1\b/g)).toHaveLength(1)
    expect(html).toContain('28 y 29 de noviembre de 2026')
  })

  it.each([
    [PosterProgram, 'program', 'Programación', 'MACIÓN'],
    [PosterDisciplines, 'disciplines', 'Disciplinas', 'Artes visuales'],
  ] as const)('preserves %s content and reserved responsive geometry', async (component, id, label, content) => {
    const container = await AstroContainer.create()
    const html = await container.renderToString(component, {
      props: id === 'program' ? posterProgramPlacement : posterDisciplinesPlacement,
    })
    expect(html).toContain(`aria-label="${label}"`)
    expect(html).toContain(content)
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
  })
})
