import { experimental_AstroContainer as AstroContainer } from 'astro/container'
import { expect, it } from 'vitest'
import ArtistDetail from '../ArtistDetail.astro'
import { participants } from '../categories'
import { artistSchema } from '../artists'

it('keeps existing performer records valid and rejects unsafe social URLs', () => {
  const base = { id: 'test', name: 'Test', order: 0, disciplines: 'musica', category: 'music', national: true, description: '', ticketUrl: null, date: { day: 'Sábado 28', time: '17:00' }, image: null }
  expect(artistSchema.safeParse(base).success).toBe(true)
  const profile = 'https://www.instagram.com/example/'
  expect(artistSchema.parse({ ...base, socialLinks: { instagram: profile } }).socialLinks?.instagram).toBe(profile)
  for (const instagram of ['javascript:alert(1)', 'https://www.instagram.com.evil.test/user', '//www.instagram.com/user', [profile]]) {
    expect(artistSchema.safeParse({ ...base, socialLinks: { instagram } }).success).toBe(false)
  }
  expect(artistSchema.safeParse({ ...base, socialLinks: { spotify: 'https://evil.test/' } }).success).toBe(false)
})

it('renders performer biography, schedule, venue, image and social links in both details', async () => {
  const description = 'Fixture biography'
  const location = 'Fixture venue'
  const alt = 'Fixture performer photo'
  const date = { day: 'Fixture day', time: '17:00', month: 'Fixture month' }
  const dateLabel = 'Fixture day de Fixture month · 17:00 hrs.'
  const instagram = 'https://www.instagram.com/performer/'
  const spotify = 'https://open.spotify.com/artist/fixture'
  const artist = {
    ...participants.find(({ id }) => id === 'nino-cohete')!,
    name: 'Fixture performer', disciplineName: 'Fixture discipline', description, date, location,
    image: { url: '/src/assets/branding/arc26-logo.png', alt }, socialLinks: { instagram, spotify },
  }
  const container = await AstroContainer.create()
  for (const modal of [false, true]) {
    const html = await container.renderToString(ArtistDetail, { props: { artist, modal } })
    expect(html).toContain(description)
    expect(html).toContain(`href="${instagram}" aria-label="Instagram de Fixture performer"`)
    expect(html).toContain(`href="${spotify}" aria-label="Spotify de Fixture performer"`)
    expect(html).toContain(`<strong>${dateLabel}</strong>`)
    expect(html).toContain(`alt="${alt}"`)
    expect(html).toContain('inline-flex size-8')
    expect(html).toContain('width="16" height="16"')
    expect(html).toMatch(/class="flex flex-wrap items-center gap-2">\s*<p>Fixture discipline<\/p>\s*<nav/)
    expect(html).toContain(`<p class="text-base/[1.5] font-black text-white">${location}</p>`)
    expect(html).toContain('mt-5 space-y-0.5')
    if (modal) {
      expect(html.indexOf(description)).toBeLessThan(html.indexOf('<img'))
      expect(html).toContain('md:grid-cols-[minmax(0,1fr)_360px]')
      expect(html).toContain('overflow-y-auto')
      const header = html.match(/<header\b[\s\S]*?<\/header>/)![0]
      expect(header).not.toContain('flex-1')
      expect(header).toContain('items-end gap-x-6')
      expect(header).not.toContain('aria-label="Instagram de Fixture performer"')
      const textColumn = html.match(/<div data-participant-copy[\s\S]*?alt="Fixture performer photo"/)![0]
      expect(textColumn).toContain('Fixture discipline')
      expect(textColumn).toContain('data-modal-meta')
      expect(textColumn.indexOf('Fixture discipline')).toBeLessThan(textColumn.indexOf(dateLabel))
      expect(textColumn.indexOf(dateLabel)).toBeLessThan(textColumn.indexOf(location))
      expect(textColumn).toContain('text-base/[1.5] font-black text-white')
      expect(textColumn).not.toContain('bg-primary')
    }
  }
})
