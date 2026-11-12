import { experimental_AstroContainer as AstroContainer } from 'astro/container'
import { describe, expect, it } from 'vitest'
import ArtistName from '../ArtistName.astro'

async function renderArtist() {
  const container = await AstroContainer.create()
  return container.renderToString(ArtistName, {
    props: { artist: { id: 'gepe', name: 'Gepe', group: 'national' } },
  })
}

describe('ArtistName interaction', () => {
  it('adds a separate view pill in the schedule row with outward hover and focus motion', async () => {
    const html = await renderArtist()
    expect(html).toContain('data-artist-meta')
    expect(html).toContain('gap-2')
    const cue = html.match(/<span\b[^>]*data-artist-view[\s\S]*?<\/span>/)?.[0] ?? ''
    expect(cue).toContain('Ver <strong>más</strong>')
    for (const token of ['bg-arc-rose', 'text-foreground', 'rounded-full', 'motion-safe:group-hover:translate-x-1', 'motion-safe:group-focus-within:translate-x-1', 'motion-reduce:translate-none']) {
      expect(cue).toContain(token)
    }
    expect(html.match(/<button\b/g)).toHaveLength(1)
  })

  it('preserves the artist, rounded example schedule, name lift and schedule drop', async () => {
    const html = await renderArtist()
    expect(html).toContain('aria-label="Gepe"')
    expect(html).toContain('text-arc-yellow')
    expect(html).toContain('to-accent')
    expect(html).toContain('from-arc-rose')
    expect(html).toContain('Sábado 28 -')
    expect(html).toContain('<strong>23:00hrs</strong>')
    expect(html).toContain('datetime="2026-11-28T23:00:00-03:00"')
    expect(html).toContain('Horario de ejemplo; por confirmar')
    const time = html.match(/<time\b[\s\S]*?<\/time>/)?.[0] ?? ''
    expect(time).toContain('rounded-full')
    expect(time).toContain('motion-safe:group-hover:translate-y-0.5')
    expect(html).toContain('motion-safe:group-hover:-translate-y-0.5')
  })
})
