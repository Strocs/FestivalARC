import { createRequire } from 'node:module'
import { resolve } from 'node:path'
import { expect, test } from '@playwright/test'
import { publicationConfig } from '../../editions.config'
import { activitiesForArtist, demoLabel, formatActivityTime, validateProgram } from '../../apps/festival-2026/src/features/arc2026/data/program'

// Node's test loader needs explicit JSON loading; validation and ordering still
// use the same public entry point as the app's build-time local data loader.
const requireFromApp = createRequire(resolve('apps/festival-2026/package.json'))
const program = validateProgram({
  artists: requireFromApp('./src/content/artists/demo.json'),
  activities: requireFromApp('./src/content/activities/demo.json'),
  venues: requireFromApp('./src/content/venues/demo.json'),
})
const detailPaths = program.artists.map(artist => `/artistas/${artist.id}/`)

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

for (const artist of program.artists) {
  test(`direct detail for ${artist.id} exposes configured demo activities without JavaScript`, async ({ browser, request }) => {
    const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 320, height: 900 } })
    try {
      const page = await context.newPage()
      expect((await page.goto(`/artistas/${artist.id}/`))?.status()).toBe(200)
      await expect(page.getByRole('heading', { level: 1, name: artist.name, exact: true })).toBeVisible()
      await expect(page.getByRole('banner')).toBeVisible()
      await expect(page.getByText(demoLabel, { exact: true })).toBeVisible()
      await expect(page.getByRole('img', { name: `Pieza de referencia de ${artist.name}` })).toBeVisible()
      const activities = page.getByRole('list', { name: 'Actividades de demostración' }).getByRole('listitem')
      const expected = activitiesForArtist(program, artist.id)
      await expect(activities).toHaveCount(expected.length)
      for (const [index, activity] of expected.entries()) {
        const item = activities.nth(index)
        const venue = program.venues.find(entry => entry.id === activity.venueId)!
        await expect(item.getByRole('heading')).toHaveText(activity.name)
        await expect(item.locator('time')).toHaveAttribute('datetime', activity.startsAt)
        await expect(item.locator('time')).toHaveText(formatActivityTime(activity.startsAt))
        await expect(item).toContainText(`${venue.name} · ${venue.city}`)
        await expect(item).toContainText(activity.disciplines.join(' · '))
        await expect(item).toBeVisible()
      }
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
