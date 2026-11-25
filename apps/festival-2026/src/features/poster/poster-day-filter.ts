import type { DayKey, PosterFilterPlan, PosterFilterPlans } from './poster-filter-layout'
import type { PosterRange } from './poster'
import type { SlotRect } from './poster-grid'
import type { PosterOrders } from './poster-order'
import type { FilterMotion, FilterMotionInput, FilterMotionSample } from './poster-filter-motion'
import { filterCellRect, filterPaintRect, readFilterGridGeometry, resolvedFilterTracks, type FilterGridGeometry } from './poster-filter-geometry'
import { createLazyFilterMotion, isMotionReady, preloadMotion } from '../artists/lazy-motion'
import { matchPosterMotifs } from './poster-motif-match'
import type { PosterPositions } from './poster-layout'
import { canonicalPosterPosition, posterPositionFields, posterPositionMask, type PosterPositionMasks } from './poster-filter-transitions'
import { validatePosterFilterTransitions, type PosterFilterIndex } from './poster-filter-transition-validation'
import { createPosterSimpleLayout, type PosterSimplePlans } from './poster-simple-layout'

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
const isSort = (value: string): value is keyof PosterOrders => value === 'time' || value === 'location'
const isPermutation = (values: number[] | undefined, count: number) => Array.isArray(values) && values.length === count
  && new Set(values).size === count && values.every(i => Number.isSafeInteger(i) && i >= 0 && i < count)
const patternPaint = (node: HTMLElement) => node.querySelector<SVGSVGElement>('svg[data-pattern-base]')
const validPatternPaint = (node: HTMLElement, variant: string) => {
  const paint = patternPaint(node)
  const base = paint?.dataset.patternBase
  return !!paint && !!base && base.startsWith('/') && !base.startsWith('//') && base.endsWith('/')
    && !/["\\\\?#]/.test(base) && paint.childElementCount === 0
    && paint.style.backgroundImage === `url("${base}${variant}.svg")`
}

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
      // Entries group same-variant placements across ranges, not geometry indices.
      // Require a bijection with the engine's complete footprints in each range.
      const footprint = (rect: SlotRect) => `${rect.column}:${rect.row}:${rect.width}:${rect.height}`
      const remaining = new Set(layout.motifs.map(footprint))
      if (plan.motifs.some((m, index) => m.index !== index || !variants.has(m.variant)
        || !m.positions
        || Object.keys(m.positions).some(r => !ranges.includes(r as PosterRange))
        || (m.positions[range] ? !validRect(m.positions[range]!) || !remaining.delete(footprint(m.positions[range]!)) : false))
        || remaining.size !== 0) return false
    }
  }
  if (motifs.length !== value.plans.all.motifs.length || motifs.some((node, index) => node.dataset.posterMotif !== value.plans.all.motifs[index].variant
    || node.dataset.posterMotifIndex !== String(index)
    || (!validPatternPaint(node, value.plans.all.motifs[index].variant) && !node.querySelector('svg use')) || node.querySelector('[id]'))) return false
  return infoIDs.every(id => ranges.some(range => value.plans.all.information[range][id]))
}

/** Adapter owned exclusively by mountEventModal. Failed setup leaves static Todos. */
export function mountDayFilter(root: HTMLElement, options: FilterOptions): DayFilter {
  const grid = root.querySelector<HTMLElement>('[data-poster-grid]')
  const controls = root.querySelector<HTMLFieldSetElement>('[data-day-filter]')
  const status = controls?.querySelector<HTMLElement>('[data-day-count]')
  const radios = [...(controls?.querySelectorAll<HTMLInputElement>('input[type="radio"][name="poster-day"]') ?? [])]
  const artists = [...root.querySelectorAll<HTMLElement>('[data-poster-artist]')]
  const information = [...root.querySelectorAll<HTMLElement>('[data-poster-information]')]
  const originalMotifs = [...root.querySelectorAll<HTMLElement>('[data-poster-motif]')]
  const sortControl = controls?.querySelector<HTMLSelectElement>('[data-poster-sort]')
  const simpleToggle = controls?.querySelector<HTMLButtonElement>('button[data-poster-simple-toggle]')
  let plans: PosterFilterPlans & { order?: PosterOrders; simple?: PosterSimplePlans }
  let index: PosterFilterIndex | undefined
  let media: MediaQueryList
  try {
    plans = JSON.parse(root.querySelector('script[data-poster-plans]')?.textContent ?? '')
    if (!grid || !controls || !status || radios.length !== 3 || radios.some((r, i) => r.value !== keys[i]) || !validate(plans, artists, information, originalMotifs)) return inactive
    index = validatePosterFilterTransitions(plans)
    if (!index) return inactive
    if (plans.simple) for (const key of keys) for (const r of ranges) {
      const plan = plans.plans[key]
      const compact = createPosterSimpleLayout(plan, r, plan.ids, plans.simple[key][r])
      for (const [id, cell] of compact.information) if (id === 'intro' || id === 'title-extension' || /^category-title(?:-|$)/.test(id)) {
        const fixed = plan.information[r][id]
        if (cell.row !== fixed.row || cell.column !== fixed.column) return inactive
      }
    }
    media = window.matchMedia('(prefers-reduced-motion: reduce)')
  } catch { return inactive }
  const abort = new AbortController()
  let destroyed = false
  let selected: DayKey = 'all'
  let simple = false
  let sort: keyof PosterOrders | undefined
  const order = plans.order
  const presentation = sortControl && simpleToggle && plans.simple && order
    && isPermutation(order.time, artists.length) && isPermutation(order.location, artists.length)
  const artistBoundary = artists.at(-1)?.nextSibling ?? null
  const simpleArea = '--poster-simple-area'
  const simpleRows = '--poster-simple-rows'
  const simpleTracks = '--poster-simple-tracks'
  const artistIDs = plans.participants.map(({ id }) => id)
  const sortedProperty = (r: PosterRange) => `--poster-sorted-${r}`
  let generation = 0
  let motion: FilterMotion | undefined
  let motionPaint: { gridRect: DOMRect; bases: Map<HTMLElement, DOMRect> } | undefined
  let pending = false
  let releaseScroll: (() => void) | undefined
  let motifNodes = [...originalMotifs]
  let motifEndpoints = plans.plans.all.motifs
  const pool = new Set(originalMotifs)
  const originalMotifSet = new Set(originalMotifs)
  const indexedPlans = index.plans
  const transitions = index.transitions
  const saved = [grid, ...artists, ...information, ...originalMotifs].map(node => ({
    node,
    restore: options.ownStyles(node, node === grid
      ? [...ranges.map(r => `--${r}-rows`), ...(presentation ? [simpleRows, simpleTracks] : [])]
      : ['display', ...ranges.flatMap(r => ['display', 'column', 'row', 'width', 'height'].map(p => `--${r}-${p}`)),
        ...(presentation && !node.hasAttribute('data-poster-motif') ? [simpleArea] : [])]),
    hidden: node.hidden, inert: node.inert, index: node.getAttribute('data-poster-motif-index'),
  }))
  const tabIndices = new Map<HTMLElement, string | null>()
  const focusables = new Map<HTMLElement, HTMLElement[]>()
  for (const artist of artists) {
    const links = [...artist.querySelectorAll<HTMLElement>('a,button,input,select,textarea,[tabindex]')]
    focusables.set(artist, links)
    for (const link of links) tabIndices.set(link, link.getAttribute('tabindex'))
  }
  let disconnect: MutationObserver | undefined
  let disconnectToolbar: (() => void) | undefined
  const range = (): PosterRange => window.innerWidth >= 1280 ? 'desktop' : window.innerWidth >= 768 ? 'tablet' : 'mobile'
  const syncRadios = () => { for (const radio of radios) radio.checked = radio.value === selected }
  // Only canonical endpoint metadata is remembered, never painted geometry.
  // Check initial inline declarations lazily once, so valid SSR benefits on click 1.
  const initialized = new WeakSet<HTMLElement>()
  const fullMask = posterPositionFields.reduce((mask, field) => mask | posterPositionMask[field], 0)
  const noChange: PosterPositionMasks = { mobile: 0, tablet: 0, desktop: 0 }
  const declarations = (endpoints: PosterPositions, display: 'grid' | 'block') => ranges.flatMap(range => {
    const value = canonicalPosterPosition(endpoints[range])
    return posterPositionFields.map(field => ({
      range, bit: posterPositionMask[field], property: `--${range}-${field === 'present' ? 'display' : field}`,
      value: field === 'present' ? value.present ? display : 'none' : String(value[field]),
    }))
  })
  const position = (node: HTMLElement, endpoints: PosterPositions, display: 'grid' | 'block', masks?: PosterPositionMasks, previous?: PosterPositions) => {
    let sparse = masks !== undefined && initialized.has(node)
    if (masks && !initialized.has(node) && previous) {
      // Inline only: missing/wrong/important values must be fully normalized.
      sparse = declarations(previous, display).every(({ property, value }) =>
        node.style.getPropertyValue(property) === value && node.style.getPropertyPriority(property) === '')
    }
    for (const { range, bit, property, value } of declarations(endpoints, display)) {
      if ((sparse ? masks![range] : fullMask) & bit) node.style.setProperty(property, value)
    }
    initialized.add(node)
  }
  let rowsInitialized = false
  const accessible = (node: HTMLElement, included: boolean) => {
    node.inert = !included
    for (const link of focusables.get(node) ?? []) {
      if (!included) link.setAttribute('tabindex', '-1')
      else {
        const previous = tabIndices.get(link)
        if (previous == null) link.removeAttribute('tabindex')
        else link.setAttribute('tabindex', previous)
      }
    }
  }
  const endpoint = (): PosterFilterPlan => plans.plans[selected]
  const announce = (count: number) => {
    status.textContent = count ? `${count} artistas` : 'No hay artistas para este filtro.'
  }
  const reorder = () => {
    const ranked = sort ? order![sort].map(index => artists[index]) : artists
    for (const node of ranked) grid.insertBefore(node, artistBoundary)
  }
  const sortedEndpoints = new Map<DayKey, Map<HTMLElement, PosterPositions>>()
  const sortedSlots = () => {
    if (!sort) return
    let slots = sortedEndpoints.get(selected)
    if (!slots) {
      slots = new Map()
      const { ids, artists: canonical } = indexedPlans.get(selected)!
      let slot = 0
      for (const index of order![sort]) {
        if (ids.has(artistIDs[index])) slots.set(artists[index], canonical.get(endpoint().ids[slot++])!)
      }
      sortedEndpoints.set(selected, slots)
    }
    return slots
  }
  const applySortedSlots = () => {
    // Motion and CSS use the same mapping; the canonical endpoints still own sparse writes.
    const slots = sortedSlots()
    if (slots) for (const [node, positions] of slots) for (const r of ranges) {
      const { row, column, width, height } = positions[r]!
      node.style.setProperty(sortedProperty(r), `${row + 1}/${column + 1}/span ${height}/span ${width}`)
    }
    grid.toggleAttribute('data-poster-ordered', !!slots)
  }
  let compact: ReturnType<typeof createPosterSimpleLayout> | undefined
  let trackWidth: number | undefined
  const posterTracks = new Map<DayKey, number[] | undefined>()
  const capturePosterTracks = (rows: number) => {
    if (trackWidth !== window.innerWidth) {
      posterTracks.clear()
      trackWidth = window.innerWidth
    }
    if (!posterTracks.has(selected)) {
      // On a new day/width, canonical placements have already been written.
      // Restore only the poster CSS during this synchronous, grid-only sample.
      const restoreSimple = grid.hasAttribute('data-poster-simple')
      if (restoreSimple) grid.removeAttribute('data-poster-simple')
      try {
        posterTracks.set(selected, resolvedFilterTracks(getComputedStyle(grid).gridTemplateRows, rows))
      } finally {
        if (restoreSimple) grid.setAttribute('data-poster-simple', '')
      }
    }
    return posterTracks.get(selected)
  }
  const applySimpleSlots = () => {
    const compactRange = range()
    const slots = sortedSlots()
    const ranked = slots ? [...slots.keys()].map(node => node.dataset.posterArtist!) : endpoint().ids
    const plan = endpoint()
    compact = createPosterSimpleLayout(plan, compactRange, ranked, plans.simple![selected][compactRange])
    grid.style.setProperty(simpleRows, String(compact.rows))
    const prefix = capturePosterTracks(plan.layouts[compactRange].rows)?.slice(0, compact.rows) ?? []
    const tracks = prefix.map(height => `${height}px`)
    const extra = compact.rows - prefix.length
    if (extra) tracks.push(`repeat(${extra},var(--poster-simple-fallback-track))`)
    grid.style.setProperty(simpleTracks, tracks.join(' ') || 'none')
    const place = (node: HTMLElement, cell?: SlotRect) => {
      if (cell) node.style.setProperty(simpleArea, `${cell.row + 1}/${cell.column + 1}/span ${cell.height}/span ${cell.width}`)
    }
    for (const node of artists) place(node, compact.artists.get(node.dataset.posterArtist!))
    for (const node of information) place(node, compact.information.get(node.dataset.posterInformation!))
  }
  const finish = () => {
    motion?.dispose(); motion = undefined; motionPaint = undefined
    const artistIDs = indexedPlans.get(selected)!.ids
    const activeMotifs = new Set(motifNodes)
    for (const node of artists) {
      node.hidden = !artistIDs.has(node.dataset.posterArtist!)
      if (node.hidden) node.style.display = 'none'; else node.style.removeProperty('display')
    }
    for (const node of pool) {
      node.hidden = !activeMotifs.has(node)
      if (node.hidden) node.style.display = 'none'; else node.style.removeProperty('display')
    }
    releaseScroll?.(); releaseScroll = undefined
    if (pending) announce(endpoint().ids.length)
    pending = false
  }
  const settle = () => {
    if (destroyed) return
    ++generation
    if (!pending && !motion && !releaseScroll) return
    finish()
  }
  const select = (key: DayKey) => {
    if (destroyed || !options.canInteract()) { syncRadios(); return }
    if (key === selected) { syncRadios(); return }
    const activeRange = range()
    const scroll = { x: window.scrollX, y: window.scrollY }
    let animate = !media.matches && (!!options.createMotion || isMotionReady())
    if (!media.matches && !options.createMotion) preloadMotion()
    const displayed = (node: HTMLElement) => !node.hidden && node.style.display !== 'none'
      && node.style.getPropertyValue(`--${activeRange}-display`) !== 'none'
    const endpointRects = (geometry: FilterGridGeometry) => {
      const rects = new Map<HTMLElement, DOMRect>()
      const current = indexedPlans.get(selected)!
      const rankedSlots = sortedSlots()
      const add = (node: HTMLElement, cell?: SlotRect) => {
        const rect = filterCellRect(geometry, cell)
        if (rect) rects.set(node, rect)
      }
      for (const node of artists) {
        const positions = rankedSlots ? rankedSlots.get(node) : current.artists.get(node.dataset.posterArtist!)
        add(node, compact ? compact.artists.get(node.dataset.posterArtist!) : positions?.[activeRange])
      }
      for (const node of information) {
        const id = node.dataset.posterInformation!
        add(node, compact ? compact.information.get(id) : current.information.get(id)?.[activeRange])
      }
      if (!simple) motifNodes.forEach((node, index) => add(node, motifEndpoints[index].positions[activeRange]))
      return rects
    }
    const sourceLayout = compact ?? endpoint().layouts[activeRange]
    const sourceGeometry = animate ? readFilterGridGeometry(grid, sourceLayout.columns, sourceLayout.rows) : undefined
    // If resolved tracks are unavailable, settle rather than measuring tiles.
    if (!sourceGeometry) animate = false
    const first = sourceGeometry ? endpointRects(sourceGeometry) : new Map<HTMLElement, DOMRect>()
    const samples = new Map<HTMLElement, FilterMotionSample>()
    if (sourceGeometry && motionPaint) for (const [node, base] of motionPaint.bases) {
      const sample = motion?.sample?.(node)
      if (sample) samples.set(node, sample)
      first.set(node, filterPaintRect(node, base, motionPaint.gridRect, sourceGeometry.rect, sample))
    }
    // Include interrupted outgoing paint, even when absent from the endpoint.
    const firstAlpha = new Map<HTMLElement, number>()
    for (const node of first.keys()) {
      const inlineAlpha = Number.parseFloat(node.style.opacity || '1')
      const alpha = samples.get(node)?.opacity ?? (Number.isFinite(inlineAlpha) ? inlineAlpha : 1)
      if (!displayed(node) || node.style.visibility === 'hidden' || alpha === 0) first.delete(node)
      else firstAlpha.set(node, alpha)
    }
    const target = plans.plans[key]
    const targetIndex = indexedPlans.get(key)!
    const transition = transitions?.get(selected)!.get(key)!
    const previousIndex = indexedPlans.get(selected)!
    const artistPatches = transition && new Map(transition.artists.map(patch => [patch.id, patch.masks]))
    const informationPatches = transition && new Map(transition.information.map(patch => [patch.id, patch.masks]))
    ++generation
    motion?.dispose(); motion = undefined; motionPaint = undefined
    releaseScroll?.()
    const restoreHtml = options.ownStyles(document.documentElement, ['overflow-anchor', 'scroll-behavior'])
    const restoreGrid = options.ownStyles(grid, ['overflow-anchor'])
    document.documentElement.style.setProperty('overflow-anchor', 'none')
    document.documentElement.style.setProperty('scroll-behavior', 'auto')
    grid.style.setProperty('overflow-anchor', 'none')
    releaseScroll = () => { restoreHtml(); restoreGrid() }
    const previousNodes = motifNodes
    const cells = (endpoints: typeof motifEndpoints) => endpoints.map(m => ({ variant: m.variant, ...m.positions[activeRange] }))
    const matches = transition ? transition.motifs[activeRange] : matchPosterMotifs(cells(motifEndpoints), cells(target.motifs), activeRange === 'mobile' ? 0 : 4)
    const travellingMotifs = new Set(matches.flatMap(({ from, to }) => {
      const source = motifEndpoints[from].positions[activeRange]!
      const destination = target.motifs[to].positions[activeRange]!
      return source.column !== destination.column || source.row !== destination.row ? [previousNodes[from]] : []
    }))
    const motifPatches = transition && new Map(transition.motifs[activeRange].map(patch => [patch.to, patch]))
    const matched = new Map(matches.map(m => [m.to, previousNodes[m.from]]))
    const assigned = new Set(matched.values())
    const previousSet = new Set(previousNodes)
    // Reserve every previous endpoint, even offscreen/outgoing paint. Preserve
    // Set insertion order within each variant without rescanning the pool.
    const available = new Map<string, { nodes: HTMLElement[]; cursor: number }>()
    for (const node of pool) {
      if (previousSet.has(node) || assigned.has(node)) continue
      const variant = node.dataset.posterMotif!
      let queue = available.get(variant)
      if (!queue) { queue = { nodes: [], cursor: 0 }; available.set(variant, queue) }
      queue.nodes.push(node)
    }
    motifNodes = target.motifs.map((m, index) => {
      let node = matched.get(index)
      if (!node) {
        const queue = available.get(m.variant)
        if (queue && queue.cursor < queue.nodes.length) node = queue.nodes[queue.cursor++]
      }
      if (!node) {
        // Clone only the safe structural SVG wrapper, never participant markup/IDs.
        const template = originalMotifs[0]
        node = template.cloneNode(true) as HTMLElement
        node.removeAttribute('style'); node.dataset.posterMotif = m.variant
        const paint = patternPaint(node)
        if (paint) paint.style.backgroundImage = `url("${paint.dataset.patternBase}${m.variant}.svg")`
        else node.querySelector('use')!.setAttribute('href', `#${m.variant}`)
        grid.append(node); pool.add(node)
      }
      assigned.add(node); node.hidden = false; node.style.removeProperty('display'); node.dataset.posterMotifIndex = String(index)
      const patch = motifPatches?.get(index)
      // Unmatched recycled nodes are deliberately full writes, regardless of history.
      position(node, m.positions, 'block', patch?.masks, patch && motifEndpoints[patch.from].positions)
      return node
    })
    motifEndpoints = target.motifs
    selected = key; pending = true; syncRadios()
    // One final-flow write batch, including actual information and all ranges.
    if (transition && !rowsInitialized) rowsInitialized = ranges.every(r =>
      grid.style.getPropertyValue(`--${r}-rows`) === String(plans.plans[transition.from].layouts[r].rows)
      && grid.style.getPropertyPriority(`--${r}-rows`) === '')
    for (const r of ranges) {
      if (!transition || !rowsInitialized || transition.rows.includes(r)) grid.style.setProperty(`--${r}-rows`, String(target.layouts[r].rows))
    }
    rowsInitialized = true
    for (const node of artists) {
      const id = node.dataset.posterArtist!
      const included = targetIndex.ids.has(id)
      accessible(node, included)
      node.hidden = !included
      if (included) node.style.removeProperty('display'); else node.style.display = 'none'
      position(node, targetIndex.artists.get(id) ?? {}, 'grid', artistPatches && (artistPatches.get(id) ?? noChange), previousIndex.artists.get(id) ?? {})
    }
    for (const node of information) {
      const id = node.dataset.posterInformation!
      position(node, targetIndex.information.get(id) ?? {}, 'grid', informationPatches && (informationPatches.get(id) ?? noChange), previousIndex.information.get(id) ?? {})
    }
    for (const node of pool) if (!assigned.has(node)) { node.hidden = true; node.style.display = 'none' }
    if (sort) applySortedSlots()
    if (simple) applySimpleSlots()
    // Keep the document coordinate, not an artist reference. Shrinking content
    // may clamp it naturally; restore only within the new document bounds.
    const max = Math.max(0, document.documentElement.scrollHeight - window.innerHeight)
    const y = Math.max(0, Math.min(max, scroll.y))
    if (y !== window.scrollY) window.scrollTo(scroll.x, y)
    if (!animate) { finish(); return }
    // A necessary bottom clamp changes viewport coordinates, not tile positions.
    const shift = scroll.y - y
    if (shift) for (const [node, rect] of first) first.set(node, new DOMRect(rect.left, rect.top + shift, rect.width, rect.height))
    const layout = compact ?? target.layouts[activeRange]
    const targetGeometry = readFilterGridGeometry(grid, layout.columns, layout.rows)
    if (!targetGeometry) { finish(); return }
    const last = endpointRects(targetGeometry)
    for (const node of last.keys()) if (!displayed(node)) last.delete(node)
    const gridRect = targetGeometry.rect
    const inView = (rect?: DOMRect) => rect && rect.width > 0 && rect.height > 0
      && rect.bottom > 0 && rect.top < window.innerHeight && rect.right > 0 && rect.left < window.innerWidth
    const items = [...new Set([...first.keys(), ...last.keys()])]
      .map(node => ({ node,
        // Same logical cells can shift in pixels as content tracks grow/shrink.
        // Only prepared travel pairs may translate decorative paint; stationary
        // and interrupted recycled motifs settle geometry directly, retaining alpha.
        first: first.has(node) && last.has(node) && pool.has(node) && !travellingMotifs.has(node)
          ? last.get(node) : first.get(node),
        firstAlpha: firstAlpha.get(node), last: last.get(node),
      }))
      .filter(({ node, first: origin, last, firstAlpha }) => (inView(first.get(node)) || inView(last))
        && (!origin || !last || origin.left !== last.left || origin.top !== last.top || firstAlpha !== 1))
    if (!items.length) { finish(); return }
    // Outgoing nodes are noninteractive paint, not hidden until finite completion.
    for (const item of items) if (!item.last) item.node.hidden = false
    const token = generation
    motionPaint = { gridRect, bases: new Map(items.map(item => [item.node, (item.last ?? item.first)!])) }
    try {
      const created = (options.createMotion ?? createLazyFilterMotion)({ items, gridRect, onComplete: () => { if (!destroyed && root.isConnected && token === generation) finish() } })
      if (pending) motion = created
      else created.dispose()
    } catch { finish() }
  }
  const change = (event: Event) => {
    const input = event.target
    if (presentation && input === sortControl) {
      const next = isSort(sortControl.value) ? sortControl.value : undefined
      if (!options.canInteract()) { sortControl.value = sort ?? ''; return }
      if (next === sort) return
      settle(); sort = next; sortedEndpoints.clear(); reorder(); applySortedSlots()
      if (simple) applySimpleSlots()
      return
    }
    if (!(input instanceof HTMLInputElement) || !radios.includes(input)) return
    if (!isKey(input.value)) { syncRadios(); return }
    select(input.value)
  }
  const syncSimple = () => simpleToggle?.setAttribute('aria-pressed', String(simple))
  const toggleSimple = () => {
    if (!presentation || !options.canInteract()) return
    settle(); simple = !simple
    if (simple) applySimpleSlots(); else compact = undefined
    grid.toggleAttribute('data-poster-simple', simple)
    syncSimple()
  }
  const destroy = () => {
    if (destroyed) return
    destroyed = true; ++generation; abort.abort(); motion?.dispose(); releaseScroll?.()
    disconnect?.disconnect(); disconnectToolbar?.(); media.removeEventListener?.('change', settle)
    if (presentation) {
      if (sort) { sort = undefined; reorder() }
      for (const node of artists) for (const r of ranges) node.style.removeProperty(sortedProperty(r))
      simple = false; grid.removeAttribute('data-poster-simple'); grid.removeAttribute('data-poster-ordered')
      sortControl.value = ''; syncSimple()
    }
    for (const node of pool) if (!originalMotifSet.has(node)) node.remove()
    for (const { node, restore, hidden, inert, index } of saved) {
      restore()
      node.hidden = hidden; node.inert = inert
      if (index !== null) node.setAttribute('data-poster-motif-index', index)
    }
    for (const [node, value] of tabIndices) { if (value === null) node.removeAttribute('tabindex'); else node.setAttribute('tabindex', value) }
    selected = 'all'; syncRadios(); controls.hidden = true; status.textContent = ''
  }
  try {
    controls.addEventListener('change', change, { signal: abort.signal })
    if (presentation) simpleToggle.addEventListener('click', toggleSimple, { signal: abort.signal })
    root.addEventListener('click', event => {
      const link = event.target instanceof Element ? event.target.closest<HTMLElement>('[data-event-trigger]') : null
      if (link && !indexedPlans.get(selected)!.ids.has(link.dataset.eventId!)) event.preventDefault()
    }, { signal: abort.signal, capture: true })
    window.addEventListener('resize', () => {
      settle()
      if (trackWidth !== window.innerWidth) {
        posterTracks.clear()
        if (simple) applySimpleSlots()
      }
    }, { signal: abort.signal })
    const refreshFontTracks = () => {
      posterTracks.clear()
      if (simple) { settle(); applySimpleSlots() }
    }
    if (presentation) document.fonts?.addEventListener('loadingdone', refreshFontTracks, { signal: abort.signal })
    media.addEventListener('change', settle)
    disconnect = new MutationObserver(() => { if (!root.isConnected) { destroy(); options.onDisconnect() } })
    disconnect.observe(document.documentElement, { childList: true, subtree: true })
    if (sortControl && simpleToggle) {
      sortControl.disabled = simpleToggle.disabled = !presentation
      sortControl.value = ''; syncSimple()
    }
    if (presentation) {
      disconnectToolbar = mountStickyToolbar(controls, sortControl, options.ownStyles, abort.signal)
    }
    controls.hidden = false; syncRadios()
  } catch { destroy(); return inactive }
  return { settle, includes: id => !!id && indexedPlans.get(selected)!.ids.has(id), destroy }
}

function mountStickyToolbar(panel: HTMLElement, picker: HTMLSelectElement, ownStyles: FilterOptions['ownStyles'], signal: AbortSignal) {
  const header = panel.ownerDocument.querySelector<HTMLElement>('[data-poster-header]')
  if (!header || typeof ResizeObserver === 'undefined') return
  const heightProperty = '--poster-header-height'
  const concealedAttribute = 'data-poster-toolbar-concealed'
  const restoreHeight = ownStyles(panel, [heightProperty])
  const setHeight = (height: number) => panel.style.setProperty(heightProperty, `${height}px`)
  // Seed the inset once, including on scroll restoration. Further changes come
  // from the observer, never from a layout read in the scroll handler.
  setHeight(header.getBoundingClientRect().height)
  const observer = new ResizeObserver(([entry]) => {
    if (!signal.aborted && entry) setHeight(entry.borderBoxSize?.[0]?.blockSize ?? entry.contentRect.height)
  })
  observer.observe(header, { box: 'border-box' })

  const offset = () => Math.max(0, window.scrollY)
  const threshold = 12
  const supportsOpen = window.CSS?.supports('selector(:open)') ?? false
  let anchor = offset()
  let concealed = false
  const setConcealed = (next: boolean) => {
    if (concealed === next) return
    concealed = next
    panel.toggleAttribute(concealedAttribute, next)
  }
  const reveal = () => { anchor = offset(); setConcealed(false) }
  panel.addEventListener('focusin', reveal, { signal })
  window.addEventListener('scroll', () => {
    const y = offset()
    if (y === 0 || panel.contains(panel.ownerDocument.activeElement) || (supportsOpen && picker.matches(':open'))) {
      anchor = y
      setConcealed(false)
    } else if (concealed) {
      anchor = Math.max(anchor, y)
      if (anchor - y >= threshold) { anchor = y; setConcealed(false) }
    } else {
      anchor = Math.min(anchor, y)
      if (y - anchor >= threshold) { anchor = y; setConcealed(true) }
    }
  }, { passive: true, signal })
  return () => { observer.disconnect(); restoreHeight(); setConcealed(false) }
}
