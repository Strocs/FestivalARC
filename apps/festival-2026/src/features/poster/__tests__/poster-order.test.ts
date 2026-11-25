import { describe, expect, it } from 'vitest'
import { createPosterOrder } from '../poster-order'

const participants = [
  { day: 'Domingo 29', time: '15:00', location: 'Teatro' },
  { day: 'Sábado 28', time: '20:00', location: 'Odeón' },
  { day: 'Sábado 28', time: '17:00', location: 'Teatro' },
  { day: 'Sábado 28', time: '17:00', location: 'Odeón' },
  { day: 'Sábado 28', time: '16:00' },
  { location: 'Odeón' },
]

describe('precalculated poster order', () => {
  it('orders by festival day and start time, preserving ties and placing unknown times last', () => {
    expect(createPosterOrder(participants).time).toEqual([4, 2, 3, 1, 0, 5])
  })

  it('orders single-digit hours accepted by the schedule catalog', () => {
    const day = 'Sábado 28'
    expect(createPosterOrder([{ day, time: '10:00' }, { day, time: '9:00' }]))
      .toEqual({ time: [1, 0], location: [1, 0] })
  })

  it('groups by venue and orders chronologically within each venue without adding cards', () => {
    expect(createPosterOrder(participants).location).toEqual([3, 1, 5, 2, 0, 4])
  })
})
