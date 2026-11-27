import { expect, test } from '@playwright/test'
import type { Locator, Page } from '@playwright/test'
import { publicationConfig } from '../../editions.config'
import { previousEditionTargets } from '../../apps/festival-2026/src/components/previousEditions'

const editions = previousEditionTargets(publicationConfig)

async function expectEditionLinks(menu: Locator) {
  await expect(menu.getByRole('link')).toHaveCount(editions.length)
  for (const edition of editions) {
    await expect(menu.getByRole('link', { name: edition.label, exact: true })).toHaveAttribute('href', edition.href)
  }
  await expect(menu.getByRole('link', { name: `ARC ${publicationConfig.active.year}`, exact: true })).toHaveCount(0)
}

async function followEdition(page: Page, menu: Locator) {
  const target = editions[0]
  const response = page.waitForResponse(response => response.request().isNavigationRequest()
    && new URL(response.url()).pathname === target.href)
  await menu.getByRole('link', { name: target.label, exact: true }).click()
  expect((await response).status()).toBe(200)
  await expect(page).toHaveURL(target.href)
}

test('desktop editions support keyboard opening, dismissal and actual navigation', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 })
  await page.goto('/')
  const nav = page.getByRole('navigation', { name: 'Navegación principal' })
  const toggle = nav.getByRole('button', { name: 'Últimas ediciones', exact: true })
  await expect(nav).toBeVisible()
  await expect(nav.getByRole('list', { includeHidden: true })).toBeHidden()
  await toggle.focus()
  await page.keyboard.press('Enter')
  await expect(toggle).toHaveAttribute('aria-expanded', 'true')
  await expectEditionLinks(nav)
  await page.keyboard.press('Tab')
  await expect(nav.getByRole('link', { name: editions[0].label, exact: true })).toBeFocused()
  await page.keyboard.press('Escape')
  await expect(toggle).toBeFocused()
  await expect(toggle).toHaveAttribute('aria-expanded', 'false')
  await expect(nav.getByRole('list', { includeHidden: true })).toBeHidden()
  await toggle.click()
  await toggle.click()
  await expect(toggle).toHaveAttribute('aria-expanded', 'false')
  await toggle.click()
  await page.getByRole('heading', { level: 1 }).click()
  await expect(toggle).toHaveAttribute('aria-expanded', 'false')
  await toggle.click()
  await followEdition(page, nav)
})

test('mobile dialog contains keyboard focus, restores focus and scrolling, and closes on resize', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/')
  const toggle = page.locator('[data-header-toggle]')
  const panel = page.getByRole('dialog', { name: 'Navegación del festival' })
  const before = await page.evaluate(() => document.documentElement.style.overflow)
  await toggle.focus()
  await page.keyboard.press('Enter')
  await expect(panel).toBeVisible()
  await expect(toggle).toHaveAttribute('aria-expanded', 'true')
  const close = panel.getByRole('button', { name: 'Cerrar navegación' })
  await expect(close).toBeFocused()
  await expect(panel.getByRole('heading', { name: 'Últimas ediciones' })).toBeVisible()
  await expect(panel.getByRole('navigation').getByRole('link').first()).toHaveText('Inicio')
  await expectEditionLinks(panel.locator('[data-header-editions]'))
  const links = panel.getByRole('link')
  await links.last().focus()
  // Native dialogs may briefly focus the document sentinel while wrapping.
  for (let step = 0; step < 2; step++) {
    await page.keyboard.press('Tab')
    expect(await panel.evaluate(element => element.contains(document.activeElement) || document.activeElement === document.body)).toBe(true)
    if (await close.evaluate(element => element === document.activeElement)) break
  }
  await expect(close).toBeFocused()
  await close.press('Shift+Tab')
  expect(await panel.evaluate(element => element.contains(document.activeElement) || document.activeElement === document.body)).toBe(true)
  await page.keyboard.press('Escape')
  await expect(panel).toBeHidden()
  await expect(toggle).toBeFocused()
  await expect(toggle).toHaveAttribute('aria-expanded', 'false')
  await expect.poll(() => page.evaluate(() => document.documentElement.style.overflow)).toBe(before)
  await toggle.click()
  await close.click()
  await expect(panel).toBeHidden()
  await expect(toggle).toBeFocused()
  await toggle.click()
  await page.setViewportSize({ width: 1280, height: 900 })
  await expect(panel).toBeHidden()
  await expect.poll(() => page.evaluate(() => document.documentElement.style.overflow)).toBe(before)
  await page.setViewportSize({ width: 320, height: 700 })
  await expect(toggle).toBeVisible()
  await expect(toggle).toHaveAttribute('aria-expanded', 'false')
  await page.evaluate(() => window.scrollTo(0, 300))
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(0)
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
})

test('mobile edition links navigate to a successful archived destination', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/')
  await page.getByRole('button', { name: 'Abrir navegación' }).click()
  const panel = page.getByRole('dialog', { name: 'Navegación del festival' })
  await expect(panel.getByRole('heading', { name: 'Últimas ediciones' })).toBeVisible()
  await expect(panel.getByRole('navigation').getByRole('link').first()).toHaveText('Inicio')
  await expectEditionLinks(panel.locator('[data-header-editions]'))
  await followEdition(page, panel)
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

test('festival styling can override public tokens and add a background without props', async ({ page }) => {
  await page.goto('/')
  const header = page.getByRole('banner')
  const footerBorder = await page.locator('footer').evaluate(element => getComputedStyle(element).borderTopColor)
  await expect(header).toHaveCSS('border-bottom-width', '1px')
  await expect(header).toHaveCSS('border-bottom-color', footerBorder)
  await page.addStyleTag({ content: '[data-festival-header] { --header-bg-color: rgb(30, 40, 50); --header-text-color: rgb(240, 230, 220); background-image: linear-gradient(red, blue); }' })
  await expect(header).toHaveCSS('background-color', 'rgb(30, 40, 50)')
  await expect(header).toHaveCSS('color', 'rgb(240, 230, 220)')
  expect(await header.evaluate(element => getComputedStyle(element).backgroundImage)).toContain('linear-gradient')
})
