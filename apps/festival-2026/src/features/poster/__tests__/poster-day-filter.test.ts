// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { mountEventModal } from '../../artists/event-modal'
import { createPosterFilterPlans } from '../poster-filter-layout'
import { homeInformation } from '../poster-layout'
import type { FilterMotionInput } from '../poster-filter-motion'
import { compilePosterFilterTransitions, diffPosterPositions } from '../poster-filter-transitions'
import type { DayKey } from '../poster-filter-layout'
import * as motifMatcher from '../poster-motif-match'

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
  document.body.innerHTML = `<main data-event-scope><section data-poster-grid>${plans.plans.all.motifs.map(m => `<div data-poster-motif="${m.variant}" data-poster-motif-index="${m.index}"><svg><use href="#${m.variant}"></use></svg></div>`).join('')}${['a', 'b'].map(id => `<div data-poster-artist="${id}"><a href="/musica/${id}/" data-event-trigger data-event-id="${id}"><span data-artist-surface></span><span data-artist-name>${id}</span></a></div>`).join('')}</section><fieldset hidden data-day-filter><legend>Filtrar artistas por día</legend>${['all', 'saturday', 'sunday'].map(key => `<label><input name="day" type="radio" value="${key}" ${key === 'all' ? 'checked' : ''}>${key}</label>`).join('')}<span role="status" data-day-count></span></fieldset><script type="application/json" data-poster-plans>${JSON.stringify(plans)}</script><dialog><div data-modal-panel><button data-modal-close>Close</button><div data-modal-content></div></div></dialog>${['a', 'b'].map(id => `<template data-event-template="${id}"><h2 id="event-modal-title" tabindex="-1">${id}</h2></template>`).join('')}</main>`
  root = document.querySelector('main')!
  const grid = root.querySelector<HTMLElement>('[data-poster-grid]')!
  for (const range of ['mobile', 'tablet', 'desktop'] as const) {
    grid.style.setProperty(`--${range}-rows`, String(plans.plans.all.layouts[range].rows))
  }
  const dialog = root.querySelector('dialog')!
  dialog.showModal = vi.fn(() => { dialog.open = true }); dialog.close = vi.fn(() => { dialog.open = false })
  const gridTracks = (node: HTMLElement) => {
    const range = window.innerWidth >= 1280 ? 'desktop' : window.innerWidth >= 768 ? 'tablet' : 'mobile'
    const columns = range === 'desktop' ? 10 : range === 'tablet' ? 6 : 8
    const rows = Number(node.style.getPropertyValue(`--${range}-rows`))
    const trackHeight = 100 / columns * 152 / 160
    return { rows, trackHeight }
  }
  vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function (this: HTMLElement) {
    if (!this.matches('[data-poster-grid]')) return rect(100)
    const { rows, trackHeight } = gridTracks(this)
    return new DOMRect(0, 100, 100, rows * trackHeight)
  })
  media = Object.assign(new EventTarget(), { matches: false })
  vi.stubGlobal('matchMedia', () => media); vi.stubGlobal('scrollTo', vi.fn())
  // No stylesheet in this fixture: model mobile visibility without jsdom's
  // quadratic cascade walk across the shared multi-range motif pool.
  vi.spyOn(window, 'getComputedStyle').mockImplementation(element => {
    const node = element as HTMLElement
    const { rows, trackHeight } = gridTracks(node)
    const gridTemplateRows = node.matches('[data-poster-grid]') && Number.isSafeInteger(rows) && rows > 0
      ? Array.from({ length: rows }, () => `${trackHeight}px`).join(' ')
      : 'none'
    return { display: node.hidden ? 'none' : node.style.display || node.style.getPropertyValue('--mobile-display') || 'block', visibility: node.style.visibility || 'visible', opacity: node.style.opacity || '1', paddingBottom: node.style.paddingBottom || '0px', gridTemplateRows: node.style.gridTemplateRows || gridTemplateRows,
      borderLeftWidth: '0px', borderRightWidth: '0px', borderTopWidth: '0px', borderBottomWidth: '0px',
      paddingLeft: '0px', paddingRight: '0px', paddingTop: '0px', columnGap: '0px', rowGap: '0px',
    } as CSSStyleDeclaration
  })
  inputs = []; dispose = () => {}; mount()
})
afterEach(() => { dispose(); document.body.innerHTML = ''; document.body.removeAttribute('style'); document.documentElement.removeAttribute('style'); vi.unstubAllGlobals(); vi.restoreAllMocks() })

describe('day filtering through the sole modal owner', () => {
  function mountPresentation() {
    dispose()
    root.querySelector('[data-day-count]')!.insertAdjacentHTML('beforebegin', '<select data-poster-sort><option value="">Poster</option><option value="time">Horario</option><option value="location">Escenario</option></select><input type="checkbox" data-poster-simple-toggle>')
    root.querySelector('script')!.textContent = JSON.stringify({ ...plans, order: { time: [0, 1], location: [1, 0] } })
    mount()
    const set = (node: HTMLInputElement | HTMLSelectElement) => node.dispatchEvent(new Event('change', { bubbles: true }))
    return {
      grid: root.querySelector<HTMLElement>('[data-poster-grid]')!,
      setSimple(checked: boolean) {
        const node = root.querySelector<HTMLInputElement>('[data-poster-simple-toggle]')!
        node.checked = checked; set(node)
      },
      sort(value: string) {
        const node = root.querySelector<HTMLSelectElement>('[data-poster-sort]')!
        node.value = value; set(node)
      },
    }
  }

  it('filters the same cards in simple view without geometry reads and keeps the modal and day', () => {
    const { grid, setSimple, sort } = mountPresentation()
    const artist = root.querySelector<HTMLElement>('[data-event-id="b"]')!
    vi.mocked(window.getComputedStyle).mockClear()
    vi.mocked(HTMLElement.prototype.getBoundingClientRect).mockClear()
    setSimple(true)
    expect(grid.hasAttribute('data-poster-simple')).toBe(true)
    choose('sunday'); sort('location')
    expect(visible()).toEqual(['b'])
    expect(root.querySelector('[data-day-count]')!.textContent).toBe('1 artistas')
    expect(root.querySelector('[data-event-id="b"]')).toBe(artist)
    expect(inputs).toHaveLength(0)
    expect(window.getComputedStyle).not.toHaveBeenCalled()
    expect(HTMLElement.prototype.getBoundingClientRect).not.toHaveBeenCalled()
    artist.click()
    expect(root.querySelector('dialog')!.open).toBe(true)
    expect(root.querySelector('[data-modal-content]')!.textContent).toBe('b')
    dispose()
    expect(grid.hasAttribute('data-poster-simple')).toBe(false)
  })

  it('sorts in either view and keeps the day when returning to the poster', () => {
    const { grid, setSimple, sort } = mountPresentation()
    sort('location')
    expect(visible()).toEqual(['b', 'a'])
    expect(grid.hasAttribute('data-poster-ordered')).toBe(true)
    setSimple(true); sort('time'); choose('saturday')
    expect(visible()).toEqual(['a'])
    setSimple(false)
    expect(grid.hasAttribute('data-poster-simple')).toBe(false)
    expect(visible()).toEqual(['a'])
    choose('all')
    expect(visible()).toEqual(['a', 'b'])
    setSimple(true); sort(''); choose('sunday'); setSimple(false)
    expect(grid.hasAttribute('data-poster-ordered')).toBe(false)
    expect(visible()).toEqual(['b'])
    choose('all')
    window.dispatchEvent(new Event('resize'))
    expect(visible()).toEqual(['a', 'b'])
  })

  it('preserves isolated background paint and publication base through clones, interruption and teardown', () => {
    dispose()
    for (const node of root.querySelectorAll<HTMLElement>('[data-poster-motif]')) {
      const svg = node.querySelector('svg')!
      svg.replaceChildren()
      svg.dataset.patternBase = '/preview/patterns/'
      svg.style.backgroundImage = `url("/preview/patterns/${node.dataset.posterMotif}.svg")`
      svg.style.backgroundSize = '100% 100%'; svg.style.backgroundRepeat = 'no-repeat'
    }
    const originals = [...root.querySelectorAll('[data-poster-motif]')]
    const artwork = originals.map(node => node.innerHTML)
    mount()
    expect(root.querySelector('fieldset')!.hidden).toBe(false)
    for (const day of ['saturday', 'sunday', 'all'] as const) {
      choose(day)
      window.dispatchEvent(new Event('resize'))
      inputs[0]?.onComplete()
      const live = [...root.querySelectorAll<HTMLElement>('[data-poster-motif]')].filter(node => !node.hidden)
      expect(live).toHaveLength(plans.plans[day].motifs.length)
      for (const node of live) {
        const svg = node.querySelector('svg')!
        expect(svg.childElementCount).toBe(0)
        expect(svg.style.backgroundImage).toBe(`url("/preview/patterns/${node.dataset.posterMotif}.svg")`)
        expect(svg.style.backgroundSize).toBe('100% 100%')
        expect(svg.style.backgroundRepeat).toBe('no-repeat')
      }
      expect(visible()).toEqual(plans.plans[day].ids)
    }
    expect(root.querySelectorAll('[data-poster-motif]').length).toBeGreaterThan(originals.length)
    dispose()
    expect([...root.querySelectorAll('[data-poster-motif]')]).toEqual(originals)
    expect(originals.map(node => node.innerHTML)).toEqual(artwork)
  })
  it.each(['canonical', 'partial', 'missing'] as const)('reduces prepared endpoint work with exact legacy parity from %s inline state', initial => {
    dispose()
    // Exercise fixed, missing-range and movable information without the remote
    // social footprints that make a two-participant baseline mostly decoration.
    // The separate full-home regression below retains the production footprint.
    const information = [
      ...homeInformation.slice(0, 2),
      { id: 'movable', positions: {
        mobile: { column: 0, row: 14, width: 8, height: 1 },
        tablet: { column: 3, row: 5, width: 2, height: 1 },
        desktop: { column: 6, row: 5, width: 2, height: 1 },
      } },
    ]
    const config = createPosterFilterPlans({ scope: 'home', participants: plans.participants, information })
    const grid = root.querySelector<HTMLElement>('[data-poster-grid]')!
    for (const node of grid.querySelectorAll('[data-poster-motif]')) node.remove()
    grid.insertAdjacentHTML('beforeend', config.plans.all.motifs.map(m => `<div data-poster-motif="${m.variant}" data-poster-motif-index="${m.index}"><svg><use href="#${m.variant}"></use></svg></div>`).join('') + information.map(block => `<div data-poster-information="${block.id}"></div>`).join(''))
    const ranges = ['mobile', 'tablet', 'desktop'] as const
    const fields = ['display', 'column', 'row', 'width', 'height'] as const
    const positions = (day: DayKey, node: HTMLElement) => {
      const plan = config.plans[day]
      if (node.hasAttribute('data-poster-motif')) return plan.motifs[Number(node.dataset.posterMotifIndex)].positions
      return Object.fromEntries(ranges.map(range => [range, node.hasAttribute('data-poster-artist')
        ? plan.layouts[range].artists.find(a => a.id === node.dataset.posterArtist)
        : plan.information[range][node.dataset.posterInformation!]]))
    }
    const values = (day: DayKey, node: HTMLElement) => {
      const destination = positions(day, node)
      return ranges.flatMap(range => fields.map(field => {
        const rect = destination[range]
        return field === 'display' ? rect ? node.hasAttribute('data-poster-motif') ? 'block' : 'grid' : 'none'
          : String(rect?.[field] ?? (field === 'width' || field === 'height' ? 1 : 0))
      }))
    }
    if (initial !== 'missing') {
      for (const node of grid.querySelectorAll<HTMLElement>('[data-poster-artist], [data-poster-information], [data-poster-motif]')) {
        const expected = values('all', node)
        ranges.flatMap(range => fields.map(field => `--${range}-${field}`)).forEach((property, i) => node.style.setProperty(property, expected[i]))
      }
      for (const range of ranges) grid.style.setProperty(`--${range}-rows`, String(config.plans.all.layouts[range].rows))
    }
    if (initial === 'partial') {
      // Include wrong values and priorities as well as missing declarations.
      grid.style.removeProperty('--tablet-rows')
      grid.style.setProperty('--mobile-rows', '999', 'important')
      for (const node of grid.querySelectorAll<HTMLElement>('[data-poster-artist], [data-poster-information], [data-poster-motif]')) {
        node.style.removeProperty('--desktop-height')
        node.style.setProperty('--tablet-column', '999')
        node.style.setProperty('--mobile-width', node.style.getPropertyValue('--mobile-width'), 'important')
      }
    }
    const original = root.innerHTML
    const run = (prepared: boolean) => {
      root.innerHTML = original
      const payload = structuredClone(config)
      if (!prepared) delete payload.transitions
      root.querySelector('script')!.textContent = JSON.stringify(payload)
      inputs = []; media.matches = false; vi.stubGlobal('innerWidth', 390)
      let writes = 0
      const set = CSSStyleDeclaration.prototype.setProperty
      const endpoint = /^--(mobile|tablet|desktop)-(display|column|row|width|height|rows)$/
      const writeSpy = vi.spyOn(CSSStyleDeclaration.prototype, 'setProperty').mockImplementation(function (this: CSSStyleDeclaration, property, value, priority) {
        if (endpoint.test(property)) writes++
        return set.call(this, property, value, priority)
      })
      mount()
      const mountWrites = writes
      const artistNodes = [...root.querySelectorAll('[data-poster-artist]')]
      const identities = new Map<HTMLElement, number>()
      const states = []; const work = []
      for (const [step, day] of (['saturday', 'sunday', 'all', 'saturday', 'all'] as const).entries()) {
        const before = writes
        choose(day)
        work.push(writes - before)
        if (step === 1) {
          // Settle the latest endpoint at a new range, then invoke stale completion.
          vi.stubGlobal('innerWidth', 1400); window.dispatchEvent(new Event('resize'))
          inputs[0]?.onComplete()
        } else if (step === 2) {
          media.matches = true; media.dispatchEvent(new Event('change'))
          inputs[0]?.onComplete()
        }
        expect([...root.querySelectorAll('[data-poster-artist]')]).toEqual(artistNodes)
        const live = [...root.querySelectorAll<HTMLElement>('[data-poster-motif]')].filter(node => node.style.display !== 'none')
        expect(live).toHaveLength(config.plans[day].motifs.length)
        for (const node of root.querySelectorAll<HTMLElement>('[data-poster-artist], [data-poster-information], [data-poster-motif]')) {
          if (!identities.has(node)) identities.set(node, identities.size)
          if (node.hasAttribute('data-poster-motif') && !live.includes(node)) continue
          const expected = values(day, node)
          expect(ranges.flatMap(range => fields.map(field => node.style.getPropertyValue(`--${range}-${field}`)))).toEqual(expected)
          for (const range of ranges) for (const field of fields) expect(node.style.getPropertyPriority(`--${range}-${field}`)).toBe('')
        }
        const currentGrid = root.querySelector<HTMLElement>('[data-poster-grid]')!
        for (const range of ranges) {
          expect(currentGrid.style.getPropertyValue(`--${range}-rows`)).toBe(String(config.plans[day].layouts[range].rows))
          expect(currentGrid.style.getPropertyPriority(`--${range}-rows`)).toBe('')
        }
        states.push({ artists: visible(), count: root.querySelector('[data-day-count]')!.textContent,
          nodes: [...identities].map(([node, identity]) => ({ identity, hidden: node.hidden, inert: node.inert,
            index: node.dataset.posterMotifIndex, href: node.querySelector('use')?.getAttribute('href'),
            values: ranges.flatMap(range => fields.map(field => node.style.getPropertyValue(`--${range}-${field}`))),
            tab: node.querySelector('a')?.getAttribute('tabindex') })) })
      }
      writeSpy.mockRestore(); dispose()
      return { states, work, mountWrites }
    }
    const prepared = run(true); const legacy = run(false)
    expect(prepared.states).toEqual(legacy.states)
    expect(prepared.mountWrites).toBe(0); expect(legacy.mountWrites).toBe(0)
    if (initial === 'canonical') expect(prepared.work[0]).toBeLessThan(legacy.work[0])
    else expect(prepared.work[0]).toBe(legacy.work[0])
    expect(prepared.work.reduce((a, b) => a + b)).toBeLessThan(legacy.work.reduce((a, b) => a + b))
    console.info('endpoint work (includes jsdom clone style copies)', initial, { prepared: prepared.work, legacy: legacy.work })
  })
  it('admits prepared tables without matcher work and preserves legacy matcher behavior', () => {
    dispose()
    const matcher = vi.spyOn(motifMatcher, 'matchPosterMotifs')
    mount()
    expect(matcher).not.toHaveBeenCalled()
    for (const key of ['saturday', 'sunday', 'all']) choose(key)
    expect(matcher).not.toHaveBeenCalled()
    dispose()
    const legacy = structuredClone(plans)
    delete legacy.transitions
    root.querySelector('script')!.textContent = JSON.stringify(legacy)
    mount()
    for (const key of ['saturday', 'sunday', 'all']) choose(key)
    expect(matcher).toHaveBeenCalledTimes(3)
    expect(visible()).toEqual(['a', 'b'])
  })
  it.each([
    { reduced: false, width: 390, range: 'mobile' }, { reduced: true, width: 390, range: 'mobile' },
    { reduced: false, width: 900, range: 'tablet' }, { reduced: true, width: 900, range: 'tablet' },
    { reduced: false, width: 1400, range: 'desktop' }, { reduced: true, width: 1400, range: 'desktop' },
  ] as const)('preserves exact FIFO node choices and endpoints through cycles/interruption ($range, reduced=$reduced)', ({ reduced, width, range }) => {
    dispose()
    vi.stubGlobal('innerWidth', width)
    media.matches = reduced
    const original = root.innerHTML
    const run = (prepared: boolean) => {
      root.innerHTML = original
      const config = structuredClone(plans)
      if (!prepared) delete config.transitions
      root.querySelector('script')!.textContent = JSON.stringify(config)
      const identities = new Map<HTMLElement, number>()
      const remember = () => {
        for (const node of root.querySelectorAll<HTMLElement>('[data-poster-motif]')) if (!identities.has(node)) identities.set(node, identities.size)
      }
      remember(); inputs = []; mount()
      const artistNodes = [...root.querySelectorAll('[data-poster-artist]')]
      // Reference the previous first-eligible pool algorithm, independently of
      // both client paths. These are logical identities, not timing/paint rules.
      const pool = plans.plans.all.motifs.map(m => ({ variant: m.variant }))
      let previous = [...pool]
      let selected: DayKey = 'all'
      const states = []
      for (const [step, key] of (['saturday', 'sunday', 'all', 'sunday', 'saturday', 'all'] as const).entries()) {
        const cells = (day: DayKey) => plans.plans[day].motifs.map(m => ({ variant: m.variant, ...m.positions[range] }))
        const matches = motifMatcher.matchPosterMotifs(cells(selected), cells(key))
        const matched = new Map(matches.map(pair => [pair.to, previous[pair.from]]))
        const assigned = new Set(matched.values())
        previous = plans.plans[key].motifs.map((m, index) => {
          let node = matched.get(index) ?? pool.find(n => !assigned.has(n) && !previous.includes(n) && n.variant === m.variant)
          if (!node) { node = { variant: m.variant }; pool.push(node) }
          assigned.add(node)
          return node
        })
        selected = key
        choose(key)
        // Alternate interruption and completed endpoints, including stale callbacks.
        if (!reduced && step % 2) {
          inputs.at(-1)?.onComplete()
          inputs[0]?.onComplete()
        }
        remember()
        const live = [...root.querySelectorAll<HTMLElement>('[data-poster-motif]')].filter(node => node.style.display !== 'none')
          .sort((a, b) => Number(a.dataset.posterMotifIndex) - Number(b.dataset.posterMotifIndex))
        expect(live.map(node => identities.get(node))).toEqual(previous.map(node => pool.indexOf(node)))
        expect([...root.querySelectorAll('[data-poster-artist]')]).toEqual(artistNodes)
        states.push({
          artists: visible(), count: root.querySelector('[data-day-count]')!.textContent,
          nodes: [...root.querySelectorAll<HTMLElement>('[data-poster-motif]')].map(node => ({
            identity: identities.get(node), index: node.dataset.posterMotifIndex,
            variant: node.dataset.posterMotif, href: node.querySelector('use')!.getAttribute('href'),
            hidden: node.hidden,
            endpoints: ['mobile', 'tablet', 'desktop'].map(range => ['display', 'column', 'row', 'width', 'height'].map(field => node.style.getPropertyValue(`--${range}-${field}`))),
          })),
        })
      }
      dispose()
      return states
    }
    expect(run(true)).toEqual(run(false))
  })
  it('does no motif-node array includes/find scans during FIFO reconciliation', () => {
    media.matches = true
    const includes = Array.prototype.includes
    const find = Array.prototype.find
    let scans = 0
    const motifArray = (array: unknown[]) => array.some(value => value instanceof HTMLElement && value.hasAttribute('data-poster-motif'))
    const includesSpy = vi.spyOn(Array.prototype, 'includes').mockImplementation(function (this: unknown[], ...args) {
      if (motifArray(this)) scans++
      return includes.apply(this, args)
    })
    const findSpy = vi.spyOn(Array.prototype, 'find').mockImplementation(function (this: unknown[], ...args) {
      if (motifArray(this)) scans++
      return find.apply(this, args)
    })
    for (const key of ['saturday', 'sunday', 'all', 'saturday']) choose(key)
    includesSpy.mockRestore(); findSpy.mockRestore()
    expect(scans).toBe(0)
    expect(visible()).toEqual(['a'])
  })
  it.each([
    'null', 'missing-pair', 'duplicate-pair', 'unknown-key', 'same-key',
    'missing-patch', 'extra-patch', 'no-op-patch', 'duplicate-patch', 'unknown-id', 'wrong-mask',
    'fractional-mask', 'high-mask', 'negative-mask', 'extra-mask-range', 'missing-mask-range', 'row-omission', 'row-duplicate', 'wrong-row',
    'missing-motif-range', 'extra-motif-range', 'duplicate-from', 'duplicate-to', 'index-bounds', 'fractional-index',
    'absent-position', 'variant', 'motif-mask',
  ])('fails closed atomically for prepared table %s', failure => {
    dispose()
    const config = structuredClone(plans)
    const table = config.transitions![0]
    const pair = table.motifs.desktop[0]
    if (failure === 'null') config.transitions = null as never
    if (failure === 'missing-pair') config.transitions!.pop()
    if (failure === 'duplicate-pair') config.transitions![1] = structuredClone(table)
    if (failure === 'unknown-key') table.from = 'other' as never
    if (failure === 'same-key') table.to = table.from
    if (failure === 'missing-patch') table.artists.pop()
    if (failure === 'extra-patch') table.information.push({ id: 'foreign', masks: { desktop: 0, tablet: 0, mobile: 0 } })
    if (failure === 'no-op-patch') table.artists.push({ id: 'a', masks: { desktop: 0, tablet: 0, mobile: 0 } })
    if (failure === 'duplicate-patch') table.artists.push(structuredClone(table.artists[0]))
    if (failure === 'unknown-id') table.artists[0].id = 'foreign'
    if (failure === 'wrong-mask') table.artists[0].masks.mobile ^= 1
    if (failure === 'fractional-mask') table.artists[0].masks.mobile = 0.5
    if (failure === 'high-mask') table.artists[0].masks.mobile += 2 ** 32
    if (failure === 'negative-mask') table.artists[0].masks.mobile = -1
    if (failure === 'extra-mask-range') Object.assign(table.artists[0].masks, { other: 1 })
    if (failure === 'missing-mask-range') delete (table.artists[0].masks as Partial<typeof pair.masks>).mobile
    if (failure === 'row-omission') table.rows = []
    if (failure === 'row-duplicate') table.rows.push(table.rows[0])
    if (failure === 'wrong-row') table.rows = ['desktop']
    if (failure === 'extra-motif-range') Object.assign(table.motifs, { other: [] })
    if (failure === 'missing-motif-range') delete (table.motifs as Partial<typeof table.motifs>).mobile
    if (failure === 'duplicate-from') table.motifs.desktop.push({ ...pair, to: table.motifs.desktop[1].to })
    if (failure === 'duplicate-to') table.motifs.desktop.push({ ...pair, from: table.motifs.desktop[1].from })
    if (failure === 'index-bounds') pair.from = config.plans[table.from].motifs.length
    if (failure === 'fractional-index') pair.to = 0.5
    if (['absent-position', 'variant'].includes(failure)) {
      const source = config.plans[table.from].motifs
      const target = config.plans[table.to].motifs[pair.to]
      const index = source.findIndex(m => failure === 'absent-position' ? !m.positions.desktop : m.variant !== target.variant)
      expect(index).toBeGreaterThanOrEqual(0)
      pair.from = index
    }
    if (failure === 'motif-mask') pair.masks.desktop ^= 1
    root.querySelector('script')!.textContent = JSON.stringify(config)
    const before = root.innerHTML
    const bodyStyle = document.body.getAttribute('style')
    const htmlStyle = document.documentElement.getAttribute('style')
    const url = location.href
    mount()
    expect(root.innerHTML).toBe(before)
    expect(document.body.getAttribute('style')).toBe(bodyStyle)
    expect(document.documentElement.getAttribute('style')).toBe(htmlStyle)
    expect(location.href).toBe(url)
    expect(root.querySelector('fieldset')!.hidden).toBe(true)
    expect(root.querySelector('[data-day-count]')!.textContent).toBe('')
    choose('saturday')
    expect(root.querySelector('[data-poster-grid]')!.outerHTML).toBe(new DOMParser().parseFromString(before, 'text/html').querySelector('[data-poster-grid]')!.outerHTML)
    expect(inputs).toHaveLength(0)
  })
  it.each(['travel', 'dimensions', 'information-omission'])('rejects inconsistent home references: %s', failure => {
    dispose()
    const config = createPosterFilterPlans({ scope: 'home', participants: plans.participants, information: homeInformation })
    const grid = root.querySelector('[data-poster-grid]')!
    for (const node of grid.querySelectorAll('[data-poster-motif]')) node.remove()
    grid.insertAdjacentHTML('beforeend', config.plans.all.motifs.map(m => `<div data-poster-motif="${m.variant}" data-poster-motif-index="${m.index}"><svg><use href="#${m.variant}"></use></svg></div>`).join('') + homeInformation.map(block => `<div data-poster-information="${block.id}"></div>`).join(''))
    // Prove this endpoint/DOM fixture is valid before corrupting metadata only.
    root.querySelector('script')!.textContent = JSON.stringify(config)
    mount(); expect(root.querySelector('fieldset')!.hidden).toBe(false); dispose()
    if (failure === 'information-omission') {
      const table = config.transitions!.find(table => table.information.length > 0)!
      expect(table).toBeDefined()
      table.information.pop()
    } else {
      const table = config.transitions![0]
      const source = config.plans[table.from].motifs
      const target = config.plans[table.to].motifs
      const from = source.findIndex(a => target.some(b => {
        const x = a.positions.mobile; const y = b.positions.mobile
        return x && y && a.variant === b.variant && (failure === 'dimensions'
          ? x.width !== y.width || x.height !== y.height
          : x.width === y.width && x.height === y.height && Math.hypot(x.column - y.column, x.row - y.row) > 4)
      }))
      expect(from).toBeGreaterThanOrEqual(0)
      const a = source[from]
      const to = target.findIndex(b => {
        const x = a.positions.mobile!; const y = b.positions.mobile
        return y && a.variant === b.variant && (failure === 'dimensions'
          ? x.width !== y.width || x.height !== y.height
          : x.width === y.width && x.height === y.height && Math.hypot(x.column - y.column, x.row - y.row) > 4)
      })
      table.motifs.mobile = [{ from, to, masks: diffPosterPositions(a.positions, target[to].positions) }]
    }
    root.querySelector('script')!.textContent = JSON.stringify(config)
    const before = root.innerHTML
    const body = document.body.getAttribute('style'); const html = document.documentElement.getAttribute('style'); const url = location.href
    mount()
    expect(root.innerHTML).toBe(before)
    expect(document.body.getAttribute('style')).toBe(body)
    expect(document.documentElement.getAttribute('style')).toBe(html)
    expect(location.href).toBe(url)
    expect(root.querySelector('fieldset')!.hidden).toBe(true)
    expect(root.querySelector('[data-day-count]')!.textContent).toBe('')
    choose('saturday')
    expect(grid.outerHTML).toBe(new DOMParser().parseFromString(before, 'text/html').querySelector('[data-poster-grid]')!.outerHTML)
    expect(inputs).toHaveLength(0)
  })
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
    config.transitions = compilePosterFilterTransitions(config.plans)
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
    config.transitions = compilePosterFilterTransitions(config.plans)
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
    const grid = root.querySelector<HTMLElement>('[data-poster-grid]')!
    for (const range of ['mobile', 'tablet', 'desktop'] as const) {
      grid.style.setProperty(`--${range}-rows`, String(expanded.plans.all.layouts[range].rows))
    }
    grid.innerHTML = expanded.plans.all.motifs.map(m =>
      `<div data-poster-motif="${m.variant}" data-poster-motif-index="${m.index}"><svg><use href="#${m.variant}"></use></svg></div>`,
    ).join('') + ['a', 'b', 'c'].map(id =>
      `<div data-poster-artist="${id}"><a href="/musica/${id}/" data-event-trigger data-event-id="${id}"><span data-artist-surface></span><span data-artist-name>${id}</span></a></div>`,
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
    for (const range of ['mobile', 'tablet', 'desktop'] as const) {
      grid.style.setProperty(`--${range}-rows`, String(home.plans.all.layouts[range].rows))
    }
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
    vi.stubGlobal('innerWidth', 390)
    vi.stubGlobal('innerHeight', 200)
    const computedStyle = vi.mocked(window.getComputedStyle)
    const originalStyle = computedStyle.getMockImplementation()!
    computedStyle.mockImplementation((element, pseudo) => {
      const style = originalStyle(element, pseudo)
      if (!element.matches('[data-poster-grid]')) return style
      const rows = Number((element as HTMLElement).style.getPropertyValue('--mobile-rows'))
      return { ...style, gridTemplateRows: Array.from({ length: rows }, () => '100px').join(' ') } as CSSStyleDeclaration
    })
    vi.mocked(HTMLElement.prototype.getBoundingClientRect).mockImplementation(function (this: HTMLElement) {
      if (!this.matches('[data-poster-grid]')) return rect(10000)
      const rows = Number(this.style.getPropertyValue('--mobile-rows'))
      // Model a content-track reflow that moves the surviving visible tile.
      const top = rows === plans.plans.all.layouts.mobile.rows ? 0 : 100
      return new DOMRect(0, top, 100, rows * 100)
    })
    const artist = root.querySelector<HTMLElement>('[data-poster-artist="a"]')!
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
