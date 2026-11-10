import { expect, test } from '@playwright/test'
import type { Locator } from '@playwright/test'

const cyan = 'rgb(0, 255, 255)'

async function expectFocus(link: Locator, style = 'solid') {
  await expect(link).toBeFocused()
  await expect(link).toHaveCSS('outline-color', cyan)
  await expect(link).toHaveCSS('outline-width', '3px')
  await expect(link).toHaveCSS('outline-style', style)
  await expect(link).toHaveCSS('outline-offset', '3px')
}

for (const [width, reducedMotion] of [
  [390, 'reduce'],
  [1365, 'reduce'],
  [1365, 'no-preference'],
] as const) {
  test.describe(`shell at ${width}px, motion ${reducedMotion}`, () => {
    test.use({ viewport: { width, height: 1000 }, reducedMotion })

    test('preserves keyboard order, focus defaults and return navigation', async ({ page }) => {
      await page.goto('/artistas/javiera-mena/')
      await page.evaluate(() => document.fonts.ready)
      const home = page.getByRole('link', { name: 'Ir al inicio', exact: true })
      const nav = page.getByRole('navigation', { name: 'Ultimas ediciones' })
      const trigger = nav.locator('[tabindex="0"]')
      const editions = nav.getByRole('list', { includeHidden: true })
      await expect(editions).toBeHidden()
      await page.keyboard.press('Tab')
      await expectFocus(home)
      await expect(home).toHaveAttribute('href', '/')
      await page.keyboard.press('Tab')
      await expect(trigger).toBeFocused()
      await expect(trigger).toHaveCSS('outline', `${cyan} solid 2px`)
      await expect(trigger).toHaveCSS('outline-offset', '2px')
      await expect(editions).toBeVisible()
      for (const year of [2025, 2024, 2023]) {
        await page.keyboard.press('Tab')
        const link = nav.getByRole('link', { name: `Festival ARC ${year}`, exact: true })
        await expectFocus(link, 'none')
        await expect(link).toHaveCSS('color', cyan)
        await expect(link).toHaveAttribute('href', `/ediciones/${year}/`)
      }
      await page.keyboard.press('Tab')
      const back = page.getByRole('link', { name: 'Volver a la portada', exact: true })
      await expectFocus(back)
      await expect(editions).toBeHidden()
      await page.keyboard.press('Enter')
      await expect(page).toHaveURL('/')
      await expect(page.getByRole('banner')).toHaveCount(0)
      await expect(page.getByRole('article')).toHaveCount(46)
    })

    test('preserves immediate edition hover and header home navigation', async ({ page }) => {
      await page.goto('/artistas/javiera-mena/')
      const nav = page.getByRole('navigation', { name: 'Ultimas ediciones' })
      const trigger = nav.locator('[tabindex="0"]')
      await trigger.hover()
      const editions = nav.getByRole('list')
      await expect(editions).toBeVisible()
      await expect(editions).toHaveCSS('opacity', '1')
      await expect(editions).toHaveCSS('pointer-events', 'auto')
      const previous = nav.getByRole('link', { name: 'Festival ARC 2024', exact: true })
      await previous.hover()
      await expect(previous).toHaveCSS('color', cyan)
      for (const element of [trigger, editions, previous]) {
        await expect(element).toHaveCSS('transition-property', 'none')
        await expect(element).toHaveCSS('transform', 'none')
      }
      await page.getByRole('link', { name: 'Ir al inicio', exact: true }).click()
      await expect(page).toHaveURL('/')
    })
  })
}
