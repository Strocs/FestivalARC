import { experimental_AstroContainer as AstroContainer } from 'astro/container'
import { describe, expect, it } from 'vitest'
import ArtistName from '../ArtistName.astro'
import { heroParticipants as artists } from '../../artists/categories'

async function renderArtist(interactive = true) {
  const container = await AstroContainer.create()
  return container.renderToString(ArtistName, {
    props: {
      interactive,
      artist: { ...artists.find(artist => artist.id === 'gepe')!, date: { day: 'Domingo 29', time: '20:30' }, location: 'Escenario Gobierno Regional' },
    },
  })
}

describe('ArtistName interaction', () => {
  it('gives the fitted name more vertical room in interactive cards without changing passive cards', async () => {
    const html = await renderArtist()
    expect(html).toContain('top-[min(0.75rem,8%)]')
    expect(html).toContain('pt-1 pb-0.5')
    expect(html).toContain('[container-type:size]')
    expect(html).toContain('100cqh /')
    const passive = await renderArtist(false)
    expect(passive).toContain('inset-y-[min(1.5rem,15%)]')
    expect(passive).toContain('py-[min(1rem,10cqh)]')
    expect(passive).not.toContain('data-artist-meta')
  })
  it('keeps keyboard focus visible without translating the surface, title or schedule on focus return', async () => {
    const html = await renderArtist()
    expect(html).toContain('focus-visible:outline-2')
    expect(html).toContain('focus-visible:outline-primary')
    expect(html).not.toMatch(/group-focus-within:[^\s"']*translate/)
    expect(html).toContain('motion-safe:group-hover:-translate-y-0.5')
    expect(html).toContain('motion-safe:group-hover:translate-y-1')
    expect(html).not.toContain('motion-safe:group-hover:translate-x-1')
  })
  it('centers the cyan view cue below the location without adding a second control', async () => {
    const html = await renderArtist()
    expect(html).toMatch(/data-artist-meta[^>]*flex-col items-center/)
    expect(html.indexOf('data-artist-view')).toBeGreaterThan(html.indexOf('data-artist-location'))
    const cue = html.match(/<span\b[^>]*data-artist-view[\s\S]*?<\/span>/)?.[0] ?? ''
    expect(cue).toContain('Ver <strong>más</strong>')
    for (const token of ['bg-primary', 'text-background', 'rounded-full', 'motion-safe:group-hover:translate-y-1', 'motion-reduce:translate-none']) {
      expect(cue).toContain(token)
    }
    expect(html.match(/<a\b/g)).toHaveLength(1)
    expect(html).toContain('href="/musica/gepe/"')
    expect(html).toContain('data-event-trigger')
    expect(html).toContain('data-event-id="gepe"')
    expect(html).not.toContain('<button')
  })

  it('renders the unboxed bold schedule over the location and a borderless surface in simple view', async () => {
    const html = await renderArtist()
    expect(html).toContain('aria-label="Gepe"')
    expect(html).toContain('text-arc-yellow')
    const surface = html.match(/<span\b[^>]*data-artist-surface[^>]*>/)?.[0] ?? ''
    expect(surface).toContain('bg-background')
    expect(surface).not.toContain('group-data-[poster-simple]/poster:border')
    expect(surface).toContain('group-data-[poster-simple]/poster:rounded-xl')
    expect(surface).toContain(' rounded-lg ')
    expect(surface).not.toMatch(/gradient|bg-linear|poster:border-2/)
    expect(html).toContain('group-data-[poster-simple]/poster:text-white')
    expect(html).toMatch(/<time[^>]*class="font-bold"[^>]*>Domingo 29 - 20:30hrs<\/time>\s*<span[^>]*data-artist-location[^>]*>Escenario Gobierno Regional<\/span>/)
    expect(html).not.toContain('datetime=')
    expect(html).not.toContain('ejemplo')
  })
})
