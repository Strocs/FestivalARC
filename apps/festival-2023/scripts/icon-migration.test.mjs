import test from 'node:test'
import assert from 'node:assert/strict'
import { mkdtempSync, readFileSync, readdirSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { withPublicationBase } from '../src/utils/publication-path.js'

const app = fileURLToPath(new URL('../', import.meta.url))
const base = '/2023'
const withBase = (path) => withPublicationBase(path, base)

function icons(html, name) {
  return [...html.matchAll(/<svg\b[^>]*>[\s\S]*?<\/svg>/g)]
    .map(([svg]) => svg)
    .filter((svg) => svg.includes(`data-icon="${name}"`))
}

function assertIcon(html, name, classes = [], document = html) {
  const matches = icons(html, name)
  assert.ok(matches.length, `Missing rendered SVG: ${name}`)
  for (const svg of matches) {
    assert.match(svg, /viewBox="0 0 24 24"/)
    // v0 omitted dimensions; v1's 1em defaults must not constrain h-only/w-only classes.
    assert.doesNotMatch(svg.slice(0, svg.indexOf('>')), /\s(?:width|height)=/)
    assert.match(svg, /<(?:path|use)\b/)
    const reference = svg.match(/<use href="#([^"]+)"/)
    if (reference) {
      assert.ok(document.includes(`<symbol id="${reference[1]}"`), `Missing SVG symbol: ${name}`)
      assert.match(document.slice(document.indexOf(`<symbol id="${reference[1]}"`)).split('</symbol>')[0], /<path\b[^>]*\sd="[^"]+"/)
    }
    assert.doesNotMatch(svg, /(?:href|src)="https?:/)
  }
  assert.ok(matches.some((svg) => classes.every((name) =>
    new RegExp(`class="[^"]*\\b${name}\\b`).test(svg))), `Missing classes for ${name}`)
}

function assertLinkIcon(html, url, label, name) {
  const anchors = [...html.matchAll(/<a\b[^>]*>[\s\S]*?<\/a>/g)].map(([a]) => a)
  const anchor = anchors.find((a) => a.replaceAll('&amp;', '&').includes(`href="${url}"`) && a.includes(`aria-label="${label}"`))
  assert.ok(anchor, `Missing ${label} link: ${url}`)
  assertIcon(anchor, name, [], html)
}

test('builds archive SVGs and dynamic links without the retired icon API', { timeout: 180_000 }, async (t) => {
  const scratch = mkdtempSync(join(tmpdir(), 'arc2023-icons-'))
  t.after(() => rmSync(scratch, { recursive: true, force: true }))
  // Deny only the retired service, not registry/package-manager or unrelated hosts.
  const denial = `
    const original = globalThis.fetch
    globalThis.fetch = (input, ...args) => {
      const url = new URL(typeof input === 'string' || input instanceof URL ? input : input.url)
      if (url.hostname === 'api.astroicon.dev') throw new Error('Retired icon API denied')
      return original(input, ...args)
    }
  `
  const runner = `
    import { build } from 'astro'
    await build({
      outDir: ${JSON.stringify(join(scratch, 'dist'))},
      cacheDir: ${JSON.stringify(join(scratch, 'cache'))},
      vite: { cacheDir: ${JSON.stringify(join(scratch, 'vite'))} },
    })
  `
  const result = spawnSync(process.execPath, ['--input-type=module', '--eval', runner], {
    cwd: app,
    encoding: 'utf8',
    timeout: 150_000,
    maxBuffer: 10 * 1024 * 1024,
    env: {
      ...process.env,
      NODE_ENV: 'production',
      PUBLICATION_BASE: base,
      DISTRIBUTION_OUTPUT_DIR: join(scratch, 'dist'),
      NODE_OPTIONS: `${process.env.NODE_OPTIONS || ''} --import=data:text/javascript,${encodeURIComponent(denial)}`,
    },
  })
  assert.equal(result.error, undefined)
  assert.equal(result.status, 0, `${result.stdout}\n${result.stderr}`)
  t.diagnostic(result.stdout + result.stderr)
  const page = (route) => readFileSync(join(scratch, 'dist', route), 'utf8')
  const home = page('index.html')
  const missing = page('404.html')
  for (const html of [home, missing, page('festival/index.html')]) {
    assertLinkIcon(html, 'https://www.instagram.com/festival_arc', 'instagram', 'mdi:instagram')
    assertLinkIcon(html, 'https://www.facebook.com/FestivalARC', 'facebook', 'mdi:facebook')
    assertLinkIcon(html, 'https://twitter.com/FestivalARC', 'twitter', 'mdi:twitter')
    assertIcon(html, 'mdi:spotify', ['h-7', 'w-7'])
    assert.ok(html.includes(`href="${withBase('/festival')}"`))
    assert.doesNotMatch(html, /api\.astroicon\.dev/)
  }
  assertIcon(page('festival/index.html'), 'mdi:email', ['h-8', 'inline'])
  const rendered = new Set()
  // Traverse the actual event/location links so dynamic names cannot disappear silently.
  for (const file of readdirSync(join(app, 'src/data')).filter((file) => /^[A-Z_]+\.js$/.test(file) && file !== 'ARC_2023.js')) {
    const data = await import(new URL(`../src/data/${file}`, import.meta.url))
    for (const location of Object.values(data)) {
      const locationHtml = page(`${location.id}/index.html`)
      assertIcon(locationHtml, 'mdi:arrow-top-left-thick', ['inline', 'h-5'])
      assertIcon(locationHtml, 'mdi:calendar-multiselect', ['inline', 'w-6'])
      const checkLinks = (html, links) => {
        for (const { name, url } of links) {
          const icon = name === 'tiktok' ? 'ic:baseline-tiktok' : `mdi:${name}`
          assertLinkIcon(html, url, 'medias', icon)
          assertIcon(html, icon, ['h-6', 'w-6'])
          rendered.add(icon)
        }
      }
      checkLinks(locationHtml, location.links)
      for (const { events } of location.schedule) {
        for (const event of events) {
          const html = page(`${location.id}/${event.id}/index.html`)
          checkLinks(html, event.links)
          assertIcon(html, 'mdi:arrow-top-right-thick', ['w-5', 'inline'])
          assert.ok(html.includes(`href="${withBase(`/${location.id}`)}"`))
          assert.ok(locationHtml.includes(`href="${withBase(`/${location.id}/${event.id}`)}"`))
        }
      }
    }
  }
  assert.deepEqual([...rendered].sort(), [
    'ic:baseline-tiktok', 'mdi:bandcamp', 'mdi:email', 'mdi:facebook',
    'mdi:instagram', 'mdi:soundcloud', 'mdi:spotify', 'mdi:twitter',
    'mdi:video', 'mdi:web', 'mdi:youtube',
  ])
  assertIcon(home, 'mdi:arrow-right-bold', ['inline', 'h-5'])
})
