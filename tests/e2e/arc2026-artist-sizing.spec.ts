import { expect, test } from '@playwright/test'
import { getArtistCompositions } from '../../apps/festival-2026/src/features/poster/artist-name'

for (const width of [320, 390, 767, 768, 1279, 1280, 1440, 1920]) {
  test(`artist labels maximize their padded area at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 1000 })
    await page.goto('/')
    await page.evaluate(() => document.fonts.ready)
    const artists = page.getByRole('article')
    const sizes = await artists.evaluateAll(nodes => nodes.map(article => {
      const label = article.querySelector('span')!
      const container = label.parentElement!
      const box = container.getBoundingClientRect()
      const textBox = label.getBoundingClientRect()
      const style = getComputedStyle(container)
      const labelStyle = getComputedStyle(label)
      const availableWidth = box.width - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight)
      const availableHeight = box.height - parseFloat(style.paddingTop) - parseFloat(style.paddingBottom)
      const textWidth = textBox.width - parseFloat(labelStyle.paddingLeft) - parseFloat(labelStyle.paddingRight)
      const textHeight = textBox.height - parseFloat(labelStyle.paddingTop) - parseFloat(labelStyle.paddingBottom)
      return {
        name: article.getAttribute('aria-label')!.toUpperCase(),
        fontSize: parseFloat(getComputedStyle(label).fontSize),
        widthSlack: availableWidth - textWidth,
        heightSlack: availableHeight - textHeight,
        availableWidth,
        availableHeight,
        lines: [...label.querySelectorAll('br')].filter(node => getComputedStyle(node).display !== 'none').length + 1,
      }
    }))
    expect(sizes.length).toBeGreaterThan(0)
    for (const size of sizes) {
      expect(size.widthSlack, size.name!).toBeGreaterThanOrEqual(-1)
      expect(size.heightSlack, size.name!).toBeGreaterThanOrEqual(-1)
      expect(Math.min(Math.abs(size.widthSlack), Math.abs(size.heightSlack)), size.name!).toBeLessThan(1)
      expect(size.fontSize).toBeGreaterThan(0)
      const maximum = Math.max(...getArtistCompositions(size.name).map(option =>
        Math.min(size.availableWidth / option.width, size.availableHeight / option.lines.length),
      ))
      // Container aspect queries quantize near fractional layout boundaries.
      // Require the optimum within one CSS pixel, as with containment above.
      expect(Math.abs(size.fontSize - maximum), size.name).toBeLessThan(1)
      if (size.name === 'GEPE') expect(size.lines).toBe(1)
    }
    if (width === 1440) expect(sizes.find(size => size.name === 'FERNANDO MILAGROS')!.lines).toBeGreaterThan(1)
    expect(sizes.find(size => size.name === 'GEPE')!.fontSize)
      .toBeGreaterThan(sizes.find(size => size.name === 'NIÑO COHETE')!.fontSize)
  })
}
