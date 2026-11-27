import { experimental_AstroContainer as AstroContainer } from 'astro/container'
import { describe, expect, it, vi } from 'vitest'
import { createPublicationUrlTools } from '../utils/publication'

const publicationBase = vi.hoisted(() => ({ value: '/' }))
vi.mock('../utils/publication', async importOriginal => {
  const original = await importOriginal<typeof import('../utils/publication')>()
  return {
    ...original,
    publicPath: (path: string) => original.createPublicationUrlTools(publicationBase.value).publicPath(path),
    categoryLink: (path: string) => original.createPublicationUrlTools(publicationBase.value).categoryLink(path),
  }
})
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
  it.each(['/', '/festival/2026/'])('marks only the exact home or parent category under base %s, with four distinct external motifs', async base => {
    publicationBase.value = base
    const { publicPath } = createPublicationUrlTools(base)
    try {
      for (const [path, active, current] of [
        ['/', '/', 'page'], ['/musica/', '/musica/', 'page'],
        ['/musica/javiera-mena/', '/musica/', 'true'],
        ['/artes-escenicas/lobas/', '/artes-escenicas/', 'true'],
        ['/expo-arte-co/', '/expo-arte-co/', 'page'],
        ['/mercado-creativo-y-daz/ejemplo/', '/mercado-creativo-y-daz/', 'true'],
        ['/musica-extra/', '', ''],
      ]) {
        const container = await AstroContainer.create()
        const html = await container.renderToString(Header, { request: new Request(`https://arc.test${publicPath(path)}`) })
        const desktop = html.match(/<nav\b[^>]*data-header-nav[\s\S]*?<\/nav>/)?.[0] ?? ''
        const panel = html.match(/<dialog\b[\s\S]*?<\/dialog>/)?.[0] ?? ''
        for (const section of [desktop, panel]) {
          const group = section.match(/<ul\b[\s\S]*?<\/ul>/)?.[0] ?? ''
          const anchors = [...group.matchAll(/<a\b[^>]*>/g)].map(match => match[0])
          expect(anchors).toHaveLength(5)
          expect(new Set(anchors.map(anchor => anchor.match(/href="([^"]+)"/)?.[1])).size).toBe(5)
          const selected = anchors.filter(anchor => anchor.includes('aria-current='))
          expect(selected).toHaveLength(active ? 1 : 0)
          if (active) {
            const activeHref = base === '/' && active === '/musica/' ? '/musica' : publicPath(active)
            expect(selected[0]).toContain(`href="${activeHref}"`)
            expect(selected[0]).toContain(`aria-current="${current}"`)
            expect(html).toContain('[&amp;_a[aria-current]]:text-arc-yellow')
          }
          expect(group).not.toContain('underline')
        }
        const tiles = [...desktop.matchAll(/<li\b[^>]*data-link-separator[\s\S]*?<\/li>/g)].map(match => match[0])
        expect(tiles).toHaveLength(4)
        const fragments = tiles.map(tile => {
          expect(tile).toContain('aria-hidden="true"')
          expect(tile).toContain('width="16"')
          expect(tile).toContain('height="16"')
          expect(tile).toContain('focusable="false"')
          expect(tile).not.toMatch(/<a\b|tabindex|<defs|\bid=/)
          return tile.match(/<use href="([^"]+)"/)?.[1]
        })
        expect(new Set(fragments).size).toBe(4)
        expect(fragments.every(href => href?.includes('poster-motifs.svg#'))).toBe(true)
        expect(desktop.match(/<ul\b[\s\S]*?<\/ul>/)?.[0].match(/<li\b[\s\S]*?<\/li>/g)?.map(li => li.includes('data-link-separator'))).toEqual([false, true, false, true, false, true, false, true, false])
      }
    } finally { publicationBase.value = '/' }
  })

  it('keeps opt-ins absent, legacy underlines/colors and input arrays unchanged by default', async () => {
    const links = [{ label: 'Inicio', href: '/' }, { label: 'Programa', href: '/programa/' }]
    const before = structuredClone({ editions, links })
    const html = await render({ props: { editions, links } })
    expect(html).toContain('hover:underline')
    expect(html).not.toContain('aria-current=')
    expect(html).not.toContain('data-link-separator')
    expect(html).not.toContain('text-arc-yellow')
    expect({ editions, links }).toEqual(before)
  })

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

  it('opts only 2026 into the stationary layered mobile mode', async () => {
    expect(await render()).toContain('data-mobile-panel-mode="modal"')
    expect(await render({ props: { editions, mobilePanelMode: 'layered' } })).toContain('data-mobile-panel-mode="layered"')
    const container = await AstroContainer.create()
    expect(await container.renderToString(Header)).toContain('data-mobile-panel-mode="layered"')
  })

  it('anchors layered editions outside the centered links and keeps the legacy group intact', async () => {
    const layered = await render({ props: { editions, mobilePanelMode: 'layered' } })
    const panel = layered.match(/<dialog\b[\s\S]*?<\/dialog>/)?.[0] ?? ''
    expect(panel).toContain('min-h-dvh')
    expect(panel.indexOf('</nav>')).toBeLessThan(panel.indexOf('data-editions-expanded'))
    const legacy = (await render()).match(/<dialog\b[\s\S]*?<\/dialog>/)?.[0] ?? ''
    expect(legacy.indexOf('data-editions-expanded')).toBeLessThan(legacy.indexOf('</nav>'))
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

  it('hides the 2026 editions menu at every viewport width', async () => {
    const container = await AstroContainer.create()
    const html = await container.renderToString(Header)
    const wrapper = html.match(/<div\s+data-poster-header\b(?:[^"'<>]|"[^"]*"|'[^']*')*>/)?.[0] ?? ''
    const classes = wrapper.match(/class="([^"]*)"/)?.[1].replaceAll('&amp;', '&').split(/\s+/) ?? []
    expect(classes).toContain('[&_[data-header-editions]]:hidden')
    expect(html.match(/\bdata-header-editions(?=[\s>])/g)).toHaveLength(2)
  })

  it('renders the same five category destinations in the 2026 desktop group and mobile panel', async () => {
    const container = await AstroContainer.create()
    const html = await container.renderToString(Header)
    const desktop = html.match(/<nav\b[^>]*data-header-nav[\s\S]*?<\/nav>/)?.[0] ?? ''
    const panel = html.match(/<dialog\b[\s\S]*?<\/dialog>/)?.[0] ?? ''
    const expected = [['Inicio', '/'], ['Música', '/musica'], ['Artes Escénicas', '/artes-escenicas/'], ['Expo Arte.Co', '/expo-arte-co/'], ['Mercado Creativo y DAZ', '/mercado-creativo-y-daz/']]
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
