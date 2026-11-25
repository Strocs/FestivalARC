import { describe, expect, it } from 'vitest'
import { artists, participantCatalog } from '../artists'
import { categories, participants, heroParticipants } from '../categories'

describe('participant projections', () => {
  it('maps every stored category member to a unique canonical route', () => {
    const sourceMembers = Object.values(participantCatalog).flatMap(({ participants }) => participants)
    expect(categories.map(({ key }) => key)).toEqual(Object.keys(participantCatalog))
    expect(participants).toHaveLength(sourceMembers.length)
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

  it('keeps the scheduled performer projection aligned with validated editorial order', () => {
    expect(heroParticipants.map(({ id }) => id)).toEqual(artists.map(({ id }) => id))
    const expected = [
      ...participantCatalog.music.participants.map(entry => ({ ...entry, category: 'music' })),
      ...participantCatalog.stage.participants.map(entry => ({ ...entry, category: 'stage' })),
    ].sort((left, right) => left.order - right.order)
    expect(artists).toEqual(expected)
  })

  it('projects only fields provided by the source category', () => {
    for (const category of categories) {
      const sourceById = new Map(participantCatalog[category.key].participants.map(entry => [entry.id, entry]))
      for (const participant of category.participants) {
        const source = sourceById.get(participant.id)!
        expect(participant.description).toBe(source.description)
        expect(participant.image).toEqual(source.image)
        expect(participant.company).toBe('company' in source ? source.company : undefined)
        expect(participant.date).toEqual('date' in source ? source.date : undefined)
      }
    }
  })
})
