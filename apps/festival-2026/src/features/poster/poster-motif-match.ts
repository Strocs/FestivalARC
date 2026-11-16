export interface MotifCell { variant: string; column?: number; row?: number; width?: number; height?: number }
export interface MotifMatch { from: number; to: number }

/** Travel requires a fully vacated source and a fully new destination footprint. */
export function posterMotifTravelEligibility(previous: readonly MotifCell[], next: readonly MotifCell[]) {
  const footprint = (cell: MotifCell): string[] => {
    if (cell.column === undefined || cell.row === undefined) return []
    const cells: string[] = []
    for (let row = cell.row; row < cell.row + (cell.height ?? 1); row++) {
      for (let column = cell.column; column < cell.column + (cell.width ?? 1); column++) cells.push(`${column}:${row}`)
    }
    return cells
  }
  const source = previous.map(footprint)
  const target = next.map(footprint)
  const sourceCells = new Set(source.flat())
  const targetCells = new Set(target.flat())
  return {
    outgoing: source.map(cells => cells.length > 0 && cells.every(cell => !targetCells.has(cell))),
    incoming: target.map(cells => cells.length > 0 && cells.every(cell => !sourceCells.has(cell))),
  }
}

/** Endpoint indices are not identities. Exact matches have first refusal.
 * A zero travel bound keeps only stationary matches (mobile policy).
 */
export function matchPosterMotifs(previous: readonly MotifCell[], next: readonly MotifCell[], maxTravel = 4): MotifMatch[] {
  const matches: MotifMatch[] = []
  const used = new Set<number>()
  const taken = new Set<number>()
  const distance = (a: MotifCell, b: MotifCell) => a.variant === b.variant
    && (a.width ?? 1) === (b.width ?? 1) && (a.height ?? 1) === (b.height ?? 1)
    && a.column !== undefined && a.row !== undefined && b.column !== undefined && b.row !== undefined
    ? Math.hypot(a.column - b.column, a.row - b.row) : Infinity
  const reserve = (from: number, to: number) => { matches.push({ from, to }); used.add(from); taken.add(to) }
  previous.forEach((cell, from) => {
    const to = next.findIndex((target, index) => !taken.has(index) && distance(cell, target) === 0)
    if (to !== -1) reserve(from, to)
  })
  const { outgoing, incoming } = posterMotifTravelEligibility(previous, next)
  previous.map((cell, index) => ({ cell, index }))
    .sort((a, b) => (a.cell.row ?? Infinity) - (b.cell.row ?? Infinity) || (a.cell.column ?? Infinity) - (b.cell.column ?? Infinity) || a.index - b.index)
    .forEach(({ cell, index: from }) => {
      if (used.has(from) || !outgoing[from]) return
      let best = -1; let length = maxTravel
      next.forEach((target, to) => {
        const travel = distance(cell, target)
        if (!taken.has(to) && incoming[to] && travel <= length && (best === -1 || travel < length)) { best = to; length = travel }
      })
      if (best !== -1) reserve(from, best)
    })
  return matches
}
