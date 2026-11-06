import { expect, test } from '@playwright/test'

const demoLabel = 'Demostración: artista, actividades, horarios y espacios no confirmados.'
const artistName = 'Javiera Mena — ver ficha de demostración'

test('renders cover-only artist links in a balanced responsive square mosaic', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { level: 1, name: 'El Arte De Habitar La Ciudad' })).toBeVisible()
  await expect(page.getByText(demoLabel, { exact: true })).toBeVisible()
  const mosaic = page.getByRole('region', { name: 'Mosaico ARC 2026' })
  const links = mosaic.getByRole('link', { name: artistName, exact: true })
  expect(await links.count()).toBeGreaterThan(0)
  const order = await mosaic.evaluate(element => [...element.children].filter(child => child.matches('a, svg')).map(child => child.tagName.toLowerCase()))
  expect(order.length).toBeGreaterThan(1)
  expect.soft(order.every((tag, index) => tag === (index % 2 ? 'a' : 'svg')), 'strict pattern/artist DOM alternation').toBe(true)
  expect.soft(await mosaic.getByRole('heading', { level: 1 }).count(), 'title belongs inside the grid').toBe(1)
  await page.setViewportSize({ width: 1920, height: 900 })
  expect.soft((await mosaic.boundingBox())?.width, 'desktop content capped at 1440px').toBe(1440)

  for (const [width, columns] of [[1920, 6], [1440, 6], [1200, 6], [1199, 4], [768, 4], [767, 2], [320, 2]]) {
    await page.setViewportSize({ width, height: 900 })
    const geometry = await mosaic.evaluate((element) => {
      const bounds = (node: Element) => {
        const rect = node.getBoundingClientRect()
        return { x: rect.x, y: rect.y, right: rect.right, bottom: rect.bottom, width: rect.width, height: rect.height }
      }
      const heading = element.querySelector('h1')!
      const title = heading.parentElement!
      const caption = title.querySelector('p')!
      const contents = [title, heading, caption].map(node => ({
        ...bounds(node), scrollWidth: node.scrollWidth, clientWidth: node.clientWidth,
        scrollHeight: node.scrollHeight, clientHeight: node.clientHeight,
        overflowX: getComputedStyle(node).overflowX, overflowY: getComputedStyle(node).overflowY,
      }))
      const tiles = [...element.children].filter(tile => tile.matches('a, svg')).map(tile => ({
        ...bounds(tile), radius: getComputedStyle(tile).borderRadius,
      }))
      return {
        tiles, contents, grid: bounds(element), title: bounds(title), heading: bounds(heading),
        titleChildren: title.querySelectorAll('img, svg, a').length,
        fontSize: parseFloat(getComputedStyle(heading).fontSize),
        columns: getComputedStyle(element).gridTemplateColumns.split(' ').length,
        overflow: document.documentElement.scrollWidth > innerWidth,
      }
    })
    const contentWidth = width >= 1200 ? Math.min(width - 64, 1440) : width
    expect(geometry.overflow, `${width}px reflow`).toBe(false)
    expect(geometry.grid.width).toBeCloseTo(contentWidth, 1)
    expect(geometry.grid.x).toBeCloseTo((width - contentWidth) / 2, 1)
    expect(geometry.columns).toBe(columns)
    expect(geometry.title.x).toBe(geometry.grid.x)
    expect(geometry.title.y).toBe(geometry.grid.y)
    expect(geometry.title.width).toBeCloseTo(contentWidth * (width >= 768 ? 0.5 : 1), 1)
    expect(geometry.titleChildren).toBe(0)
    expect(geometry.fontSize).toBeGreaterThan(36)
    if (width >= 768) expect(geometry.title.height, `${width}px title must occupy one tile row`).toBeCloseTo(geometry.tiles[0].height, 1)
    else {
      expect(geometry.title.height).toBeGreaterThan(geometry.heading.height)
      expect(geometry.tiles[0].y).toBeCloseTo(geometry.title.bottom, 1)
    }
    for (const content of geometry.contents) {
      expect(content.x).toBeGreaterThanOrEqual(geometry.title.x)
      expect(content.right).toBeLessThanOrEqual(geometry.title.right)
      expect(content.bottom).toBeLessThanOrEqual(geometry.title.bottom)
      expect(content.scrollWidth).toBeLessThanOrEqual(content.clientWidth)
      // Tight display leading can extend glyphs beyond their own line box;
      // visible text must still fit inside the complete editorial block.
      expect(content.y + content.scrollHeight).toBeLessThanOrEqual(geometry.title.bottom + 1)
      expect(content.overflowX).toBe('visible')
      expect(content.overflowY).toBe('visible')
    }
    console.log(`${width}px: title ${geometry.title.width}×${geometry.title.height}, tile ${geometry.tiles[0].width}×${geometry.tiles[0].height}, heading ${geometry.fontSize}px`)
    geometry.tiles.forEach((tile, index) => {
      expect(tile.width).toBeCloseTo(contentWidth / columns, 1)
      expect(tile.height).toBeCloseTo(tile.width, 1)
      expect(tile.radius).toBe('0px')
      expect(tile.x).toBeGreaterThanOrEqual(geometry.grid.x)
      expect(tile.right).toBeLessThanOrEqual(geometry.grid.right + 0.1)
      expect(tile.y >= geometry.title.bottom - 0.1 || tile.x >= geometry.title.right - 0.1).toBe(true)
      if (index) {
        const previous = geometry.tiles[index - 1]
        expect(tile.y > previous.y || tile.x > previous.x).toBe(true)
        if (Math.abs(tile.y - previous.y) < 0.1) expect(tile.x).toBeCloseTo(previous.right, 1)
        else expect(tile.y).toBeCloseTo(previous.bottom, 1)
      }
    })
  }

  for (const link of await links.all()) {
    await expect(link).toHaveAttribute('href', '/artistas/javiera-mena/')
    expect(await link.innerText()).toBe('')
    expect(await link.locator('*').count()).toBe(1)
    const image = link.locator('img')
    await expect(image).toHaveCSS('object-fit', 'cover')
    await expect(image).toHaveAttribute('alt', '')
    expect(await image.evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth === 397 && img.naturalHeight === 349)).toBe(true)
    const imageBox = await image.boundingBox()
    const linkBox = await link.boundingBox()
    expect(imageBox).toEqual(linkBox)
  }
  for (const motif of await mosaic.locator('svg').all()) {
    await expect(motif).toHaveAttribute('aria-hidden', 'true')
    await expect(motif).toHaveAttribute('focusable', 'false')
    await expect(motif).not.toHaveCSS('cursor', 'pointer')
  }
  await links.first().focus()
  await expect(links.first()).toBeFocused()
  await expect(links.first()).toHaveCSS('outline-style', 'solid')
  await links.first().press('Enter')
  await expect(page).toHaveURL(/\/artistas\/javiera-mena\/$/)
})

test('renders actual Anton 400 headings and local-only active-edition fonts', async ({ page, context }) => {
  const fontRequests: string[] = []
  const externalRequests: string[] = []
  page.on('request', request => {
    if (new URL(request.url()).origin !== 'http://127.0.0.1:4173') externalRequests.push(request.url())
    if (request.resourceType() === 'font') fontRequests.push(request.url())
  })
  for (const path of ['/', '/artistas/javiera-mena/']) {
    fontRequests.length = 0
    await page.goto(path)
    await page.evaluate(() => document.fonts.ready)
    const session = await context.newCDPSession(page)
    try {
      await session.send('DOM.enable')
      await session.send('CSS.enable')
      const { root } = await session.send('DOM.getDocument')
      const { nodeId } = await session.send('DOM.querySelector', { nodeId: root.nodeId, selector: 'h1' })
      const { fonts } = await session.send('CSS.getPlatformFontsForNode', { nodeId })
      expect(fonts.some(font => font.familyName === 'Anton' && font.isCustomFont && font.glyphCount > 0), JSON.stringify(fonts)).toBe(true)
      await expect(page.getByRole('heading', { level: 1 })).toHaveCSS('font-weight', '400')
      const paragraph = await session.send('DOM.querySelector', { nodeId: root.nodeId, selector: 'main p' })
      const reading = await session.send('CSS.getPlatformFontsForNode', { nodeId: paragraph.nodeId })
      expect(reading.fonts.some(font => font.familyName === 'Poppins' && font.isCustomFont && font.glyphCount > 0), JSON.stringify(reading.fonts)).toBe(true)
      console.log(`${path} rendered heading fonts: ${JSON.stringify(fonts)}; reading fonts: ${JSON.stringify(reading.fonts)}`)
    } finally {
      await session.detach()
    }
    expect(fontRequests.length).toBeGreaterThan(0)
    fontRequests.forEach(url => expect(new URL(url).pathname).toMatch(/^\/_astro\/fonts\//))
    console.log(`${path} local font requests: ${JSON.stringify(fontRequests)}`)
  }
  expect(externalRequests).toEqual([])
})

test('direct artist route works without JavaScript and exposes all ordered demo activities', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 320, height: 900 } })
  try {
    const page = await context.newPage()
    expect((await page.goto('/artistas/javiera-mena/'))?.status()).toBe(200)
    await expect(page.getByRole('heading', { level: 1, name: 'Javiera Mena' })).toBeVisible()
    await expect(page.getByText(demoLabel, { exact: true })).toBeVisible()
    await expect(page.getByRole('img', { name: 'Pieza de referencia de Javiera Mena' })).toBeVisible()
    const activities = page.getByRole('list', { name: 'Actividades de demostración' }).getByRole('listitem')
    await expect(activities).toHaveCount(2)
    await expect(activities.nth(0)).toContainText('Presentación de ejemplo')
    await expect(activities.nth(0)).toContainText('miércoles, 28 de octubre de 2026, 18:00')
    await expect(activities.nth(1)).toContainText('Encuentro de ejemplo')
    await expect(activities.nth(1)).toContainText('jueves, 29 de octubre de 2026, 12:00')
    for (const activity of await activities.all()) {
      await expect(activity).toContainText('Espacio de ejemplo (no confirmado)')
      await expect(activity).toContainText('La Serena')
      await expect(activity).toBeVisible()
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)).toBe(false)
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', 'https://festivalarc.com/artistas/javiera-mena')
    await expect(page).toHaveTitle('Javiera Mena | Festival ARC 2026 — Demostración')
    await page.getByRole('link', { name: 'Volver a la portada' }).click()
    await expect(page).toHaveURL('/')
  } finally {
    await context.close()
  }
})

test('preserves root indexation, editions navigation, assets and normal-flow footer', async ({ page, request }) => {
  await page.goto('/')
  await expect(page.locator('meta[name="robots"]')).toHaveCount(0)
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', 'https://festivalarc.com')
  await expect(page).toHaveTitle('Festival ARC | Selección Convocatoria Regional 2026')
  await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', 'Selección Convocatoria Regional del Festival ARC 2026. Revisa la resolución oficial.')
  await page.getByRole('link', { name: 'Ir al inicio' }).focus()
  await page.keyboard.press('Tab')
  const navigation = page.getByRole('navigation', { name: 'Ultimas ediciones' })
  await expect(navigation.getByRole('link', { name: 'Festival ARC 2024', exact: true })).toBeVisible()
  await navigation.getByRole('link', { name: 'Festival ARC 2024', exact: true }).click()
  await expect(page).toHaveURL('/ediciones/2024/')
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', 'https://festivalarc.com/ediciones/2024/')
  await page.goto('/')
  for (const src of await page.locator('img').evaluateAll((images) => images.map(image => image.getAttribute('src')!))) {
    expect((await request.get(src)).status()).toBe(200)
  }
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
  expect((await page.getByRole('banner').boundingBox())?.y).toBe(0)
  await expect(page.getByRole('contentinfo')).toHaveCSS('position', 'relative')
  expect(await page.getByRole('contentinfo').evaluate(element => element.getBoundingClientRect().top >= document.querySelector('main')!.getBoundingClientRect().bottom)).toBe(true)
})
