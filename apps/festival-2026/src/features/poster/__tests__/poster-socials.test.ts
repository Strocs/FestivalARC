import { experimental_AstroContainer as AstroContainer } from 'astro/container'
import { describe, expect, it } from 'vitest'
import PosterSocials from '../PosterSocials.astro'
import PosterProgram from '../PosterProgram.astro'

const networks = ['instagram', 'facebook', 'twitter'] as const
const destinations = [
  'https://www.instagram.com/festival_arc',
  'https://www.facebook.com/FestivalARC',
  'https://x.com/FestivalARC',
]
const props = {
  placement: {
    desktop: { column: 7, row: 18, width: 3, height: 2 },
    tablet: { column: 3, row: 28, width: 3, height: 2 },
    mobile: { column: 0, row: 112, width: 8, height: 2 },
  },
  informationId: 'socials',
}

describe('PosterSocials', () => {
  it('renders one combined 3-by-3 desktop footprint with left-aligned official links', async () => {
    const container = await AstroContainer.create()
    const html = await container.renderToString(PosterSocials, { props })
    expect(html.match(/information-slot/g)).toHaveLength(1)
    expect(html).toContain('data-poster-information="socials"')
    expect(html).toContain('--desktop-column:7;--desktop-row:18;--desktop-width:3;--desktop-height:2')
    expect(html).toContain('--tablet-column:3;--tablet-row:28;--tablet-width:3;--tablet-height:2')
    expect(html).toContain('--mobile-column:0;--mobile-row:112;--mobile-width:8;--mobile-height:2')
    const links = html.match(/<a\b[\s\S]*?<\/a>/g) ?? []
    expect(links).toHaveLength(3)
    for (const [index, network] of networks.entries()) {
      expect(links[index]).toContain(`aria-label="${network === 'twitter' ? 'X' : network[0].toUpperCase() + network.slice(1)}"`)
      expect(links[index]).toContain(`href="${destinations[index]}"`)
      expect(links[index]).toContain('target="_blank"')
      expect(links[index]).toContain('rel="noopener noreferrer"')
      expect(links[index]).toContain('justify-start')
      expect(links[index]).toContain('text-[length:clamp(1rem,calc(0.5rem+7cqw),3rem)]')
      expect(links[index]).toContain("M8 42H65L42 18H64L94 50 64 82H42L65 58H8Z")
    }
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
