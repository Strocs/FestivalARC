import { expect, test } from '@playwright/test'
import { publicationConfig } from '../../editions.config'
import { categories, participants } from '../../apps/festival-2026/src/features/artists/categories'

// Future browser acceptance coverage. T1 verifies static rendering with Vitest/build only.
const detailPaths = participants.map(artist => artist.canonicalPath)

function isSuccessfulResourceStatus(status: number) {
  return (status >= 200 && status < 300) || status === 304
}

test('resource delivery accepts success and cache validation but rejects HTTP errors', () => {
  for (const status of [200, 204, 299, 304]) expect(isSuccessfulResourceStatus(status)).toBe(true)
  for (const status of [199, 300, 301, 400, 404, 500]) expect(isSuccessfulResourceStatus(status)).toBe(false)
})

test('publishes useful indexable metadata and successfully delivers local resources', async ({ page }) => {
  const failed: string[] = []
  const localResources: string[] = []
  page.on('response', response => {
    const request = response.request()
    if (new URL(response.url()).origin === new URL(page.url()).origin) {
      if (!isSuccessfulResourceStatus(response.status())) failed.push(`${response.status()} ${response.url()}`)
      if (['font', 'image', 'stylesheet', 'script'].includes(request.resourceType())) localResources.push(response.url())
    }
  })
  page.on('requestfailed', request => failed.push(`${request.url()}: ${request.failure()?.errorText}`))
  for (const path of ['/', ...categories.map(category => category.path), ...detailPaths]) {
    expect((await page.goto(path))?.status()).toBe(200)
    await page.evaluate(() => document.fonts.ready)
    await expect(page).toHaveTitle(/\S/)
    await expect(page.locator('html')).toHaveAttribute('lang', /^es(?:-|$)/)
    await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', /\S/)
    const canonical = new URL(path === '/' ? '' : path.replace(/\/$/, ''), publicationConfig.siteOrigin).href.replace(/\/$/, '')
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', canonical)
    await expect(page.locator('meta[property="og:url"]')).toHaveAttribute('content', canonical)
    const robots = await page.locator('meta[name="robots"]').evaluateAll(nodes => nodes.map(node => node.getAttribute('content') ?? '').join(','))
    expect(robots).not.toMatch(/noindex|none/i)
    for (const image of await page.getByRole('img').all()) {
      await image.scrollIntoViewIfNeeded()
      await expect.poll(() => image.evaluate(node => (node as HTMLImageElement).complete && (node as HTMLImageElement).naturalWidth > 0)).toBe(true)
    }
  }
  expect(localResources.length).toBeGreaterThan(0)
  expect(failed).toEqual([])
})

for (const artist of participants) {
  test(`direct detail for ${artist.id} exposes the source-of-truth artist data without JavaScript`, async ({ browser, request }) => {
    const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 320, height: 900 } })
    try {
      const page = await context.newPage()
      expect((await page.goto(artist.canonicalPath))?.status()).toBe(200)
      await expect(page.getByRole('heading', { level: 1, name: artist.name, exact: true })).toBeVisible()
      await expect(page.getByRole('banner')).toBeVisible()
      const detail = page.getByRole('main', { name: `Ficha de ${artist.name}` })
      if (artist.disciplineName) await expect(detail.getByText(artist.disciplineName, { exact: true })).toBeVisible()
      await expect(detail.getByText(`${artist.date.day} · ${artist.date.time}`, { exact: true })).toBeVisible()
      await expect(detail.getByRole('img')).toHaveCount(0)
      await expect(detail).not.toContainText(/demostración|ejemplo/i)
      await expect(detail.getByRole('list')).toHaveCount(0)
      expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)).toBe(false)
      for (const src of await page.locator('img').evaluateAll(images => images.map(image => image.src))) {
        expect((await request.get(src)).status()).toBe(200)
      }
      const category = categories.find(({ key }) => key === artist.category)!
      const back = page.getByRole('link', { name: `Volver a ${category.name}` })
      await expect(back).toHaveAttribute('href', category.path)
      await back.focus()
      await page.keyboard.press('Enter')
      await expect(page).toHaveURL(category.path)
    } finally {
      await context.close()
    }
  })
}

for (const category of categories) {
  test(`${category.slug} publishes only its category members in the shared poster`, async ({ page }) => {
    await page.goto(category.path)
    await expect(page.getByRole('heading', { level: 1, name: category.name, exact: true })).toBeVisible()
    const triggers = page.locator('[data-event-trigger]')
    expect(await triggers.evaluateAll(nodes => nodes.map(node => node.getAttribute('data-event-id'))))
      .toEqual(category.participants.map(({ id }) => id))
    for (const participant of category.participants) {
      await expect(page.locator(`[data-event-id="${participant.id}"]`)).toHaveAttribute('href', participant.canonicalPath)
    }
    await expect(page.getByRole('main').locator('.information-slot')).toHaveCount(1)
    await expect(page.getByRole('main').getByText('Instagram', { exact: true })).toHaveCount(0)
  })
}

test('removed legacy details do not remain as aliases', async ({ request }) => {
  expect((await request.get('/artistas/gepe/')).status()).toBe(404)
})

test('detail header home link returns to the active edition', async ({ page }) => {
  await page.goto(detailPaths[0])
  await page.getByRole('banner').getByRole('link', { name: 'Inicio', exact: true }).click()
  await expect(page).toHaveURL('/')
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
})
