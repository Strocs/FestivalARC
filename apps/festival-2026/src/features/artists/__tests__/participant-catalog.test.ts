import { describe, expect, it } from 'vitest'
import data from '../../../content/artists.json'
import { artists, participantCatalog, validateParticipantCatalog } from '../artists'
import { categories, participants } from '../categories'

const catalog = data as unknown as Record<string, { name: string, location?: string, participants: Record<string, unknown>[] }>

describe('participant catalog behavior', () => {
  it('validates the grouped catalog without mutating input', () => {
    const input = structuredClone(data)
    const before = structuredClone(input)
    expect(validateParticipantCatalog(input)).toEqual(data)
    expect(input).toEqual(before)
  })

  it('rejects invalid category-specific fields and duplicate identifiers without mutating input', () => {
    const invalidations = [
      (input: typeof data) => { Object.assign(input.music.participants[0], { national: undefined }) },
      (input: typeof data) => { Object.assign(input.music.participants[0], { national: 'true' }) },
      (input: typeof data) => { Object.assign(input.stage.participants[0], { national: false }) },
      (input: typeof data) => { Object.assign(input.expo.participants[0], { national: false }) },
      (input: typeof data) => { Object.assign(input.market.participants[0], { group: 'regional' }) },
      (input: typeof data) => { input.market.participants[0].id = input.music.participants[0].id },
      (input: typeof data) => { input.stage.participants[0].order = input.music.participants[0].order },
    ]
    for (const invalidate of invalidations) {
      const input = structuredClone(data)
      invalidate(input)
      const before = structuredClone(input)
      expect(() => validateParticipantCatalog(input)).toThrow()
      expect(input).toEqual(before)
    }
  })

  it('applies music-only national fields while preserving other category shapes', () => {
    for (const national of [false, true]) {
      const input = structuredClone(data)
      input.music.participants[0].national = national
      const before = structuredClone(input)
      expect(validateParticipantCatalog(input).music.participants[0].national).toBe(national)
      expect(input).toEqual(before)
    }
    for (const category of ['stage', 'expo', 'market'] as const) {
      const input = structuredClone(data)
      Object.assign(input[category].participants[0], { national: false })
      const before = structuredClone(input)
      expect(() => validateParticipantCatalog(input)).toThrow()
      expect(input).toEqual(before)
    }
  })

  it('projects every source category member to a unique canonical path', () => {
    expect(categories.map(({ key }) => key)).toEqual(Object.keys(catalog))
    expect(participants).toHaveLength(Object.values(catalog).reduce((total, category) => total + category.participants.length, 0))
    expect(new Set(participants.map(({ canonicalPath }) => canonicalPath)).size).toBe(participants.length)
    for (const category of categories) {
      const source = participantCatalog[category.key]
      expect(category.participants.map(({ id }) => id)).toEqual(source.participants.map(({ id }) => id))
      for (const participant of category.participants) {
        expect(participant.category).toBe(category.key)
        expect(participant.canonicalPath).toBe(`${category.path}${participant.id}/`)
      }
    }
  })

  it('projects scheduled performers in validated order', () => {
    const expected = [
      ...participantCatalog.music.participants.map(entry => ({ ...entry, category: 'music' })),
      ...participantCatalog.stage.participants.map(entry => ({ ...entry, category: 'stage' })),
    ].sort((left, right) => left.order - right.order)
    expect(artists).toEqual(expected)
    expect(artists.map(({ order }) => order)).toEqual([...artists].map(({ order }) => order).sort((a, b) => a - b))
  })

  it('stores visual-arts location at category level and rejects participant schedules', () => {
    const input = structuredClone(data)
    input.expo.location = 'Fixture venue'
    for (const participant of input.expo.participants) delete (participant as { date?: unknown }).date
    const validated = validateParticipantCatalog(input)
    expect(validated.expo.location).toBe(input.expo.location)
    expect(validated.expo.participants.every(participant => !('date' in participant))).toBe(true)
    const invalid = structuredClone(input)
    delete (invalid.expo as { location?: string }).location
    expect(() => validateParticipantCatalog(invalid)).toThrow()
    const scheduled = structuredClone(input) as unknown as { expo: { participants: Record<string, unknown>[] } }
    scheduled.expo.participants[0].date = { day: 'Day', time: '12:00' }
    expect(() => validateParticipantCatalog(scheduled)).toThrow()
  })

  it('requires valid editable details for expo and market records', () => {
    for (const category of ['market'] as const) {
      const input = structuredClone(data)
      const participant = input[category].participants[0] as Record<string, unknown>
      Object.assign(participant, { date: { day: 'Day', time: '23:00' }, description: '', image: null })
      const before = structuredClone(input)
      expect(validateParticipantCatalog(input)[category].participants[0]).toEqual(participant)
      expect(input).toEqual(before)
      const invalidFields = [
        { date: undefined }, { date: null }, { date: '2026-11-28T23:00:00' },
        { date: { day: 'Day' } }, { date: { time: '23:00' } },
        { date: { day: 28, time: '23:00' } }, { date: { day: 'Day', time: 23 } },
        { date: { day: '', time: '23:00' } }, { date: { day: 'Day', time: '' } },
        { description: undefined }, { description: null }, { description: 3 },
        { image: undefined }, { image: 'image.jpg' }, { image: {} },
        { image: { url: 'image.jpg' } }, { image: { alt: 'Participant' } },
        { image: { url: 3, alt: '' } }, { image: { url: 'image.jpg', alt: 3 } },
        { image: { url: '', alt: '' } },
      ]
      for (const fields of invalidFields) {
        const invalid = structuredClone(input)
        Object.assign(invalid[category].participants[0], fields)
        const unchanged = structuredClone(invalid)
        expect(() => validateParticipantCatalog(invalid)).toThrow()
        expect(invalid).toEqual(unchanged)
      }
    }
  })

  it('requires stage audience type to be text and duration to be a positive integer', () => {
    const stage = structuredClone(data)
    Object.assign(stage.stage.participants[0], { audienceType: 'Audience', durationMinutes: 45 })
    expect(validateParticipantCatalog(stage).stage.participants[0]).toMatchObject({ audienceType: 'Audience', durationMinutes: 45 })
    for (const durationMinutes of [0, -1, 1.5, '45']) {
      const invalid = structuredClone(stage)
      Object.assign(invalid.stage.participants[0], { durationMinutes })
      expect(() => validateParticipantCatalog(invalid)).toThrow()
    }
  })

  it('keeps source artist IDs unique and category projections aligned', () => {
    expect(new Set(artists.map(({ id }) => id)).size).toBe(artists.length)
    expect(artists.every(({ category }) => category === 'music' || category === 'stage')).toBe(true)
  })
})
