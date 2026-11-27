import { motifSequence, type PosterMotif, type PosterRange } from './poster'
import type { SlotRect } from './poster-grid'
import type { DayKey, PosterFilterPlan } from './poster-filter-layout'
import { selectPosterMotifs } from './poster-motif-distribution'

const ranges = ['desktop', 'tablet', 'mobile'] as const
const days = ['all', 'saturday', 'sunday'] as const
const footprint = (cell: SlotRect) => `${cell.row}:${cell.column}:${cell.width}:${cell.height}`

/** Anchor each range independently, then share DOM slots only for identical artwork. */
export function stabilizePosterFilterArtwork(plans: Record<DayKey, PosterFilterPlan>): void {
  const artwork = {} as Record<PosterRange, Map<string, PosterMotif>>
  for (const range of ranges) {
    const baseline = new Map(plans.all.motifs.flatMap(motif => {
      const cell = motif.positions[range]
      return cell ? [[footprint(cell), motif.variant] as const] : []
    }))
    // The union includes cells shared only by Saturday and Sunday. Select them
    // once, with all Todos anchors already known, regardless of endpoint order.
    const cells = new Map<string, SlotRect>()
    for (const day of days) for (const cell of plans[day].layouts[range].motifs) cells.set(footprint(cell), cell)
    const union = [...cells.values()].sort((a, b) => a.row - b.row || a.column - b.column || a.width - b.width || a.height - b.height)
    const anchored = new Map(union.flatMap((cell, index) => {
      const variant = baseline.get(footprint(cell))
      return variant ? [[index, variant] as const] : []
    }))
    const variants = selectPosterMotifs([{ ...plans.all.layouts[range], motifs: union }], anchored)
    artwork[range] = new Map(union.map((cell, index) => [footprint(cell), variants[index]]))
  }
  // Todos keeps its original entries, artwork, ordering and responsive positions.
  for (const day of ['saturday', 'sunday'] as const) {
    const plan = plans[day]
    const entries: PosterFilterPlan['motifs'] = []
    const slots = new Map<PosterMotif, PosterFilterPlan['motifs']>(motifSequence.map(variant => [variant, []]))
    for (const range of ranges) {
      const cursors = new Map<PosterMotif, number>()
      for (const cell of plan.layouts[range].motifs) {
        const variant = artwork[range].get(footprint(cell))!
        const cursor = cursors.get(variant) ?? 0
        const queue = slots.get(variant)!
        let entry = queue[cursor]
        if (!entry) {
          entry = { index: entries.length, variant, positions: {} }
          entries.push(entry); queue.push(entry)
        }
        entry.positions[range] = cell
        cursors.set(variant, cursor + 1)
      }
    }
    if (entries.length > 40960) throw new Error('Poster artwork exceeds motif limit')
    plan.motifs = entries
  }
}
