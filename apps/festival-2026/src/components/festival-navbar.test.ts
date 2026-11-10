import { experimental_AstroContainer as AstroContainer } from 'astro/container'
import { describe, expect, it } from 'vitest'
import FestivalNavbar from '@festivalarc/ui/FestivalNavbar.astro'
import Header from './Header.astro'
import PosterIntro from '../features/arc2026/components/PosterIntro.astro'

const editions = [
  { label: 'ARC 2025', href: '/ediciones/2025/' },
  { label: 'ARC 2024', href: '/ediciones/2024/' },
]
const slots = { logo: '<img alt="Festival" src="/logo.png">', date: '28 y 29 de noviembre' }

async function render(options = {}) {
  const container = await AstroContainer.create()
  return container.renderToString(FestivalNavbar, { props: { editions }, slots, ...options })
}

describe('FestivalNavbar public contract', () => {
  it('keeps the visible poster dates consistent with the confirmed November header', async () => {
    const container = await AstroContainer.create()
    const html = await container.renderToString(PosterIntro)
    expect(html).toContain('28.11')
    expect(html).toContain('29.11')
    expect(html).toContain('28 y 29 de noviembre de 2026')
    expect(html).not.toContain('28.10')
    expect(html).not.toContain('29.10')
  })

  it('renders the minimal identity and mandatory editions without optional content', async () => {
    const html = await render()
    expect(html).toContain('28 y 29 de noviembre')
    expect(html).toContain('alt="Festival"')
    for (const edition of editions) {
      expect(html).toContain(`href="${edition.href}"`)
      expect(html).toContain(edition.label)
    }
    expect(html).not.toContain('data-header-cta')
    expect(html).not.toContain('data-header-location')
    expect(html).toContain('data-header-editions')
  })

  it.each(['logo', 'date'])('rejects a missing required %s slot', async name => {
    const remainingSlots = Object.fromEntries(Object.entries(slots).filter(([key]) => key !== name))
    await expect(render({ slots: remainingSlots })).rejects.toThrow(name)
  })

  it('renders optional links, location, CTA and mobile extras through public slots', async () => {
    const html = await render({
      props: { editions, links: [{ label: 'Programa', href: '/programa/' }] },
      slots: { ...slots, location: 'Plaza de Armas de La Serena', cta: '<a href="/entradas/">Entradas</a>', 'mobile-extra': '<p>Redes del festival</p>' },
    })
    expect(html).toContain('href="/programa/"')
    expect(html).toContain('Plaza de Armas de La Serena')
    expect(html).toContain('href="/entradas/"')
    expect(html).toContain('Redes del festival')
    expect(html).toContain('data-header-cta')
  })

  it('keeps Inicio first and editions expanded in the mobile panel without visible close text', async () => {
    const html = await render({ props: { editions, homeHref: '/festival/', links: [{ label: 'Inicio', href: '/festival/' }, { label: 'Programa', href: '/programa/' }] } })
    const panel = html.match(/<dialog\b[\s\S]*?<\/dialog>/)?.[0] ?? ''
    expect(panel.match(/>Inicio<\/a>/g)).toHaveLength(1)
    expect(panel.indexOf('>Inicio</a>')).toBeLessThan(panel.indexOf('>Programa</a>'))
    expect(panel).toContain('Últimas ediciones')
    expect(panel).toContain('data-editions-expanded')
    expect(panel).not.toMatch(/<ul[^>]*hidden/)
    expect(panel).not.toContain('>Cerrar navegación</button>')
  })

  it('uses one header button with both menu and close symbols, not a separate panel close', async () => {
    const html = await render()
    const toggle = html.match(/<button\b[^>]*data-header-toggle[\s\S]*?<\/button>/)?.[0] ?? ''
    expect(toggle).toContain('data-icon-menu')
    expect(toggle.match(/data-icon-line/g)).toHaveLength(3)
    expect(toggle).not.toContain('data-icon-close')
    expect(html).not.toContain('data-header-close')
  })

  it('matches the footer border weight and color on the 2026 header only', async () => {
    const container = await AstroContainer.create()
    const html = await container.renderToString(Header)
    expect(html).toContain('[&amp;_[data-festival-header]]:border-b')
    expect(html).toContain('--header-border-color:color-mix(in_oklab,var(--color-primary)_10%,transparent)')
  })

  it('does not darken the page behind the mobile panel', async () => {
    const html = await render()
    expect(html).toContain('backdrop:bg-transparent')
    expect(html).not.toContain('backdrop:bg-black')
  })

  it('exposes stable style hooks, color tokens and the 2024 height reference', async () => {
    const html = await render()
    for (const hook of ['festival-header', 'header-brand', 'header-nav', 'header-editions', 'header-toggle', 'header-panel']) {
      expect(html).toContain(`data-${hook}`)
    }
    expect(html).toContain('--header-bg-color')
    expect(html).toContain('--header-text-color')
    expect(html).toContain('py-1')
    expect(html).toContain('min-h-16')
  })
})
