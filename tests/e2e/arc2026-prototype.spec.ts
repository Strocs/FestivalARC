import { expect, test } from '@playwright/test'

const demoLabel = 'Demostración: artista, actividades, horarios y espacios no confirmados.'

test('retains actual Anton 400 and local fonts on the existing detail route', async ({ page, context }) => {
  const fontRequests: string[] = []
  const externalRequests: string[] = []
  page.on('request', request => {
    if (new URL(request.url()).origin !== 'http://127.0.0.1:4173') externalRequests.push(request.url())
    if (request.resourceType() === 'font') fontRequests.push(request.url())
  })
  for (const path of ['/artistas/javiera-mena/']) {
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
