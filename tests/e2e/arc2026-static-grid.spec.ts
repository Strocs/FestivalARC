import { expect, test } from '@playwright/test'
import { lineup } from '../../apps/festival-2026/src/features/arc2026/data/lineup'

test('publishes every configured artist once and a live accessible heading without JavaScript', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 390, height: 900 } })
  try {
    const page = await context.newPage()
    expect((await page.goto('/'))?.status()).toBe(200)
    const heading = page.getByRole('heading', { level: 1 })
    await expect(heading).toBeVisible()
    expect((await heading.innerText()).trim()).not.toBe('')
    const artists = page.getByRole('article')
    await expect(artists).toHaveCount(lineup.length)
    expect(await artists.evaluateAll(nodes => nodes.map(node => node.getAttribute('aria-label')).sort()))
      .toEqual(lineup.map(artist => artist.name).sort())
    for (const artist of lineup) {
      await expect(page.getByRole('article', { name: artist.name, exact: true })).toHaveText(artist.name)
    }
  } finally {
    await context.close()
  }
})

for (const width of [320, 390, 1024, 1440]) {
  test(`visible content and navigation remain usable at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 })
    const errors: string[] = []
    page.on('pageerror', error => errors.push(error.message))
    expect((await page.goto('/'))?.status()).toBe(200)
    await page.evaluate(() => document.fonts.ready)
    expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)).toBe(false)

    // Inspect rendered text, not panel geometry: decorative overlaps are intentional.
    const content = page.getByRole('heading', { level: 1 }).or(page.getByRole('article'))
    for (const element of await content.all()) {
      await expect(element).toBeVisible()
      await element.scrollIntoViewIfNeeded()
      const problems = await element.evaluate(root => {
        const failures: string[] = []
        const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT)
        while (walker.nextNode()) {
          const text = walker.currentNode
          if (!text.textContent?.trim()) continue
          const parent = text.parentElement!
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
            const y = (rect.top + rect.bottom) / 2
            if (y > 0 && y < innerHeight) {
              const hit = document.elementFromPoint((rect.left + rect.right) / 2, y)
              if (!hit || !parent.contains(hit)) failures.push(`obscured: ${text.textContent}`)
            }
          }
        }
        return failures
      })
      expect(problems).toEqual([])
    }
    // Trial clicks check hit targets without navigating or opening a panel.
    for (const control of await page.getByRole('banner').getByRole('link').or(page.getByRole('banner').getByRole('button')).all()) {
      if (await control.isVisible()) await control.click({ trial: true })
    }
    expect(errors).toEqual([])
  })
}
