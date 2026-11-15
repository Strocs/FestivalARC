// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { mountEventModal } from '../../artists/event-modal'
import { createPosterFilterPlans } from '../poster-filter-layout'
import { homeInformation } from '../poster-layout'
import type { FilterMotionInput } from '../poster-filter-motion'

let root: HTMLElement
let dispose: () => void
let media: EventTarget & { matches: boolean }
let inputs: FilterMotionInput[]
const plans = createPosterFilterPlans({ scope: 'category', participants: [{ id: 'a', day: 'Sábado 28' }, { id: 'b', day: 'Domingo 29' }], information: [] })
const rect = (top: number) => ({ x: 0, y: top, left: 0, top, right: 100, bottom: top + 50, width: 100, height: 50, toJSON() {} })
const choose = (key: string) => {
  const radio = root.querySelector<HTMLInputElement>(`input[value="${key}"]`)!
  radio.checked = true; radio.focus(); radio.dispatchEvent(new Event('change', { bubbles: true }))
}
const visible = () => [...root.querySelectorAll<HTMLElement>('[data-poster-artist]')].filter(n => !n.hidden && !n.inert).map(n => n.dataset.posterArtist)
function mount() {
  dispose = mountEventModal(root, { createFilterMotion: input => { inputs.push(input); return { dispose: vi.fn() } }, createMotion: () => ({ dispose() {}, reverse() {} }) })
}
beforeEach(() => {
  document.body.innerHTML = `<main data-event-scope><section data-poster-grid>${plans.plans.all.motifs.map(m => `<div data-poster-motif="${m.variant}" data-poster-motif-index="${m.index}"><svg><use href="#${m.variant}"></use></svg></div>`).join('')}${['a', 'b'].map(id => `<div data-poster-artist="${id}"><a href="/musica/${id}/" data-event-trigger data-event-id="${id}"><span data-artist-surface>${id}</span></a></div>`).join('')}</section><fieldset hidden data-day-filter><legend>Filtrar artistas por día</legend>${['all', 'saturday', 'sunday'].map(key => `<label><input name="day" type="radio" value="${key}" ${key === 'all' ? 'checked' : ''}>${key}</label>`).join('')}<span role="status" data-day-count></span></fieldset><script type="application/json" data-poster-plans>${JSON.stringify(plans)}</script><dialog><div data-modal-panel><button data-modal-close>Close</button><div data-modal-content></div></div></dialog>${['a', 'b'].map(id => `<template data-event-template="${id}"><h2 id="event-modal-title" tabindex="-1">${id}</h2></template>`).join('')}</main>`
  root = document.querySelector('main')!
  const dialog = root.querySelector('dialog')!
  dialog.showModal = vi.fn(() => { dialog.open = true }); dialog.close = vi.fn(() => { dialog.open = false })
  vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(() => rect(100))
  media = Object.assign(new EventTarget(), { matches: false })
  vi.stubGlobal('matchMedia', () => media); vi.stubGlobal('scrollTo', vi.fn())
  // No stylesheet in this fixture: model mobile visibility without jsdom's
  // quadratic cascade walk across the shared multi-range motif pool.
  vi.spyOn(window, 'getComputedStyle').mockImplementation(element => {
    const node = element as HTMLElement
    return { display: node.hidden ? 'none' : node.style.display || node.style.getPropertyValue('--mobile-display') || 'block', visibility: node.style.visibility || 'visible', opacity: node.style.opacity || '1', paddingBottom: node.style.paddingBottom || '0px' } as CSSStyleDeclaration
  })
  inputs = []; dispose = () => {}; mount()
})
afterEach(() => { dispose(); document.body.innerHTML = ''; document.body.removeAttribute('style'); document.documentElement.removeAttribute('style'); vi.unstubAllGlobals(); vi.restoreAllMocks() })

describe('day filtering through the sole modal owner', () => {
  it('keeps controls available, intersects scope, disables outgoing anchors and restores exact Todos endpoints without navigation', () => {
    const push = vi.spyOn(history, 'pushState'); const replace = vi.spyOn(history, 'replaceState'); const url = location.href
    const original = root.querySelector('script')!.textContent
    choose('saturday')
    expect(root.querySelector('fieldset')!.hidden).toBe(false)
    expect(visible()).toEqual(['a'])
    expect(root.querySelector('[data-poster-artist="b"] a')!.getAttribute('tabindex')).toBe('-1')
    expect(root.querySelector('[data-day-count]')!.textContent).toBe('')
    inputs[0].onComplete()
    expect(root.querySelector<HTMLElement>('[data-poster-artist="b"]')!.hidden).toBe(true)
    expect(root.querySelector('[data-day-count]')!.textContent).toBe('1 artistas')
    choose('all'); inputs.at(-1)!.onComplete()
    expect(visible()).toEqual(['a', 'b'])
    expect(root.querySelector('[data-poster-artist="b"] a')!.hasAttribute('tabindex')).toBe(false)
    for (const range of ['mobile', 'tablet', 'desktop'] as const) {
      expect(root.querySelector<HTMLElement>('[data-poster-grid]')!.style.getPropertyValue(`--${range}-rows`)).toBe(String(plans.plans.all.layouts[range].rows))
    }
    expect(root.querySelector('script')!.textContent).toBe(original)
    expect(document.activeElement).toBe(root.querySelector('input[value="all"]'))
    expect(location.href).toBe(url); expect(push).not.toHaveBeenCalled(); expect(replace).not.toHaveBeenCalled()
  })
  it('accepts trimmed endpoints with logical reserves beyond the visible bottom', () => {
    dispose()
    const config = structuredClone(plans)
    const target = config.plans.saturday
    for (const range of ['mobile', 'tablet', 'desktop'] as const) {
      const layout = target.layouts[range]
      layout.rows = Math.max(...layout.artists.map(a => a.row + a.height))
      layout.motifs = layout.motifs.filter(m => m.row < layout.rows)
      for (const motif of target.motifs) {
        if (layout.motifs[motif.index]) motif.positions[range] = layout.motifs[motif.index]
        else delete motif.positions[range]
      }
    }
    root.querySelector('script')!.textContent = JSON.stringify(config)
    mount()
    expect(root.querySelector('fieldset')!.hidden).toBe(false)
    choose('saturday')
    expect(visible()).toEqual(['a'])
    expect(inputs).toHaveLength(1)
    inputs[0].onComplete()
    expect(root.querySelector('[data-day-count]')!.textContent).toBe('1 artistas')
    for (const range of ['mobile', 'tablet', 'desktop'] as const) {
      expect(root.querySelector<HTMLElement>('[data-poster-grid]')!.style.getPropertyValue(`--${range}-rows`)).toBe(String(target.layouts[range].rows))
    }
  })
  it('accepts the home opening band and restores every pooled destination dimension for each day and Todos', () => {
    dispose()
    const config = createPosterFilterPlans({ scope: 'home', participants: plans.participants, information: [homeInformation[0]] })
    // Author the handoff independently so acceptance is tested before builder support.
    for (const plan of Object.values(config.plans)) {
      plan.layouts.mobile.motifs = [
        ...[4, 6].flatMap(row => [0, 2, 4, 6].map(column => ({ column, row, width: 2, height: 2 }))),
        ...plan.layouts.mobile.motifs.filter(m => m.row < 4 || m.row >= 8),
      ]
      for (const motif of plan.motifs) for (const range of ['mobile', 'tablet', 'desktop'] as const) {
        const destination = plan.layouts[range].motifs[motif.index]
        if (destination) motif.positions[range] = destination
        else delete motif.positions[range]
      }
    }
    root.querySelector('script')!.textContent = JSON.stringify(config)
    const grid = root.querySelector<HTMLElement>('[data-poster-grid]')!
    for (const node of grid.querySelectorAll('[data-poster-motif]')) node.remove()
    grid.insertAdjacentHTML('beforeend', config.plans.all.motifs.map(m => `<div data-poster-motif="${m.variant}" data-poster-motif-index="${m.index}"><svg><use href="#${m.variant}"></use></svg></div>`).join('') + '<div data-poster-information="intro"></div>')
    media.matches = true
    mount()
    expect(root.querySelector('fieldset')!.hidden).toBe(false)
    for (const key of ['saturday', 'sunday', 'all'] as const) {
      choose(key)
      expect(visible()).toEqual(config.plans[key].ids)
      expect(root.querySelector('[data-day-count]')!.textContent).toBe(`${config.plans[key].ids.length} artistas`)
      const nodes = [...grid.querySelectorAll<HTMLElement>('[data-poster-motif]')].filter(n => !n.hidden).sort((a, b) => Number(a.dataset.posterMotifIndex) - Number(b.dataset.posterMotifIndex))
      expect(nodes).toHaveLength(config.plans[key].motifs.length)
      for (const [index, node] of nodes.entries()) {
        const motif = config.plans[key].motifs[index]
        expect(node.querySelector('use')!.getAttribute('href')).toBe(`#${motif.variant}`)
        for (const range of ['mobile', 'tablet', 'desktop'] as const) {
          const destination = motif.positions[range]
          expect(node.style.getPropertyValue(`--${range}-display`)).toBe(destination ? 'block' : 'none')
          for (const property of ['column', 'row', 'width', 'height'] as const) expect(node.style.getPropertyValue(`--${range}-${property}`)).toBe(String(destination?.[property] ?? (property === 'width' || property === 'height' ? 1 : 0)))
        }
      }
    }
    expect(inputs).toHaveLength(0)
  })
  it.each(['category-double', 'tablet-double', 'outside-band', 'unaligned', 'wrong-shape', 'overlapping-motifs', 'missing-coverage', 'out-of-bounds'])('rejects unauthorized motif geometry %s without endpoint or count writes', failure => {
    dispose()
    const config = failure === 'category-double' ? structuredClone(plans) : createPosterFilterPlans({ scope: 'home', participants: plans.participants, information: [homeInformation[0]] })
    const range = failure === 'tablet-double' ? 'tablet' : 'mobile'
    const endpoint = failure === 'category-double' ? config.plans.all : config.plans.saturday
    const layout = endpoint.layouts[range]
    const target = layout.motifs[0]
    Object.assign(target, { width: 2, height: 2 })
    if (failure === 'outside-band') target.row = 8
    if (failure === 'unaligned') Object.assign(target, { column: 1, row: 4 })
    if (failure === 'wrong-shape') target.height = 1
    if (failure === 'out-of-bounds') target.column = 8
    if (failure === 'overlapping-motifs') Object.assign(layout.motifs[1], target)
    endpoint.motifs[0].positions[range] = target
    if (failure === 'missing-coverage') {
      layout.motifs.pop()
      delete config.plans.saturday.motifs[layout.motifs.length].positions[range]
    }
    root.querySelector('script')!.textContent = JSON.stringify(config)
    const grid = root.querySelector('[data-poster-grid]')!
    for (const node of grid.querySelectorAll('[data-poster-motif]')) node.remove()
    grid.insertAdjacentHTML('beforeend', config.plans.all.motifs.map(m => `<div data-poster-motif="${m.variant}" data-poster-motif-index="${m.index}"><svg><use href="#${m.variant}"></use></svg></div>`).join('') + (config.scope === 'home' ? '<div data-poster-information="intro"></div>' : ''))
    const before = grid.outerHTML
    const handoff = root.querySelector('script')!.textContent
    const bodyStyle = document.body.getAttribute('style')
    mount(); choose('saturday')
    expect(root.querySelector('script')!.textContent).toBe(handoff)
    expect(document.body.getAttribute('style')).toBe(bodyStyle)
    expect(root.querySelector('fieldset')!.hidden).toBe(true)
    expect(root.querySelector('[data-poster-grid]')!.outerHTML).toBe(before)
    expect(visible()).toEqual(['a', 'b'])
    expect(root.querySelector('[data-day-count]')!.textContent).toBe('')
    expect(inputs).toHaveLength(0)
  })
  it('rebases latest intent and rejects every stale count/removal callback', () => {
    choose('saturday'); const abandoned = inputs[0]
    choose('sunday'); const latest = inputs[1]
    abandoned.onComplete()
    expect(visible()).toEqual(['b']); expect(root.querySelector('[data-day-count]')!.textContent).toBe('')
    latest.onComplete()
    expect(root.querySelector('[data-day-count]')!.textContent).toBe('1 artistas')
    expect(root.querySelector<HTMLElement>('[data-poster-artist="b"]')!.hidden).toBe(false)
    choose('sunday'); expect(inputs).toHaveLength(2)
  })
  it('settles before modal measurement, rejects excluded sources, and reverts synthetic radio checks throughout modality', () => {
    choose('saturday')
    const excluded = root.querySelector<HTMLAnchorElement>('[data-event-id="b"]')!
    const click = new MouseEvent('click', { bubbles: true, cancelable: true }); excluded.dispatchEvent(click)
    expect(click.defaultPrevented).toBe(true); expect(root.querySelector('dialog')!.open).toBe(false)
    root.querySelector<HTMLAnchorElement>('[data-event-id="a"]')!.click()
    expect(root.querySelector('dialog')!.open).toBe(true)
    expect(root.querySelector('[data-day-count]')!.textContent).toBe('1 artistas')
    choose('sunday')
    expect(root.querySelector<HTMLInputElement>('input[value="saturday"]')!.checked).toBe(true)
    expect(visible()).toEqual(['a']); expect(inputs).toHaveLength(1)
  })
  it.each(['cold idle', 'completed filter'])('does not rewrite grid visibility on idle resize or valid modal opening: %s', state => {
    if (state === 'completed filter') {
      choose('saturday')
      inputs[0].onComplete()
      expect(visible()).toEqual(['a'])
      expect(root.querySelector('[data-day-count]')!.textContent).toBe('1 artistas')
    }
    const wrappers = [...root.querySelectorAll<HTMLElement>('[data-poster-artist], [data-poster-motif]')]
    const writes = wrappers.flatMap(node => [
      vi.spyOn(node, 'hidden', 'set'),
      vi.spyOn(node.style, 'display', 'set'),
      vi.spyOn(node.style, 'removeProperty'),
    ])
    const expectedArtists = state === 'cold idle' ? ['a', 'b'] : ['a']
    const expectedCount = state === 'cold idle' ? '' : '1 artistas'
    window.dispatchEvent(new Event('resize'))
    expect(visible()).toEqual(expectedArtists)
    expect(root.querySelector('[data-day-count]')!.textContent).toBe(expectedCount)
    for (const write of writes) expect(write).not.toHaveBeenCalled()
    root.querySelector<HTMLAnchorElement>('[data-event-id="a"]')!.click()
    expect(root.querySelector('dialog')!.open).toBe(true)
    expect(root.querySelector('[data-modal-content] h2')!.textContent).toBe('a')
    expect(visible()).toEqual(expectedArtists)
    expect(root.querySelector('[data-day-count]')!.textContent).toBe(expectedCount)
    for (const write of writes) expect(write).not.toHaveBeenCalled()
  })
  it('focuses a surviving filtered member after its modal origin disappears', () => {
    dispose()
    const expanded = createPosterFilterPlans({
      scope: 'category',
      participants: [
        { id: 'a', day: 'Sábado 28' },
        { id: 'b', day: 'Sábado 28' },
        { id: 'c', day: 'Domingo 29' },
      ],
      information: [],
    })
    root.querySelector('script')!.textContent = JSON.stringify(expanded)
    const grid = root.querySelector('[data-poster-grid]')!
    grid.innerHTML = expanded.plans.all.motifs.map(m =>
      `<div data-poster-motif="${m.variant}" data-poster-motif-index="${m.index}"><svg><use href="#${m.variant}"></use></svg></div>`,
    ).join('') + ['a', 'b', 'c'].map(id =>
      `<div data-poster-artist="${id}"><a href="/musica/${id}/" data-event-trigger data-event-id="${id}"><span data-artist-surface>${id}</span></a></div>`,
    ).join('')
    inputs = []
    mount()
    choose('saturday')
    inputs[0].onComplete()
    const origin = root.querySelector<HTMLAnchorElement>('[data-event-id="b"]')!
    origin.click()
    expect(root.querySelector('dialog')!.open).toBe(true)
    origin.remove()
    root.querySelector<HTMLElement>('[data-modal-close]')!.click()
    window.dispatchEvent(new Event('resize'))
    expect(root.querySelector('dialog')!.open).toBe(false)
    expect(document.activeElement).toBe(root.querySelector('[data-event-id="a"]'))
    expect(root.querySelector<HTMLElement>('[data-poster-artist="c"]')!.hidden).toBe(true)
    expect(root.querySelector<HTMLInputElement>('input[value="saturday"]')!.checked).toBe(true)
  })
  it('settles resize and preference changes immediately with stale completions guarded', () => {
    choose('saturday'); window.dispatchEvent(new Event('resize'))
    expect(root.querySelector('[data-day-count]')!.textContent).toBe('1 artistas')
    media.matches = true; media.dispatchEvent(new Event('change')); choose('sunday')
    expect(inputs).toHaveLength(1); expect(visible()).toEqual(['b'])
    inputs[0].onComplete(); expect(visible()).toEqual(['b'])
  })
  it('restores only owned state on teardown, supports reconnect and ignores abandoned callbacks', () => {
    dispose(); document.body.style.cssText = 'padding-bottom:13px;overflow:clip;padding-right:7px'
    mount(); choose('saturday'); dispose()
    inputs[0].onComplete()
    expect(visible()).toEqual(['a', 'b']); expect(root.querySelector('fieldset')!.hidden).toBe(true)
    expect(root.querySelector<HTMLInputElement>('input[value="all"]')!.checked).toBe(true)
    expect(document.body.style.paddingBottom).toBe('13px'); expect(document.body.style.overflow).toBe('clip'); expect(document.body.style.paddingRight).toBe('7px')
    mount(); choose('sunday'); inputs.at(-1)!.onComplete(); expect(visible()).toEqual(['b'])
  })
  it.each(['json', 'ids', 'geometry', 'overlap', 'protected-envelope', 'missing-visible-motif', 'visible-bounds', 'motif', 'dom'])('fails closed before writes for malformed %s setup', failure => {
    dispose()
    const json = root.querySelector('script')!
    const config = JSON.parse(json.textContent!)
    if (failure === 'json') json.textContent = '{'
    if (failure === 'ids') config.plans.saturday.ids.push('foreign')
    if (failure === 'geometry') config.plans.saturday.layouts.mobile.rows = -1
    if (failure === 'overlap') config.plans.all.layouts.mobile.artists[1] = { ...config.plans.all.layouts.mobile.artists[0], id: 'b' }
    if (failure === 'protected-envelope') {
      // Visible artists do not overlap; only a's protected row intersects b.
      const layout = config.plans.all.layouts.mobile
      layout.artists[1].row = layout.artists[0].row + layout.artists[0].height
      layout.rows = layout.artists[1].row + layout.artists[1].height
      layout.motifs = []
      for (const motif of config.plans.all.motifs) delete motif.positions.mobile
    }
    if (failure === 'missing-visible-motif') {
      config.plans.saturday.layouts.desktop.motifs.pop()
      const last = config.plans.saturday.layouts.desktop.motifs.length
      delete config.plans.saturday.motifs[last].positions.desktop
    }
    if (failure === 'visible-bounds') config.plans.saturday.layouts.mobile.rows = config.plans.saturday.layouts.mobile.artists[0].row + 1
    if (failure === 'motif') config.plans.saturday.motifs[0].variant = 'unsafe'
    if (failure === 'dom') root.querySelector('[data-poster-artist="b"]')!.remove()
    if (failure !== 'json') json.textContent = JSON.stringify(config)
    const before = root.querySelector('[data-poster-grid]')!.outerHTML
    const handoff = json.textContent
    const bodyStyle = document.body.getAttribute('style')
    mount(); choose('saturday')
    expect(json.textContent).toBe(handoff)
    expect(document.body.getAttribute('style')).toBe(bodyStyle)
    expect(root.querySelector('fieldset')!.hidden).toBe(true)
    expect(root.querySelector('[data-poster-grid]')!.outerHTML).toBe(before)
    expect(inputs).toHaveLength(0); expect(root.querySelector('[data-day-count]')!.textContent).toBe('')
  })
  it('moves every real home information box at all ranges and restores exact Todos artwork/endpoints', () => {
    dispose()
    const home = createPosterFilterPlans({ scope: 'home', participants: plans.participants, information: homeInformation })
    root.querySelector('script')!.textContent = JSON.stringify(home)
    const grid = root.querySelector<HTMLElement>('[data-poster-grid]')!
    for (const node of grid.querySelectorAll('[data-poster-motif]')) node.remove()
    grid.insertAdjacentHTML('beforeend', home.plans.all.motifs.map(m =>
      `<div data-poster-motif="${m.variant}" data-poster-motif-index="${m.index}"><svg><use href="#${m.variant}"></use></svg></div>`,
    ).join('') + homeInformation.map(block => `<div data-poster-information="${block.id}"></div>`).join(''))
    mount()
    for (const key of ['saturday', 'sunday', 'all'] as const) {
      choose(key); inputs.at(-1)!.onComplete()
      const target = home.plans[key]
      for (const range of ['mobile', 'tablet', 'desktop'] as const) {
        expect(grid.style.getPropertyValue(`--${range}-rows`)).toBe(String(target.layouts[range].rows))
        for (const node of grid.querySelectorAll<HTMLElement>('[data-poster-information]')) {
          const rect = target.information[range][node.dataset.posterInformation!]
          expect(node.style.getPropertyValue(`--${range}-display`)).toBe(rect ? 'grid' : 'none')
          if (rect) for (const prop of ['column', 'row', 'width', 'height'] as const) expect(node.style.getPropertyValue(`--${range}-${prop}`)).toBe(String(rect[prop]))
        }
      }
      const motifs = [...grid.querySelectorAll<HTMLElement>('[data-poster-motif]')].filter(n => !n.hidden).sort((a, b) => Number(a.dataset.posterMotifIndex) - Number(b.dataset.posterMotifIndex))
      expect(motifs.map(n => n.dataset.posterMotif)).toEqual(target.motifs.map(m => m.variant))
      expect(new Set(motifs).size).toBe(motifs.length)
      expect(motifs.map(node => ({
        href: node.querySelector('use')!.getAttribute('href'),
        ranges: ['mobile', 'tablet', 'desktop'].map(range => ({
          display: node.style.getPropertyValue(`--${range}-display`),
          row: node.style.getPropertyValue(`--${range}-row`),
        })),
      }))).toEqual(target.motifs.map(motif => ({
        href: `#${motif.variant}`,
        ranges: (['mobile', 'tablet', 'desktop'] as const).map(range => ({
          display: motif.positions[range] ? 'block' : 'none',
          row: String(motif.positions[range]?.row ?? 0),
        })),
      })))
    }
  })
  it.each([
    { y: 400, height: 3000, destination: undefined },
    { y: 2400, height: 1500, destination: 900 },
  ])('preserves viewport position and only clamps beyond the new bottom: $y', ({ y, height, destination }) => {
    vi.stubGlobal('scrollY', y)
    vi.stubGlobal('innerHeight', 600)
    vi.spyOn(document.documentElement, 'scrollHeight', 'get').mockReturnValue(height)
    const artist = root.querySelector<HTMLElement>('[data-poster-artist="a"]')!
    artist.getBoundingClientRect = () => rect(artist.style.getPropertyValue('--mobile-row') ? 200 : 100)
    choose('saturday')
    if (destination === undefined) expect(scrollTo).not.toHaveBeenCalled()
    else {
      expect(scrollTo).toHaveBeenCalledExactlyOnceWith(0, destination)
    }
    window.dispatchEvent(new Event('resize'))
    expect(visible()).toEqual(['a'])
    expect(root.querySelector('[data-day-count]')!.textContent).toBe('1 artistas')
    expect(document.activeElement).toBe(root.querySelector('input[value="saturday"]'))
  })
  it('offers motion only changed viewport tiles while applying the complete day selection', () => {
    vi.mocked(HTMLElement.prototype.getBoundingClientRect).mockImplementation(() => rect(10000))
    const artist = root.querySelector<HTMLElement>('[data-poster-artist="a"]')!
    artist.getBoundingClientRect = () => rect(artist.style.getPropertyValue('--mobile-row') ? 200 : 100)
    choose('saturday')
    expect(inputs).toHaveLength(1)
    expect(inputs[0].items.map(item => item.node)).toEqual([artist])
    inputs[0].onComplete()
    expect(visible()).toEqual(['a'])
    expect(root.querySelector('[data-day-count]')!.textContent).toBe('1 artistas')
  })
  it('skips animation geometry for reduced motion and repeated selections', () => {
    media.matches = true
    const geometry = vi.mocked(HTMLElement.prototype.getBoundingClientRect)
    geometry.mockClear()
    choose('saturday')
    choose('saturday')
    expect(geometry).not.toHaveBeenCalled()
    expect(inputs).toHaveLength(0)
    expect(visible()).toEqual(['a'])
    expect(root.querySelector('[data-day-count]')!.textContent).toBe('1 artistas')
  })
  it('filters independently when native dialog is unavailable and retains ordinary fallback links', () => {
    dispose(); root.querySelector('dialog')!.showModal = undefined as never
    mount(); choose('sunday'); inputs[0].onComplete()
    expect(visible()).toEqual(['b']); expect(root.querySelector('fieldset')!.hidden).toBe(false)
    const event = new MouseEvent('click', { bubbles: true, cancelable: true })
    root.querySelector('[data-event-id="b"]')!.dispatchEvent(event)
    expect(event.defaultPrevented).toBe(false)
  })
})
