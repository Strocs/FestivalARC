import { describe, expect, it } from 'vitest'
import { categories, heroParticipants } from '../../artists/categories'
import { calculatePosterLayout, type SlotRect } from '../poster-grid'
import { selectPosterMotifs } from '../poster-motif-distribution'
import { createPosterFilterPlans, getPosterFilterPlan, type FilterParticipant } from '../poster-filter-layout'
import { homeInformation, categoryInformation } from '../poster-layout'

const ranges = ['desktop', 'tablet', 'mobile'] as const
const narrow = (participants: typeof heroParticipants): FilterParticipant[] => participants.map(({ id, date }) => ({ id, day: date.day }))
const overlaps = (a: SlotRect, b: SlotRect) => a.column < b.column + b.width && a.column + a.width > b.column && a.row < b.row + b.height && a.row + a.height > b.row
const home = (participants = narrow(heroParticipants)) => createPosterFilterPlans({ scope: 'home', participants, information: homeInformation })

describe('finite scoped poster filter plans', () => {
  it('maps only exact day strings, derives availability from full scope, and retains unknown days in Todos', () => {
    const participants = [{ id: 'a', day: 'Sábado 28' }, { id: 'b', day: 'Domingo 29' }, { id: 'unknown', day: '2026-11-28' }]
    const result = home(participants)
    expect(result.available).toBe(true)
    expect(result.plans.all.ids).toEqual(['a', 'b', 'unknown'])
    expect(result.plans.saturday.ids).toEqual(['a'])
    expect(result.plans.sunday.ids).toEqual(['b'])
    for (const fixture of [[], participants.slice(0, 1), participants.slice(2)]) expect(home(fixture).available).toBe(false)
    expect(home().plans.all.ids).toHaveLength(46)
    expect(home().plans.saturday.ids).toHaveLength(23)
    expect(home().plans.sunday.ids).toHaveLength(23)
  })

  it('intersects each authoritative category without changing its order or borrowing home information', () => {
    const expected = [[30, 15, 15], [16, 8, 8], [8, 4, 4], [39, 20, 19]]
    categories.forEach((category, index) => {
      const participants = narrow(category.participants)
      const result = createPosterFilterPlans({ scope: 'category', participants, information: categoryInformation })
      expect(['all', 'saturday', 'sunday'].map(key => result.plans[key as 'all'].ids.length)).toEqual(expected[index])
      for (const key of ['all', 'saturday', 'sunday'] as const) {
        expect(result.plans[key].ids).toEqual(participants.filter(p => key === 'all' || p.day === (key === 'saturday' ? 'Sábado 28' : 'Domingo 29')).map(p => p.id))
        for (const range of ranges) expect(result.plans[key].information[range]).toEqual({ 'category-title': categoryInformation[0].positions[range] })
      }
    })
  })

  it('compacts home information for empty, one, boundary and actual day subsets without collisions or lost envelopes', () => {
    const boundary = narrow(heroParticipants).map((participant, index) => ({ ...participant, day: [0, 4, 10, 22, 23, 35, 45].includes(index) ? 'Sábado 28' : 'unknown' }))
    for (const participants of [[], narrow(heroParticipants).slice(0, 1), narrow(heroParticipants).slice(0, 9), boundary, narrow(heroParticipants)]) {
      const result = home(participants)
      for (const key of ['saturday', 'sunday'] as const) for (const range of ranges) {
        const plan = result.plans[key]
        const layout = plan.layouts[range]
        const information = Object.values(plan.information[range])
        expect(layout.artists.map(a => a.id)).toEqual(plan.ids)
        expect(information).toHaveLength(range === 'mobile' ? 7 : 8)
        for (const [index, block] of information.entries()) {
          expect(information.slice(index + 1).some(other => overlaps(block, other))).toBe(false)
          expect(layout.artists.some(artist => overlaps(block, { ...artist, height: 2 }))).toBe(false)
        }
        expect(layout.rows).toBe(Math.max(...information.map(b => b.row + b.height), ...layout.artists.map(a => a.row + 2)))
        // At most the actual box heights, full envelopes and one cadence row
        // per box, plus the established mobile opening; never baseline-rank gaps.
        const compactBound = information.reduce((sum, block) => sum + block.height + 1, 0) + plan.ids.length * 2 + (range === 'mobile' ? 4 : 0)
        expect(layout.rows).toBeLessThanOrEqual(compactBound)
        if (range === 'mobile') {
          let gap = 0
          for (let row = 0; row < layout.rows; row++) {
            const occupied = [...information, ...layout.artists.map(a => ({ ...a, height: 2 }))].some(b => b.row <= row && row < b.row + b.height)
            gap = occupied ? 0 : gap + 1
            expect(gap).toBeLessThanOrEqual(2) // Original opening only; packing cadence needs at most one.
          }
        }
        expect(plan.information[range].intro).toEqual(homeInformation[0].positions[range])
        if (range !== 'mobile') expect(plan.information[range]['title-extension']).toEqual(homeInformation[1].positions[range])
        const canonical = homeInformation.filter(b => !b.fixed && b.positions[range]).slice().sort((a, b) => a.positions[range]!.row - b.positions[range]!.row || a.positions[range]!.column - b.positions[range]!.column)
        const ordered = canonical.map(b => plan.information[range][b.id])
        for (const [index, block] of ordered.entries()) {
          const original = canonical[index].positions[range]!
          expect([block.width, block.height]).toEqual([original.width, original.height])
          if (index) expect(block.row * layout.columns + block.column).toBeGreaterThanOrEqual(ordered[index - 1].row * layout.columns + ordered[index - 1].column)
        }
        if (participants.length === 46) expect(layout.rows).toBeLessThan(result.plans.all.layouts[range].rows)
      }
    }
  })

  it('restores exact original Todos packing and selects one shared deterministic three-range motif sequence', () => {
    const before = structuredClone(homeInformation)
    const result = home()
    for (const range of ranges) {
      const blocks = homeInformation.flatMap(block => block.positions[range] ? [block.positions[range]!] : [])
      expect(result.plans.all.layouts[range]).toEqual(calculatePosterLayout(heroParticipants.map(p => p.id), range === 'desktop' ? 10 : range === 'tablet' ? 6 : 4, blocks, [], range === 'mobile' ? 4 : 0))
    }
    for (const plan of Object.values(result.plans)) {
      const variants = selectPosterMotifs(ranges.map(range => plan.layouts[range]))
      expect(plan.motifs.map(m => m.variant)).toEqual(variants)
      plan.motifs.forEach((motif, index) => {
        expect(motif.index).toBe(index)
        for (const range of ranges) expect(motif.positions[range]).toEqual(plan.layouts[range].motifs[index])
      })
    }
    expect(home()).toEqual(result)
    expect(homeInformation).toEqual(before)
  })

  it('rejects invalid IDs, keys and information atomically without input mutation', () => {
    const participants = narrow(heroParticipants)
    const input = { scope: 'home' as const, participants, information: structuredClone(homeInformation) }
    const before = structuredClone(input)
    const valid = createPosterFilterPlans(input)
    for (const invalid of [
      { ...input, participants: [{ id: '', day: 'Sábado 28' }] },
      { ...input, participants: [participants[0], participants[0]] },
      { ...input, participants: [{ id: 'bad', day: 28 }] },
      { ...input, participants: Array.from({ length: 513 }, (_, index) => ({ id: `a${index}`, day: 'unknown' })) },
      { ...input, scope: 'invalid' },
      { ...input, information: [...input.information, input.information[0]] },
      { ...input, information: [{ id: 'bad', positions: { mobile: { column: 4, row: 0, width: 4, height: 1 } } }] },
      { ...input, information: [{ id: 'bad', positions: { mobile: { column: 0, row: 4096, width: 4, height: 1 } } }] },
      { ...input, information: [{ id: 'bad', positions: { watch: { column: 0, row: 0, width: 4, height: 1 } } }] },
      { ...input, information: [{ ...input.information[0], id: 'second' }, input.information[0]] },
      { ...input, information: [{ id: 'fraction', positions: { mobile: { column: 0, row: 1.5, width: 4, height: 1 } } }] },
    ]) expect(() => createPosterFilterPlans(invalid as unknown as typeof input)).toThrow()
    expect(() => getPosterFilterPlan(valid, 'monday' as 'all')).toThrow()
    expect(input).toEqual(before)
    expect(createPosterFilterPlans(input)).toEqual(valid)
  })
})
