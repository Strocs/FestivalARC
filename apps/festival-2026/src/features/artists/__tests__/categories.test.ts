import { describe, expect, it } from 'vitest'
import { artists, participantCatalog } from '../artists'
import { categories, participants, heroParticipants, safeTicketUrl } from '../categories'

describe('public participant scopes', () => {
  it('maps the four stored categories to distinct public routes and all 96 members', () => {
    expect(categories.map(({ key, slug, name, path }) => ({ key, slug, name, path }))).toEqual([
      { key: 'music', slug: 'musica', name: 'Música', path: '/musica/' },
      { key: 'stage', slug: 'artes-escenicas', name: 'Artes Escénicas', path: '/artes-escenicas/' },
      { key: 'expo', slug: 'expo-arte-co', name: 'Expo Arte.Co', path: '/expo-arte-co/' },
      { key: 'market', slug: 'mercado-creativo-y-daz', name: 'Mercado Creativo y DAZ', path: '/mercado-creativo-y-daz/' },
    ])
    expect(participants).toHaveLength(96)
    expect(new Set(participants.map(({ canonicalPath }) => canonicalPath)).size).toBe(96)
    for (const category of categories) {
      expect(category.participants.map(({ id }) => id)).toEqual(participantCatalog[category.key].participants.map(({ id }) => id))
      for (const participant of category.participants) {
        expect(participant.category).toBe(category.key)
        expect(participant.canonicalPath).toBe(`${category.path}${participant.id}/`)
        expect(participant.name).toBe(participantCatalog[category.key].participants.find(({ id }) => id === participant.id)!.name)
      }
    }
  })

  it('preserves all 49 music/stage works in editorial order, independent of national status', () => {
    expect(heroParticipants.map(({ id }) => id)).toEqual(artists.map(({ id }) => id))
    expect(heroParticipants).toHaveLength(49)
    expect(new Set(heroParticipants.map(({ category }) => category))).toEqual(new Set(['music', 'stage']))
    for (const artist of participantCatalog.music.participants) {
      expect(heroParticipants.some(({ id }) => id === artist.id)).toBe(true)
    }
    for (const category of categories.filter(({ key }) => key === 'expo' || key === 'market')) {
      for (const participant of category.participants) {
        expect(participant.disciplineName).toBeUndefined()
        expect(participant.company).toBeUndefined()
        expect(participant.ticketUrl).toBeNull()
        expect(participant.description).toBe('')
        expect(participant.image).toBeNull()
        expect(participant).not.toHaveProperty('order')
      }
    }
  })

  it.each(['https://tickets.example/event', 'http://tickets.example/event'])('allows an absolute HTTP ticket URL: %s', url => {
    expect(safeTicketUrl(url)).toBe(url)
  })

  it.each([null, '', 'javascript:alert(1)', 'data:text/html,x', '//tickets.example/event', '/tickets', 'https:example.com', 'not a url'])('omits unsafe or absent ticket URLs: %s', url => {
    expect(safeTicketUrl(url)).toBeNull()
  })
})
