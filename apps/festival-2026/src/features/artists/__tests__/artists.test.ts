import { describe, expect, it } from 'vitest'
import { artistSchema, artists, disciplines, validateArtists } from '../artists'

const entry = {
  id: 'artist', name: 'Artist', category: 'music', national: true, order: 1,
  disciplines: 'musica', description: '', ticketUrl: null,
  date: { day: 'Sábado 28', time: '23:00' }, image: null,
}

function rejectsUnchanged(value: unknown) {
  const before = structuredClone(value)
  expect(() => validateArtists(value)).toThrow()
  expect(value).toEqual(before)
}

describe('general artist contract', () => {
  it('accepts one catalog discipline ID and rejects arrays or unknown IDs', () => {
    expect(artistSchema.parse(entry).disciplines).toBe('musica')
    rejectsUnchanged([{ ...entry, disciplines: ['musica'] }])
    rejectsUnchanged([{ ...entry, disciplines: 'unknown' }])
    expect(disciplines.find(({ id }) => id === 'artes-escenicas')?.name).toBe('Artes escénicas')
  })

  it('removes the old demo contract and requires a string description', () => {
    expect(artistSchema.parse(entry)).not.toHaveProperty('demo')
    rejectsUnchanged([{ ...entry, demo: true }])
    rejectsUnchanged([{ ...entry, description: undefined }])
    rejectsUnchanged([{ ...entry, description: 3 }])
    expect(artistSchema.parse({ ...entry, description: 'Biography' }).description).toBe('Biography')
  })

  it('requires a nullable string ticket URL', () => {
    for (const ticketUrl of [null, 'https://example.org/tickets']) {
      expect(artistSchema.parse({ ...entry, ticketUrl }).ticketUrl).toBe(ticketUrl)
    }
    rejectsUnchanged([{ ...entry, ticketUrl: undefined }])
    rejectsUnchanged([{ ...entry, ticketUrl: 3 }])
  })

  it('requires editable day and time strings rather than a datetime', () => {
    expect(artistSchema.parse(entry).date).toEqual({ day: 'Sábado 28', time: '23:00' })
    for (const date of [undefined, null, '2026-11-28T23:00:00', { day: 'Sábado 28' }, { time: '23:00' }, { day: 28, time: '23:00' }]) {
      rejectsUnchanged([{ ...entry, date }])
    }
  })

  it('requires a nullable image object with string url and alt', () => {
    const image = { url: '/src/assets/artists/artist.jpg', alt: 'Artist on stage' }
    expect(artistSchema.parse({ ...entry, image }).image).toEqual(image)
    expect(artistSchema.parse(entry).image).toBeNull()
    for (const image of [undefined, 'image.jpg', {}, { url: 'image.jpg' }, { url: 3, alt: '' }]) {
      rejectsUnchanged([{ ...entry, image }])
    }
  })

  it('sorts by explicit order without mutating data', () => {
    const input = [{ ...entry, id: 'second', order: 2 }, entry]
    const before = structuredClone(input)
    expect(validateArtists(input).map(({ id }) => id)).toEqual(['artist', 'second'])
    expect(input).toEqual(before)
  })

  it('rejects duplicate IDs, duplicate orders and invalid orders without changing input', () => {
    rejectsUnchanged([entry, { ...entry, order: 2 }])
    rejectsUnchanged([entry, { ...entry, id: 'other' }])
    for (const order of [-1, 1.5, '1']) rejectsUnchanged([{ ...entry, order }])
  })

  it('preserves all real artists, requested defaults and category discipline assignments', () => {
    expect(artists).toHaveLength(49)
    expect(artists.map(({ order }) => order)).toEqual(Array.from({ length: 49 }, (_, index) => index + 1))
    for (const artist of artists) {
      expect(artist.disciplines).toBe(artist.category === 'stage' ? 'artes-escenicas' : 'musica')
      if (artist.id === 'nino-cohete') {
        expect(artist.description).toContain('«pop silvestre»')
        expect(artist.image?.url).toBe('/src/assets/artists/nino-cohete.webp')
        expect(artist.date).toEqual({ day: 'Domingo 29', time: '17:00', month: 'noviembre' })
        continue
      }
      expect(artist.description).toBe('')
      expect(artist.ticketUrl).toBeNull()
      expect(artist.image).toBeNull()
      if (artist.category === 'music') {
        expect(artist.location).toBeTruthy()
        expect(artist.date.month).toBe('noviembre')
      } else {
        expect(artist.date.day).toMatch(/^(Sábado 28|Domingo 29)$/)
        expect(artist.date.time).toMatch(/^([01]\d|2[0-3]):00$/)
      }
      expect(artist).not.toHaveProperty('demo')
    }
    expect(artists.filter(({ date }) => date.day === 'Sábado 28')).toHaveLength(25)
    expect(artists.filter(({ date }) => date.day === 'Domingo 29')).toHaveLength(24)
    expect(JSON.stringify(disciplines)).not.toContain('(ejemplo)')
  })
})
