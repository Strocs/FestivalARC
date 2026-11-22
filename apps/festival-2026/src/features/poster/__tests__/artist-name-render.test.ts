import { experimental_AstroContainer as AstroContainer } from 'astro/container'
import { describe, expect, it } from 'vitest'
import ArtistName from '../ArtistName.astro'
import { heroParticipants as artists } from '../../artists/categories'

async function renderArtist() {
  const container = await AstroContainer.create()
  return container.renderToString(ArtistName, {
    props: { artist: { ...artists.find(artist => artist.id === 'gepe')!, date: { day: 'Domingo 29', time: '20:30' } } },
  })
}

describe('ArtistName interaction', () => {
  it('adds vertical padding inside the gradient and fits the name within that padded area', async () => {
    const html = await renderArtist()
    expect(html).toContain('inset-y-[min(1.5rem,15%)]')
    expect(html).toContain('py-[min(1rem,10cqh)]')
    expect(html).toContain('[container-type:size]')
    expect(html).toContain('100cqh /')
  })
  it('keeps keyboard focus visible without translating the surface, title or schedule on focus return', async () => {
    const html = await renderArtist()
    expect(html).toContain('focus-visible:outline-2')
    expect(html).toContain('focus-visible:outline-primary')
    expect(html).not.toMatch(/group-focus-within:[^\s"']*translate/)
    expect(html).toContain('motion-safe:group-hover:-translate-y-0.5')
    expect(html).toContain('motion-safe:group-hover:translate-y-0.5')
    expect(html).toContain('motion-safe:group-hover:translate-x-1')
  })
  it('adds a separate view pill in the schedule row with preserved outward hover motion', async () => {
    const html = await renderArtist()
    expect(html).toContain('data-artist-meta')
    expect(html).toContain('gap-2')
    const cue = html.match(/<span\b[^>]*data-artist-view[\s\S]*?<\/span>/)?.[0] ?? ''
    expect(cue).toContain('Ver <strong>más</strong>')
    for (const token of ['bg-arc-rose', 'text-foreground', 'rounded-full', 'motion-safe:group-hover:translate-x-1', 'motion-reduce:translate-none']) {
      expect(cue).toContain(token)
    }
    expect(html.match(/<a\b/g)).toHaveLength(1)
    expect(html).toContain('href="/musica/gepe/"')
    expect(html).toContain('data-event-trigger')
    expect(html).toContain('data-event-id="gepe"')
    expect(html).not.toContain('<button')
  })

  it('preserves the artist and styling while rendering its editable schedule', async () => {
    const html = await renderArtist()
    expect(html).toContain('aria-label="Gepe"')
    expect(html).toContain('text-arc-yellow')
    expect(html).toContain('to-accent')
    expect(html).toContain('from-arc-rose')
    expect(html).toContain('Domingo 29 -')
    expect(html).toContain('<strong>20:30hrs</strong>')
    expect(html).not.toContain('datetime=')
    expect(html).not.toContain('ejemplo')
    const time = html.match(/<time\b[\s\S]*?<\/time>/)?.[0] ?? ''
    expect(time).toContain('rounded-full')
    expect(time).toContain('motion-safe:group-hover:translate-y-0.5')
    expect(html).toContain('motion-safe:group-hover:-translate-y-0.5')
  })
})
