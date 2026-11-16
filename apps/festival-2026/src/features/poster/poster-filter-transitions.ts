import type { PosterRange } from './poster'
import type { SlotRect } from './poster-grid'
import type { DayKey, PosterFilterPlan } from './poster-filter-layout'
import type { PosterPositions } from './poster-layout'
import { matchPosterMotifs } from './poster-motif-match'

const ranges = ['desktop', 'tablet', 'mobile'] as const
const days = ['all', 'saturday', 'sunday'] as const

export const posterPositionFields = ['present', 'column', 'row', 'width', 'height'] as const
export const posterPositionMask = { present: 1, column: 2, row: 4, width: 8, height: 16 } as const
export interface CanonicalPosterPosition extends SlotRect { present: boolean }
export type PosterPositionMasks = Record<PosterRange, number>
export interface PosterStablePatch { id: string; masks: PosterPositionMasks }
export interface PosterMotifPatch { from: number; to: number; masks: PosterPositionMasks }
export interface PosterFilterTransition {
  from: DayKey
  to: DayKey
  artists: PosterStablePatch[]
  information: PosterStablePatch[]
  rows: PosterRange[]
  motifs: Record<PosterRange, PosterMotifPatch[]>
}

/** Canonical variable values used by position(): absent means none, 0/0/1/1. */
export function canonicalPosterPosition(rect?: SlotRect): CanonicalPosterPosition {
  return { present: !!rect, column: rect?.column ?? 0, row: rect?.row ?? 0,
    width: rect?.width ?? 1, height: rect?.height ?? 1 }
}

/** Presence selects grid/block versus none; coordinates remain zero-based DTO values. */
export function diffPosterPosition(previous?: SlotRect, next?: SlotRect): number {
  const source = canonicalPosterPosition(previous)
  const target = canonicalPosterPosition(next)
  return posterPositionFields.reduce((mask, field) =>
    mask | (source[field] === target[field] ? 0 : posterPositionMask[field]), 0)
}

export function diffPosterPositions(previous: PosterPositions, next: PosterPositions): PosterPositionMasks {
  return {
    desktop: diffPosterPosition(previous.desktop, next.desktop),
    tablet: diffPosterPosition(previous.tablet, next.tablet),
    mobile: diffPosterPosition(previous.mobile, next.mobile),
  }
}

/** Build-only invocation on validated finite endpoints; imports remain client-safe. */
export function compilePosterFilterTransitions(plans: Record<DayKey, PosterFilterPlan>): PosterFilterTransition[] {
  const index = (plan: PosterFilterPlan, kind: 'artists' | 'information') => {
    const positions = new Map<string, PosterPositions>()
    for (const range of ranges) {
      const entries = kind === 'artists'
        ? plan.layouts[range].artists.map(rect => [rect.id, rect] as const)
        : Object.entries(plan.information[range])
      for (const [id, rect] of entries) {
        let value = positions.get(id)
        if (!value) { value = {}; positions.set(id, value) }
        value[range] = rect
      }
    }
    return positions
  }
  const indexed = new Map(days.map(day => [day, {
    artists: index(plans[day], 'artists'), information: index(plans[day], 'information'),
  }]))
  return days.flatMap(from => days.filter(to => to !== from).map(to => {
    const source = plans[from]
    const target = plans[to]
    const stable = (kind: 'artists' | 'information'): PosterStablePatch[] => {
      const previous = indexed.get(from)![kind]
      const next = indexed.get(to)![kind]
      return [...new Set([...previous.keys(), ...next.keys()])].flatMap(id => {
        const masks = diffPosterPositions(previous.get(id) ?? {}, next.get(id) ?? {})
        return ranges.some(range => masks[range] !== 0) ? [{ id, masks }] : []
      })
    }
    const correspondence = (range: PosterRange): PosterMotifPatch[] => {
      const cells = (plan: PosterFilterPlan) => plan.motifs.map(motif => ({
        variant: motif.variant, ...motif.positions[range],
      }))
      // Each direction/range is independently matched. Never reverse pairs or reorder them.
      return matchPosterMotifs(cells(source), cells(target), range === 'mobile' ? 0 : 4).map(({ from, to }) => ({
        from, to, masks: diffPosterPositions(source.motifs[from].positions, target.motifs[to].positions),
      }))
    }
    return {
      from, to, artists: stable('artists'), information: stable('information'),
      rows: ranges.filter(range => source.layouts[range].rows !== target.layouts[range].rows),
      motifs: { desktop: correspondence('desktop'), tablet: correspondence('tablet'), mobile: correspondence('mobile') },
    }
  }))
}
