import { experimental_AstroContainer as AstroContainer } from 'astro/container'
import { expect, it } from 'vitest'
import ArtistDetail from '../ArtistDetail.astro'
import { participants } from '../categories'
import { artistSchema } from '../artists'

it('keeps existing performer records valid and rejects unsafe social URLs', () => {
  const base = { id: 'test', name: 'Test', order: 0, disciplines: 'musica', category: 'music', national: true, description: '', ticketUrl: null, date: { day: 'Sábado 28', time: '17:00' }, image: null }
  expect(artistSchema.safeParse(base).success).toBe(true)
  for (const instagram of ['javascript:alert(1)', 'https://www.instagram.com.evil.test/user', '//www.instagram.com/user']) {
    expect(artistSchema.safeParse({ ...base, socialLinks: { instagram } }).success).toBe(false)
  }
  expect(artistSchema.safeParse({ ...base, socialLinks: { spotify: 'https://evil.test/' } }).success).toBe(false)
})

it('publishes Niño Cohete biography, schedule, venue, image and social links in both details', async () => {
  const artist = participants.find(({ id }) => id === 'nino-cohete')!
  expect(artist.date).toEqual({ day: 'Sábado 28', time: '17:00', month: 'noviembre' })
  expect(artist.description).toContain('«pop silvestre»')
  const container = await AstroContainer.create()
  for (const modal of [false, true]) {
    const html = await container.renderToString(ArtistDetail, { props: { artist, modal } })
    expect(html).toContain('Escenario Gobierno Regional')
    expect(html).toContain('https://www.instagram.com/ncohete')
    expect(html).toContain('https://open.spotify.com/intl-es/artist/00kBFCMv8iB3aMpHy043LO')
    expect(html).toContain('aria-label="Instagram de Niño Cohete"')
    expect(html).toContain('aria-label="Spotify de Niño Cohete"')
    expect(html).toContain('<strong>Sábado 28 de noviembre · 17:00 hrs.</strong>')
    expect(html).toContain('alt="Niño Cohete"')
    expect(html).toContain('inline-flex size-8')
    expect(html).toContain('width="16" height="16"')
    expect(html).toMatch(/class="flex flex-wrap items-center gap-2"><p>Música<\/p><nav/)
    expect(html).toContain('<p class="text-base/6 font-black text-white">Escenario Gobierno Regional</p>')
    expect(html).toContain('mt-5 space-y-0.5')
    if (modal) {
      expect(html.indexOf(artist.description)).toBeLessThan(html.indexOf('<img'))
      expect(html).toContain('md:grid-cols-[minmax(0,1fr)_360px]')
      expect(html).toContain('overflow-y-auto')
      const header = html.match(/<header\b[\s\S]*?<\/header>/)![0]
      expect(header).not.toContain('flex-1')
      expect(header).toContain('items-end gap-x-6')
      expect(header).not.toContain('aria-label="Instagram de Niño Cohete"')
      const textColumn = html.match(/<div data-participant-copy[\s\S]*?<\/div>\s*<img/)![0]
      expect(textColumn).toContain('Música')
      expect(textColumn).toContain('data-modal-meta')
      expect(textColumn.indexOf('Música')).toBeLessThan(textColumn.indexOf('Sábado 28'))
      expect(textColumn.indexOf('Sábado 28')).toBeLessThan(textColumn.indexOf('Escenario Gobierno Regional'))
      expect(textColumn).toContain('text-base/6 font-black text-white')
      expect(textColumn).not.toContain('bg-primary')
    }
  }
})
