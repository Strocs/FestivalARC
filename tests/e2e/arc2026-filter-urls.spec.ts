import { expect, test, type Page } from '@playwright/test'

const scopes = [
  { scope: 'home', path: '/' },
  { scope: 'music', path: '/musica/' },
  { scope: 'stage', path: '/artes-escenicas/' },
] as const
const days = ['all', 'saturday', 'sunday'] as const
const orders = ['original', 'time', 'location'] as const

async function lineup(page: Page) {
  return page.locator('[data-poster-grid] > [data-poster-artist]').evaluateAll(cards => cards
    .filter(card => card.getClientRects().length > 0)
    .map(card => {
      const { gridRowStart, gridColumnStart } = getComputedStyle(card)
      return [card.getAttribute('data-poster-artist'), gridRowStart, gridColumnStart]
    }))
}

const dayControl = (page: Page) => page.locator('[data-poster-day-select]')
const sortControl = (page: Page) => page.locator('[data-poster-sort]')

test.use({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' })

for (const { scope, path } of scopes) {
  test(`${scope}: every non-default variant renders the interactive endpoint before JS`, async ({ page, browser }) => {
    expect((await page.goto(path))?.status()).toBe(200)
    await expect(dayControl(page)).toBeEnabled()
    await expect(dayControl(page)).toHaveValue('all')
    await expect(sortControl(page)).toHaveValue('')
    const defaultLineup = await lineup(page)
    const staticPage = await browser.newPage({ javaScriptEnabled: false, viewport: { width: 390, height: 844 } })
    try {
      for (const day of days) for (const order of orders) {
        if (day === 'all' && order === 'original') continue
        const sort = order === 'original' ? '' : order
        await dayControl(page).selectOption(day)
        await sortControl(page).selectOption(sort)
        const expected = await lineup(page)
        expect(expected.length).toBeGreaterThan(0)
        if (day !== 'all') expect(expected.length).toBeLessThan(defaultLineup.length)

        const variant = new URL(`/poster-variants/${scope}/${day}-${order}/`, page.url()).href
        expect((await staticPage.goto(variant))?.status()).toBe(200)
        await expect(dayControl(staticPage)).toHaveValue(day)
        await expect(sortControl(staticPage)).toHaveValue(sort)
        await expect(staticPage.locator(`input[name="poster-day"][value="${day}"]`)).toBeChecked()
        const canonical = new URL(path, 'https://festivalarc.com').href.replace(/\/$/, '')
        await expect(staticPage.locator('link[rel="canonical"]')).toHaveAttribute('href', canonical)
        for (const link of await staticPage.locator('header a[aria-current="page"]').all()) {
          await expect(link).toHaveAttribute('href', path)
        }
        expect(await staticPage.locator('header a[aria-current="page"]').count()).toBeGreaterThan(0)
        expect(await lineup(staticPage)).toEqual(expected)
      }
    } finally {
      await staticPage.close()
    }

    const variant = `/poster-variants/${scope}/sunday-location/`
    const expected = await lineup(page)
    expect((await page.goto(variant))?.status()).toBe(200)
    await expect(dayControl(page)).toBeEnabled()
    await expect(dayControl(page)).toHaveValue('sunday')
    await expect(sortControl(page)).toHaveValue('location')
    expect(await lineup(page)).toEqual(expected)
    await dayControl(page).selectOption('saturday')
    await sortControl(page).selectOption('')
    expect(await lineup(page)).not.toEqual(expected)
  })
}

test('filter edits push history without requesting a document; Back and Forward leave view alone', async ({ page }) => {
  await page.goto('/musica/?extra=keep&dia=todos&orden=unknown&vista=legacy#section')
  const initial = page.url()
  const day = dayControl(page)
  const sort = sortControl(page)
  const simple = page.locator('[data-poster-simple-toggle]')
  await expect(day).toBeEnabled()
  await expect(day).toHaveValue('all')
  await expect(sort).toHaveValue('')
  const requests: string[] = []
  page.on('request', request => {
    if (request.isNavigationRequest()) requests.push(request.url())
  })

  await day.selectOption('saturday')
  const saturday = new URL(initial)
  saturday.searchParams.set('dia', 'sabado')
  saturday.searchParams.delete('orden')
  await expect(page).toHaveURL(saturday.href)
  await sort.selectOption('time')
  const ordered = new URL(saturday)
  ordered.searchParams.set('orden', 'horario')
  await expect(page).toHaveURL(ordered.href)
  await simple.click()
  await expect(page).toHaveURL(ordered.href)
  await expect(simple).toHaveAttribute('aria-pressed', 'true')

  await day.selectOption('all')
  await sort.selectOption('')
  const defaults = new URL(ordered)
  defaults.searchParams.delete('dia')
  defaults.searchParams.delete('orden')
  await expect(page).toHaveURL(defaults.href)

  // Jump across entries so both filter values have to be restored together.
  await page.evaluate(() => history.go(-2))
  await expect(page).toHaveURL(ordered.href)
  await expect(day).toHaveValue('saturday')
  await expect(sort).toHaveValue('time')
  await page.goBack()
  await expect(page).toHaveURL(saturday.href)
  await expect(sort).toHaveValue('')
  await page.goBack()
  await expect(page).toHaveURL(initial)
  await expect(day).toHaveValue('all')
  await expect(sort).toHaveValue('')
  await page.goForward()
  await expect(page).toHaveURL(saturday.href)
  await expect(day).toHaveValue('saturday')
  await expect(simple).toHaveAttribute('aria-pressed', 'true')
  expect(requests).toEqual([])
})
