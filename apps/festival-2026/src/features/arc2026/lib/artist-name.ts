import metrics from '../data/poppins-black-metrics.json' with { type: 'json' }

export interface ArtistComposition {
  lines: string[]
  width: number
  breaks: number[]
}

export interface ArtistFitRange {
  minRatio: number
  index: number
}

// For each line count, dynamic programming minimizes the widest measured line.
// Narrower compositions dominate wider ones at the same line count.
export function getArtistCompositions(name: string): ArtistComposition[] {
  const words = name.trim().split(/\s+/)
  const cache = new Map<string, ArtistComposition>()
  const solve = (end: number, count: number): ArtistComposition => {
    const key = `${end}:${count}`
    const cached = cache.get(key)
    if (cached) return cached
    if (count === 1) {
      const line = words.slice(0, end).join(' ')
      return { lines: [line], width: measureArtistName(line), breaks: [] }
    }
    let best: ArtistComposition | undefined
    for (let split = count - 1; split < end; split++) {
      const previous = solve(split, count - 1)
      const line = words.slice(split, end).join(' ')
      const width = Math.max(previous.width, measureArtistName(line))
      if (!best || width < best.width) {
        best = { lines: [...previous.lines, line], width, breaks: [...previous.breaks, split] }
      }
    }
    cache.set(key, best!)
    return best!
  }
  return words.map((_, index) => solve(words.length, index + 1))
}

// Fit is min(aspect / measuredWidth, 1 / lineCount). Its upper envelope
// changes only where one composition's width limit meets another's height
// limit. Emit those aspect intervals for native CSS container queries.
export function getArtistFitRanges(options: ArtistComposition[]): ArtistFitRange[] {
  const boundaries = [...new Set([0, ...options.flatMap(option =>
    options.map(other => option.width / other.lines.length),
  )])].sort((a, b) => a - b)
  const ranges: ArtistFitRange[] = []
  for (const [position, minRatio] of boundaries.entries()) {
    const next = boundaries[position + 1]
    const ratio = next === undefined ? minRatio + 1 : (minRatio + next) / 2
    let index = 0
    let maximum = -Infinity
    for (const [candidate, option] of options.entries()) {
      const fit = Math.min(ratio / option.width, 1 / option.lines.length)
      // Options are ordered by line count: ties keep fewer lines.
      if (fit > maximum + Number.EPSILON) {
        maximum = fit
        index = candidate
      }
    }
    if (ranges.at(-1)?.index !== index) ranges.push({ minRatio, index })
  }
  return ranges
}

// Advances extracted from the same Latin Poppins 900 WOFF2 served by Astro.
// Keep these metrics in sync when changing the poster font. No font parser ships
// to the browser, and builds do not depend on Astro's generated cache paths.
export function measureArtistName(name: string): number {
  const advances: Record<string, number> = metrics.advances
  const pairs: Record<string, number> = metrics.pairs
  const characters = Array.from(name.normalize('NFC').toUpperCase())
  return characters.reduce((width, character, index) => {
    const advance = advances[character]
    if (advance === undefined) {
      throw new Error(`Missing Poppins 900 metrics for ${JSON.stringify(character)}`)
    }
    return width + advance + (pairs[(characters[index - 1] ?? '') + character] ?? 0)
  }, 0)
}
