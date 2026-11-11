import { expect, test, type Page } from '@playwright/test'
import { lineup } from '../../apps/festival-2026/src/features/arc2026/data/lineup'

async function openPoster(page: Page, width: number) {
  await page.setViewportSize({ width, height: 1000 })
  expect((await page.goto('/'))?.status()).toBe(200)
  await page.evaluate(() => document.fonts.ready)
}

async function expectReadablePoster(page: Page) {
  expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)).toBe(false)
  const artists = page.getByRole('article')
  await expect(artists).toHaveCount(lineup.length)
  expect(await artists.evaluateAll(nodes => nodes.map(node => node.getAttribute('aria-label')).sort()))
    .toEqual(lineup.map(artist => artist.name).sort())

  const textBlocks = page.getByRole('heading', { level: 1 }).or(artists)
    .or(page.getByRole('complementary', { name: 'Programación' }))
    .or(page.getByRole('complementary', { name: 'Disciplinas' }))
  for (const block of await textBlocks.all()) {
    await expect(block).toBeVisible()
    const problems = await block.evaluate(root => {
      const failures: string[] = []
      const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT)
      while (walker.nextNode()) {
        const text = walker.currentNode
        if (!text.textContent?.trim()) continue
        const parent = text.parentElement!
        parent.scrollIntoView({ block: 'center', inline: 'nearest' })
        const range = document.createRange()
        range.selectNodeContents(text)
        for (const rect of range.getClientRects()) {
          if (!rect.width || !rect.height) continue
          if (rect.left < -1 || rect.right > innerWidth + 1) failures.push(`offscreen: ${text.textContent}`)
          for (let ancestor: Element | null = parent; ancestor; ancestor = ancestor.parentElement) {
            const style = getComputedStyle(ancestor)
            const box = ancestor.getBoundingClientRect()
            if (['hidden', 'clip'].includes(style.overflowX) && (rect.left < box.left - 1 || rect.right > box.right + 1)) failures.push(`clipped horizontally: ${text.textContent}`)
            if (['hidden', 'clip'].includes(style.overflowY) && (rect.top < box.top - 1 || rect.bottom > box.bottom + 1)) failures.push(`clipped vertically: ${text.textContent}`)
          }
          // Test actual text, including lower title lines, against overlapping art
          // and other text. Centering avoids the shared sticky navigation.
          const y = (rect.top + rect.bottom) / 2
          if (y > 0 && y < innerHeight) {
            for (const x of [rect.left + 1, (rect.left + rect.right) / 2, rect.right - 1]) {
              const hit = document.elementFromPoint(x, y)
              if (!hit || !parent.contains(hit)) failures.push(`obscured: ${text.textContent}`)
            }
          }
        }
      }
      return failures
    })
    expect(problems).toEqual([])
  }
}

for (const width of [320, 390, 767, 768, 1279, 1280, 1440]) {
  test(`poster text remains readable and artists unique at ${width}px`, async ({ page }) => {
    await openPoster(page, width)
    await expectReadablePoster(page)
  })
}

for (const width of [320, 390, 767]) {
  test(`mobile uses three proportional tiles and two decorative rows before artists at ${width}px`, async ({ page }) => {
    await openPoster(page, width)
    const grid = page.getByRole('region', { name: 'Festival ARC: artistas y obras' })
    // Compare the full article with live adjacent tiles, not its interior label
    // or fixed pixel dimensions. Allow one CSS pixel for fractional track rounding.
    const tiles = await grid.locator('.pattern-slot').evaluateAll(nodes => nodes.map(node => {
      const box = node.getBoundingClientRect()
      return { x: box.x, y: box.y, width: box.width, height: box.height }
    }).filter(box => box.width > 0 && box.height > 0))
    const firstRow = tiles.filter(tile => Math.abs(tile.y - tiles[0].y) < 1).sort((a, b) => a.x - b.x)
    expect(firstRow, 'three visible horizontal decorative slots are exercised').toHaveLength(3)
    const [left, middle, right] = firstRow
    expect(Math.abs(left.x + left.width - middle.x)).toBeLessThanOrEqual(1)
    expect(Math.abs(middle.x + middle.width - right.x)).toBeLessThanOrEqual(1)
    for (const tile of tiles) {
      expect(Math.abs(tile.height - tile.width * 152 / 160)).toBeLessThanOrEqual(1)
    }
    const moduleHeight = left.height
    const hero = await grid.locator('.information-slot').filter({ has: page.getByRole('heading', { level: 1 }) }).boundingBox()
    const firstArtist = await grid.getByRole('article').first().boundingBox()
    expect(hero).not.toBeNull()
    expect(firstArtist).not.toBeNull()
    const opening = tiles.filter(tile => tile.y >= hero!.y + hero!.height - 1 && tile.y < firstArtist!.y - 1)
    expect(opening).toHaveLength(6)
    for (const row of [0, 1]) {
      const rowTop = hero!.y + hero!.height + row * moduleHeight
      expect(opening.filter(tile => Math.abs(tile.y - rowTop) < 1)).toHaveLength(3)
    }
    expect(Math.abs(firstArtist!.y - (hero!.y + hero!.height + 2 * moduleHeight))).toBeLessThanOrEqual(1)
    const artists = grid.getByRole('article')
    await expect(artists).toHaveCount(lineup.length)
    for (const artist of await artists.all()) {
      const box = await artist.boundingBox()
      expect(box).not.toBeNull()
      expect(Math.abs(box!.x - left.x)).toBeLessThanOrEqual(1)
      expect(Math.abs(box!.width - (right.x + right.width - left.x))).toBeLessThanOrEqual(1)
      expect(box!.height).toBeGreaterThanOrEqual(moduleHeight - 1)
    }
  })

  test(`mobile artist footprint stays fixed when root text is enlarged at ${width}px`, async ({ page }) => {
    await openPoster(page, width)
    const artist = page.getByRole('article').first()
    // Artist metrics are computed on the server; root text enlargement must
    // refit the existing name, not grow its reserved mosaic footprint.
    await page.evaluate(() => { document.documentElement.style.fontSize = '200%' })
    const after = await artist.boundingBox()
    // Root enlargement also changes the page's rem-based margins. Compare
    // against the live three-slot geometry, not the previous viewport measure.
    expect(Math.abs(after!.height - after!.width * 152 / 480)).toBeLessThanOrEqual(1)
    const contained = await artist.evaluate(root => {
      const range = document.createRange()
      range.selectNodeContents(root.querySelector('span')!)
      const box = root.getBoundingClientRect()
      return [...range.getClientRects()].every(rect => rect.left >= box.left - 1 && rect.right <= box.right + 1 && rect.top >= box.top - 1 && rect.bottom <= box.bottom + 1)
    })
    expect(contained).toBe(true)
    await expectReadablePoster(page)
  })
}

for (const width of [320, 390, 768, 1280, 1440]) {
  test(`poster tolerates 200% root text at ${width}px`, async ({ page }) => {
    await openPoster(page, width)
    await page.evaluate(() => { document.documentElement.style.fontSize = '200%' })
    const after = await page.getByRole('article').first().locator('span').first().evaluate(node => parseFloat(getComputedStyle(node).fontSize))
    expect(after).toBeGreaterThan(0)
    await expectReadablePoster(page)
  })
}

test('reflows at a halved CSS viewport as a 200% zoom approximation', async ({ page }) => {
  // This exercises zoom-induced reflow, not native browser zoom or text-only
  // enlargement. deviceScaleFactor changes raster density, not browser zoom.
  await openPoster(page, 1280)
  await page.setViewportSize({ width: 640, height: 500 })
  await expectReadablePoster(page)
})
