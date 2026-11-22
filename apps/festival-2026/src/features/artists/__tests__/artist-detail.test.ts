import { experimental_AstroContainer as AstroContainer } from 'astro/container'
import { describe, expect, it } from 'vitest'
import ArtistDetail from '../ArtistDetail.astro'
import { heroParticipants as artists, categories } from '../categories'

async function render(override: Record<string, unknown> = {}) {
  const container = await AstroContainer.create()
  return container.renderToString(ArtistDetail, { props: { artist: { ...artists[0], ...override } } })
}

describe('artist detail', () => {
  it('renders real data with no invented image, description or activities', async () => {
    const html = await render()
    expect(html).toContain('Polter')
    expect(html).toContain('Música')
    expect(html).toContain('Sábado 28 de noviembre · 22:00 hrs.')
    expect(html).not.toContain('<img')
    expect(html).not.toMatch(/demostración|ejemplo|Actividades/i)
  })

  it('renders expo/market detail without fabricated performer metadata or media holes', async () => {
    const container = await AstroContainer.create()
    for (const category of categories.slice(2)) {
      const artist = category.participants[0]
      const html = await container.renderToString(ArtistDetail, { props: { artist } })
      expect(html).toContain(artist.name)
      if (artist.date) expect(html).toContain(`${artist.date.day} · ${artist.date.time}`)
      else expect(html).not.toContain(' ·  hrs.')
      expect(html).not.toContain('<img')
      expect(html).not.toContain('md:grid-cols-[1fr_1fr]')
      expect(html).not.toContain('undefined')
      expect(html).not.toContain('Descripción próximamente')
      expect(html).not.toContain('<a')
      expect(html.match(/<p\b/g)).toHaveLength(1)
    }
  })

  it.each(['javascript:alert(1)', 'data:text/html,x', '//tickets.example', null])('does not render an unsafe or absent ticket link: %s', async ticketUrl => {
    const html = await render({ ticketUrl, description: '<script>alert(1)</script>' })
    expect(html).not.toContain('<a')
    expect(html).not.toContain('<script>')
    expect(html).toContain('&lt;script&gt;')
  })

  it('renders a safe actionable ticket without opening another tab', async () => {
    const html = await render({ ticketUrl: 'https://tickets.example/event' })
    expect(html).toContain('href="https://tickets.example/event"')
    expect(html).toContain('Entradas')
    expect(html).not.toContain('target=')
  })

  it('renders supplied descriptions and companies', async () => {
    const html = await render({ description: 'Artist biography', company: 'Company' })
    expect(html).toContain('Artist biography')
    expect(html).toContain('Company')
  })

  it('resolves a local asset through the glob for Astro Image', async () => {
    const html = await render({ image: { url: '/src/assets/branding/arc26-logo.png', alt: 'Test asset' } })
    expect(html).toContain('<img')
    expect(html).toContain('alt="Test asset"')
    expect(html).toMatch(/width="\d+"/)
    expect(html).toMatch(/height="\d+"/)
    expect(html).not.toContain('src="/src/assets/')
  })

  it('fails clearly rather than silently displaying a broken local image', async () => {
    await expect(render({ image: { url: '/src/assets/missing.jpg', alt: '' } }))
      .rejects.toThrow('Artist image does not exist in src/assets: /src/assets/missing.jpg')
  })
})
