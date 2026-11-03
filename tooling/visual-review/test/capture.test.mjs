import test from 'node:test'
import assert from 'node:assert/strict'
import { capturePages } from '../src/capture.mjs'
import { mkdtemp, readdir } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const devices = [
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'mobile', width: 390, height: 844 },
]

function fakeLauncher(browserName, records) {
  return {
    async launch() {
      records.push({ type: 'launch', browserName })
      return {
        async newContext(options) {
          records.push({ type: 'context', browserName, options })
          return {
            async newPage() {
              return {
                async goto(url, options) {
                  records.push({ type: 'goto', browserName, url, options })
                },
                async screenshot(options) {
                  records.push({ type: 'screenshot', browserName, options })
                },
                async close() {
                  records.push({ type: 'page-close', browserName })
                },
              }
            },
            async close() {
              records.push({ type: 'context-close', browserName })
            },
          }
        },
        async close() {
          records.push({ type: 'browser-close', browserName })
        },
      }
    },
  }
}

test('captures every route at every device and browser with fullPage enabled', async () => {
  const output = await mkdtemp(join(tmpdir(), 'visual-review-output-'))
  const records = []
  const pages = [
    { route: '/', filePath: '/build/index.html' },
    { route: '/agenda/', filePath: '/build/agenda/index.html' },
  ]

  await capturePages({
    origin: 'http://127.0.0.1:4173',
    pages,
    outputDirectory: output,
    devices,
    browsers: {
      chromium: fakeLauncher('chromium', records),
      firefox: fakeLauncher('firefox', records),
      webkit: fakeLauncher('webkit', records),
    },
  })

  const screenshots = records.filter((record) => record.type === 'screenshot')
  assert.equal(screenshots.length, 18)
  assert.equal(new Set(screenshots.map(({ options }) => options.path)).size, 18)
  assert.ok(screenshots.every(({ options }) => options.fullPage === true))
  assert.ok(records.filter((record) => record.type === 'context').every(({ options }) => (
    devices.some((device) => (
      options.viewport.width === device.width && options.viewport.height === device.height
    ))
  )))
  assert.deepEqual(
    records.filter((record) => record.type === 'goto').slice(0, 2).map((record) => record.url),
    ['http://127.0.0.1:4173/', 'http://127.0.0.1:4173/agenda/'],
  )
  assert.equal(records.filter((record) => record.type === 'browser-close').length, 3)
  assert.ok(screenshots.some(({ options }) => options.path === join(output, 'home', 'desktop-chromium.png')))
  assert.ok(screenshots.some(({ options }) => options.path === join(output, 'agenda', 'desktop-chromium.png')))
  assert.equal((await readdir(output, { recursive: true })).filter((file) => file.endsWith('.png')).length, 0)
})

test('captures only the selected browser while retaining viewport coverage', async () => {
  const output = await mkdtemp(join(tmpdir(), 'visual-review-browser-'))
  const records = []

  await capturePages({
    origin: 'http://127.0.0.1:4173',
    pages: [{ route: '/', filePath: '/build/index.html' }],
    outputDirectory: output,
    devices,
    browserNames: ['chromium'],
    browsers: {
      chromium: fakeLauncher('chromium', records),
      firefox: fakeLauncher('firefox', records),
      webkit: fakeLauncher('webkit', records),
    },
  })

  assert.equal(records.filter((record) => record.type === 'screenshot').length, 3)
  assert.deepEqual(
    [...new Set(records.filter((record) => record.type === 'launch').map(({ browserName }) => browserName))],
    ['chromium'],
  )
})

test('prefixes archive routes with the configured publication base', async () => {
  const output = await mkdtemp(join(tmpdir(), 'visual-review-archive-'))
  const records = []

  await capturePages({
    origin: 'http://127.0.0.1:4173',
    base: '/ediciones/2024/',
    pages: [{ route: '/agenda/', filePath: '/build/agenda/index.html' }],
    outputDirectory: output,
    devices: [devices[0]],
    browsers: {
      chromium: fakeLauncher('chromium', records),
      firefox: fakeLauncher('firefox', records),
      webkit: fakeLauncher('webkit', records),
    },
  })

  assert.deepEqual(
    records.filter((record) => record.type === 'goto').map((record) => record.url),
    [
      'http://127.0.0.1:4173/ediciones/2024/agenda/',
      'http://127.0.0.1:4173/ediciones/2024/agenda/',
      'http://127.0.0.1:4173/ediciones/2024/agenda/',
    ],
  )
})
