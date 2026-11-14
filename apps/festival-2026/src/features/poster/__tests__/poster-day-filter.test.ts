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
  for (const node of root.querySelectorAll('*')) node.getBoundingClientRect = () => rect(100)
  media = Object.assign(new EventTarget(), { matches: false })
  vi.stubGlobal('matchMedia', () => media); vi.stubGlobal('scrollTo', vi.fn())
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
  it.each(['json', 'ids', 'geometry', 'overlap', 'motif', 'dom'])('fails closed before writes for malformed %s setup', failure => {
    dispose()
    const json = root.querySelector('script')!
    const config = JSON.parse(json.textContent!)
    if (failure === 'json') json.textContent = '{'
    if (failure === 'ids') config.plans.saturday.ids.push('foreign')
    if (failure === 'geometry') config.plans.saturday.layouts.mobile.rows = -1
    if (failure === 'overlap') config.plans.all.layouts.mobile.artists[1] = { ...config.plans.all.layouts.mobile.artists[0], id: 'b' }
    if (failure === 'motif') config.plans.saturday.motifs[0].variant = 'unsafe'
    if (failure === 'dom') root.querySelector('[data-poster-artist="b"]')!.remove()
    if (failure !== 'json') json.textContent = JSON.stringify(config)
    const before = root.querySelector('[data-poster-grid]')!.outerHTML
    mount(); choose('saturday')
    expect(root.querySelector('fieldset')!.hidden).toBe(true)
    expect(root.querySelector('[data-poster-grid]')!.outerHTML).toBe(before)
    expect(inputs).toHaveLength(0); expect(root.querySelector('[data-day-count]')!.textContent).toBe('')
  })
  it('moves every real home information box at all ranges and restores exact Todos artwork/endpoints', () => {
    dispose()
    // Fixture has no stylesheet. Avoid jsdom's quadratic cascade walk over the
    // full home motif set; model the active mobile display variables explicitly.
    vi.spyOn(window, 'getComputedStyle').mockImplementation(element => {
      const node = element as HTMLElement
      return { display: node.hidden ? 'none' : node.style.display || node.style.getPropertyValue('--mobile-display') || 'block', visibility: node.style.visibility || 'visible', opacity: node.style.opacity || '1', paddingBottom: '0px' } as CSSStyleDeclaration
    })
    const home = createPosterFilterPlans({ scope: 'home', participants: plans.participants, information: homeInformation })
    root.querySelector('script')!.textContent = JSON.stringify(home)
    const grid = root.querySelector<HTMLElement>('[data-poster-grid]')!
    for (const node of grid.querySelectorAll('[data-poster-motif]')) node.remove()
    for (const m of home.plans.all.motifs) {
      const node = document.createElement('div'); node.dataset.posterMotif = m.variant; node.dataset.posterMotifIndex = String(m.index)
      node.innerHTML = `<svg><use href="#${m.variant}"></use></svg>`; grid.append(node)
    }
    for (const block of homeInformation) { const node = document.createElement('div'); node.dataset.posterInformation = block.id; grid.append(node) }
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
      for (const [index, node] of motifs.entries()) {
        expect(node.querySelector('use')!.getAttribute('href')).toBe(`#${target.motifs[index].variant}`)
        for (const range of ['mobile', 'tablet', 'desktop'] as const) {
          const rect = target.motifs[index].positions[range]
          expect(node.style.getPropertyValue(`--${range}-display`)).toBe(rect ? 'block' : 'none')
          if (rect) expect(node.style.getPropertyValue(`--${range}-row`)).toBe(String(rect.row))
        }
      }
    }
  })
  it('preserves a retained reading offset with clamped scroll compensation and restores anchoring', () => {
    vi.stubGlobal('scrollY', 400)
    vi.spyOn(document.documentElement, 'scrollHeight', 'get').mockReturnValue(3000)
    const artist = root.querySelector<HTMLElement>('[data-poster-artist="a"]')!
    artist.getBoundingClientRect = () => rect(artist.style.getPropertyValue('--mobile-row') ? 200 : 100)
    choose('saturday')
    expect(scrollTo).toHaveBeenCalledWith(0, 500)
    expect(document.documentElement.style.getPropertyValue('overflow-anchor')).toBe('none')
    inputs[0].onComplete()
    expect(document.documentElement.style.getPropertyValue('overflow-anchor')).toBe('')
    expect(document.documentElement.style.scrollBehavior).toBe('')
    expect(document.activeElement).toBe(root.querySelector('input[value="saturday"]'))
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
