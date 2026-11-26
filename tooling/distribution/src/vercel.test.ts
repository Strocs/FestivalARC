import { createHash } from 'node:crypto'
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { expect, it } from 'vitest'
import { baseForPublication, createFinalPublication, publicationBase, validatePublicationConfig } from '@festivalarc/editions'
import { compose } from './index.js'

const vercel = JSON.parse(readFileSync(new URL('../../../vercel.json', import.meta.url), 'utf8'))
const publicationConfig = validatePublicationConfig({
  schemaVersion: 1,
  siteOrigin: 'https://festivalarc.com',
  active: createFinalPublication({ id: 'festival-2026', year: 2026, packageName: 'festival-2026' }),
  archives: [{ ...createFinalPublication({ id: 'festival-2024', year: 2024, packageName: 'festival-arc-2024' }), base: publicationBase('/ediciones/2024') }],
  global: { notFound: 'distribution', robots: 'distribution', sitemap: 'distribution' },
})
const scopes = [['home', '/', 'index.html'], ['music', '/musica', 'musica/index.html'], ['stage', '/artes-escenicas', 'artes-escenicas/index.html']] as const
const days = [['', 'all'], ['sabado', 'saturday'], ['domingo', 'sunday']] as const
const orders = [['', 'original'], ['horario', 'time'], ['escenario', 'location']] as const
const document = (label: string) => `<html><head></head><body>${label}</body></html>`
const activeFiles = scopes.flatMap(([scope, , defaultFile]) => days.flatMap(([dia, day]) => orders.map(([orden, order]) => ({
  relativePath: dia || orden ? `poster-variants/${scope}/${day}-${order}/index.html` : defaultFile,
  bytes: Buffer.from(document(`${scope}:${day}-${order}`)),
}))))
const detailPath = 'musica/artist/index.html'
const inputs = [
  { ownerId: publicationConfig.active.id, kind: publicationConfig.active.kind, sourceRoot: '/fixture', destination: '/', base: baseForPublication(publicationConfig.active), files: [...activeFiles, { relativePath: detailPath, bytes: Buffer.from(document('artist')) }] },
  ...publicationConfig.archives.map(archive => ({ ownerId: archive.id, kind: archive.kind, sourceRoot: '/fixture', destination: archive.base, base: archive.base, files: [{ relativePath: 'index.html', bytes: Buffer.from(document(archive.id)) }] })),
]

type Rewrite = { source: string; destination: string; has?: { type: string; key: string; value: string }[] }

it('packages every public poster query behind ordered static rewrites without changing local or archive URLs', () => {
  const root = mkdtempSync(join(tmpdir(), 'festivalarc-vercel-test-'))
  try {
    mkdirSync(join(root, 'local'))
    mkdirSync(join(root, 'deploy'))
    const local = join(root, 'local', '.output'), deploy = join(root, 'deploy', '.output')
    const request = { config: publicationConfig, inputs }
    const localResult = compose({ ...request, outputRoot: local })
    const result = compose({ ...request, outputRoot: deploy, profile: 'vercel' })
    const rewrites: Rewrite[] = vercel.rewrites
    expect(rewrites).toHaveLength(27)
    expect(new Set(rewrites.map(rule => rule.destination)).size).toBe(27)
    expect(vercel.headers).toContainEqual({ source: '/poster-variants/:path*', headers: [{ key: 'X-Robots-Tag', value: 'noindex, follow' }] })
    for (const [scope, source, defaultFile] of scopes) {
      expect(existsSync(join(deploy, defaultFile))).toBe(false)
      expect(readFileSync(join(local, defaultFile), 'utf8')).toBe(document(`${scope}:all-original`))
      const rules = rewrites.filter(rule => rule.source === (source === '/' ? source : `${source}{/}?`))
      expect(rules.map(rule => rule.has?.length ?? 0)).toEqual([2, 2, 2, 2, 1, 1, 1, 1, 0])
      for (const dia of ['undefined', 'todos', 'unknown', ...days.map(([query]) => query)]) {
        for (const orden of ['undefined', 'original', 'unknown', ...orders.map(([query]) => query)]) {
          const url = new URL(source, publicationConfig.siteOrigin)
          if (dia !== 'undefined') url.searchParams.set('dia', dia)
          if (orden !== 'undefined') url.searchParams.set('orden', orden)
          url.searchParams.set('vista', 'list')
          url.hash = 'poster'
          const match = rules.find(rule => rule.has?.every(({ type, key, value }) => type === 'query' && url.searchParams.has(key) && new RegExp(`^(?:${value})$`).test(url.searchParams.get(key)!)) ?? true)
          expect(match?.destination).toMatch(/^\/poster-variants\/.*\.html$/)
          const day = days.find(([query]) => query === dia)?.[1] ?? 'all'
          const order = orders.find(([query]) => query === orden)?.[1] ?? 'original'
          expect(readFileSync(join(deploy, match!.destination), 'utf8')).toBe(document(`${scope}:${day}-${order}`))
        }
      }
    }
    for (const variant of activeFiles.filter(file => file.relativePath.startsWith('poster-variants/'))) {
      expect(readFileSync(join(local, variant.relativePath), 'utf8')).toContain('<meta name="robots" content="noindex, follow">')
      expect(existsSync(join(deploy, variant.relativePath))).toBe(false)
    }
    expect(readFileSync(join(deploy, detailPath), 'utf8')).toBe(document('artist'))
    expect(readFileSync(join(local, detailPath), 'utf8')).toBe(document('artist'))
    for (const archive of publicationConfig.archives) {
      const path = `${archive.base.slice(1)}/index.html`
      expect(readFileSync(join(deploy, path), 'utf8')).toBe(readFileSync(join(local, path), 'utf8'))
    }
    const sitemap = readFileSync(join(deploy, 'sitemap-0.xml'), 'utf8')
    expect(sitemap).toBe(readFileSync(join(local, 'sitemap-0.xml'), 'utf8'))
    expect(sitemap).not.toContain('poster-variants')
    for (const [, source] of scopes) expect(sitemap).toContain(`<loc>${publicationConfig.siteOrigin}${source === '/' ? source : `${source}/`}</loc>`)
    expect(result.manifest).toHaveLength(localResult.manifest.length)
    expect(JSON.parse(readFileSync(join(root, 'local', '.distribution-manifest.json'), 'utf8')).manifest).toEqual(localResult.manifest)
    expect(JSON.parse(readFileSync(join(root, 'deploy', '.distribution-manifest.json'), 'utf8')).manifest).toEqual(result.manifest)
    for (const entry of result.manifest) {
      const file = readFileSync(join(deploy, entry.path))
      expect(entry.bytes).toBe(file.byteLength)
      expect(entry.sha256).toBe(createHash('sha256').update(file).digest('hex'))
    }
  } finally {
    rmSync(root, { recursive: true, force: true })
  }
})
