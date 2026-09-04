import { describe, expect, it } from 'vitest'
import { disciplines } from './disciplines'

describe('call disciplines', () => {
  it('preserves the published discipline sequence', () => {
    expect(disciplines.map(({ name }) => name)).toEqual([
      'MÚSICA',
      'TEATRO',
      'DANZA',
      'ARTES ESCÉNICAS',
      'LITERATURA',
      'ARTES VISUALES',
      'ARTESANÍA',
      'DISEÑO'
    ])
  })

  it('uses the clarified stage arts name without separator entries', () => {
    expect(disciplines.some(({ name }) => name === 'ARTES CIRCENSES')).toBe(false)
    expect(disciplines.filter(({ name }) => name === 'ARTES ESCÉNICAS')).toHaveLength(1)
    expect(disciplines.every(({ name }) => !name.includes('/'))).toBe(true)
  })
})
