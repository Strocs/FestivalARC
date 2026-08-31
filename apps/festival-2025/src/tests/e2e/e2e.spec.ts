import { expect, test } from '@playwright/test'

const publicationBase = process.env.PUBLICATION_BASE ?? '/'
const publicPath = (path: string) =>
  publicationBase === '/' ? path : `${publicationBase}${path}`

const screenshotPath = process.env.SLICE6_SCREENSHOT
const expectedCanonical =
  publicationBase === '/'
    ? 'https://festivalarc.com'
    : `https://festivalarc.com${publicationBase}`
const expectedSitemap = 'https://festivalarc.com/sitemap-index.xml'

test('renders the publication context and base-aware metadata', async ({ page }) => {
  await page.goto(publicPath('/'))

  await expect(page.locator('main[data-page="main"]')).toBeVisible()
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    'href',
    expectedCanonical,
  )
  await expect(page.locator('meta[property="og:url"]')).toHaveAttribute(
    'content',
    expectedCanonical,
  )
  await expect(page.locator('link[rel="icon"]')).toHaveAttribute(
    'href',
    publicPath('/ARC25.png'),
  )
  await expect(page.locator('link[rel="sitemap"]')).toHaveAttribute(
    'href',
    expectedSitemap,
  )
})

test('opens the nested program route in the publication context', async ({ page }) => {
  await page.goto(publicPath('/programacion'))

  await expect(page.locator('main[data-page="programacion"]')).toBeVisible()
  await expect(page.locator('a[href$="/programacion"]').first()).toHaveAttribute(
    'href',
    publicPath('/programacion'),
  )
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    'href',
    `${expectedCanonical}/programacion`,
  )

  const nextDay = page.getByRole('button', { name: 'Día siguiente' })
  await nextDay.click()
  await expect(page.getByText('Domingo').first()).toBeVisible()

  if (screenshotPath) await page.screenshot({ path: screenshotPath, fullPage: true })
})
