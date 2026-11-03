import { mkdir } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { sanitizeRoute } from './paths.mjs'

export const VIEWPORTS = Object.freeze([
  Object.freeze({ name: 'desktop', width: 1440, height: 900 }),
  Object.freeze({ name: 'tablet', width: 768, height: 1024 }),
  Object.freeze({ name: 'mobile', width: 390, height: 844 }),
])

export const BROWSER_NAMES = Object.freeze(['chromium', 'firefox', 'webkit'])

export async function capturePages({
  origin,
  base = '/',
  pages,
  outputDirectory,
  devices = VIEWPORTS,
  browserNames = BROWSER_NAMES,
  browsers,
}) {
  for (const browserName of browserNames) {
    const browser = await browsers[browserName].launch()
    try {
      for (const device of devices) {
        const context = await browser.newContext({
          viewport: { width: device.width, height: device.height },
        })
        try {
          for (const page of pages) {
            const screenshotPath = join(
              outputDirectory,
              sanitizeRoute(page.route),
              `${device.name}-${browserName}.png`,
            )
            await mkdir(dirname(screenshotPath), { recursive: true })
            const browserPage = await context.newPage()
            try {
              await browserPage.goto(joinUrl(origin, base, page.route), { waitUntil: 'load' })
              await browserPage.screenshot({ path: screenshotPath, fullPage: true })
            } finally {
              await browserPage.close()
            }
          }
        } finally {
          await context.close()
        }
      }
    } finally {
      await browser.close()
    }
  }
}

function joinUrl(origin, base, route) {
  const originUrl = new URL(origin)
  const basePath = `/${base.replace(/^\/+|\/+$/g, '')}`
  const routePath = route.replace(/^\/+/, '')
  const path = `${basePath === '/' ? '' : basePath}/${routePath}`
  originUrl.pathname = path || '/'
  return originUrl.toString()
}
