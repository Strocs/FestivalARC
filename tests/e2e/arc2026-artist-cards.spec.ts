import { expect, test } from '@playwright/test'
import { lineup } from '../../apps/festival-2026/src/features/poster/lineup'

const schedule = 'Sábado 28.11 | 23:00hrs'

for (const width of [320, 390, 768, 1280, 1440, 1920]) {
  test(`artist schedules overlap the name surface and stay centered without touching letters at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 1000 })
    expect((await page.goto('/'))?.status()).toBe(200)
    await page.evaluate(() => document.fonts.ready)
    const cards = page.getByRole('article')
    await expect(cards).toHaveCount(lineup.length)
    const labels = cards.locator('time')
    await expect(labels).toHaveText(lineup.map(() => schedule))
    const geometry = await cards.evaluateAll((nodes) =>
      nodes.map((card) => {
        const name = card
          .querySelector('[data-artist-name]')!
          .getBoundingClientRect()
        const time = card.querySelector('time')!
        const date = time.getBoundingClientRect()
        const surface = card
          .querySelector('[data-artist-surface]')!
          .getBoundingClientRect()
        const box = card.getBoundingClientRect()
        const style = getComputedStyle(time)
        return {
          name: card.getAttribute('aria-label'),
          gap: date.top - name.bottom,
          topInset: surface.top - box.top,
          bottomInset: box.bottom - date.bottom,
          sideInset: surface.left - box.left,
          centerOffset: Math.abs(
            (date.left + date.right - surface.left - surface.right) / 2,
          ),
          overlap: surface.bottom - date.top,
          lowerOffset: date.bottom - surface.bottom,
          contained:
            date.left >= box.left &&
            date.right <= box.right + 1 &&
            date.bottom <= box.bottom + 1,
          overflow: time.scrollWidth > time.clientWidth,
          background: style.backgroundColor,
          color: style.color,
          radii: [
            style.borderTopLeftRadius,
            style.borderTopRightRadius,
            style.borderBottomLeftRadius,
            style.borderBottomRightRadius,
          ],
          padding: parseFloat(style.paddingLeft),
        }
      }),
    )
    for (const card of geometry) {
      // Chromium rounds fractional grid tracks to 1/64 CSS pixels.
      expect(card.gap, card.name!).toBeGreaterThanOrEqual(4 - 1 / 64)
      expect(card.topInset, card.name!).toBeGreaterThanOrEqual(
        card.sideInset * 0.4,
      )
      expect(
        Math.abs(card.topInset - card.bottomInset),
        card.name!,
      ).toBeLessThanOrEqual(1)
      expect(card.centerOffset, card.name!).toBeLessThanOrEqual(1)
      expect(card.overlap, card.name!).toBeGreaterThan(0)
      expect(card.lowerOffset, card.name!).toBeGreaterThan(0)
      expect(card.contained, card.name!).toBe(true)
      expect(card.overflow, card.name!).toBe(false)
      expect(card.background).toBe('rgb(0, 255, 255)')
      expect(card.color).toBe('rgb(0, 15, 22)')
      expect(card.radii).toEqual(['0px', '0px', '0px', '0px'])
      expect(card.padding).toBeGreaterThanOrEqual(12)
    }
  })
}

test('artist cards omit city suffixes but preserve descriptors and identities', async ({
  page,
}) => {
  await page.goto('/')
  await expect(
    page.getByRole('article', { name: 'Polter', exact: true }),
  ).toBeVisible()
  await expect(
    page.getByRole('article', { name: 'Quitá de Bulla', exact: true }),
  ).toBeVisible()
  await expect(
    page.getByRole('article', { name: 'Josefa Errazuriz (DJ)', exact: true }),
  ).toBeVisible()
  await expect(
    page.getByRole('article', { name: 'Guaype Club (Infantil)', exact: true }),
  ).toBeVisible()
})

test('the whole card responds to hover and keyboard focus without inventing navigation', async ({
  page,
}) => {
  await page.goto('/')
  const card = page.getByRole('article').first()
  const button = card.getByRole('button')
  const surface = card.locator('[data-artist-surface]')
  const scheduleLabel = card.locator('time')
  const name = card.locator('[data-artist-name]')
  await expect(button).toHaveAttribute('type', 'button')
  await expect(button).toHaveCSS('cursor', 'pointer')
  const rest = await surface.evaluate(
    (node) => getComputedStyle(node).translate,
  )
  await button.hover({ position: { x: 2, y: 2 } })
  await expect
    .poll(() => surface.evaluate((node) => getComputedStyle(node).translate))
    .not.toBe(rest)
  await expect(name).toHaveCSS('text-decoration-line', 'none')
  await expect(scheduleLabel).not.toHaveCSS('translate', 'none')
  await button.click()
  await expect(page).toHaveURL('/')
  await page.mouse.move(0, 0)
  await page.keyboard.press('Shift+Tab')
  await page.keyboard.press('Tab')
  await expect(button).toBeFocused()
  await expect(button).toHaveCSS('outline-style', 'solid')
  await expect(name).toHaveCSS('text-decoration-line', 'none')
  await page.keyboard.press('Enter')
  await expect(page).toHaveURL('/')
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await expect(surface).toHaveCSS('transition-property', 'none')
  await expect(surface).toHaveCSS('translate', 'none')
  await expect(scheduleLabel).toHaveCSS('translate', 'none')
})
