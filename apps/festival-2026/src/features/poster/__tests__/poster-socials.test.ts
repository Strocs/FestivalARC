import { experimental_AstroContainer as AstroContainer } from 'astro/container'
import { describe, expect, it } from 'vitest'
import PosterSocials from '../PosterSocials.astro'
import PosterProgram from '../PosterProgram.astro'

const networks = ['instagram', 'facebook', 'twitter'] as const
const props = {
  instagram: { mobile: { column: 0, row: 28, width: 3, height: 1 } },
  facebook: { mobile: { column: 0, row: 34, width: 3, height: 1 } },
  twitter: { mobile: { column: 0, row: 40, width: 3, height: 1 } },
}

describe('PosterSocials', () => {
  it('renders three independent footprints with page-authored placement and placeholder links', async () => {
    const container = await AstroContainer.create()
    const html = await container.renderToString(PosterSocials, { props })
    expect(html.match(/information-slot/g)).toHaveLength(3)
    const links = html.match(/<a\b[\s\S]*?<\/a>/g) ?? []
    expect(links).toHaveLength(3)
    for (const [index, network] of networks.entries()) {
      expect(links[index]).toContain(`aria-label="${network[0].toUpperCase() + network.slice(1)}"`)
      expect(links[index]).toContain('href="#"')
      expect(links[index]).toContain('target="_blank"')
      expect(links[index]).toContain('rel="noopener noreferrer"')
      expect(links[index]).toContain("M8 42H65L42 18H64L94 50 64 82H42L65 58H8Z")
      expect(html).toContain(`--mobile-row:${props[network].mobile.row}`)
    }
    expect(html).not.toContain('--tablet-display:grid')
    expect(html).not.toContain('--desktop-display:grid')
  })

  it('preserves the program link and its decorative arrow after extraction', async () => {
    const container = await AstroContainer.create()
    const html = await container.renderToString(PosterProgram, {
      props: { mobile: { column: 0, row: 22, width: 3, height: 1 } },
    })
    expect(html).toContain('href="/programacion"')
    expect(html).toContain('aria-label="Programación"')
    expect(html).not.toContain('target="_blank"')
    expect(html).toContain('MACIÓN')
    expect(html).toContain('M8 42H65L42 18H64L94 50 64 82H42L65 58H8Z')
    expect(html).toContain('aria-hidden="true"')
    expect(html).toContain('group-hover/program:-rotate-45')
  })
})
