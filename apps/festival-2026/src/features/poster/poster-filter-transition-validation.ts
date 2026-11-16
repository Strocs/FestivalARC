import type { DayKey, PosterFilterPlan, PosterFilterPlans } from './poster-filter-layout'
import type { PosterPositions } from './poster-layout'
import type { PosterFilterTransition, PosterPositionMasks, PosterStablePatch } from './poster-filter-transitions'
import { diffPosterPositions } from './poster-filter-transitions'

const ranges = ['desktop', 'tablet', 'mobile'] as const
const days = ['all', 'saturday', 'sunday'] as const

export interface PosterPlanIndex {
  ids: Set<string>
  artists: Map<string, PosterPositions>
  information: Map<string, PosterPositions>
}
export interface PosterFilterIndex {
  plans: Map<DayKey, PosterPlanIndex>
  transitions?: Map<DayKey, Map<DayKey, PosterFilterTransition>>
}

function indexPlan(plan: PosterFilterPlan): PosterPlanIndex {
  const artists = new Map<string, PosterPositions>()
  const information = new Map<string, PosterPositions>()
  for (const range of ranges) {
    for (const [kind, entries] of [
      [artists, plan.layouts[range].artists.map(rect => [rect.id, rect] as const)],
      [information, Object.entries(plan.information[range])],
    ] as const) {
      for (const [id, rect] of entries) {
        let positions = kind.get(id)
        if (!positions) { positions = {}; kind.set(id, positions) }
        positions[range] = rect
      }
    }
  }
  return { ids: new Set(plan.ids), artists, information }
}

function validMasks(value: PosterPositionMasks, expected: PosterPositionMasks): boolean {
  return !!value && Object.keys(value).length === ranges.length && ranges.every(range =>
    Number.isSafeInteger(value[range]) && value[range] >= 0 && value[range] <= 31 && value[range] === expected[range])
}

function validStable(patches: PosterStablePatch[], previous: Map<string, PosterPositions>, next: Map<string, PosterPositions>): boolean {
  const ids = new Set([...previous.keys(), ...next.keys()])
  if (!Array.isArray(patches) || patches.length > ids.size) return false
  const expected = new Map<string, PosterPositionMasks>()
  for (const id of ids) {
    const masks = diffPosterPositions(previous.get(id) ?? {}, next.get(id) ?? {})
    if (ranges.some(range => masks[range] !== 0)) expected.set(id, masks)
  }
  for (const patch of patches) {
    if (!patch || !expected.has(patch.id) || !validMasks(patch.masks, expected.get(patch.id)!)) return false
    expected.delete(patch.id)
  }
  return expected.size === 0
}

/** After full endpoint/DOM validation, admit metadata once without rematching.
 * Work is linear in the bounded endpoints plus supplied pairs (six fixed tables).
 * Undefined means malformed; a successful index without transitions is legacy v1.
 */
export function validatePosterFilterTransitions(value: PosterFilterPlans): PosterFilterIndex | undefined {
  const plans = new Map(days.map(day => [day, indexPlan(value.plans[day])]))
  if (!Object.hasOwn(value, 'transitions')) return { plans }
  if (!Array.isArray(value.transitions) || value.transitions.length !== 6) return undefined
  const transitions = new Map<DayKey, Map<DayKey, PosterFilterTransition>>()
  for (const table of value.transitions) {
    if (!table || !days.includes(table.from) || !days.includes(table.to) || table.from === table.to) return undefined
    let targets = transitions.get(table.from)
    if (!targets) { targets = new Map(); transitions.set(table.from, targets) }
    if (targets.has(table.to)) return undefined
    const source = value.plans[table.from]
    const target = value.plans[table.to]
    const previous = plans.get(table.from)!
    const next = plans.get(table.to)!
    if (!validStable(table.artists, previous.artists, next.artists)
      || !validStable(table.information, previous.information, next.information)) return undefined
    if (!Array.isArray(table.rows) || table.rows.length > 3 || new Set(table.rows).size !== table.rows.length
      || table.rows.some(range => !ranges.includes(range))
      || ranges.some(range => table.rows.includes(range) !== (source.layouts[range].rows !== target.layouts[range].rows))) return undefined
    if (!table.motifs || Object.keys(table.motifs).length !== 3) return undefined
    for (const range of ranges) {
      const pairs = table.motifs[range]
      if (!Array.isArray(pairs) || pairs.length > Math.min(source.motifs.length, target.motifs.length)) return undefined
      const used = new Set<number>()
      const taken = new Set<number>()
      for (const pair of pairs) {
        if (!pair || !Number.isSafeInteger(pair.from) || !Number.isSafeInteger(pair.to)
          || pair.from < 0 || pair.from >= source.motifs.length || pair.to < 0 || pair.to >= target.motifs.length
          || used.has(pair.from) || taken.has(pair.to)) return undefined
        const from = source.motifs[pair.from]
        const to = target.motifs[pair.to]
        const a = from.positions[range]
        const b = to.positions[range]
        if (!a || !b || from.variant !== to.variant || a.width !== b.width || a.height !== b.height
          || Math.hypot(a.column - b.column, a.row - b.row) > 4
          || !validMasks(pair.masks, diffPosterPositions(from.positions, to.positions))) return undefined
        used.add(pair.from); taken.add(pair.to)
      }
    }
    targets.set(table.to, table)
  }
  return { plans, transitions }
}
