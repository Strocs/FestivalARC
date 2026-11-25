import type { PosterFilterPlan } from './poster-filter-layout'
import type { PosterMotif } from './poster'
import type { SlotRect } from './poster-grid'
import { selectPosterMotifs } from './poster-motif-distribution'

/** Build-only: keep the packed content, replacing its decorative row gaps. */
export function projectPosterMobileStrips(plan: PosterFilterPlan, interior: ReadonlySet<string>): void {
  const layout = plan.layouts.mobile
  const information = plan.information.mobile
  const content = [
    ...layout.artists.map(rect => ({ rect, interior: false, intro: false })),
    ...Object.entries(information).map(([id, rect]) => ({ rect, interior: interior.has(id), intro: id === 'intro' })),
  ].sort((a, b) => a.rect.row - b.rect.row || a.rect.column - b.rect.column)
  let end = 0
  let groupEnd = 0
  let offset = 0
  let groupInterior = false
  let groupIntro = false
  for (const [index, cell] of content.entries()) {
    const { rect } = cell
    const sourceEnd = rect.row + rect.height
    // Keep overlapping information in the same band. Change only gaps next
    // to an interior band, never the opening gap after the intro.
    if (index === 0 || rect.row >= groupEnd) {
      if (index > 0 && !groupIntro && !cell.intro && (groupInterior || cell.interior)) {
        offset = end + 1 - rect.row
      }
      groupInterior = false
      groupIntro = false
    }
    groupEnd = Math.max(groupEnd, sourceEnd)
    groupInterior ||= cell.interior
    groupIntro ||= cell.intro
    rect.row += offset
    end = Math.max(end, rect.row + rect.height)
  }
  layout.rows = groupInterior ? end + 1 : layout.rows + offset
  if (layout.rows > 4096) throw new Error('Mobile strip projection exceeds row limit')
  const occupied = new Uint8Array(layout.columns * layout.rows)
  for (const { rect } of content) {
    for (let row = rect.row; row < rect.row + rect.height; row++) {
      occupied.fill(1, row * layout.columns + rect.column, row * layout.columns + rect.column + rect.width)
    }
  }
  const opening = layout.motifs.filter(tile => tile.width === 2 && tile.height === 2)
  for (const tile of opening) for (let row = tile.row; row < tile.row + tile.height; row++) {
    occupied.fill(1, row * layout.columns + tile.column, row * layout.columns + tile.column + tile.width)
  }
  layout.motifs = [...opening]
  for (const [index, used] of occupied.entries()) if (!used) {
    layout.motifs.push({ column: index % layout.columns, row: Math.floor(index / layout.columns), width: 1, height: 1 })
  }
}

/** Preserve the original shared-index wide artwork; assign mobile separately. */
export function assignProjectedMobileArtwork(plan: PosterFilterPlan): void {
  const mobile = plan.layouts.mobile
  const opening = new Map<number, PosterMotif>()
  const entries = plan.motifs.filter(entry => entry.positions.desktop || entry.positions.tablet || entry.positions.mobile?.width === 2)
  const queues = new Map<PosterMotif, PosterFilterPlan['motifs']>()
  for (const entry of entries) {
    const cell = entry.positions.mobile
    if (cell?.width === 2) {
      opening.set(mobile.motifs.indexOf(cell), entry.variant)
      continue
    }
    delete entry.positions.mobile
    const queue = queues.get(entry.variant) ?? []
    queue.push(entry)
    queues.set(entry.variant, queue)
  }
  const variants = selectPosterMotifs([mobile], opening)
  const cursors = new Map<PosterMotif, number>()
  for (const [index, cell] of mobile.motifs.entries()) {
    if (opening.has(index)) continue
    const variant = variants[index]
    const cursor = cursors.get(variant) ?? 0
    const entry = queues.get(variant)?.[cursor]
    if (entry) entry.positions.mobile = cell
    else entries.push({ index: entries.length, variant, positions: { mobile: cell } })
    cursors.set(variant, cursor + 1)
  }
  if (entries.length > 40960) throw new Error('Poster artwork exceeds motif limit')
  plan.motifs = entries
}
