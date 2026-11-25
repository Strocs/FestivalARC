import type { PosterRange } from './poster'
import type { DayKey, PosterFilterPlan } from './poster-filter-layout'
import type { ArtistAnchor, GridColumns, PosterLayout, SlotRect } from './poster-grid'

export type SimpleEndpoint = [cards: number[], information: number[]]
export type PosterSimplePlans = Record<DayKey, Record<PosterRange, SimpleEndpoint>>

const rowMask = (column: number, width: number) => ((1 << width) - 1) << column
const fits = (rows: number[], { row, column, width, height }: SlotRect) => {
  const mask = rowMask(column, width)
  for (let y = row; y < row + height; y++) if ((rows[y] ?? 0) & mask) return false
  return true
}
const occupy = (rows: number[], { row, column, width, height }: SlotRect) => {
  const mask = rowMask(column, width)
  for (let y = row; y < row + height; y++) rows[y] = (rows[y] ?? 0) | mask
}

/** Build-only packing strategy for the established information compactor. */
export function calculateDensePosterLayout(ids: readonly string[], columns: GridColumns, information: readonly SlotRect[] = [], anchors: readonly ArtistAnchor[] = [], startRow = 0): PosterLayout {
  const occupied: number[] = []
  const width = columns === 8 ? 8 : 2
  const height = columns === 8 ? 2 : 1
  for (const rect of information) {
    if (!fits(occupied, rect)) throw new Error('Overlapping dense information')
    occupy(occupied, rect)
  }
  const artists = anchors.map(anchor => {
    const cell = { ...anchor, width, height }
    if (!fits(occupied, cell)) throw new Error('Dense artist anchor overlaps information')
    occupy(occupied, cell)
    return cell
  })
  let index = startRow * columns
  for (const id of ids.slice(artists.length)) {
    for (;; index++) {
      const column = index % columns
      if (column + width > columns) continue
      const cell = { id, column, row: Math.floor(index / columns), width, height }
      if (!fits(occupied, cell)) continue
      occupy(occupied, cell)
      artists.push(cell)
      break
    }
  }
  return { columns, rows: occupied.length, artists, motifs: [] }
}

/** Expand validated integer starts to the shared paint/animation footprints. */
export function createPosterSimpleLayout(plan: PosterFilterPlan, range: PosterRange, ranked: readonly string[], endpoint: SimpleEndpoint) {
  const { columns, artists: canonical } = plan.layouts[range]
  const blocks = Object.entries(plan.information[range])
  const [starts, reserved] = endpoint
  if (!Array.isArray(starts) || starts.length !== ranked.length || !Array.isArray(reserved) || reserved.length !== blocks.length) throw new Error('Invalid simple endpoint')
  const occupied: number[] = []
  const cell = (index: number, width: number, height: number) => {
    const rect = { column: index % columns, row: Math.floor(index / columns), width, height }
    if (!Number.isSafeInteger(index) || index < 0 || rect.row + height > 4096 || rect.column + width > columns || !fits(occupied, rect)) {
      throw new Error('Invalid simple footprint')
    }
    occupy(occupied, rect)
    return rect
  }
  const information = new Map(blocks.map(([id, block], i) => [id, cell(reserved[i], block.width, block.height)]))
  const artists = new Map(ranked.map((id, i) => {
    if (i && starts[i] <= starts[i - 1]) throw new Error('Invalid simple card order')
    return [id, cell(starts[i], canonical[i].width, canonical[i].height)]
  }))
  return { columns, rows: occupied.length, artists, information }
}
