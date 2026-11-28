import { readFile } from 'node:fs/promises'
import { extname, resolve, sep } from 'node:path'
import { expect, test, type Page } from '@playwright/test'

const expansion = `
  [data-artist-meta] { word-spacing: 24px; letter-spacing: 5px; }
`
const affectedArtists = ['polter', 'lobas']
const measuredNames: Record<number, string[]> = { 230: ['dulce-y-agraz', 'gepe'], 360: ['yaru'], 575: ['lobas'] }

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
        const nameBox = card.querySelector('[data-artist-name-box]')!
        const meta = card.querySelector('[data-artist-meta]')!
        const box = card.getBoundingClientRect()
        const title = name.getBoundingClientRect()
        const titleBox = nameBox.getBoundingClientRect()
        const titleStyle = getComputedStyle(nameBox)
        const lines = new Map<number, { left: number, right: number }>()
        const text = document.createTreeWalker(name, NodeFilter.SHOW_TEXT)
        const range = document.createRange()
        for (let node = text.nextNode(); node; node = text.nextNode()) {
          range.selectNodeContents(node)
          for (const rect of range.getClientRects()) {
            const line = lines.get(rect.top)
            lines.set(rect.top, {
              left: Math.min(line?.left ?? Infinity, rect.left),
              right: Math.max(line?.right ?? -Infinity, rect.right),
            })
          }
        }
        const widestLine = Math.max(0, ...Array.from(lines.values(), ({ left, right }) => right - left))
        const usableWidth = titleBox.width - parseFloat(titleStyle.paddingLeft) - parseFloat(titleStyle.paddingRight)
        const metaBox = meta.getBoundingClientRect()
        return {
          id: card.dataset.posterArtist,
          top: box.top - top,
          height: box.height,
          cardWidth: box.width,
          contentHeight: content.getBoundingClientRect().height,
          nameFont: getComputedStyle(name).fontSize,
          nameBreaks: [...name.querySelectorAll('br')].filter(br => getComputedStyle(br).display !== 'none').map(br => br.dataset.break),
          nameHeight: title.height,
          nameBoxHeight: titleBox.height,
          nameBoxWidth: titleBox.width,
          nameFitHeight: titleBox.height - parseFloat(titleStyle.paddingTop) - parseFloat(titleStyle.paddingBottom),
          widestLine,
          usableWidth,
          nameTop: title.top - box.top,
          nameOverhang: Math.max(Math.max(box.left, titleBox.left) - title.left, title.right - Math.min(box.right, titleBox.right)),
          nameToMeta: metaBox.top - title.bottom,
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

async function layoutGeometry(page: Page) {
  const { cards, ...grid } = await geometry(page)
  return { ...grid, cards: cards.map(({ widestLine, nameOverhang, ...card }) => card) }
}

for (const width of [230, 280, 320, 360, 390, 412, 575, 767]) {
  for (const simple of [false, true]) {
    test(`mobile metadata contributes to ${simple ? 'simple' : 'poster'} rows at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: width === 360 ? 780 : width === 575 ? 767 : 900 })
      await page.emulateMedia({ reducedMotion: 'reduce' })
      await openPoster(page)
      const grid = page.locator('[data-poster-grid]')
      if (simple) {
        await page.locator('[data-poster-simple-toggle]').click()
        await expect(grid).toHaveAttribute('data-poster-simple', '')
      }
      const base = await geometry(page)
      expect(base.cards.length).toBeGreaterThan(1)
      for (const id of measuredNames[width] ?? []) {
        const card = base.cards.find(card => card.id === id)!
        console.info(`${simple ? 'simple' : 'poster'} ${width}px ${id}: card ${card.cardWidth}px, usable ${card.usableWidth}px, line ${card.widestLine}px, font ${card.nameFont}, metadata gap ${card.nameToMeta}px`)
        expect.soft(card.usableWidth / card.cardWidth, `${id} usable card width`).toBeGreaterThan(0.9)
        if (id === 'dulce-y-agraz' || id === 'yaru') {
          expect.soft(card.widestLine / card.cardWidth, `${id} fitted line`).toBeGreaterThan(0.88)
        } else {
          const [min, max] = id === 'gepe' ? [28, 36] : [65, 85]
          expect.soft(parseFloat(card.nameFont), `${id} responsive cap`).toBeGreaterThanOrEqual(min)
          expect.soft(parseFloat(card.nameFont), `${id} responsive cap`).toBeLessThanOrEqual(max)
        }
        expect(card.nameBreaks, `${id} composition`).toEqual(id === 'yaru' ? ['3'] : [])
      }
      if (width === 360 || width === 575) {
        for (const id of ['yaru', 'nino-cohete', 'shicris']) {
          const card = base.cards.find(card => card.id === id)!
          const utilization = card.widestLine / card.usableWidth
          console.info(`${simple ? 'simple' : 'poster'} ${base.width}px ${id}: name box ${card.nameBoxWidth} × ${card.nameBoxHeight}px (${card.nameFitHeight}px content height); ${card.nameFont}; breaks [${card.nameBreaks.join(', ')}]; widest line ${card.widestLine}px / ${card.usableWidth}px usable (${(100 * utilization).toFixed(2)}%)`)
          if (width === 360 && id === 'yaru') expect.soft(utilization, id).toBeGreaterThan(0.95)
        }
      }
      if ([230, 280, 360, 390, 575].includes(width)) {
        for (const id of affectedArtists) {
          const artist = base.cards.find(card => card.id === id)
          expect(artist, id).toBeDefined()
          expect.soft(parseFloat(artist!.nameFont), id).toBeGreaterThan(0)
        }
        expect(new Set(base.cards.map(card => card.nameFont)).size).toBeGreaterThan(1)
        expect(base.cards.some(card => card.nameBreaks.length > 0)).toBe(true)
        for (const card of base.cards) {
          expect.soft(parseFloat(card.nameFont), card.id).toBeGreaterThan(0)
          expect.soft(card.nameHeight, card.id).toBeGreaterThan(0)
          expect.soft(card.nameOverhang, card.id).toBeLessThanOrEqual(0.5)
          expect.soft(card.nameToMeta, `${card.id} metadata gap`).toBeGreaterThanOrEqual(6)
        }
      }
      const beforeExpansion = await layoutGeometry(page)
      // At the widest mobile size, wrapping alone can fit inside the poster's existing minimum tracks.
      const style = await page.addStyleTag({ content: expansion + (width === 767
        ? '[data-artist-meta] { line-height: 160px; }'
        : '') })
      await page.evaluate(() => window.dispatchEvent(new Event('resize')))
      const expanded = await geometry(page)
      expect(expanded.width).toBe(base.width)
      expect(expanded.rootFont).toBe(base.rootFont)
      expect(expanded.cards.map(card => card.metaFont)).toEqual(base.cards.map(card => card.metaFont))
      expect(expanded.height).toBeGreaterThan(base.height)
      expect(expanded.cards.some((card, index) => card.metaHeight > base.cards[index].metaHeight &&
        card.contentHeight > base.cards[index].height && card.height > base.cards[index].height)).toBe(true)
      for (const [index, card] of expanded.cards.entries()) {
        const original = base.cards[index]
        expect(card.nameFont, card.id).toBe(original.nameFont)
        expect(card.nameBreaks, card.id).toEqual(original.nameBreaks)
        expect(card.nameHeight, card.id).toBe(original.nameHeight)
        expect(card.usableWidth, card.id).toBe(original.usableWidth)
        expect(card.nameToMeta, card.id).toBeCloseTo(original.nameToMeta, 1)
        expect(card.nameBoxHeight, card.id).toBe(original.nameBoxHeight)
        expect(card.nameTop, card.id).toBeCloseTo(original.nameTop, 1)
        expect(card.linkPosition, card.id).toBe('relative')
        expect(card.contentPosition, card.id).toBe('relative')
        expect(card.metaBottom, card.id).toBeLessThanOrEqual(0)
        expect(card.contentHeight - original.contentHeight, card.id).toBeCloseTo(card.metaHeight - original.metaHeight, 1)
        // A short title can leave room inside the existing poster track minimum.
        // Metadata still increases intrinsic content height; the card grows when that reserve runs out.
        expect(card.height, card.id).toBeGreaterThanOrEqual(Math.max(original.height, card.contentHeight) - 0.05)
      }
      await style.evaluate(node => node.remove())
      await expect.poll(() => layoutGeometry(page)).toEqual(beforeExpansion)
      if (simple) {
        await page.locator('[data-poster-simple-toggle]').click()
        await page.locator('[data-poster-simple-toggle]').click()
        await expect.poll(() => layoutGeometry(page)).toEqual(beforeExpansion)
      }
      if (width === 230) {
        await page.setViewportSize({ width: 390, height: 900 })
        for (const id of affectedArtists) {
          const narrow = base.cards.find(card => card.id === id)!
          await expect.poll(async () => parseFloat((await geometry(page)).cards.find(card => card.id === id)!.nameFont))
            .toBeGreaterThan(parseFloat(narrow.nameFont))
        }
      }
    })
  }
}

test('narrow poster loads and resets with doubled root text without shrinking artist names', async ({ page }) => {
  await page.setViewportSize({ width: 280, height: 900 })
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await openPoster(page)
  const base = await layoutGeometry(page)
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
  const titles = (cards: typeof base.cards) => cards.map(({ nameFont, nameBreaks, nameHeight, nameBoxHeight, usableWidth }) => ({ nameFont, nameBreaks, nameHeight, nameBoxHeight, usableWidth }))
  expect(loaded.width).toBe(base.width)
  for (const id of ['javier-barria', 'removernos-a-cielo-abierto', 'fernando-milagros']) {
    const original = base.cards.find(card => card.id === id)!
    const zoomed = loaded.cards.find(card => card.id === id)!
    expect.soft(zoomed.nameFont, `${id} font at fixed-width 200% text`).toBe(original.nameFont)
    expect(parseFloat(zoomed.metaFont), `${id} metadata at 200% text`).toBeGreaterThan(parseFloat(original.metaFont))
  }
  expect(titles(loaded.cards)).toEqual(titles(base.cards))
  expect(loaded.cards.every(card => card.metaBottom <= 0)).toBe(true)
  await page.evaluate(() => { document.documentElement.style.removeProperty('font-size') })
  await expect.poll(() => layoutGeometry(page)).toEqual(base)
})
