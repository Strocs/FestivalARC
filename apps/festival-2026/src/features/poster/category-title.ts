import { measureArtistName } from './artist-name'
import type { PosterInformationBlock } from './poster-layout'
import type { PosterRange } from './poster'

export interface CategoryTitleLine {
  text: string
  fontUnits: Record<PosterRange, number>
}

export function createCategoryTitle(name: string): {
  lines: CategoryTitleLine[]
  information: PosterInformationBlock[]
} {
  const words = name.trim().split(/\s+/)
  const widest = Math.max(...words.map(measureArtistName))
  // Keep short adjacent words together without exceeding the longest-word lane.
  const lines: string[] = []
  for (const word of words) {
    const previous = lines.at(-1)
    if (previous && measureArtistName(`${previous} ${word}`) <= widest) {
      lines[lines.length - 1] = `${previous} ${word}`
    } else {
      lines.push(word)
    }
  }
  const ranges = ['mobile', 'tablet', 'desktop'] as const
  const fontUnits = Object.fromEntries(ranges.map(range => [
    range, Math.min((range === 'tablet' ? 3 : range === 'mobile' ? 8 : 4) * 160 * 0.94 / widest, 152 * 0.9 * (range === 'mobile' ? 2 : 1)),
  ])) as Record<PosterRange, number>
  return {
    lines: lines.map(text => ({ text, fontUnits })),
    information: lines.map((text, row) => ({
      id: row === 0 ? 'category-title' : `category-title-${row}`,
      fixed: true,
      positions: Object.fromEntries(ranges.map(range => [range, {
        column: 0, row: row * (range === 'mobile' ? 2 : 1), width: Math.max(1, Math.ceil(measureArtistName(text) * fontUnits[range] / 160)), height: range === 'mobile' ? 2 : 1,
      }])),
    })),
  }
}
