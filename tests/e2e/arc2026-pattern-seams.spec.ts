import { createRequire } from 'node:module'
import { resolve } from 'node:path'
import { expect, test } from '@playwright/test'

// Resolve the already installed app dependency without adding a root dependency.
const requireFromApp = createRequire(resolve('apps/festival-2026/package.json'))
const sharp: typeof import('../../apps/festival-2026/node_modules/sharp') = requireFromApp('sharp')

for (const { width, dpr } of [
  { width: 390, dpr: 1 },
  { width: 1024, dpr: 1 },
  { width: 1440, dpr: 1 },
  { width: 1365, dpr: 1 },
  { width: 1365, dpr: 2 },
]) {
  test.describe(`decorative tiles at ${width}px and DPR ${dpr}`, () => {
    test.use({ viewport: { width, height: 1000 }, deviceScaleFactor: dpr })

    test('remain silent, resolve their symbols and cover adjacent seams in rendered pixels', async ({ page }) => {
      expect((await page.goto('/'))?.status()).toBe(200)
      await page.evaluate(() => document.fonts.ready)
      const grid = page.getByRole('region', { name: 'Festival ARC: artistas y obras' })
      await expect(grid).toBeVisible()
      const tiles = grid.locator('.pattern-slot svg')
      expect(await tiles.count()).toBeGreaterThan(0)
      for (const tile of await tiles.all()) {
        await expect(tile).toHaveAttribute('aria-hidden', 'true')
        await expect(tile).toHaveAttribute('focusable', 'false')
        expect(await tile.evaluate(element => element.tabIndex)).toBeLessThan(0)
      }
      const unresolved = await tiles.locator('use').evaluateAll(nodes => nodes.flatMap(node => {
        const href = node.getAttribute('href') ?? ''
        return href.startsWith('#') && document.getElementById(href.slice(1))?.tagName.toLowerCase() === 'symbol' ? [] : [href]
      }))
      expect(await tiles.locator('use').count()).toBeGreaterThan(0)
      expect(unresolved).toEqual([])
      expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)).toBe(false)

      // A controlled page-color marker reveals exposed gaps without freezing the
      // artwork palette, grid tracks, bleed mechanism or complete composition.
      const seams = await grid.evaluate(element => {
        ;(element as HTMLElement).style.backgroundColor = 'rgb(1, 2, 3)'
        const boxes = [...element.querySelectorAll('.pattern-slot')]
          .map(node => node.getBoundingClientRect())
          .filter(box => box.width > 0 && box.height > 0)
        const result: { x: number, y: number, width: number, height: number, axis: string }[] = []
        for (const a of boxes) {
          for (const b of boxes) {
            const top = Math.max(a.top, b.top)
            const bottom = Math.min(a.bottom, b.bottom)
            const left = Math.max(a.left, b.left)
            const right = Math.min(a.right, b.right)
            if (Math.abs(a.right - b.left) < 1 && bottom - top > 12) {
              result.push({ x: a.right + scrollX - 2, y: top + scrollY + 4, width: 4, height: bottom - top - 8, axis: 'vertical' })
            }
            if (Math.abs(a.bottom - b.top) < 1 && right - left > 12) {
              result.push({ x: left + scrollX + 4, y: a.bottom + scrollY - 2, width: right - left - 8, height: 4, axis: 'horizontal' })
            }
          }
        }
        return result
      })
      expect(seams.length, 'at least one adjacent tile edge is exercised').toBeGreaterThan(0)
      // Sample both orientations when present, without selecting particular motifs.
      const samples = ['vertical', 'horizontal'].flatMap(axis => seams.filter(seam => seam.axis === axis).slice(0, 3))
      for (const { axis, ...clip } of samples) {
        const screenshot = await page.screenshot({ clip, fullPage: true, animations: 'disabled' })
        const { data, info } = await sharp(screenshot).removeAlpha().raw().toBuffer({ resolveWithObject: true })
        let exposedPixels = 0
        for (let index = 0; index < data.length; index += info.channels) {
          if (Math.abs(data[index] - 1) <= 2 && Math.abs(data[index + 1] - 2) <= 2 && Math.abs(data[index + 2] - 3) <= 2) exposedPixels++
        }
        expect(exposedPixels, `${axis} seam at ${clip.x},${clip.y}`).toBe(0)
      }
    })
  })
}
