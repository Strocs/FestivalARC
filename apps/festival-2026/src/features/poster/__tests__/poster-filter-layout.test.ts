import { describe, expect, it } from 'vitest'
import { categories, heroParticipants, type ParticipantView } from '../../artists/categories'
import { calculatePosterLayout, type SlotRect } from '../poster-grid'
import { createPosterFilterPlans, getPosterFilterPlan, type FilterParticipant } from '../poster-filter-layout'
import { homeInformation, categoryInformation } from '../poster-layout'

const ranges = ['desktop', 'tablet', 'mobile'] as const
const narrow = (participants: readonly ParticipantView[]): FilterParticipant[] => participants.map(({ id, date }) => ({ id, day: date?.day ?? '' }))
const overlaps = (a: SlotRect, b: SlotRect) => a.column < b.column + b.width && a.column + a.width > b.column && a.row < b.row + b.height && a.row + a.height > b.row
const home = (participants = narrow(heroParticipants)) => createPosterFilterPlans({ scope: 'home', participants, information: homeInformation })

describe('finite scoped poster filter plans', () => {
  it('does not reserve a program information block for any day or range', () => {
    const result = home()
    for (const key of ['all', 'saturday', 'sunday'] as const) {
      for (const range of ranges) {
        expect(result.plans[key].information[range]).not.toHaveProperty('program')
      }
    }
  })
  it('coalesces only the home mobile opening into four columns by two rows without moving content', () => {
    const result = home()
    for (const plan of Object.values(result.plans)) for (const range of ranges) {
      const layout = plan.layouts[range]
      const original = calculatePosterLayout(plan.ids, layout.columns, Object.values(plan.information[range]), [], range === 'mobile' ? 8 : 0)
      expect(layout.artists).toEqual(original.artists)
      expect(layout.rows).toBe(original.rows)
      if (range !== 'mobile') expect(layout).toEqual(original)
      else {
        expect(layout.motifs.filter(m => m.row >= 4 && m.row < 8)).toEqual(
          [4, 6].flatMap(row => [0, 2, 4, 6].map(column => ({ column, row, width: 2, height: 2 }))),
        )
        expect(layout.motifs.filter(m => m.row < 4 || m.row >= 8)).toEqual(original.motifs.filter(m => m.row < 4 || m.row >= 8))
        const cells = (motifs: SlotRect[]) => motifs.flatMap(m => Array.from({ length: m.height }, (_, y) => Array.from({ length: m.width }, (_, x) => `${m.column + x}:${m.row + y}`)).flat()).sort()
        expect(cells(layout.motifs)).toEqual(cells(original.motifs))
      }
    }
  })

  it('maps only exact day strings, derives availability from full scope, and retains unknown days in Todos', () => {
    const participants = [{ id: 'a', day: 'Sábado 28' }, { id: 'b', day: 'Domingo 29' }, { id: 'unknown', day: '2026-11-28' }]
    const result = home(participants)
    expect(result.available).toBe(true)
    expect(result.plans.all.ids).toEqual(['a', 'b', 'unknown'])
    expect(result.plans.saturday.ids).toEqual(['a'])
    expect(result.plans.sunday.ids).toEqual(['b'])
    for (const fixture of [[], participants.slice(0, 1), participants.slice(2)]) expect(home(fixture).available).toBe(false)
    expect(home().plans.all.ids).toHaveLength(46)
    expect(home().plans.saturday.ids).toHaveLength(24)
    expect(home().plans.sunday.ids).toHaveLength(22)
  })

  it('intersects each authoritative category without changing its order or borrowing home information', () => {
    const expected = [[30, 16, 14], [16, 8, 8], [8, 0, 0], [39, 20, 19]]
    categories.forEach((category, index) => {
      const participants = narrow(category.participants)
      const information = category.key === 'expo' ? [] : categoryInformation
      const result = createPosterFilterPlans({ scope: 'category', participants, information })
      expect(['all', 'saturday', 'sunday'].map(key => result.plans[key as 'all'].ids.length)).toEqual(expected[index])
      for (const key of ['all', 'saturday', 'sunday'] as const) {
        expect(result.plans[key].ids).toEqual(participants.filter(p => key === 'all' || p.day === (key === 'saturday' ? 'Sábado 28' : 'Domingo 29')).map(p => p.id))
        for (const range of ranges) {
          const expectedInformation = category.key === 'expo' ? {} : { 'category-title': categoryInformation[0].positions[range] }
          expect(result.plans[key].information[range]).toEqual(expectedInformation)
        }
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
        const envelopeHeight = range === 'mobile' ? 3 : 2
        expect(layout.artists.map(a => a.id)).toEqual(plan.ids)
        expect(information).toHaveLength(range === 'mobile' ? 6 : 7)
        for (const [index, block] of information.entries()) {
          expect(information.slice(index + 1).some(other => overlaps(block, other))).toBe(false)
          expect(layout.artists.some(artist => overlaps(block, { ...artist, height: envelopeHeight }))).toBe(false)
        }
        expect(layout.rows).toBe(Math.max(...information.map(b => b.row + b.height), ...layout.artists.map(a => a.row + a.height)))
        // At most the actual box heights, full envelopes and one cadence row
        // per box, plus the established mobile opening; never baseline-rank gaps.
        const compactBound = information.reduce((sum, block) => sum + block.height + envelopeHeight - 1, 0) + plan.ids.length * envelopeHeight + (range === 'mobile' ? 8 : 0)
        expect(layout.rows).toBeLessThanOrEqual(compactBound)
        if (range === 'mobile') {
          let gap = 0
          for (let row = 0; row < layout.rows; row++) {
            const occupied = [...information, ...layout.artists.map(a => ({ ...a, height: envelopeHeight }))].some(b => b.row <= row && row < b.row + b.height)
            gap = occupied ? 0 : gap + 1
            expect(gap).toBeLessThanOrEqual(4) // Preserved hero opening at half-size mobile modules.
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

  it('ends every home and category day at actual content, not the final protected reserve', () => {
    const scopes = [home(), ...categories.map(category => createPosterFilterPlans({ scope: 'category', participants: narrow(category.participants), information: categoryInformation }))]
    for (const scope of scopes) for (const plan of Object.values(scope.plans)) for (const range of ranges) {
      const layout = plan.layouts[range]
      expect(layout.rows).toBe(Math.max(0, ...Object.values(plan.information[range]).map(b => b.row + b.height), ...layout.artists.map(a => a.row + a.height)))
      expect(layout.motifs.every(m => m.row + m.height <= layout.rows)).toBe(true)
    }
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
      { ...input, information: [{ id: 'bad', positions: { mobile: { column: 8, row: 0, width: 4, height: 1 } } }] },
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
