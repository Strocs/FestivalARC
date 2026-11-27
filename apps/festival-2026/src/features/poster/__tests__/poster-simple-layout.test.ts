import { describe, expect, it } from 'vitest'
import { createPosterFilterPlans, createPosterSimplePlans } from '../poster-filter-layout'
import { homeInformation } from '../poster-layout'
import { createPosterSimpleLayout } from '../poster-simple-layout'

const plans = createPosterFilterPlans({ scope: 'home', information: homeInformation,
  participants: Array.from({ length: 36 }, (_, i) => ({ id: String(i), day: i % 2 ? 'Sábado 28' : 'Domingo 29' })),
})
const simple = createPosterSimplePlans(plans, homeInformation)

describe('compact simple endpoints', () => {
  it.each(['all', 'saturday', 'sunday'] as const)('packs %s into the first fitting cells while preserving fixed geometry and movable boundaries', day => {
    const plan = plans.plans[day]
    const ranked = [...plan.ids].reverse()
    for (const range of ['desktop', 'tablet', 'mobile'] as const) {
      const { artists, information, rows, columns } = createPosterSimpleLayout(plan, range, ranked, simple[day][range])
      expect(columns).toBe(plan.layouts[range].columns)
      const start = (cell: { row: number; column: number }) => cell.row * columns + cell.column
      let previous = -1
      for (const block of homeInformation) {
        const canonical = block.positions[range]
        if (!canonical) continue
        const cell = information.get(block.id)!
        expect(cell).toMatchObject({ width: canonical.width, height: canonical.height })
        if (block.fixed) expect(cell).toEqual(canonical)
        else {
          const kept = plans.plans.all.layouts[range].artists.filter(artist => start(artist) < start(canonical) && plan.ids.includes(artist.id))
          for (const id of ranked.slice(0, kept.length)) expect(start(artists.get(id)!)).toBeLessThan(start(cell))
          expect(start(cell)).toBeGreaterThan(previous)
          previous = start(cell)
        }
      }
      expect(information.get('socials')!.row).toBeLessThan(plan.information[range].socials.row)
      expect([...artists.keys()]).toEqual(ranked)
      const slots = [...information.values()]
      const { width, height } = plan.layouts[range].artists[0]
      const fits = (column: number, row: number) => column + width <= columns && slots.every(slot =>
        column >= slot.column + slot.width || column + width <= slot.column || row >= slot.row + slot.height || row + height <= slot.row)
      for (const cell of artists.values()) {
        expect(cell).toMatchObject({ width, height })
        const index = cell.row * columns + cell.column
        expect(fits(cell.column, cell.row)).toBe(true)
        expect(Array.from({ length: index }, (_, i) => fits(i % columns, Math.floor(i / columns))).some(Boolean)).toBe(false)
        slots.push(cell)
      }
      expect(rows).toBe(Math.max(...slots.map(slot => slot.row + slot.height)))
    }
  })
})
