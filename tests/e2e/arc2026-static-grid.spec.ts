import { expect, test } from '@playwright/test'
import { lineup } from '../../apps/festival-2026/src/features/arc2026/data/lineup'

test('renders the confirmed names as static content without JavaScript', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 390, height: 900 } })
  try {
    const page = await context.newPage()
    expect((await page.goto('/'))?.status()).toBe(200)
    await expect(page.getByRole('heading', { level: 1, name: /el arte de habitar la ciudad/i })).toBeVisible()
    const cards = page.getByRole('article')
    await expect(cards).toHaveCount(46)
    expect((await cards.allTextContents()).map(name => name.trim())).toEqual(lineup.map(artist => artist.name))
    await expect(cards.getByRole('link')).toHaveCount(0)
    await expect(cards.getByRole('button')).toHaveCount(0)
  } finally {
    await context.close()
  }
})

test('adds shared navigation without changing the static grid or loading client animation', async ({ page }) => {
  const scripts: string[] = []
  const errors: string[] = []
  page.on('request', request => { if (request.resourceType() === 'script') scripts.push(request.url()) })
  page.on('pageerror', error => errors.push(error.message))
  await page.goto('/')
  await expect(page.getByRole('article')).toHaveCount(46)
  await expect(page.getByRole('banner')).toHaveCount(1)
  await expect(page.getByRole('contentinfo')).toHaveCount(0)
  await expect(page.getByRole('navigation', { name: 'Navegación principal' })).toBeVisible()
  await expect(page.getByRole('dialog')).toHaveCount(0)
  await expect(page.getByRole('button', { name: 'Ediciones' })).toBeVisible()
  await expect(page.getByRole('combobox')).toHaveCount(0)
  const before = await page.getByRole('article').first().innerText()
  await page.getByRole('article').first().click()
  await expect(page).toHaveURL('/')
  expect(await page.getByRole('article').first().innerText()).toBe(before)
  expect(await page.evaluate(() => document.getAnimations().length)).toBe(0)
  expect(scripts.length).toBeLessThanOrEqual(1)
  await expect(page.locator('script[type="module"]')).toHaveCount(1)
  await expect(page.locator('astro-island')).toHaveCount(0)
  expect(errors).toEqual([])
})

test('keeps the chosen cadence, lower reserves and readable names at every breakpoint', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('article')).toHaveCount(46)
  for (const [width, columns] of [[1920, 10], [1440, 10], [1200, 10], [1199, 6], [768, 6], [767, 2], [390, 2], [320, 2]]) {
    await page.setViewportSize({ width, height: 900 })
    await page.evaluate(() => document.fonts.ready)
    const result = await page.getByRole('region', { name: 'Festival ARC: artistas y obras' }).evaluate(element => {
      const grid = element.getBoundingClientRect()
      const css = getComputedStyle(element)
      const columns = css.gridTemplateColumns.split(' ').length
      const cellWidth = grid.width / columns
      const cellHeight = parseFloat(css.gridTemplateRows)
      const box = (node: Element) => {
        const b = node.getBoundingClientRect()
        return { column: Math.round((b.x - grid.x) / cellWidth), row: Math.round((b.y - grid.y) / cellHeight), width: b.width / cellWidth, height: b.height / cellHeight }
      }
      const information = [...element.querySelectorAll('.information-slot')].filter(node => getComputedStyle(node).display !== 'none').map(box)
      const artists = [...element.querySelectorAll('article')].map(box)
      const overlap = (a: typeof artists[number], b: typeof artists[number]) =>
        a.column < b.column + b.width - .01 && a.column + a.width > b.column + .01
        && a.row < b.row + b.height - .01 && a.row + a.height > b.row + .01
      const problems: string[] = []
      artists.forEach((artist, index) => {
        const allowed = columns === 2 ? artist.row % 2 === 0 && artist.column === 0
          : (artist.row % 2 ? columns === 10 ? [2, 6] : [2] : columns === 10 ? [0, 4, 8] : [0, 4]).includes(artist.column)
        if (!allowed || Math.abs(artist.width - 2) > .01 || Math.abs(artist.height - 1) > .01) problems.push('artist span/cadence')
        if (information.some(block => overlap({ ...artist, height: 2 }, block))) problems.push('information overlap')
        if (artists.some((other, otherIndex) => index !== otherIndex && overlap({ ...artist, height: 2 }, other))) problems.push('lower reserve overlap')
      })
      for (const label of element.querySelectorAll('.artist-label')) {
        const panel = label.closest('.artist-panel')!.getBoundingClientRect()
        const b = label.getBoundingClientRect()
        if (b.left < panel.left - 1 || b.right > panel.right + 1 || b.top < panel.top - 1 || b.bottom > panel.bottom + 1) problems.push('name outside panel')
        if (parseFloat(getComputedStyle(label).fontSize) < 16) problems.push('small type')
      }
      return { columns, problems, horizontalOverflow: document.documentElement.scrollWidth > innerWidth }
    })
    expect(result.columns, width.toString()).toBe(columns)
    expect(result.horizontalOverflow, width.toString()).toBe(false)
    expect(result.problems, width.toString()).toEqual([])
  }
})

test('keeps single-word artist names on one line at the reference type size', async ({ page }) => {
  await page.setViewportSize({ width: 1920, height: 900 })
  await page.goto('/')
  await page.evaluate(() => document.fonts.ready)
  for (const name of ['Innundaremos', 'Jazztacuatico']) {
    const label = page.getByRole('article', { name, exact: true }).locator('.artist-label')
    const lines = await label.evaluate(element => {
      const range = document.createRange()
      range.selectNodeContents(element)
      return [...range.getClientRects()].filter(rect => rect.width > 0).length
    })
    expect(lines, name).toBe(1)
    await expect(label).toHaveCSS('font-size', '26px')
  }
})

test('loads the local headline and all decorative symbols without announcing them', async ({ page, request }) => {
  const external: string[] = []
  page.on('request', request => { if (new URL(request.url()).origin !== 'http://127.0.0.1:4173') external.push(request.url()) })
  await page.goto('/')
  await expect(page.getByRole('article')).toHaveCount(46)
  const source = await page.locator('h1 image').getAttribute('href')
  expect(source).toBeTruthy()
  expect((await request.get(source!)).status()).toBe(200)
  const symbols = await page.locator('symbol').evaluateAll(nodes => nodes.map(node => node.id))
  expect(symbols).toHaveLength(11)
  const references = await page.locator('.pattern-slot use').evaluateAll(nodes => nodes.map(node => node.getAttribute('href')!.slice(1)))
  expect(references.length).toBeGreaterThan(0)
  expect(references.every(id => symbols.includes(id))).toBe(true)
  for (const pattern of await page.locator('.pattern-slot svg').all()) {
    await expect(pattern).toHaveAttribute('aria-hidden', 'true')
    await expect(pattern).toHaveAttribute('focusable', 'false')
  }
  expect(external).toEqual([])
})
