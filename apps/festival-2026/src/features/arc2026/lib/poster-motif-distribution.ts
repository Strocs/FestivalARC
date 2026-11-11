import { motifMetadata, motifSequence, type MotifAccent, type PosterMotif } from '../data/poster'
import type { PosterLayout } from './poster-grid'

/** One build-time selection per DOM index, constrained by all responsive placements. */
export function selectPosterMotifs(layouts: readonly PosterLayout[]): PosterMotif[] {
  const count = Math.max(0, ...layouts.map(layout => layout.motifs.length))
  const edges = Array.from({ length: count }, () => new Set<number>())
  const diagonals = Array.from({ length: count }, () => new Set<number>())
  for (const layout of layouts) {
    const previous = new Map<string, number>()
    layout.motifs.forEach((cell, index) => {
      // Generated cells are row-major: only left/up edges can already be selected.
      for (const [dx, dy] of [[-1, 0], [0, -1], [-1, -1], [1, -1]]) {
        const neighbor = previous.get(`${cell.column + dx},${cell.row + dy}`)
        if (neighbor !== undefined) (dx === 0 || dy === 0 ? edges : diagonals)[index].add(neighbor)
      }
      previous.set(`${cell.column},${cell.row}`, index)
    })
  }

  const weights: Record<MotifAccent, number> = { magenta: 0, cyan: 0, yellow: 0 }
  const accents: Record<MotifAccent, number> = { magenta: 0, cyan: 0, yellow: 0 }
  const uses = new Map<PosterMotif, number>(motifSequence.map(motif => [motif, 0]))
  for (const motif of motifSequence) weights[motifMetadata[motif].accent]++
  const selected: PosterMotif[] = []
  for (let index = 0; index < count; index++) {
    let best: PosterMotif | undefined
    let bestScore = -Infinity
    for (const motif of motifSequence) {
      const { family, accent } = motifMetadata[motif]
      if ([...edges[index]].some(neighbor => motifMetadata[selected[neighbor]].family === family)) continue
      const deficit = (index + 1) * weights[accent] / motifSequence.length - accents[accent]
      const variantDeficit = (index + 1) / motifSequence.length - uses.get(motif)!
      const diagonalRepeats = [...diagonals[index]]
        .filter(neighbor => motifMetadata[selected[neighbor]].family === family).length
      const localRepeats = [...edges[index]]
        .filter(neighbor => motifMetadata[selected[neighbor]].accent === accent).length
      const recentRepeats = selected.slice(-2).filter(value => motifMetadata[value].accent === accent).length
      const score = deficit * 4 + variantDeficit - diagonalRepeats * 1.5 - localRepeats * 0.5 - recentRepeats
      // Stable catalog order breaks ties; no random seed or browser state is needed.
      if (score > bestScore) {
        best = motif
        bestScore = score
      }
    }
    // Seven families exceed the six prior edges of three generated layouts.
    if (!best) throw new Error('No motif family satisfies the responsive edge constraints')
    selected.push(best)
    accents[motifMetadata[best].accent]++
    uses.set(best, uses.get(best)! + 1)
  }
  return selected
}
