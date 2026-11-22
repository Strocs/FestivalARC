import { experimental_AstroContainer as AstroContainer } from 'astro/container'
import { describe, expect, it } from 'vitest'
import ArtistDetail from '../ArtistDetail.astro'
import { heroParticipants as artists, categories } from '../categories'

async function render(override: Record<string, unknown> = {}) {
  const container = await AstroContainer.create()
  return container.renderToString(ArtistDetail, { props: { artist: { ...artists[0], ...override } } })
}

describe('artist detail', () => {
  it.each([false, true])('renders the supplied videos below the photos (modal: %s)', async modal => {
    const container = await AstroContainer.create()
    for (const [id, video] of [['nino-cohete', 'yYA2XkelDw0'], ['dejenme-dormir', 'oL8RRDTznBc']]) {
      const artist = artists.find(entry => entry.id === id)!
      const html = await container.renderToString(ArtistDetail, { props: { artist, modal } })
      const embed = `https://www.youtube-nocookie.com/embed/${video}`
      expect(artist.description.length).toBeGreaterThan(0)
      expect(html).toContain(embed)
      if (!modal) expect(html).toMatch(/<img\b[^>]*>\s*<\/div>\s*<iframe\b[^>]*aspect-video[^>]*w-full/)
      expect(html.indexOf(embed)).toBeGreaterThan(html.indexOf(`alt="${artist.name}"`))
      if (id === 'dejenme-dormir') {
        expect(html).toContain('https://www.instagram.com/dejenme.dormir')
        expect(html).toContain('https://open.spotify.com/intl-ko/artist/0wlw3iBVFnAzSviZyLjxDJ/discography/all')
        expect(html).not.toContain('start_radio')
      }
    }
  })

  it('renders self-contained social icons in multiple artist modal templates', async () => {
    const container = await AstroContainer.create()
    for (const id of ['nino-cohete', 'dejenme-dormir']) {
      const artist = artists.find(entry => entry.id === id)!
      const html = await container.renderToString(ArtistDetail, { props: { artist, modal: true } })
      for (const icon of ['instagram', 'spotify']) {
        expect(html).toMatch(new RegExp(`<svg[^>]*data-icon="simple-icons:${icon}"[^>]*>\\s*<path`))
      }
    }
  })

  it('renders the supplied Polter photo without invented video or activities', async () => {
    const html = await render()
    expect(html).toContain('Polter')
    expect(html).toMatch(/<h1[^>]*class="[^"]*font-sans[^"]*font-black[^"]*"[^>]*>Polter<\/h1>/)
    expect(html).toContain('Música')
    expect(html).toContain('Sábado 28 de noviembre · 22:00 hrs.')
    expect(html).toContain('alt="Polter"')
    expect(html).not.toContain('<iframe')
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
