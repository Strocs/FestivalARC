import type { PosterRange, PosterMotif } from './poster'
import { calculatePosterLayout, type PosterLayout, type SlotRect, type ArtistAnchor, type GridColumns } from './poster-grid'
import { selectPosterMotifs } from './poster-motif-distribution'
import type { PosterInformationBlock, PosterPositions } from './poster-layout'

export type DayKey = 'all' | 'saturday' | 'sunday'
export interface FilterParticipant { id: string; day: string }
export interface PosterFilterInput {
  scope: 'home' | 'category'
  participants: readonly FilterParticipant[]
  information: readonly PosterInformationBlock[]
}
export interface PosterFilterPlan {
  ids: string[]
  layouts: Record<PosterRange, PosterLayout>
  information: Record<PosterRange, Record<string, SlotRect>>
  motifs: { index: number; variant: PosterMotif; positions: PosterPositions }[]
}
export interface PosterFilterPlans {
  version: 1
  available: boolean
  participants: FilterParticipant[]
  plans: Record<DayKey, PosterFilterPlan>
}

const ranges = ['desktop', 'tablet', 'mobile'] as const
const days = { saturday: 'Sábado 28', sunday: 'Domingo 29' } as const
const columns: Record<PosterRange, GridColumns> = { desktop: 10, tablet: 6, mobile: 4 }
const limit = 4096
const before = (a: SlotRect, b: SlotRect) => a.row < b.row || (a.row === b.row && a.column < b.column)

/** Client consumers should import the DTO types only; no catalog/schema dependency. */
export function getPosterFilterPlan(plans: PosterFilterPlans, key: DayKey): PosterFilterPlan {
  if (key !== 'all' && key !== 'saturday' && key !== 'sunday') throw new Error('Invalid day key')
  return plans.plans[key]
}

function rangeInformation(blocks: readonly PosterInformationBlock[], range: PosterRange): Record<string, SlotRect> {
  return Object.fromEntries(blocks.flatMap(block => {
    const rect = block.positions[range]
    return rect ? [[block.id, { column: rect.column, row: rect.row, width: rect.width, height: rect.height }]] : []
  }))
}

function compact(
  ids: readonly string[], baseline: PosterLayout, blocks: readonly PosterInformationBlock[],
  range: PosterRange, startRow: number,
): { layout: PosterLayout; information: Record<string, SlotRect> } {
  const information = rangeInformation(blocks.filter(block => block.fixed), range)
  const movable = blocks.filter(block => !block.fixed && block.positions[range])
    .slice().sort((a, b) => {
      const left = a.positions[range]!
      const right = b.positions[range]!
      return left.row - right.row || left.column - right.column
    })
  let anchors: ArtistAnchor[] = []
  let lastBlock: SlotRect | undefined
  for (const block of movable) {
    const original = block.positions[range]!
    // A boundary counts retained predecessor identities, never the original numeric rank.
    const predecessors = new Set(baseline.artists.filter(artist => before(artist, original)).map(artist => artist.id))
    const prefix = ids.filter(id => predecessors.has(id))
    const established = calculatePosterLayout(prefix, columns[range], Object.values(information), anchors, startRow)
    anchors = established.artists.map(({ id, column, row }) => ({ id, column, row }))
    const lastArtist = established.artists.at(-1)
    const firstRow = Math.max(lastArtist?.row ?? 0, lastBlock?.row ?? 0)
    let placed = false
    // Bounded forward scan. Ask the engine to validate candidate footprints AND
    // committed full-height artist anchors, retaining its cadence/collision rules.
    for (let row = firstRow; row + original.height <= limit && !placed; row++) {
      const lanes = [original.column, ...Array.from({ length: columns[range] - original.width + 1 }, (_, index) => index).filter(column => column !== original.column)]
      for (const column of lanes) {
        const candidate = { column, row, width: original.width, height: original.height }
        if (lastBlock && before(candidate, lastBlock)) continue
        try {
          calculatePosterLayout(prefix, columns[range], [...Object.values(information), candidate], anchors, startRow)
        } catch {
          continue
        }
        information[block.id] = candidate
        lastBlock = candidate
        placed = true
        break
      }
    }
    if (!placed) throw new Error('Information compaction exceeds row limit')
  }
  const layout = calculatePosterLayout(ids, columns[range], Object.values(information), anchors, startRow)
  if (layout.rows > limit || layout.artists.some((artist, index) => artist.id !== ids[index])) {
    throw new Error('Compaction cannot preserve canonical artist order')
  }
  return { layout, information }
}

/** Build the finite endpoints atomically. No input or catalog state is written. */
export function createPosterFilterPlans(input: PosterFilterInput): PosterFilterPlans {
  if (!input || (input.scope !== 'home' && input.scope !== 'category')) throw new Error('Invalid poster scope')
  if (!Array.isArray(input.participants) || input.participants.length > 512
    || input.participants.some(participant => !participant || typeof participant.id !== 'string' || !participant.id.trim() || typeof participant.day !== 'string')) {
    throw new Error('Invalid filter participants')
  }
  if (!Array.isArray(input.information) || input.information.length > 32
    || input.information.some(block => !block || !/^[a-z][a-z0-9-]*$/.test(block.id) || !block.positions
      || (block.fixed !== undefined && typeof block.fixed !== 'boolean')
      || Object.keys(block.positions).some(key => !ranges.includes(key as PosterRange))
      || !Object.keys(block.positions).length)
    || new Set(input.information.map(block => block.id)).size !== input.information.length) {
    throw new Error('Invalid information metadata')
  }
  const informationBlocks: readonly PosterInformationBlock[] = input.information
  // Cap geometry before invoking the engine: finite scanning/motif allocation even
  // for hostile input. All footprint/collision/cadence validation stays in the engine.
  for (const block of informationBlocks) for (const rect of Object.values(block.positions)) {
    if (!rect || ![rect.column, rect.row, rect.width, rect.height].every(Number.isSafeInteger)
      || rect.row + rect.height > limit || rect.height > 128) throw new Error('Information exceeds geometry limits')
  }
  const participants = input.participants.map(({ id, day }) => ({ id, day }))
  const ids = participants.map(participant => participant.id)
  const startRow = (range: PosterRange) => input.scope === 'home' && range === 'mobile' ? 4 : 0
  const baseline = {} as Record<PosterRange, PosterLayout>
  for (const range of ranges) {
    baseline[range] = calculatePosterLayout(ids, columns[range], Object.values(rangeInformation(input.information, range)), [], startRow(range))
    if (baseline[range].rows > limit) throw new Error('Poster exceeds row limit')
  }
  const build = (key: DayKey): PosterFilterPlan => {
    const selected = participants.filter(participant => key === 'all' || participant.day === days[key]).map(participant => participant.id)
    const layouts = {} as Record<PosterRange, PosterLayout>
    const information = {} as Record<PosterRange, Record<string, SlotRect>>
    for (const range of ranges) {
      if (key === 'all' || input.scope === 'category') {
        information[range] = rangeInformation(input.information, range)
        layouts[range] = calculatePosterLayout(selected, columns[range], Object.values(information[range]), [], startRow(range))
      } else {
        const result = compact(selected, baseline[range], input.information, range, startRow(range))
        layouts[range] = result.layout
        information[range] = result.information
      }
    }
    const variants = selectPosterMotifs(ranges.map(range => layouts[range]))
    return {
      ids: selected, layouts, information,
      motifs: variants.map((variant, index) => ({
        index, variant,
        positions: Object.fromEntries(ranges.flatMap(range => layouts[range].motifs[index] ? [[range, layouts[range].motifs[index]]] : [])),
      })),
    }
  }
  return {
    version: 1,
    available: participants.some(participant => participant.day === days.saturday) && participants.some(participant => participant.day === days.sunday),
    participants,
    plans: { all: build('all'), saturday: build('saturday'), sunday: build('sunday') },
  }
}
