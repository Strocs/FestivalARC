import { describe, expect, it } from 'vitest'
import { lineup } from '../lineup'
import { motifSequence, posterPresets, type PosterMotif } from '../poster'
import { calculatePosterLayout } from '../poster-grid'
import { selectPosterMotifs } from '../poster-motif-distribution'

// Independent artwork groupings: directions and color variants are not new shapes.
const family = (motif: PosterMotif) => motif.split('-')[0]
const accent = (motif: PosterMotif) => {
  if (['lightning', 'rosette-cyan', 'orbits-cyan'].includes(motif)) return 'cyan'
  if (['rosette-yellow', 'sparks'].includes(motif)) return 'yellow'
  return 'magenta'
}
const layouts = (['desktop', 'tablet', 'mobile'] as const).map(range => {
  const preset = posterPresets[range]
  return calculatePosterLayout(lineup.map(artist => artist.id), preset.columns, preset.blocks, [], preset.artistStartRow)
})

function longestGap(motifs: PosterMotif[], color: string) {
  let gap = 0
  let longest = 0
  for (const motif of motifs) {
    gap = accent(motif) === color ? 0 : gap + 1
    longest = Math.max(longest, gap)
  }
  return longest
}

describe('shared build-time motif distribution', () => {
  it('never puts the same shape family on a shared edge in any responsive layout', () => {
    const motifs = selectPosterMotifs(layouts)
    for (const layout of layouts) {
      layout.motifs.forEach((cell, index) => {
        layout.motifs.slice(0, index).forEach((other, previous) => {
          if (Math.abs(cell.column - other.column) + Math.abs(cell.row - other.row) === 1) {
            expect(family(motifs[index]), `edge ${previous}/${index} at ${layout.columns} columns`)
              .not.toBe(family(motifs[previous]))
          }
        })
      })
    }
  })

  it('mixes cyan and yellow throughout each visible prefix while retaining the 6:3:2 catalog weights', () => {
    const motifs = selectPosterMotifs(layouts)
    for (const layout of layouts) {
      const visible = motifs.slice(0, layout.motifs.length)
      const counts = { magenta: 0, cyan: 0, yellow: 0 }
      visible.forEach((motif, index) => {
        counts[accent(motif)]++
        for (const [color, weight] of [['magenta', 6], ['cyan', 3], ['yellow', 2]] as const) {
          expect(Math.abs(counts[color] - (index + 1) * weight / 11)).toBeLessThanOrEqual(3)
        }
      })
      expect(counts.magenta).toBeGreaterThan(counts.cyan)
      expect(counts.magenta).toBeGreaterThan(counts.yellow)
      expect(longestGap(visible, 'yellow')).toBeLessThanOrEqual(10)
      expect(longestGap(visible, 'cyan')).toBeLessThanOrEqual(8)
      for (const motif of motifSequence) {
        expect(visible.filter(value => value === motif).length)
          .toBeGreaterThanOrEqual(Math.max(1, Math.floor(visible.length / 11) - 3))
      }
      console.info(`${layout.columns} columns: ${JSON.stringify(counts)}; longest gaps yellow=${longestGap(visible, 'yellow')}, cyan=${longestGap(visible, 'cyan')}`)
    }
  })

  it('returns one deterministic selection per shared index without changing frozen layout inputs', () => {
    const frozen = structuredClone(layouts)
    for (const layout of frozen) {
      for (const cell of [...layout.motifs, ...layout.artists]) Object.freeze(cell)
      Object.freeze(layout.motifs)
      Object.freeze(layout.artists)
      Object.freeze(layout)
    }
    Object.freeze(frozen)
    const result = selectPosterMotifs(frozen)
    expect(result).toHaveLength(Math.max(...layouts.map(layout => layout.motifs.length)))
    expect(result.every(motif => motifSequence.includes(motif))).toBe(true)
    expect(selectPosterMotifs(frozen)).toEqual(result)
    expect(frozen).toEqual(layouts)
    expect(selectPosterMotifs([])).toEqual([])
    expect(selectPosterMotifs([calculatePosterLayout([], 3)])).toEqual([])
  })
})
