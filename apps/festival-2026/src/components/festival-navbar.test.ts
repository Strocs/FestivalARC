import { experimental_AstroContainer as AstroContainer } from 'astro/container'
import { describe, expect, it } from 'vitest'
import FestivalNavbar from '@festivalarc/ui/FestivalNavbar.astro'
import PosterIntro from '../features/poster/PosterIntro.astro'
import Header from './Header.astro'

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
  it('renders the slogan as accessible live heading text', async () => {
    const container = await AstroContainer.create()
    const html = await container.renderToString(PosterIntro)
    const heading = html.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/)?.[0] ?? ''
    expect(heading.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim().toLowerCase())
      .toBe('el arte de habitar la ciudad')
  })

  it('keeps the visible poster dates consistent with the confirmed November header', async () => {
    const container = await AstroContainer.create()
    const html = await container.renderToString(PosterIntro)
    expect(html).toContain('28 y 29 de noviembre de 2026')
  })

  it('renders the minimal identity and mandatory editions without optional content', async () => {
    const html = await render()
    expect(html).toContain('28 y 29 de noviembre')
    expect(html).toContain('alt="Festival"')
    for (const edition of editions) {
      expect(html).toContain(`href="${edition.href}"`)
      expect(html).toContain(edition.label)
    }
    expect(html).not.toContain('Entradas')
    expect(html).not.toContain('Plaza de Armas de La Serena')
    expect(html).not.toContain('Redes del festival')
    expect(html).toContain('aria-label="Navegación principal"')
    expect(html).toContain('aria-label="Abrir navegación"')
    const desktop = html.match(/<nav\b[^>]*data-header-nav[\s\S]*?<\/nav>/)?.[0] ?? ''
    expect(desktop).not.toContain('data-editions-expanded')
    expect(desktop).toContain('aria-expanded="false"')
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
    expect(html).toContain('Programa')
    expect(html).toContain('Plaza de Armas de La Serena')
    expect(html).toContain('href="/entradas/"')
    expect(html).toContain('Redes del festival')
    expect(html).toContain('Entradas')
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

  it('renders the same five category destinations in the 2026 desktop group and mobile panel', async () => {
    const container = await AstroContainer.create()
    const html = await container.renderToString(Header)
    const desktop = html.match(/<nav\b[^>]*data-header-nav[\s\S]*?<\/nav>/)?.[0] ?? ''
    const panel = html.match(/<dialog\b[\s\S]*?<\/dialog>/)?.[0] ?? ''
    const expected = [['Inicio', '/'], ['Música', '/musica/'], ['Artes Escénicas', '/artes-escenicas/'], ['Expo Arte.Co', '/expo-arte-co/'], ['Mercado Creativo y DAZ', '/mercado-creativo-y-daz/']]
    for (const section of [desktop, panel]) {
      const group = section.match(/<ul\b[\s\S]*?<\/ul>/)?.[0] ?? ''
      expect(group.match(/<a\b/g)).toHaveLength(5)
      for (const [label, href] of expected) expect(group).toContain(`href="${href}"`)
      for (const [label] of expected) expect(group).toContain(`>${label}</a>`)
    }
    expect(desktop).toContain('data-header-links="centered"')
    expect(desktop).toContain('justify-center')
  })

  it('keeps default consumers uncentered and opts into a centered desktop group only explicitly', async () => {
    const options = { props: { editions, links: [{ label: 'Programa', href: '/programa/' }] } }
    const html = await render(options)
    expect(html).not.toContain('data-header-links="centered"')
    expect(html).toContain('hidden shrink-0 items-center gap-4 lg:flex')
    const centered = await render({ props: { ...options.props, centeredLinks: true } })
    expect(centered).toContain('data-header-links="centered"')
    expect(centered).toContain('lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)_minmax(0,1fr)]')
    expect(centered).toContain('href="/programa/"')
  })

  it('honors a custom public home destination', async () => {
    const html = await render({ props: { editions, homeHref: '/festival/' } })
    expect(html).toContain('href="/festival/"')
    expect(html).toContain('aria-label="Inicio"')
  })
})
