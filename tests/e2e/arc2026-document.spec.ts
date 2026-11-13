import { expect, test } from '@playwright/test'
import { publicationConfig } from '../../editions.config'
import { artists, disciplines } from '../../apps/festival-2026/src/features/artists/artists'

const detailPaths = artists.map(artist => `/artistas/${artist.id}/`)

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
  for (const path of ['/', ...detailPaths]) {
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

for (const artist of artists) {
  test(`direct detail for ${artist.id} exposes the source-of-truth artist data without JavaScript`, async ({ browser, request }) => {
    const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 320, height: 900 } })
    try {
      const page = await context.newPage()
      expect((await page.goto(`/artistas/${artist.id}/`))?.status()).toBe(200)
      await expect(page.getByRole('heading', { level: 1, name: artist.name, exact: true })).toBeVisible()
      await expect(page.getByRole('banner')).toBeVisible()
      const detail = page.getByRole('main', { name: `Ficha de ${artist.name}` })
      const discipline = disciplines.find(({ id }) => id === artist.disciplines)!
      await expect(detail.getByText(discipline.name, { exact: true })).toBeVisible()
      await expect(detail.getByText(`${artist.date.day} · ${artist.date.time}`, { exact: true })).toBeVisible()
      await expect(detail.getByRole('img')).toHaveCount(0)
      await expect(detail).not.toContainText(/demostración|ejemplo/i)
      await expect(detail.getByRole('list')).toHaveCount(0)
      expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)).toBe(false)
      for (const src of await page.locator('img').evaluateAll(images => images.map(image => image.src))) {
        expect((await request.get(src)).status()).toBe(200)
      }
      const back = page.getByRole('link', { name: 'Volver a la portada' })
      await expect(back).toHaveAttribute('href', '/')
      await back.focus()
      await page.keyboard.press('Enter')
      await expect(page).toHaveURL('/')
    } finally {
      await context.close()
    }
  })
}

test('detail header home link returns to the active edition', async ({ page }) => {
  await page.goto(detailPaths[0])
  await page.getByRole('banner').getByRole('link', { name: 'Inicio', exact: true }).click()
  await expect(page).toHaveURL('/')
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
})
