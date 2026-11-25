import { experimental_AstroContainer as AstroContainer } from 'astro/container'
import { describe, expect, it } from 'vitest'
import ArtistDetail from '../ArtistDetail.astro'
import type { ParticipantView } from '../categories'

const fixture: ParticipantView = {
  id: 'fixture',
  name: 'Fixture performer',
  category: 'music',
  canonicalPath: '/musica/fixture/',
  description: '',
  date: { day: 'Day', time: '12:00' },
  image: null,
  ticketUrl: null,
}

async function render(override: Partial<ParticipantView> = {}, modal = false) {
  const container = await AstroContainer.create()
  return container.renderToString(ArtistDetail, {
    props: { artist: { ...fixture, ...override }, modal },
  })
}

describe('artist detail rendering', () => {
  it.each([false, true])('renders a supplied video and social links (modal: %s)', async modal => {
    const artist = {
      ...fixture,
      youtubeVideoId: 'AbCdEf12345',
      socialLinks: {
        instagram: 'https://www.instagram.com/example/',
        spotify: 'https://open.spotify.com/artist/example',
      },
    }
    const container = await AstroContainer.create()
    const html = await container.renderToString(ArtistDetail, { props: { artist, modal } })
    expect(html).toContain('https://www.youtube-nocookie.com/embed/AbCdEf12345')
    expect(html).toContain('https://www.instagram.com/example/')
    expect(html).toContain('https://open.spotify.com/artist/example')
    expect(html).toContain('aria-label="Redes sociales de Fixture performer"')
  })

  it('renders optional audience and duration details in page and modal views', async () => {
    for (const modal of [false, true]) {
      const html = await render({ audienceType: 'Fixture audience', durationMinutes: 45 }, modal)
      expect(html).toContain('Fixture audience')
      expect(html).toContain('45 minutos')
    }
  })

  it('renders optional performer details only when supplied', async () => {
    const html = await render({ description: 'Fixture biography', company: 'Fixture company' })
    expect(html).toContain('Fixture biography')
    expect(html).toContain('Fixture company')
    expect(html).not.toContain('<iframe')
    expect(html).not.toContain('undefined')
  })

  it('renders expo/market-style details without performer metadata or media holes', async () => {
    const html = await render({ category: 'expo', date: undefined, image: null, description: 'Fixture description' })
    expect(html).toContain('Fixture description')
    expect(html).not.toContain('<img')
    expect(html).not.toContain('<iframe')
    expect(html).not.toContain('undefined')
  })

  it.each(['javascript:alert(1)', 'data:text/html,x', '//tickets.example', null])('omits unsafe or absent ticket links: %s', async ticketUrl => {
    const html = await render({ ticketUrl, description: '<script>alert(1)</script>' })
    expect(html).not.toContain('data-modal-ticket')
    expect(html).not.toContain('<script>')
    expect(html).toContain('&lt;script&gt;')
  })

  it('renders a safe actionable ticket without opening another tab', async () => {
    const html = await render({ ticketUrl: 'https://tickets.example/event' })
    expect(html).toContain('href="https://tickets.example/event"')
    expect(html).toContain('Entradas')
    expect(html).not.toContain('target=')
  })

  it('resolves a supplied local asset through Astro Image', async () => {
    const html = await render({ image: { url: '/src/assets/branding/arc26-logo.png', alt: 'Fixture asset' } })
    expect(html).toContain('<img')
    expect(html).toContain('alt="Fixture asset"')
    expect(html).toMatch(/width="\d+"/)
    expect(html).toMatch(/height="\d+"/)
    expect(html).not.toContain('src="/src/assets/')
  })

  it('fails clearly rather than silently displaying a broken supplied image', async () => {
    await expect(render({ image: { url: '/src/assets/missing.jpg', alt: '' } }))
      .rejects.toThrow('Artist image does not exist in src/assets: /src/assets/missing.jpg')
  })
})
