import { describe, expect, it } from 'vitest'
import { matchPosterMotifs } from '../poster-motif-match'

const cell = (variant: string, column: number, row: number) => ({ variant, column, row })
describe('bounded persistent motif matching', () => {
  it('reserves exact artwork/cells before nearest matches and never reuses a destination', () => {
    expect(matchPosterMotifs([cell('rings', 0, 0), cell('rings', 1, 0)], [cell('rings', 1, 0), cell('rings', 2, 0)]))
      .toEqual([{ from: 1, to: 0 }, { from: 0, to: 1 }])
  })
  it('reserves same-size exact cells rather than differently sized artwork at the same origin', () => {
    const small = { ...cell('rings', 0, 4), width: 1, height: 1 }
    const large = { ...cell('rings', 0, 4), width: 2, height: 2 }
    expect(matchPosterMotifs([small, large], [large, small])).toEqual([{ from: 0, to: 1 }, { from: 1, to: 0 }])
    expect(matchPosterMotifs([small], [large])).toEqual([])
    expect(matchPosterMotifs([cell('rings', 0, 4)], [small])).toEqual([{ from: 0, to: 0 }])
  })
  it('breaks ties by stable destination order and rejects variants, absent cells and long travel', () => {
    expect(matchPosterMotifs([cell('rings', 1, 1), cell('star', 0, 0), cell('rings', 40, 40)], [cell('rings', 0, 1), cell('rings', 2, 1), cell('sparks', 0, 0)]))
      .toEqual([{ from: 0, to: 0 }])
  })
})
