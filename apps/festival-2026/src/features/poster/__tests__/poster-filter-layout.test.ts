import { describe, expect, it } from 'vitest'
import { categories, heroParticipants, type ParticipantView } from '../../artists/categories'
import { calculatePosterLayout, type SlotRect } from '../poster-grid'
import { createPosterFilterPlans, createPosterSimplePlans, getPosterFilterPlan, type FilterParticipant } from '../poster-filter-layout'
import { createCategoryTitle } from '../category-title'
import { homeInformation, categoryInformation } from '../poster-layout'

const ranges = ['desktop', 'tablet', 'mobile'] as const
const narrow = (participants: readonly ParticipantView[]): FilterParticipant[] => participants.map(({ id, date }) => ({ id, day: date?.day ?? '' }))
const overlaps = (a: SlotRect, b: SlotRect) => a.column < b.column + b.width && a.column + a.width > b.column && a.row < b.row + b.height && a.row + a.height > b.row
const home = (participants = narrow(heroParticipants)) => createPosterFilterPlans({ scope: 'home', participants, information: homeInformation })

describe('finite scoped poster filter plans', () => {
  it('leaves the complete category title layout and its artwork alone', () => {
    const input = { scope: 'category' as const, participants: narrow(categories[1].participants), information: createCategoryTitle(categories[1].name).information }
    const original = createPosterFilterPlans(input)
    const projected = createPosterFilterPlans(input, { mobileStrips: true })
    expect(projected.plans).toEqual(original.plans)
    expect(projected.transitions).toEqual(original.transitions)
    expect(projected.simple).toEqual(createPosterSimplePlans(original, input.information))
  })

  it('projects one shared mobile strip around home interior information without changing the opening, wide or simple endpoints', () => {
    const input = { scope: 'home' as const, participants: narrow(heroParticipants), information: homeInformation }
    const original = createPosterFilterPlans(input)
    const projected = createPosterFilterPlans(input, { mobileStrips: true })
    for (const day of ['all', 'saturday', 'sunday'] as const) {
      const from = original.plans[day]
      const to = projected.plans[day]
      const content = (plan: typeof from) => [
        ...plan.layouts.mobile.artists.map(rect => ({ id: rect.id, rect, info: false })),
        ...Object.entries(plan.information.mobile).map(([id, rect]) => ({ id, rect, info: true })),
      ].sort((a, b) => a.rect.row - b.rect.row || a.rect.column - b.rect.column)
      const cells = content(to)
      expect(cells.map(({ id, rect: { column, width, height } }) => [id, column, width, height]))
        .toEqual(content(from).map(({ id, rect: { column, width, height } }) => [id, column, width, height]))
      const opening = (plan: typeof from) => plan.motifs.flatMap(({ variant, positions }) => {
        const cell = positions.mobile
        return cell && cell.row < 8 ? [{ variant, ...cell }] : []
      }).sort((a, b) => a.row - b.row || a.column - b.column)
      expect(opening(to)).toEqual(opening(from))
      expect(opening(to)).toHaveLength(8)
      const strip = (row: number) => expect(to.layouts.mobile.motifs.filter(m => m.row === row))
        .toEqual(Array.from({ length: 8 }, (_, column) => ({ column, row, width: 1, height: 1 })))
      let end = 0
      for (const [i, { rect, id, info }] of cells.entries()) {
        const previous = cells[i - 1]
        const original = content(from)
        const prior = original[i - 1]?.rect
        const oldGap = original[i].rect.row - (prior ? prior.row + prior.height : 0)
        const gap = previous?.id === 'intro' || !(info || previous?.info) || id === 'intro' ? oldGap : 1
        expect(rect.row - end, `${day}: before ${id}`).toBe(gap)
        if (gap === 1) strip(end)
        for (let row = rect.row; row < rect.row + rect.height; row++) {
          expect(to.layouts.mobile.motifs.filter(m => m.row === row)).toEqual(
            Array.from({ length: 8 }, (_, column) => column)
              .filter(column => column < rect.column || column >= rect.column + rect.width)
              .map(column => ({ column, row, width: 1, height: 1 })),
          )
        }
        end = rect.row + rect.height
      }
      const tail = cells.at(-1)?.info ? 1 : 0
      expect(to.layouts.mobile.rows).toBe(end + tail)
      if (tail) strip(end)
      for (const range of ['tablet', 'desktop'] as const) {
        expect(to.layouts[range]).toEqual(from.layouts[range])
        expect(to.information[range]).toEqual(from.information[range])
        const artwork = (plan: typeof from) => plan.motifs.flatMap(({ index, variant, positions }) => positions[range] ? [{ index, variant, cell: positions[range] }] : [])
        expect(artwork(to)).toEqual(artwork(from))
      }
    }
    expect(projected.simple).toEqual(createPosterSimplePlans(original, input.information))
  })

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
    const actual = home()
    const lineup = narrow(heroParticipants)
    expect(actual.plans.all.ids).toEqual(lineup.map(({ id }) => id))
    expect(actual.plans.saturday.ids).toEqual(lineup.filter(({ day }) => day === 'Sábado 28').map(({ id }) => id))
    expect(actual.plans.sunday.ids).toEqual(lineup.filter(({ day }) => day === 'Domingo 29').map(({ id }) => id))
  })

  it('intersects each authoritative category without changing its order or borrowing home information', () => {
    categories.forEach(category => {
      const participants = narrow(category.participants)
      const hasCategoryTitle = category.key === 'music' || category.key === 'stage'
      const information = hasCategoryTitle ? categoryInformation : []
      const result = createPosterFilterPlans({ scope: 'category', participants, information })
      for (const key of ['all', 'saturday', 'sunday'] as const) {
        expect(result.plans[key].ids).toEqual(participants.filter(p => key === 'all' || p.day === (key === 'saturday' ? 'Sábado 28' : 'Domingo 29')).map(p => p.id))
        for (const range of ranges) {
          const expectedInformation = hasCategoryTitle ? { 'category-title': categoryInformation[0].positions[range] } : {}
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
        expect(information).toHaveLength(range === 'mobile' ? 4 : 5)
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
