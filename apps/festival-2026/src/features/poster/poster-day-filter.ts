import type { DayKey, PosterFilterPlan, PosterFilterPlans } from './poster-filter-layout'
import type { PosterRange } from './poster'
import type { SlotRect } from './poster-grid'
import { createFilterMotion, type FilterMotion, type FilterMotionInput } from './poster-filter-motion'
import { matchPosterMotifs } from './poster-motif-match'

const ranges = ['mobile', 'tablet', 'desktop'] as const
const keys = ['all', 'saturday', 'sunday'] as const
const variants = new Set(['lightning', 'rosette-yellow', 'chevrons-right', 'rings', 'orbits-rose', 'star', 'sparks', 'rosette-pink', 'orbits-cyan', 'chevrons-left', 'rosette-cyan'])
interface FilterOptions {
  canInteract: () => boolean
  onDisconnect: () => void
  ownStyles: (node: HTMLElement, properties: string[]) => () => void
  createMotion?: (input: FilterMotionInput) => FilterMotion
}
export interface DayFilter {
  settle: () => void
  includes: (id: string | undefined) => boolean
  destroy: () => void
}
const inactive: DayFilter = { settle() {}, includes: () => true, destroy() {} }
const isKey = (value: unknown): value is DayKey => keys.includes(value as DayKey)

/** Validate the entire finite handoff before changing any live endpoint. No packing. */
function validate(value: PosterFilterPlans, artists: HTMLElement[], information: HTMLElement[], motifs: HTMLElement[]): boolean {
  if (!value || value.version !== 1 || (value.scope !== 'home' && value.scope !== 'category') || value.available !== true || !Array.isArray(value.participants) || value.participants.length > 512) return false
  const ids = value.participants.map(p => p.id)
  if (value.participants.some(p => typeof p.id !== 'string' || !p.id || typeof p.day !== 'string') || new Set(ids).size !== ids.length
    || ids.join('\0') !== artists.map(n => n.dataset.posterArtist).join('\0')) return false
  if (!value.participants.some(p => p.day === 'Sábado 28') || !value.participants.some(p => p.day === 'Domingo 29')) return false
  const infoIDs = information.map(n => n.dataset.posterInformation!)
  if (new Set(infoIDs).size !== infoIDs.length || infoIDs.length > 32) return false
  for (const key of keys) {
    const plan = value.plans[key]
    const expected = value.participants.filter(p => key === 'all' || p.day === (key === 'saturday' ? 'Sábado 28' : 'Domingo 29')).map(p => p.id)
    if (!Array.isArray(plan.ids) || plan.ids.join('\0') !== expected.join('\0') || !Array.isArray(plan.motifs) || plan.motifs.length > 40960) return false
    for (const range of ranges) {
      const layout = plan.layouts[range]
      const columns = range === 'mobile' ? 8 : range === 'tablet' ? 6 : 10
      if (layout.columns !== columns || !Number.isSafeInteger(layout.rows) || layout.rows < 0 || layout.rows > 4096) return false
      const validRect = (rect: SlotRect) => rect && [rect.column, rect.row, rect.width, rect.height].every(Number.isSafeInteger)
        && rect.column >= 0 && rect.row >= 0 && rect.width > 0 && rect.height > 0 && rect.column + rect.width <= columns && rect.row + rect.height <= layout.rows
      if (layout.artists.map(a => a.id).join('\0') !== expected.join('\0') || !layout.artists.every(validRect)) return false
      if (!plan.information[range] || Object.entries(plan.information[range]).some(([id, rect]) => !infoIDs.includes(id) || !validRect(rect))) return false
      const baselineIDs = Object.keys(value.plans.all.information[range]).sort().join('\0')
      if (Object.keys(plan.information[range]).sort().join('\0') !== baselineIDs) return false
      if (!Array.isArray(layout.motifs) || !layout.motifs.every(validRect)) return false
      // Validate occupancy only, never reproduce the build-time placement/search.
      const protectedCells = new Set<string>()
      const paint = new Set<string>()
      const occupy = (rect: SlotRect, cells: Set<string>) => {
        for (let row = rect.row; row < rect.row + rect.height; row++) for (let column = rect.column; column < rect.column + rect.width; column++) {
          const cell = `${column}:${row}`
          if (cells.has(cell)) return false
          cells.add(cell)
        }
        return true
      }
      for (const rect of Object.values(plan.information[range])) if (!occupy(rect, protectedCells) || !occupy(rect, paint)) return false
      for (const artist of layout.artists) {
        // Visible paint is bounded above; the logical reserve may cross only the bottom edge.
        if (artist.height !== (range === 'mobile' ? 2 : 1) || artist.width !== (range === 'mobile' ? 8 : 2)
          || !occupy({ ...artist, height: artist.height + 1 }, protectedCells) || !occupy(artist, paint)) return false
      }
      for (const rect of layout.motifs) {
        const intro = plan.information.mobile.intro
        const openingTile = value.scope === 'home' && range === 'mobile'
          && intro?.column === 0 && intro.row === 0 && intro.width === 8 && intro.height === 4
          && rect.width === 2 && rect.height === 2 && rect.column % 2 === 0
          && (rect.row === 4 || rect.row === 6)
        if ((!openingTile && (rect.width !== 1 || rect.height !== 1)) || !occupy(rect, paint)) return false
      }
      if (paint.size !== columns * layout.rows) return false
      if (plan.motifs.some((m, index) => m.index !== index || !variants.has(m.variant)
        || Object.keys(m.positions).some(r => !ranges.includes(r as PosterRange))
        || (m.positions[range] ? !validRect(m.positions[range]!) || JSON.stringify(m.positions[range]) !== JSON.stringify(layout.motifs[index]) : !!layout.motifs[index]))) return false
    }
  }
  if (motifs.length !== value.plans.all.motifs.length || motifs.some((node, index) => node.dataset.posterMotif !== value.plans.all.motifs[index].variant
    || node.dataset.posterMotifIndex !== String(index) || !node.querySelector('svg use') || node.querySelector('[id]'))) return false
  return infoIDs.every(id => ranges.some(range => value.plans.all.information[range][id]))
}

/** Adapter owned exclusively by mountEventModal. Failed setup leaves static Todos. */
export function mountDayFilter(root: HTMLElement, options: FilterOptions): DayFilter {
  const grid = root.querySelector<HTMLElement>('[data-poster-grid]')
  const controls = root.querySelector<HTMLFieldSetElement>('[data-day-filter]')
  const status = controls?.querySelector<HTMLElement>('[data-day-count]')
  const radios = [...(controls?.querySelectorAll<HTMLInputElement>('input[type="radio"]') ?? [])]
  const artists = [...root.querySelectorAll<HTMLElement>('[data-poster-artist]')]
  const information = [...root.querySelectorAll<HTMLElement>('[data-poster-information]')]
  const originalMotifs = [...root.querySelectorAll<HTMLElement>('[data-poster-motif]')]
  let plans: PosterFilterPlans
  let media: MediaQueryList
  try {
    plans = JSON.parse(root.querySelector('script[data-poster-plans]')?.textContent ?? '')
    if (!grid || !controls || !status || radios.length !== 3 || radios.some((r, i) => r.value !== keys[i]) || !validate(plans, artists, information, originalMotifs)) return inactive
    media = window.matchMedia('(prefers-reduced-motion: reduce)')
  } catch { return inactive }
  const abort = new AbortController()
  let destroyed = false
  let selected: DayKey = 'all'
  let generation = 0
  let motion: FilterMotion | undefined
  let pending = false
  let releaseScroll: (() => void) | undefined
  let motifNodes = [...originalMotifs]
  let motifEndpoints = plans.plans.all.motifs
  const pool = new Set(originalMotifs)
  const saved = [grid, ...artists, ...information, ...originalMotifs].map(node => ({
    node,
    restore: options.ownStyles(node, node === grid ? ranges.map(r => `--${r}-rows`) : ['display', ...ranges.flatMap(r => ['display', 'column', 'row', 'width', 'height'].map(p => `--${r}-${p}`))]),
    hidden: node.hidden, inert: node.inert, index: node.getAttribute('data-poster-motif-index'),
  }))
  const tabIndices = new Map<HTMLElement, string | null>()
  for (const artist of artists) for (const link of artist.querySelectorAll<HTMLElement>('a,button,input,select,textarea,[tabindex]')) tabIndices.set(link, link.getAttribute('tabindex'))
  const restorePadding = options.ownStyles(document.body, ['padding-bottom'])
  const basePadding = getComputedStyle(document.body).paddingBottom
  let observer: ResizeObserver | undefined
  let disconnect: MutationObserver | undefined
  const range = (): PosterRange => window.innerWidth >= 1280 ? 'desktop' : window.innerWidth >= 768 ? 'tablet' : 'mobile'
  const syncRadios = () => { for (const radio of radios) radio.checked = radio.value === selected }
  const position = (node: HTMLElement, endpoints: Partial<Record<PosterRange, SlotRect>>, display: 'grid' | 'block') => {
    for (const range of ranges) {
      const rect = endpoints[range]
      node.style.setProperty(`--${range}-display`, rect ? display : 'none')
      for (const property of ['column', 'row', 'width', 'height'] as const) node.style.setProperty(`--${range}-${property}`, String(rect?.[property] ?? (property === 'width' || property === 'height' ? 1 : 0)))
    }
  }
  const accessible = (node: HTMLElement, included: boolean) => {
    node.inert = !included
    for (const link of node.querySelectorAll<HTMLElement>('a,button,input,select,textarea,[tabindex]')) {
      if (!included) link.setAttribute('tabindex', '-1')
      else {
        const previous = tabIndices.get(link)
        if (previous == null) link.removeAttribute('tabindex')
        else link.setAttribute('tabindex', previous)
      }
    }
  }
  const endpoint = (): PosterFilterPlan => plans.plans[selected]
  const finish = () => {
    motion?.dispose(); motion = undefined
    for (const node of artists) {
      node.hidden = !endpoint().ids.includes(node.dataset.posterArtist!)
      if (node.hidden) node.style.display = 'none'; else node.style.removeProperty('display')
    }
    for (const node of pool) {
      node.hidden = !motifNodes.includes(node)
      if (node.hidden) node.style.display = 'none'; else node.style.removeProperty('display')
    }
    releaseScroll?.(); releaseScroll = undefined
    if (pending) status.textContent = endpoint().ids.length ? `${endpoint().ids.length} artistas` : 'No hay artistas para este filtro.'
    pending = false
  }
  const settle = () => { if (destroyed) return; ++generation; finish() }
  const clearance = () => {
    if (destroyed) return
    // A live height includes wrapping/text growth. Safe-area is also reserved below.
    document.body.style.paddingBottom = `calc(${basePadding} + ${Math.ceil(controls.getBoundingClientRect().height)}px + 2rem + env(safe-area-inset-bottom))`
  }
  const select = (key: DayKey) => {
    if (destroyed || !options.canInteract()) { syncRadios(); return }
    if (key === selected) { syncRadios(); return }
    const activeRange = range()
    const nodes = [...artists, ...information, ...pool]
    // Capture PAINT before killing any old inversion/exit presentation.
    const painted = nodes.map(node => ({ node, style: getComputedStyle(node) })).filter(({ node, style }) => !node.hidden && style.display !== 'none' && style.visibility !== 'hidden')
    const first = new Map(painted.map(({ node }) => [node, node.getBoundingClientRect()]))
    const firstAlpha = new Map(painted.map(({ node, style }) => [node, Number.parseFloat(style.opacity) || (style.opacity === '0' ? 0 : 1)]))
    const canonical = artists.filter(n => first.has(n) && !n.inert)
    const reading = window.innerHeight * 0.3
    const viewed = canonical.slice().sort((a, b) => Math.abs(first.get(a)!.top - reading) - Math.abs(first.get(b)!.top - reading))[0]
    const target = plans.plans[key]
    const survivors = artists.filter(n => target.ids.includes(n.dataset.posterArtist!))
    const anchor = viewed && survivors.includes(viewed) ? viewed : survivors.slice().sort((a, b) => Math.abs(artists.indexOf(a) - artists.indexOf(viewed!)) - Math.abs(artists.indexOf(b) - artists.indexOf(viewed!)))[0]
    const offset = viewed ? first.get(viewed)!.top : undefined
    ++generation
    motion?.dispose(); motion = undefined
    releaseScroll?.()
    const restoreHtml = options.ownStyles(document.documentElement, ['overflow-anchor', 'scroll-behavior'])
    const restoreGrid = options.ownStyles(grid, ['overflow-anchor'])
    document.documentElement.style.setProperty('overflow-anchor', 'none')
    document.documentElement.style.setProperty('scroll-behavior', 'auto')
    grid.style.setProperty('overflow-anchor', 'none')
    releaseScroll = () => { restoreHtml(); restoreGrid() }
    const previousNodes = motifNodes
    const cells = (endpoints: typeof motifEndpoints) => endpoints.map(m => ({ variant: m.variant, ...m.positions[activeRange] }))
    const matches = matchPosterMotifs(cells(motifEndpoints), cells(target.motifs))
    const matched = new Map(matches.map(m => [m.to, previousNodes[m.from]]))
    const assigned = new Set(matched.values())
    motifNodes = target.motifs.map((m, index) => {
      let node = matched.get(index)
      if (!node) node = [...pool].find(n => !assigned.has(n) && !previousNodes.includes(n) && n.dataset.posterMotif === m.variant)
      if (!node) {
        // Clone only the safe structural SVG wrapper, never participant markup/IDs.
        const template = originalMotifs[0]
        node = template.cloneNode(true) as HTMLElement
        node.removeAttribute('style'); node.dataset.posterMotif = m.variant
        node.querySelector('use')!.setAttribute('href', `#${m.variant}`)
        grid.append(node); pool.add(node)
      }
      assigned.add(node); node.hidden = false; node.style.removeProperty('display'); node.dataset.posterMotifIndex = String(index)
      position(node, m.positions, 'block')
      return node
    })
    motifEndpoints = target.motifs
    selected = key; pending = true; syncRadios()
    // One final-flow write batch, including actual information and all ranges.
    for (const r of ranges) grid.style.setProperty(`--${r}-rows`, String(target.layouts[r].rows))
    for (const node of artists) {
      const id = node.dataset.posterArtist!
      const included = target.ids.includes(id)
      accessible(node, included)
      node.hidden = !included
      if (included) node.style.removeProperty('display'); else node.style.display = 'none'
      position(node, Object.fromEntries(ranges.map(r => [r, target.layouts[r].artists.find(a => a.id === id)])), 'grid')
    }
    for (const node of information) position(node, Object.fromEntries(ranges.map(r => [r, target.information[r][node.dataset.posterInformation!]])), 'grid')
    for (const node of pool) if (!motifNodes.includes(node)) { node.hidden = true; node.style.display = 'none' }
    // Compensate once, then batch Last in actual compensated viewport coordinates.
    if (anchor && offset !== undefined) {
      const top = anchor.getBoundingClientRect().top
      const max = Math.max(0, document.documentElement.scrollHeight - window.innerHeight)
      const y = Math.max(0, Math.min(max, window.scrollY + top - offset))
      if (y !== window.scrollY) window.scrollTo(window.scrollX, y)
    }
    const live = [...artists.filter(n => !n.hidden), ...information, ...motifNodes].filter(n => getComputedStyle(n).display !== 'none')
    const last = new Map(live.map(n => [n, n.getBoundingClientRect()]))
    const gridRect = grid.getBoundingClientRect()
    const items = [...new Set([...first.keys(), ...last.keys()])].map(node => ({ node, first: first.get(node), firstAlpha: firstAlpha.get(node), last: last.get(node) }))
    if (media.matches) { finish(); return }
    // Outgoing nodes are noninteractive paint, not hidden until finite completion.
    for (const item of items) if (!item.last) item.node.hidden = false
    const token = generation
    try {
      const created = (options.createMotion ?? createFilterMotion)({ items, gridRect, onComplete: () => { if (!destroyed && root.isConnected && token === generation) finish() } })
      if (pending) motion = created
      else created.dispose()
    } catch { finish() }
  }
  const change = (event: Event) => {
    const input = event.target
    if (!(input instanceof HTMLInputElement) || !radios.includes(input)) return
    if (!isKey(input.value)) { syncRadios(); return }
    select(input.value)
  }
  const destroy = () => {
    if (destroyed) return
    destroyed = true; ++generation; abort.abort(); motion?.dispose(); releaseScroll?.()
    observer?.disconnect(); disconnect?.disconnect(); media.removeEventListener?.('change', settle)
    for (const node of pool) if (!originalMotifs.includes(node)) node.remove()
    for (const { node, restore, hidden, inert, index } of saved) {
      restore()
      node.hidden = hidden; node.inert = inert
      if (index !== null) node.setAttribute('data-poster-motif-index', index)
    }
    for (const [node, value] of tabIndices) { if (value === null) node.removeAttribute('tabindex'); else node.setAttribute('tabindex', value) }
    restorePadding(); selected = 'all'; syncRadios(); controls.hidden = true; status.textContent = ''
  }
  try {
    controls.addEventListener('change', change, { signal: abort.signal })
    root.addEventListener('click', event => {
      const link = event.target instanceof Element ? event.target.closest<HTMLElement>('[data-event-trigger]') : null
      if (link && !endpoint().ids.includes(link.dataset.eventId!)) event.preventDefault()
    }, { signal: abort.signal, capture: true })
    window.addEventListener('resize', settle, { signal: abort.signal })
    media.addEventListener('change', settle)
    observer = typeof ResizeObserver === 'undefined' ? undefined : new ResizeObserver(clearance)
    observer?.observe(controls)
    disconnect = new MutationObserver(() => { if (!root.isConnected) { destroy(); options.onDisconnect() } })
    disconnect.observe(document.documentElement, { childList: true, subtree: true })
    controls.hidden = false; syncRadios(); clearance()
  } catch { destroy(); return inactive }
  return { settle, includes: id => !!id && endpoint().ids.includes(id), destroy }
}
