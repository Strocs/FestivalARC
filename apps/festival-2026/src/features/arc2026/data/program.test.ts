import { describe, expect, it } from 'vitest'
import { readLocalProgram } from './local'
import { activitiesForArtist, demoLabel, formatActivityTime, validateProgram } from './program'
import type { Program } from './program'

function fixture(): Program {
  return {
    artists: [
      { id: 'artist-b', name: 'Artist B', order: 2, demo: true, disciplines: ['Music'] },
      { id: 'artist-a', name: 'Artist A', order: 1, demo: true, disciplines: ['Music', 'Dance'] },
    ],
    activities: [
      { id: 'activity-c', name: 'Activity C', order: 3, demo: true, artistId: 'artist-a', venueId: 'venue-b', disciplines: ['Dance'], startsAt: '2026-10-28T21:00:00Z' },
      { id: 'activity-b', name: 'Activity B', order: 2, demo: true, artistId: 'artist-b', venueId: 'venue-a', disciplines: ['Music'], startsAt: '2026-10-28T18:00:00-03:00' },
      { id: 'activity-a', name: 'Activity A', order: 1, demo: true, artistId: 'artist-a', venueId: 'venue-a', disciplines: ['Music'], startsAt: '2026-10-28T17:00:00-03:00' },
    ],
    venues: [
      { id: 'venue-b', name: 'Venue B', order: 2, demo: true, city: 'La Serena' },
      { id: 'venue-a', name: 'Venue A', order: 1, demo: true, city: 'La Serena' },
    ],
  }
}

function expectRejectedUnchanged(input: unknown, message?: string) {
  const before = structuredClone(input)
  expect(() => validateProgram(input)).toThrow(message)
  expect(input).toEqual(before)
}

const collections = ['artists', 'activities', 'venues'] as const

describe('demonstration program validation', () => {
  it('sorts every collection by explicit order without modifying successful input', () => {
    const input = fixture()
    const before = structuredClone(input)
    const program = validateProgram(input)
    expect(program.artists.map(({ id }) => id)).toEqual(['artist-a', 'artist-b'])
    expect(program.activities.map(({ id }) => id)).toEqual(['activity-a', 'activity-b', 'activity-c'])
    expect(program.venues.map(({ id }) => id)).toEqual(['venue-a', 'venue-b'])
    expect(program.artists[0].disciplines).toEqual(['Music', 'Dance'])
    expect(input).toEqual(before)
  })

  it('filters multiple artists independently, preserving ordered activities and input', () => {
    const program = validateProgram(fixture())
    const before = structuredClone(program)
    expect(activitiesForArtist(program, 'artist-a').map(({ id }) => id))
      .toEqual(['activity-a', 'activity-c'])
    expect(activitiesForArtist(program, 'artist-b').map(({ id }) => id)).toEqual(['activity-b'])
    expect(activitiesForArtist(program, 'unknown')).toEqual([])
    expect(program).toEqual(before)
  })

  it.each(collections)('rejects duplicate IDs independently of order in %s', collection => {
    const input = fixture()
    const entries = [...input[collection], { ...input[collection][0], order: 99 }]
    expect(new Set(entries.map(({ order }) => order)).size).toBe(entries.length)
    expectRejectedUnchanged({ ...input, [collection]: entries }, 'ID y orden deben ser únicos en la colección.')
  })

  it.each(collections)('rejects duplicate order independently of IDs in %s', collection => {
    const input = fixture()
    input[collection][1].order = input[collection][0].order
    expect(new Set(input[collection].map(({ id }) => id)).size).toBe(input[collection].length)
    expectRejectedUnchanged(input, 'ID y orden deben ser únicos en la colección.')
  })

  it.each([
    ['artistId', 'Artista inexistente.'],
    ['venueId', 'Espacio inexistente.'],
  ] as const)('rejects an unknown %s reference', (field, message) => {
    const input = fixture()
    input.activities[0][field] = 'missing'
    expectRejectedUnchanged(input, message)
  })

  it.each(collections)('requires explicit demo marking on %s', collection => {
    for (const demo of [false, undefined]) {
      const input = fixture()
      const invalid = { ...input, [collection]: input[collection].map(entry => ({ ...entry, demo })) }
      expectRejectedUnchanged(invalid)
    }
  })

  it('rejects a date without an explicit timezone', () => {
    const input = fixture()
    input.activities[0].startsAt = '2026-10-28T18:00:00'
    expectRejectedUnchanged(input)
  })

  it('rejects executable external URLs', () => {
    const input = fixture()
    input.activities[0].externalUrl = 'javascript:alert(1)'
    expectRejectedUnchanged(input)
  })

  it.each([undefined, 'http://example.org/registration', 'https://example.org/registration'])(
    'accepts optional safe registration URL %s without changing input', externalUrl => {
      const input = fixture()
      input.activities[0].externalUrl = externalUrl
      const before = structuredClone(input)
      const program = validateProgram(input)
      expect(program.activities.find(({ id }) => id === 'activity-c')?.externalUrl).toBe(externalUrl)
      expect(input).toEqual(before)
    },
  )

  it('presents explicit offset and UTC times consistently in Chile', () => {
    expect(formatActivityTime('2026-10-28T21:00:00Z'))
      .toBe('miércoles, 28 de octubre de 2026, 18:00')
    expect(formatActivityTime('2026-10-28T18:00:00-03:00'))
      .toBe('miércoles, 28 de octubre de 2026, 18:00')
    expect(demoLabel).toMatch(/demostraci[oó]n/i)
    expect(demoLabel).toMatch(/no confirmad[oa]s/i)
  })
})

describe('local program integration', () => {
  it('loads valid relationships and marks every entity as demonstration content', () => {
    const program = readLocalProgram()
    const before = structuredClone(program)
    expect(validateProgram(program)).toEqual(program)
    for (const collection of collections) {
      expect(program[collection].length).toBeGreaterThan(0)
      expect(program[collection].every(({ demo }) => demo === true)).toBe(true)
    }
    for (const activity of program.activities) {
      expect(program.artists.some(({ id }) => id === activity.artistId)).toBe(true)
      expect(program.venues.some(({ id }) => id === activity.venueId)).toBe(true)
    }
    expect(program).toEqual(before)
  })
})
