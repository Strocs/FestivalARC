export interface MotifCell { variant: string; column?: number; row?: number }
export interface MotifMatch { from: number; to: number }

/** Endpoint indices are not identities. Exact matches have first refusal. */
export function matchPosterMotifs(previous: readonly MotifCell[], next: readonly MotifCell[], maxTravel = 4): MotifMatch[] {
  const matches: MotifMatch[] = []
  const used = new Set<number>()
  const taken = new Set<number>()
  const distance = (a: MotifCell, b: MotifCell) => a.variant === b.variant
    && a.column !== undefined && a.row !== undefined && b.column !== undefined && b.row !== undefined
    ? Math.hypot(a.column - b.column, a.row - b.row) : Infinity
  const reserve = (from: number, to: number) => { matches.push({ from, to }); used.add(from); taken.add(to) }
  previous.forEach((cell, from) => {
    const to = next.findIndex((target, index) => !taken.has(index) && distance(cell, target) === 0)
    if (to !== -1) reserve(from, to)
  })
  previous.map((cell, index) => ({ cell, index }))
    .sort((a, b) => (a.cell.row ?? Infinity) - (b.cell.row ?? Infinity) || (a.cell.column ?? Infinity) - (b.cell.column ?? Infinity) || a.index - b.index)
    .forEach(({ cell, index: from }) => {
      if (used.has(from)) return
      let best = -1; let length = maxTravel
      next.forEach((target, to) => {
        const travel = distance(cell, target)
        if (!taken.has(to) && travel <= length && (best === -1 || travel < length)) { best = to; length = travel }
      })
      if (best !== -1) reserve(from, best)
    })
  return matches
}
