import { describe, expect, it } from 'vitest'
import { calculatePosterLayout } from '../poster-grid'
import { createCategoryTitle } from '../category-title'

describe('poster polish', () => {
  it('leaves eight decorative cells between mobile artists and preserves wider cadences', () => {
    const layout = calculatePosterLayout(['a', 'b', 'c'], 8, [], [], 8)
    expect(layout.artists.map(artist => artist.row)).toEqual([8, 11, 14])
    expect(layout.artists.every(artist => artist.width === 8 && artist.height === 2)).toBe(true)
    const gap = layout.motifs.filter(tile => tile.row >= 10 && tile.row < 11)
    expect(gap).toEqual(Array.from({ length: 8 }, (_, column) => ({ column, row: 10, width: 1, height: 1 })))
    expect(calculatePosterLayout(['a', 'b', 'c'], 6).artists.map(artist => [artist.column, artist.row]))
      .toEqual([[0, 0], [4, 0], [2, 1]])
  })

  it('reserves only measured title lines, leaving stepped gaps available for motifs in every range', () => {
    const title = createCategoryTitle('Artes escénicas')
    expect(title.lines.map(line => line.text)).toEqual(['Artes', 'escénicas'])
    for (const range of ['mobile', 'tablet', 'desktop'] as const) {
      const boxes = title.information.map(block => block.positions[range]!)
      expect(boxes).toHaveLength(2)
      expect(boxes[0].height).toBe(range === 'mobile' ? 2 : 1)
      expect(boxes[0].width).toBeLessThan(boxes[1].width)
      const columns = range === 'desktop' ? 10 : range === 'tablet' ? 6 : 8
      const layout = calculatePosterLayout([], columns, boxes)
      expect(layout.rows).toBe(range === 'mobile' ? 4 : 2)
      expect(layout.motifs).toContainEqual({ column: boxes[0].width, row: 0, width: 1, height: 1 })
    }
    expect(createCategoryTitle('Música').information).toHaveLength(1)
  })
})
