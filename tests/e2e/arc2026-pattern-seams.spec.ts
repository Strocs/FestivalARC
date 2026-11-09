import { expect, test } from '@playwright/test'

const configurations = [
  { width: 390, dpr: 1, columns: 2 },
  { width: 1024, dpr: 1, columns: 6 },
  { width: 1440, dpr: 1, columns: 10 },
  { width: 1365, dpr: 1, columns: 10 },
  { width: 1365, dpr: 2, columns: 10 },
]

for (const { width, dpr, columns } of configurations) {
  test.describe(`poster patterns at ${width}px and DPR ${dpr}`, () => {
    test.use({ viewport: { width, height: 1000 }, deviceScaleFactor: dpr })

    test('bleeds only the artwork without expanding the grid cells or disabling smoothing', async ({ page }) => {
      expect((await page.goto('/'))?.status()).toBe(200)
      await page.evaluate(() => document.fonts.ready)
      const grid = page.getByRole('region', { name: 'Festival ARC: artistas y obras' })
      await expect(grid).toBeVisible()
      const result = await grid.evaluate(element => {
        const bounds = element.getBoundingClientRect()
        const css = getComputedStyle(element)
        const columns = css.gridTemplateColumns.split(' ').length
        const cellWidth = bounds.width / columns
        const cellHeight = parseFloat(css.gridTemplateRows)
        const patterns = [...element.querySelectorAll('.pattern-slot')]
          .filter(node => node.getBoundingClientRect().width > 0)
        return {
          columns,
          count: patterns.length,
          patterns: patterns.map(node => {
            const cell = node.getBoundingClientRect()
            const svg = node.querySelector('svg')!
            const artwork = svg.getBoundingClientRect()
            return {
              cellWidth: cell.width - cellWidth,
              cellHeight: cell.height - cellHeight,
              extraWidth: artwork.width - cell.width,
              extraHeight: artwork.height - cell.height,
              left: artwork.left - cell.left,
              top: artwork.top - cell.top,
              hidden: svg.getAttribute('aria-hidden'),
              focusable: svg.getAttribute('focusable'),
            }
          }),
          horizontalOverflow: document.documentElement.scrollWidth > innerWidth,
        }
      })
      expect(result.columns).toBe(columns)
      expect(result.count).toBeGreaterThan(0)
      expect(result.horizontalOverflow).toBe(false)
      for (const pattern of result.patterns) {
        expect(pattern.extraWidth).toBeCloseTo(1, 2)
        expect(pattern.extraHeight).toBeCloseTo(1, 2)
        expect(pattern.left).toBeCloseTo(-0.5, 2)
        expect(pattern.top).toBeCloseTo(-0.5, 2)
        expect(Math.abs(pattern.cellWidth)).toBeLessThan(0.02)
        expect(Math.abs(pattern.cellHeight)).toBeLessThan(0.02)
        expect(pattern.hidden).toBe('true')
        expect(pattern.focusable).toBe('false')
      }
      expect(await page.locator('symbol path, symbol circle').evaluateAll(nodes =>
        nodes.every(node => getComputedStyle(node).shapeRendering === 'auto'),
      )).toBe(true)
      await expect(page.locator('[shape-rendering="crispEdges"]')).toHaveCount(0)
    })
  })
}
