import { describe, expect, it } from 'vitest'
import { artistSchema, artists, validateArtists } from '../artists'

const entry = {
  id: 'artist', name: 'Artist', category: 'music', national: true, order: 1,
  disciplines: 'musica', description: '', ticketUrl: null,
  date: { day: 'Day', time: '23:00' }, image: null,
}

function rejectsUnchanged(value: unknown) {
  const before = structuredClone(value)
  expect(() => validateArtists(value)).toThrow()
  expect(value).toEqual(before)
}

describe('artist contract', () => {
  it('accepts a discipline identifier and rejects arrays or unknown identifiers', () => {
    expect(artistSchema.parse(entry).disciplines).toBe(entry.disciplines)
    rejectsUnchanged([{ ...entry, disciplines: ['musica'] }])
    rejectsUnchanged([{ ...entry, disciplines: 'unknown' }])
  })

  it('rejects removed properties and requires a string description', () => {
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

  it('requires editable day and time strings', () => {
    expect(artistSchema.parse(entry).date).toEqual(entry.date)
    for (const date of [undefined, null, '2026-11-28T23:00:00', { day: 'Day' }, { time: '23:00' }, { day: 28, time: '23:00' }]) {
      rejectsUnchanged([{ ...entry, date }])
    }
  })

  it('accepts optional audience and positive duration fields', () => {
    const { national: _national, ...performer } = entry
    const stage = { ...performer, category: 'stage', audienceType: 'Audience', durationMinutes: 40 }
    expect(artistSchema.safeParse(stage).success).toBe(true)
    for (const durationMinutes of [0, -1, 1.5, '40']) {
      expect(artistSchema.safeParse({ ...stage, durationMinutes }).success).toBe(false)
    }
  })

  it('requires a nullable image object with string URL and alt text', () => {
    const image = { url: '/src/assets/artists/artist.jpg', alt: 'Artist on stage' }
    expect(artistSchema.parse({ ...entry, image }).image).toEqual(image)
    expect(artistSchema.parse(entry).image).toBeNull()
    for (const image of [undefined, 'image.jpg', {}, { url: 'image.jpg' }, { url: 3, alt: '' }]) {
      rejectsUnchanged([{ ...entry, image }])
    }
  })

  it('sorts supplied records by order without mutating input', () => {
    const input = [{ ...entry, id: 'second', order: 2 }, entry]
    const before = structuredClone(input)
    expect(validateArtists(input).map(({ id }) => id)).toEqual(['artist', 'second'])
    expect(input).toEqual(before)
  })

  it('rejects duplicate IDs, duplicate orders and invalid orders without mutating input', () => {
    rejectsUnchanged([entry, { ...entry, order: 2 }])
    rejectsUnchanged([entry, { ...entry, id: 'other' }])
    for (const order of [-1, 1.5, '1']) rejectsUnchanged([{ ...entry, order }])
  })

  it('keeps validated catalog records uniquely identified and ordered', () => {
    expect(validateArtists(artists)).toEqual(artists)
    expect(new Set(artists.map(({ id }) => id)).size).toBe(artists.length)
    expect(new Set(artists.map(({ order }) => order)).size).toBe(artists.length)
    expect(artists.map(({ order }) => order)).toEqual([...artists].map(({ order }) => order).sort((a, b) => a - b))
  })
})
