import { expect, test } from '@playwright/test'

const date = '28 y 29 de noviembre'

test('desktop header uses the shared identity and 2024 dimensions', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 })
  await page.goto('/')
  const header = page.locator('[data-festival-header]')
  await expect(header).toBeVisible()
  await expect(header).toContainText(date)
  await expect(header).toContainText('Plaza de Armas de La Serena')
  await expect(header.getByRole('link', { name: 'Inicio', exact: true })).toBeVisible()
  expect((await header.boundingBox())?.height).toBe(72)
  await expect(header.locator('[data-header-toggle]')).toBeHidden()
  const editions = header.locator('[data-header-editions]')
  await editions.locator('button').click()
  for (const year of [2025, 2024, 2023]) {
    await expect(editions.getByRole('link', { name: `ARC ${year}` })).toHaveAttribute('href', `/ediciones/${year}/`)
  }
  await expect(editions.getByRole('link', { name: 'ARC 2026' })).toHaveCount(0)
  await page.keyboard.press('Escape')
  await expect(editions.locator('button')).toHaveAttribute('aria-expanded', 'false')
  await page.screenshot({ path: 'test-results/navbar-desktop.png' })
})

test('mobile panel supports keyboard, focus restoration, editions and resize', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/')
  const header = page.locator('[data-festival-header]')
  const toggle = header.getByRole('button', { name: 'Abrir navegación' })
  await expect(header).toContainText(date)
  await toggle.focus()
  await page.keyboard.press('Enter')
  const panel = page.getByRole('dialog', { name: 'Navegación del festival' })
  await expect(panel).toBeVisible()
  await expect(toggle).toHaveAttribute('aria-expanded', 'true')
  await expect(panel.getByRole('button', { name: 'Cerrar navegación' })).toBeFocused()
  await expect(panel.getByRole('link', { name: 'ARC 2024' })).toBeVisible()
  await panel.getByRole('link', { name: 'ARC 2023' }).focus()
  await page.keyboard.press('Tab')
  // Native dialogs may focus the document's neutral sentinel before wrapping.
  expect(await panel.evaluate(element => element.contains(document.activeElement) || document.activeElement === document.body)).toBe(true)
  await page.keyboard.press('Tab')
  await expect(panel.getByRole('button', { name: 'Cerrar navegación' })).toBeFocused()
  await page.keyboard.press('Escape')
  await expect(panel).toBeHidden()
  await expect(toggle).toBeFocused()
  await expect(toggle).toHaveAttribute('aria-expanded', 'false')
  await toggle.click()
  await page.screenshot({ path: 'test-results/navbar-mobile-open.png' })
  await page.setViewportSize({ width: 1280, height: 900 })
  await expect(panel).toBeHidden()
  await page.setViewportSize({ width: 320, height: 700 })
  await expect(toggle).toBeVisible()
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  await page.screenshot({ path: 'test-results/navbar-mobile-small.png' })
})

test('festival styling can override tokens and add a background without props', async ({ page }) => {
  await page.goto('/')
  const header = page.locator('[data-festival-header]')
  const footerBorder = await page.locator('footer').evaluate(element => getComputedStyle(element).borderTopColor)
  await expect(header).toHaveCSS('border-bottom-width', '1px')
  await expect(header).toHaveCSS('border-bottom-color', footerBorder)
  await page.addStyleTag({ content: '[data-festival-header] { --header-bg-color: rgb(30, 40, 50); --header-text-color: rgb(240, 230, 220); background-image: linear-gradient(red, blue); }' })
  await expect(header).toHaveCSS('background-color', 'rgb(30, 40, 50)')
  await expect(header).toHaveCSS('color', 'rgb(240, 230, 220)')
  expect(await header.evaluate(element => getComputedStyle(element).backgroundImage)).toContain('linear-gradient')
})

test('the original header stays above the sliding panel and its hamburger becomes the close control', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/')
  const toggle = page.locator('[data-header-toggle]')
  const before = await toggle.boundingBox()
  await toggle.click()
  await expect(toggle).toBeVisible()
  await expect(toggle).toHaveAccessibleName('Cerrar navegación')
  await expect(toggle).toHaveAttribute('data-icon-open', 'true')
  await expect(toggle.locator('[data-icon-line="middle"]')).toHaveCSS('opacity', '0')
  await expect(toggle.locator('[data-icon-line]')).toHaveCount(3)
  const header = page.locator('[data-festival-header]')
  await expect(header.locator('[data-header-brand]')).toBeVisible()
  expect(await toggle.boundingBox()).toEqual(before)
  expect(await toggle.evaluate(element => {
    const rect = element.getBoundingClientRect()
    return element.contains(document.elementFromPoint(rect.x + rect.width / 2, rect.y + rect.height / 2))
  })).toBe(true)
  await toggle.click()
  await expect(page.getByRole('dialog')).toBeHidden()
  await expect(toggle.locator('[data-icon-menu]')).toBeVisible()
  await expect(toggle).toHaveAttribute('data-icon-open', 'false')
  await expect(toggle.locator('[data-icon-line="middle"]')).toHaveCSS('opacity', '1')
  await expect(toggle).toHaveAccessibleName('Abrir navegación')
})

test('navbar slides from the right without dimming, reverses on close and honors reduced motion', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.emulateMedia({ reducedMotion: 'no-preference' })
  await page.goto('/')
  const motion = await page.locator('festival-navbar').evaluate(element => {
    element.querySelector<HTMLButtonElement>('[data-header-toggle]')!.click()
    return ['[data-header-surface]', '[data-header-toggle]'].map(selector => {
      const effect = element.querySelector(selector)!.getAnimations()[0].effect as KeyframeEffect
      return { duration: effect.getTiming().duration, frames: effect.getKeyframes().map(frame => frame.transform) }
    })
  })
  expect(motion).toEqual([
    { duration: 500, frames: ['translateX(100%)', 'translateX(0px)'] },
    { duration: 300, frames: ['rotate(0deg)', 'rotate(-90deg)'] },
  ])
  expect(await page.locator('[data-header-panel]').evaluate(element => getComputedStyle(element, '::backdrop').backgroundColor)).toBe('rgba(0, 0, 0, 0)')
  const closing = await page.locator('festival-navbar').evaluate(element => {
    element.querySelector<HTMLButtonElement>('[data-header-toggle]')!.click()
    return {
      open: element.querySelector<HTMLDialogElement>('[data-header-panel]')!.open,
      exit: (element.querySelector('[data-header-surface]')!.getAnimations()[0].effect as KeyframeEffect).getKeyframes().at(-1)?.transform,
      duration: element.querySelector('[data-header-surface]')!.getAnimations()[0].effect!.getTiming().duration,
    }
  })
  expect(closing).toEqual({ open: true, exit: 'translateX(100%)', duration: 500 })
  await expect(page.getByRole('dialog')).toBeHidden()
  await expect(page.locator('[data-header-toggle]')).toHaveAttribute('aria-expanded', 'false')
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.reload()
  await page.getByRole('button', { name: 'Abrir navegación' }).click()
  expect(await page.locator('[data-header-panel]').evaluate(element => element.getAnimations({ subtree: true }).length)).toBe(0)
})
