import { gzipSync } from 'node:zlib'
import { describe, expect, it } from 'vitest'
import { heroParticipants } from '../../artists/categories'
import { createPosterFilterPlans, type PosterFilterPlan, type PosterFilterPlans } from '../poster-filter-layout'
import { homeInformation } from '../poster-layout'
import type { SlotRect } from '../poster-grid'
import {
  compilePosterFilterTransitions, diffPosterPosition, diffPosterPositions,
  canonicalPosterPosition, posterPositionFields, posterPositionMask,
} from '../poster-filter-transitions'

const days = ['all', 'saturday', 'sunday'] as const
const ranges = ['desktop', 'tablet', 'mobile'] as const
const home = () => createPosterFilterPlans({
  scope: 'home', information: homeInformation,
  participants: heroParticipants.map(({ id, date }) => ({ id, day: date.day })),
})
const rect = (column = 0, row = 0, width = 1, height = 1): SlotRect => ({ column, row, width, height })

function applyMask(previous: SlotRect | undefined, next: SlotRect | undefined, mask: number) {
  const actual = canonicalPosterPosition(previous)
  const target = canonicalPosterPosition(next)
  for (const field of posterPositionFields) if (mask & posterPositionMask[field]) {
    Object.assign(actual, { [field]: target[field] })
  }
  return actual
}

// Deliberately independent expected canonical defaults, matching the public endpoint contract.
const canonical = (value?: SlotRect) => ({ present: !!value, column: value?.column ?? 0,
  row: value?.row ?? 0, width: value?.width ?? 1, height: value?.height ?? 1 })

describe('prepared poster transitions', () => {
  it('adds six directed tables without changing legacy v1 endpoints or mutating inputs', () => {
    const result = home()
    const before = structuredClone(result.plans)
    expect(result.transitions).toHaveLength(6)
    expect(result.transitions).toEqual(compilePosterFilterTransitions(result.plans))
    expect(result.plans).toEqual(before)
    const { transitions, ...legacy } = result
    const compatible: PosterFilterPlans = legacy
    expect(compatible.version).toBe(1)
    expect(compatible.available).toBe(true)
    expect(compatible.participants.map(p => p.id)).toEqual(compatible.plans.all.ids)
    expect(transitions?.map(t => [t.from, t.to])).toEqual(days.flatMap(from =>
      days.filter(to => to !== from).map(to => [from, to])))
  })

  it('uses destination references and sparse stable patches to reach all target and absent defaults', () => {
    const result = home()
    const tables = compilePosterFilterTransitions(result.plans)
    expect(tables).toHaveLength(6)
    for (const table of tables) {
      const source = result.plans[table.from]
      const target = result.plans[table.to]
      for (const kind of ['artists', 'information'] as const) {
        const ids = kind === 'artists' ? result.participants.map(p => p.id)
          : [...new Set(ranges.flatMap(r => [...Object.keys(source.information[r]), ...Object.keys(target.information[r])]))]
        const patches = new Map(table[kind].map(p => [p.id, p]))
        expect(patches.size).toBe(table[kind].length)
        for (const patch of table[kind]) {
          expect(Object.keys(patch).sort()).toEqual(['id', 'masks'])
          expect(Object.values(patch.masks).some(Boolean)).toBe(true)
        }
        for (const id of ids) for (const range of ranges) {
          const lookup = (plan: PosterFilterPlan) => kind === 'artists'
            ? plan.layouts[range].artists.find(a => a.id === id) : plan.information[range][id]
          const previous = lookup(source)
          const next = lookup(target)
          const mask = patches.get(id)?.masks[range] ?? 0
          expect(mask).toBe(diffPosterPosition(previous, next))
          expect(applyMask(previous, next, mask)).toEqual(canonical(next))
        }
      }
      expect(table.rows).toEqual(ranges.filter(r => source.layouts[r].rows !== target.layouts[r].rows))
      for (const patches of Object.values(table.motifs)) for (const patch of patches) {
        expect(Object.keys(patch).sort()).toEqual(['from', 'masks', 'to'])
      }
    }
  })

  it('returns zero for no-op fields and isolates presence, geometry and absent resets', () => {
    expect(canonicalPosterPosition()).toEqual(canonical())
    expect(diffPosterPosition(undefined, undefined)).toBe(0)
    expect(diffPosterPosition(rect(2, 3, 2, 2), rect(2, 3, 2, 2))).toBe(0)
    expect(diffPosterPosition(undefined, rect())).toBe(posterPositionMask.present)
    for (const field of ['column', 'row', 'width', 'height'] as const) {
      const next = { ...rect(), [field]: 4 }
      expect(diffPosterPosition(rect(), next)).toBe(posterPositionMask[field])
    }
    const previous = rect(2, 3, 2, 2)
    expect(diffPosterPosition(previous, undefined)).toBe(31)
    expect(applyMask(previous, undefined, 31)).toEqual(canonical())
    expect(diffPosterPositions({}, {})).toEqual({ desktop: 0, tablet: 0, mobile: 0 })
  })

  it('compiles exact-first, source-order, distance ties, missing ranges and mixed sizes through the helper', () => {
    const plans = structuredClone(home().plans)
    const motif = (positions: PosterFilterPlan['motifs'][number]['positions'], index: number) => ({ index, variant: 'rings' as const, positions })
    plans.all.motifs = [
      motif({ desktop: rect(0, 0), mobile: rect(0, 4, 2, 2) }, 0),
      motif({ desktop: rect(1, 0), tablet: rect() }, 1),
      motif({ desktop: rect(4, 2) }, 2),
      motif({ desktop: rect(4, 4, 2, 2), mobile: rect() }, 3),
      motif({ mobile: rect(3, 0) }, 4),
      motif({ desktop: rect(8, 1) }, 5),
      motif({ desktop: rect(6, 1) }, 6),
      motif({ desktop: rect(4, 2) }, 7),
    ]
    plans.saturday.motifs = [
      motif({ desktop: rect(1, 0), tablet: rect(2, 0) }, 0),
      motif({ desktop: rect(2, 0), mobile: rect(0, 4, 2, 2) }, 1),
      motif({ desktop: rect(3, 2) }, 2),
      motif({ desktop: rect(5, 2) }, 3),
      motif({ desktop: rect(4, 4), mobile: rect() }, 4),
      motif({ desktop: rect(8, 2) }, 5),
      motif({ desktop: rect(6, 2) }, 6),
      motif({ desktop: rect(4, 3) }, 7),
    ]
    const before = structuredClone(plans)
    const table = compilePosterFilterTransitions(plans).find(t => t.from === 'all' && t.to === 'saturday')!
    expect(table.motifs.desktop.map(({ from, to }) => ({ from, to }))).toEqual([
      { from: 1, to: 0 }, { from: 0, to: 1 }, { from: 6, to: 6 },
      { from: 5, to: 5 }, { from: 2, to: 2 }, { from: 7, to: 3 },
    ])
    expect(table.motifs.mobile.map(({ from, to }) => ({ from, to }))).toEqual([{ from: 0, to: 1 }, { from: 3, to: 4 }])
    expect(table.motifs.tablet.map(({ from, to }) => ({ from, to }))).toEqual([{ from: 1, to: 0 }])
    const exact = table.motifs.desktop[0]
    expect(exact.masks.desktop).toBe(0)
    expect(exact.masks.tablet).toBe(posterPositionMask.column)
    expect(exact.masks.mobile).toBe(0)
    expect(table.motifs.desktop[1].masks.mobile).toBe(0)
    expect(plans).toEqual(before)
  })

  it('reports actual home JSON serialization overhead, not network or latency performance', () => {
    const result = home()
    const { transitions: _transitions, ...legacy } = result
    const bytes = (value: unknown) => {
      const json = JSON.stringify(value)
      return { raw: Buffer.byteLength(json), gzip: gzipSync(json).byteLength }
    }
    console.info('Home plan JSON bytes (legacy / prepared):', bytes(legacy), bytes(result))
    expect(JSON.parse(JSON.stringify(result)).plans).toEqual(legacy.plans)
  })
})
