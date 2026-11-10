import { expect, test } from '@playwright/test'

const demoDescription = 'Demostración: artista, actividades, horarios y espacios no confirmados.'

test('preserves active document metadata and local font delivery', async ({ page }) => {
  const external: string[] = []
  const fonts: string[] = []
  page.on('request', request => {
    const url = new URL(request.url())
    if (url.origin !== 'http://127.0.0.1:4173') external.push(request.url())
    if (request.resourceType() === 'font') fonts.push(url.pathname)
  })
  for (const [path, title, description, canonical] of [
    ['/', 'Festival ARC | Selección Convocatoria Regional 2026', 'Selección Convocatoria Regional del Festival ARC 2026. Revisa la resolución oficial.', 'https://festivalarc.com'],
    ['/artistas/javiera-mena/', 'Javiera Mena | Festival ARC 2026 — Demostración', demoDescription, 'https://festivalarc.com/artistas/javiera-mena'],
  ]) {
    await page.goto(path)
    await page.evaluate(() => document.fonts.ready)
    await expect(page).toHaveTitle(title)
    await expect(page.locator('html')).toHaveAttribute('lang', 'es')
    await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', description)
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', canonical)
    await expect(page.locator('meta[property="og:url"]')).toHaveAttribute('content', canonical)
    await expect(page.locator('meta[name="robots"]')).toHaveCount(0)
  }
  expect(fonts.length).toBeGreaterThan(0)
  expect(fonts.every(path => path.startsWith('/_astro/fonts/'))).toBe(true)
  expect(external).toEqual([])
})

test('retains the existing detail route and its normal header/footer without JavaScript', async ({ browser, request }) => {
  const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 320, height: 900 } })
  try {
    const page = await context.newPage()
    expect((await page.goto('/artistas/javiera-mena/'))?.status()).toBe(200)
    await expect(page.getByRole('heading', { level: 1, name: 'Javiera Mena' })).toBeVisible()
    await expect(page.getByRole('banner')).toBeVisible()
    await expect(page.getByRole('contentinfo')).toBeVisible()
    await expect(page.getByRole('navigation', { name: 'Navegación principal', includeHidden: true })).toBeAttached()
    await expect(page.getByRole('link', { name: 'Volver a la portada' })).toHaveAttribute('href', '/')
    await expect(page.getByText(demoDescription, { exact: true })).toBeVisible()
    await expect(page.getByRole('list', { name: 'Actividades de demostración' }).getByRole('listitem')).toHaveCount(2)
    expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)).toBe(false)
    for (const src of await page.locator('img').evaluateAll(images => images.map(image => image.getAttribute('src')!))) {
      expect((await request.get(src)).status()).toBe(200)
    }
  } finally {
    await context.close()
  }
})
