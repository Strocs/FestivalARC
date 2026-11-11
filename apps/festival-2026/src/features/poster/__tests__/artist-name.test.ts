import { describe, expect, it } from 'vitest'
import { getArtistCompositions, getArtistFitRanges, measureArtistName } from '../artist-name'
import { lineup } from '../lineup'

describe('artist typography metrics', () => {
  it('keeps GEPE on one line and compares word-boundary wraps for composed names', () => {
    expect(getArtistCompositions('GEPE')).toEqual([{ lines: ['GEPE'], width: measureArtistName('GEPE'), breaks: [] }])
    const options = getArtistCompositions('FERNANDO MILAGROS')
    expect(options.map(option => option.lines)).toEqual([
      ['FERNANDO MILAGROS'], ['FERNANDO', 'MILAGROS'],
    ])
  })

  it('selects the maximum fitting font across both dimensions for every aspect range', () => {
    const name = 'LAS LUCIÉRNAGAS Y EL ORIGEN DEL FUEGO'
    const options = getArtistCompositions(name)
    const ranges = getArtistFitRanges(options)
    for (const ratio of [0.3, 0.7, 1, 1.5, 2, 3, 5, 10, 20]) {
      const range = ranges.findLast(range => ratio >= range.minRatio)!
      const selected = options[range.index]
      const fit = Math.min(ratio / selected.width, 1 / selected.lines.length)
      const maximum = Math.max(...options.map(option => Math.min(ratio / option.width, 1 / option.lines.length)))
      expect(fit).toBeCloseTo(maximum, 10)
    }
    expect(new Set(ranges.map(range => range.index)).size).toBeGreaterThan(1)
  })
  it('measures actual uppercase Poppins 900 advances instead of character counts', () => {
    expect(measureArtistName('GEPE')).toBeCloseTo(2.513, 3)
    expect(measureArtistName('IIII')).toBeLessThan(measureArtistName('MMMM'))
  })

  it('supports every published artist without fallback widths', () => {
    for (const artist of lineup) expect(measureArtistName(artist.name)).toBeGreaterThan(0)
    expect(() => measureArtistName('未知')).toThrow('Missing Poppins 900 metrics')
  })

  it('preserves spaces and accented names and applies the rendered uppercase form', () => {
    expect(measureArtistName('gepe')).toBe(measureArtistName('GEPE'))
    expect(measureArtistName('NIÑO COHETE')).toBeGreaterThan(measureArtistName('NIÑOCOHETE'))
    expect(measureArtistName('JAVIER BARRÍA')).toBeGreaterThan(0)
  })
})
