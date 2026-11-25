import { experimental_AstroContainer as AstroContainer } from 'astro/container'
import { describe, expect, it } from 'vitest'
import EventModal from '../EventModal.astro'
import { categories, heroParticipants, type ParticipantView } from '../categories'

async function render(participants: readonly ParticipantView[] = heroParticipants) {
  const container = await AstroContainer.create()
  return container.renderToString(EventModal, { props: { participants } })
}
describe('prerendered modal boundary', () => {
  it('renders one native named dialog and only the relevant inert templates, without catalog serialization', async () => {
    const html = await render(categories[2].participants)
    expect(html.match(/<dialog\b/g)).toHaveLength(1)
    expect(html).toContain('aria-labelledby="event-modal-title"')
    expect(html).toMatch(/<button\b[^>]*data-modal-close[^>]*>Cerrar<\/button>/)
    expect(html.match(/<template\b/g)).toHaveLength(8)
    for (const participant of categories[2].participants) expect(html).toContain(`data-event-template="${participant.id}"`)
    expect(html).not.toContain('data-event-template="polter"')
    expect(html).not.toContain('<h1'); expect(html).not.toContain('application/json')
    expect(html).not.toContain('Descripción próximamente')
    expect(html).not.toContain('<img')
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
