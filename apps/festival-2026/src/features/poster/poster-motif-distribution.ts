import { motifMetadata, motifSequence, type MotifAccent, type PosterMotif } from './poster'
import type { PosterLayout } from './poster-grid'

/** One build-time selection per DOM index, constrained by all responsive placements. */
export function selectPosterMotifs(layouts: readonly PosterLayout[]): PosterMotif[] {
  const count = Math.max(0, ...layouts.map(layout => layout.motifs.length))
  const edges = Array.from({ length: count }, () => new Set<number>())
  const diagonals = Array.from({ length: count }, () => new Set<number>())
  for (const layout of layouts) {
    const previous = new Map<string, number>()
    layout.motifs.forEach((cell, index) => {
      // Index occupied logical cells so mixed-size rectangles use their actual borders.
      const left = cell.column; const right = left + cell.width
      const top = cell.row; const bottom = top + cell.height
      const localEdges = new Set<number>()
      const edge = (column: number, row: number) => {
        const neighbor = previous.get(`${column},${row}`)
        if (neighbor !== undefined) { edges[index].add(neighbor); localEdges.add(neighbor) }
      }
      for (let row = top; row < bottom; row++) { edge(left - 1, row); edge(right, row) }
      for (let column = left; column < right; column++) { edge(column, top - 1); edge(column, bottom) }
      for (const [column, row] of [[left - 1, top - 1], [right, top - 1], [left - 1, bottom], [right, bottom]]) {
        const neighbor = previous.get(`${column},${row}`)
        if (neighbor !== undefined && !localEdges.has(neighbor)) diagonals[index].add(neighbor)
      }
      for (let row = top; row < bottom; row++) for (let column = left; column < right; column++) previous.set(`${column},${row}`, index)
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
    // Selection remains deterministic across all responsive border constraints.
    if (!best) throw new Error('No motif family satisfies the responsive edge constraints')
    selected.push(best)
    accents[motifMetadata[best].accent]++
    uses.set(best, uses.get(best)! + 1)
  }
  return selected
}
