import { experimental_AstroContainer as AstroContainer } from 'astro/container'
import { describe, expect, it } from 'vitest'
import EventModal from '../EventModal.astro'
import PosterGrid from '../../poster/PosterGrid.astro'
import { categories, heroParticipants, type ParticipantView } from '../categories'

async function render(participants: readonly ParticipantView[] = heroParticipants) {
  const container = await AstroContainer.create()
  return container.renderToString(EventModal, { props: { participants } })
}
describe('prerendered modal boundary', () => {
  it.each(['market', 'expo'] as const)('links only %s cards with a description or an external link to compact details', async key => {
    const category = categories.find(category => category.key === key)!
    const website = 'https://example.org/exhibitor/'
    const instagram = 'https://www.instagram.com/exhibitor/'
    const description = 'Fixture description'
    const [withCopy, withWebsite, withSocial, withoutDetails, withoutDescription] = Array.from({ length: 5 }, (_, index) => ({
      id: `fixture-${index}`, name: `Fixture ${index}`, category: key,
      canonicalPath: `${category.path}fixture-${index}/`, image: null, ticketUrl: null,
      date: { day: 'Fixture day', time: '23:00' }, location: 'Fixture venue',
    }))
    const participants: ParticipantView[] = [
      { ...withCopy, description },
      { ...withWebsite, website },
      { ...withSocial, socialLinks: { instagram } },
      { ...withoutDetails, description: ' \n ', socialLinks: {} },
      withoutDescription,
    ]
    const container = await AstroContainer.create()
    const html = await container.renderToString(PosterGrid, { props: { category: { ...category, participants } } })
    const cards = html.match(/<article\b[\s\S]*?<\/article>/g) ?? []
    expect(cards).toHaveLength(5)
    for (const [index, { id, canonicalPath, name }] of participants.entries()) {
      expect(cards[index]).toContain(`aria-label="${name}"`)
      expect(cards[index]).not.toMatch(/<time|data-artist-location/)
      const template = html.match(new RegExp(`<template data-event-template="${id}">([\\s\\S]*?)</template>`))?.[1]
      if (index >= 3) {
        expect(cards[index]).not.toMatch(/<a\b|data-event-trigger|data-artist-view/)
        expect(template).toBeUndefined()
        continue
      }
      expect(cards[index]).toMatch(/<a\b[^>]*data-event-trigger[^>]*absolute inset-0 size-full/)
      expect(cards[index]).toContain(`href="${canonicalPath}"`)
      expect(cards[index].indexOf('data-artist-view')).toBeGreaterThan(cards[index].indexOf('data-artist-name'))
      expect(cards[index]).toContain('Ver <strong>más</strong>')
      expect(template).toMatch(/<h2 id="event-modal-title"/)
      expect(template).toContain(name)
      expect(template).not.toMatch(/Fixture day|Fixture venue|Ver página del participante|Entradas|<img|<iframe/)
      expect(template!.includes(description)).toBe(index === 0)
      expect(template!.includes(`href="${website}"`)).toBe(index === 1)
      expect(template!.includes(`href="${instagram}"`)).toBe(index === 2)
    }
    expect(html.match(/<dialog\b/g)).toHaveLength(1)
    expect(html.match(/<dialog\b[^>]*>/)?.[0]).toContain('max-w-prose')
    expect(html).toContain('aria-labelledby="event-modal-title"')
    expect(html).toMatch(/<button\b[^>]*data-modal-close[^>]*>Cerrar<\/button>/)
    const passive = await container.renderToString(PosterGrid, { props: { category: { ...category, participants: participants.slice(3) } } })
    expect(passive).not.toMatch(/<dialog|data-event-template|data-event-trigger/)
  })

  it.each(['music', 'stage'] as const)('keeps scheduled details and the fallback link for %s', async key => {
    const category = categories.find(category => category.key === key)!
    const artist = { ...category.participants[0], date: { day: 'Fixture day', time: '21:00' }, location: 'Fixture venue' }
    const container = await AstroContainer.create()
    const html = await container.renderToString(PosterGrid, { props: { category: { ...category, participants: [artist] } } })
    expect(html.match(/<dialog\b[^>]*>/)?.[0]).toContain('max-w-3xl')
    expect(html).toMatch(/<time[^>]*>Fixture day - 21:00hrs<\/time>/)
    expect(html).toMatch(/<span data-artist-location[^>]*>Fixture venue<\/span>/)
    const template = html.match(/<template data-event-template=[^>]*>([\s\S]*?)<\/template>/)?.[1]
    expect(template).toContain('Fixture day · 21:00')
    expect(template).toContain('Fixture venue')
    expect(template).toContain(`href="${artist.canonicalPath}"`)
    expect(template).toContain('Ver página del participante')
  })

  it('escapes text and optimizes supplied images with dimensions', async () => {
    const participant = { ...heroParticipants[0], name: '<script>name</script>', company: '<b>Company</b>', description: '<img src=x onerror=alert(1)>', image: { url: '/src/assets/branding/arc26-logo.png', alt: 'Actual image' } }
    const html = await render([participant])
    expect(html).toContain('&lt;script&gt;name&lt;/script&gt;')
    expect(html).toContain('&lt;b&gt;Company&lt;/b&gt;')
    expect(html).toContain('&lt;img src=x onerror=alert(1)&gt;')
    expect(html).toContain('alt="Actual image"'); expect(html).toMatch(/width="\d+"/); expect(html).toMatch(/height="\d+"/)
    expect(html).toContain('data-modal-header'); expect(html).toContain('data-modal-details')
    const withoutImage = await render([{ ...participant, image: null }])
    expect(withoutImage).not.toContain('<img')
    expect(withoutImage).toContain(`href="${participant.canonicalPath}"`)
    expect(withoutImage).toContain('Ver página del participante')
  })
})
