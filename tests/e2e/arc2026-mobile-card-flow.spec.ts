import { readFile } from 'node:fs/promises'
import { extname, resolve, sep } from 'node:path'
import { expect, test, type Page } from '@playwright/test'

const expansion = `
  [data-artist-meta] { word-spacing: 24px; letter-spacing: 5px; }
`

async function openPoster(page: Page) {
  const dist = process.env.ARC_MOBILE_FLOW_DIST
  if (dist) {
    // Optional socket-free run against a local Astro build.
    const root = resolve(dist)
    const types: Record<string, string> = {
      '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript',
      '.svg': 'image/svg+xml', '.woff2': 'font/woff2',
    }
    await page.route('**/*', async (route) => {
      const url = new URL(route.request().url())
      if (url.origin !== 'http://arc-flow.test') return route.abort()
      const path = resolve(root, `.${url.pathname}${url.pathname.endsWith('/') ? 'index.html' : ''}`)
      if (!path.startsWith(`${root}${sep}`)) return route.abort()
      const body = await readFile(path).catch(() => undefined)
      return body ? route.fulfill({ body, contentType: types[extname(path)] }) : route.fulfill({ status: 404 })
    })
  }
  await page.goto(dist ? 'http://arc-flow.test/' : '/')
  await page.evaluate(() => document.fonts.ready)
  await expect(page.locator('[data-poster-simple-toggle]')).toBeEnabled()
}

async function geometry(page: Page) {
  return page.locator('[data-poster-grid]').evaluate((grid) => {
    const cards = Array.from(grid.querySelectorAll<HTMLElement>('[data-poster-artist]')).filter(node => node.getClientRects().length)
    const top = grid.getBoundingClientRect().top
    return {
      rootFont: getComputedStyle(document.documentElement).fontSize,
      width: window.innerWidth,
      height: grid.getBoundingClientRect().height,
      rows: getComputedStyle(grid).gridTemplateRows,
      cards: cards.map(card => {
        const link = card.querySelector('[data-artist-card-link]')!
        const content = card.querySelector('[data-artist-content]')!
        const name = card.querySelector('[data-artist-name]')!
        const meta = card.querySelector('[data-artist-meta]')!
        const box = card.getBoundingClientRect()
        const metaBox = meta.getBoundingClientRect()
        return {
          id: card.dataset.posterArtist,
          top: box.top - top,
          height: box.height,
          nameFont: getComputedStyle(name).fontSize,
          nameTop: name.getBoundingClientRect().top - box.top,
          metaFont: getComputedStyle(meta).fontSize,
          metaHeight: metaBox.height,
          metaBottom: metaBox.bottom - box.bottom,
          linkPosition: getComputedStyle(link).position,
          contentPosition: getComputedStyle(content).position,
        }
      }),
    }
  })
}

for (const width of [280, 320, 390, 412, 767]) {
  for (const simple of [false, true]) {
    test(`mobile metadata contributes to ${simple ? 'simple' : 'poster'} rows at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 })
      await page.emulateMedia({ reducedMotion: 'reduce' })
      await openPoster(page)
      const grid = page.locator('[data-poster-grid]')
      if (simple) {
        await page.locator('[data-poster-simple-toggle]').click()
        await expect(grid).toHaveAttribute('data-poster-simple', '')
      }
      const base = await geometry(page)
      expect(base.cards.length).toBeGreaterThan(1)
      const style = await page.addStyleTag({ content: expansion })
      const expanded = await geometry(page)
      expect(expanded.width).toBe(base.width)
      expect(expanded.rootFont).toBe(base.rootFont)
      expect(expanded.cards.map(card => card.metaFont)).toEqual(base.cards.map(card => card.metaFont))
      expect(expanded.height).toBeGreaterThan(base.height)
      for (const [index, card] of expanded.cards.entries()) {
        expect(card.nameFont, card.id).toBe(base.cards[index].nameFont)
        expect(card.nameTop, card.id).toBeCloseTo(base.cards[index].nameTop, 1)
        expect(card.linkPosition, card.id).toBe('relative')
        expect(card.contentPosition, card.id).toBe('relative')
        expect(card.metaBottom, card.id).toBeLessThanOrEqual(0)
        if (card.metaHeight > base.cards[index].metaHeight) {
          expect(card.height, card.id).toBeGreaterThan(base.cards[index].height)
        }
      }
      await style.evaluate(node => node.remove())
      await expect.poll(() => geometry(page)).toEqual(base)
      if (simple) {
        await page.locator('[data-poster-simple-toggle]').click()
        await page.locator('[data-poster-simple-toggle]').click()
        await expect.poll(() => geometry(page)).toEqual(base)
      }
    })
  }
}

test('narrow poster loads and resets with doubled root text without shrinking artist names', async ({ page }) => {
  await page.setViewportSize({ width: 280, height: 900 })
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await openPoster(page)
  const base = await geometry(page)
  await page.addInitScript(() => {
    const setRoot = () => {
      if (!document.documentElement) return
      document.documentElement.style.fontSize = '32px'
      observer.disconnect()
    }
    const observer = new MutationObserver(setRoot)
    observer.observe(document, { childList: true })
    setRoot()
  })
  await page.reload()
  await page.evaluate(() => document.fonts.ready)
  const loaded = await geometry(page)
  expect(loaded.rootFont).toBe('32px')
  expect(loaded.height).toBeGreaterThan(base.height)
  expect(loaded.cards.map(card => card.nameFont)).toEqual(base.cards.map(card => card.nameFont))
  expect(loaded.cards.every(card => card.metaBottom <= 0)).toBe(true)
  await page.evaluate(() => { document.documentElement.style.removeProperty('font-size') })
  await expect.poll(() => geometry(page)).toEqual(base)
})
