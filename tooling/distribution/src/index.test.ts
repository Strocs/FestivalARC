import { createHash } from 'node:crypto'
import { execFileSync } from 'node:child_process'
import { mkdtempSync, mkdirSync, symlinkSync, writeFileSync, readFileSync, existsSync, readdirSync, renameSync } from 'node:fs'
import type { Stats } from 'node:fs'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { describe, expect, it } from 'vitest'
import { configurationDigest, createCallsPublication, createFinalPublication, publicationBase, replaceCallsWithFinal, validatePublicationConfig } from '@festivalarc/editions'
import { buildApp, compose, DistributionError, generateDiscoveryFiles, generateNotFoundHtml, loadInputs, normalizeBuildOutput, normalizeRelativePath, routeInventory, scanReferences, validateCandidates } from './index.js'

const active = createFinalPublication({ id: 'festival-2025', year: 2025, packageName: 'festivalarc-2025' })
const archive = createFinalPublication({ id: 'festival-2024', year: 2024, packageName: 'festivalarc-2024' })
const config = () => validatePublicationConfig({
  schemaVersion: 1, siteOrigin: 'https://festivalarc.com', active,
  archives: [{ ...archive, base: publicationBase('/ediciones/2024') }],
  global: { notFound: 'distribution', robots: 'distribution', sitemap: 'distribution' },
})
const input = (ownerId: string, destination: string, files = [{ relativePath: 'index.html', bytes: Buffer.from(ownerId === archive.id ? '<html><head></head><body>archive</body></html>' : ownerId) }], kind: 'final' | 'calls' = 'final') => ({
  ownerId, kind, sourceRoot: '/fixture', destination, base: publicationBase(destination), files,
})

describe('Slice 5 global files, discovery, and references', () => {
  it('generates one neutral self-contained fallback and deterministic discovery files', () => {
    const notFound = generateNotFoundHtml()
    expect(notFound).toContain('<style>')
    expect(notFound).toContain('Page not found')
    expect(notFound).not.toContain('stylesheet')
    expect(notFound).not.toContain('/assets/')
    const files = generateDiscoveryFiles(config(), ['https://festivalarc.com/ediciones/2024/', 'https://festivalarc.com/'])
    expect(files.map(file => file.path)).toEqual(['robots.txt', 'sitemap-0.xml', 'sitemap-index.xml'])
    expect(new TextDecoder().decode(files.find(file => file.path === 'robots.txt')!.bytes)).toBe('User-agent: *\nAllow: /\nSitemap: https://festivalarc.com/sitemap-index.xml\n')
    expect(new TextDecoder().decode(files.find(file => file.path === 'sitemap-0.xml')!.bytes)).toContain('<loc>https://festivalarc.com/</loc>')
  })

  it('shards sorted de-duplicated sitemap URLs deterministically', () => {
    const files = generateDiscoveryFiles(config(), ['https://festivalarc.com/z', 'https://festivalarc.com/a', 'https://festivalarc.com/a'], 1)
    expect(files.map(file => file.path)).toEqual(['robots.txt', 'sitemap-0.xml', 'sitemap-1.xml', 'sitemap-index.xml'])
    expect(new TextDecoder().decode(files[1].bytes)).toContain('<loc>https://festivalarc.com/a</loc>')
    expect(new TextDecoder().decode(files[2].bytes)).toContain('<loc>https://festivalarc.com/z</loc>')
  })

  it('inventories only active publication HTML routes and sorts duplicate absolute URLs', () => {
    const files = [
      { path: 'ediciones/2024/programacion/index.html', owner: archive.id, bytes: Buffer.from('<html/>') },
      { path: '404.html', owner: 'distribution', bytes: Buffer.from('<html/>') },
      { path: 'index.html', owner: active.id, bytes: Buffer.from('<html/>') },
      { path: 'section/index.html', owner: active.id, bytes: Buffer.from('<html/>') },
      { path: 'assets/app.js', owner: active.id, bytes: Buffer.from('x') },
      { path: 'evidence/debug.html', owner: active.id, bytes: Buffer.from('<html/>') },
      { path: 'ediciones/2024/index.html', owner: archive.id, bytes: Buffer.from('<html/>') },
    ]
    expect(routeInventory(config(), files)).toEqual(['https://festivalarc.com/', 'https://festivalarc.com/section/'])
  })

  it('adds exactly one noindex meta to archived HTML while preserving active HTML and robots access', () => {
    const activeHtml = '<!doctype html><html><head><meta name="description" content="active"></head><body>active</body></html>'
    const archiveHtml = '<!doctype html><html><HEAD>\n<META content=\'index, follow\' NAME=\'ROBOTS\'><meta name=\'robots\' content=\'noarchive\'><meta name="description" content="archive">\n</HEAD><body>archive</body></html>'
    const archiveNestedHtml = '<html><head><title>Nested archive</title></head><body>nested</body></html>'
    const root = mkdtempSync(join(tmpdir(), 'dist-archive-seo-')), output = join(root, '.output')
    compose({ config: config(), outputRoot: output, inputs: [
      input(active.id, '/', [{ relativePath: 'index.html', bytes: Buffer.from(activeHtml) }]),
      input(archive.id, '/ediciones/2024', [
        { relativePath: 'index.html', bytes: Buffer.from(archiveHtml) },
        { relativePath: 'nested/page.HTML', bytes: Buffer.from(archiveNestedHtml) },
      ]),
    ] })

    expect(readFileSync(join(output, 'index.html'), 'utf8')).toBe(activeHtml)
    const archived = readFileSync(join(output, 'ediciones/2024/index.html'), 'utf8')
    expect(archived.match(/<meta\b[^>]*>/gi)?.filter(tag => /\bname\s*=\s*["']robots["']/i.test(tag))).toEqual(['<meta name="robots" content="noindex, follow">'])
    expect(readFileSync(join(output, 'ediciones/2024/nested/page.HTML'), 'utf8')).toContain('<meta name="robots" content="noindex, follow">')
    expect(readFileSync(join(output, 'robots.txt'), 'utf8')).toContain('Allow: /')
    expect(readFileSync(join(output, 'robots.txt'), 'utf8')).not.toContain('Disallow:')
    expect(readFileSync(join(output, 'sitemap-0.xml'), 'utf8')).toContain('https://festivalarc.com/')
    expect(readFileSync(join(output, 'sitemap-0.xml'), 'utf8')).not.toContain('/ediciones/2024/')
    expect(readFileSync(join(output, 'sitemap-index.xml'), 'utf8')).not.toContain('/ediciones/2024/')
  })

  it('fails clearly when archived HTML has no head', () => {
    expect(() => compose({ config: config(), outputRoot: join(mkdtempSync(join(tmpdir(), 'dist-archive-no-head-')), '.output'), inputs: [
      input(active.id, '/', [{ relativePath: 'index.html', bytes: Buffer.from('<html><head></head></html>') }]),
      input(archive.id, '/ediciones/2024', [{ relativePath: 'index.html', bytes: Buffer.from('<html><body>archive</body></html>') }]),
    ] })).toThrow('archived HTML missing head')
  })

  it('reports archive escapes while allowing cross-edition, global, external, and fragment references', () => {
    const valid = input(archive.id, '/ediciones/2024', [
      { relativePath: 'index.html', bytes: Buffer.from('<a href="/programacion">active</a><img src="/robots.txt"><a href="https://cdn.example/x.css">x</a><a href="#section">fragment</a>') },
      { relativePath: 'styles.css', bytes: Buffer.from('body { background: url("assets/bg.png") }') },
    ])
    expect(scanReferences(config(), [valid])).toEqual([])
    const invalid = input(archive.id, '/ediciones/2024', [{ relativePath: 'index.html', bytes: Buffer.from('<a href="/ediciones/2025">escape</a>') }])
    expect(() => scanReferences(config(), [invalid])).toThrow('archive base escape')
    const invalidAbsolute = input(archive.id, '/ediciones/2024', [{ relativePath: 'index.html', bytes: Buffer.from('<a href="https://festivalarc.com/ediciones/2025">escape</a>') }])
    expect(() => scanReferences(config(), [invalidAbsolute])).toThrow('archive base escape')
    const invalidCss = input(archive.id, '/ediciones/2024', [{ relativePath: 'styles.css', bytes: Buffer.from('body{background:url("../assets/bg.png")}') }])
    expect(() => scanReferences(config(), [invalidCss])).toThrow('styles.css url() ../assets/bg.png')
  })

  it('composes distribution globals into the manifest and rejects app-owned globals', () => {
    const result = compose({ config: config(), outputRoot: join(mkdtempSync(join(tmpdir(), 'dist-globals-')), '.output'), inputs: [input(active.id, '/'), input(archive.id, '/ediciones/2024')] })
    expect(result.manifest.filter(entry => entry.owner === 'distribution').map(entry => entry.path)).toEqual(['404.html', 'robots.txt', 'sitemap-0.xml', 'sitemap-index.xml'])
    expect(() => compose({ config: config(), outputRoot: join(mkdtempSync(join(tmpdir(), 'dist-owned-')), '.output'), inputs: [input(active.id, '/', [{ relativePath: '404.html', bytes: Buffer.from('app') }]), input(archive.id, '/ediciones/2024')] })).toThrow('distribution-owned')
    expect(() => compose({ config: config(), outputRoot: join(mkdtempSync(join(tmpdir(), 'dist-robots-')), '.output'), inputs: [input(active.id, '/', [{ relativePath: 'robots.txt', bytes: Buffer.from('app') }]), input(archive.id, '/ediciones/2024')] })).toThrow('distribution-owned')
    expect(() => compose({ config: config(), outputRoot: join(mkdtempSync(join(tmpdir(), 'dist-sitemap-')), '.output'), inputs: [input(active.id, '/', [{ relativePath: 'sitemap.xml', bytes: Buffer.from('app') }]), input(archive.id, '/ediciones/2024')] })).toThrow('distribution-owned')
  })
})

it('replaces root calls atomically and never creates a calls archive', () => {
  const calls = createCallsPublication({ id: 'calls-2026', year: 2026, packageName: 'calls-2026' })
  const callsConfig = validatePublicationConfig({ ...config(), active: calls }, { knownWorkspacePackages: ['festivalarc-2025', 'festivalarc-2024', 'calls-2026'] })
  const finalConfig = replaceCallsWithFinal(callsConfig, { id: 'festival-2026', year: 2026, packageName: 'festivalarc-2026' }, { knownWorkspacePackages: ['festivalarc-2025', 'festivalarc-2024', 'calls-2026', 'festivalarc-2026'], callsPackageName: 'calls-2026' })
  const root = mkdtempSync(join(tmpdir(), 'dist-calls-lifecycle-')), output = join(root, '.output')
  const callFiles = [{ relativePath: 'index.html', bytes: Buffer.from('<a href="/convocatoria">calls</a>') }, { relativePath: 'convocatoria/index.html', bytes: Buffer.from('temporary call data') }, { relativePath: 'calls.css', bytes: Buffer.from('body{color:blue}') }]
  expect(() => loadInputs(callsConfig, [input(calls.id, '/ediciones/2026', callFiles, 'calls'), input(archive.id, '/ediciones/2024')])).toThrow('boundary mismatch')
  compose({ config: callsConfig, outputRoot: output, inputs: [input(calls.id, '/', callFiles, 'calls'), input(archive.id, '/ediciones/2024')] })
  expect(readFileSync(join(output, 'convocatoria/index.html'), 'utf8')).toBe('temporary call data')
  expect(existsSync(join(output, 'ediciones/2026'))).toBe(false)
  const priorConfig = JSON.stringify(callsConfig)
  expect(() => compose({ config: finalConfig, outputRoot: output, inputs: [input(calls.id, '/', callFiles, 'calls'), input(archive.id, '/ediciones/2024')] })).toThrow('unconfigured input')
  expect(JSON.stringify(callsConfig)).toBe(priorConfig)
  expect(readFileSync(join(output, 'convocatoria/index.html'), 'utf8')).toBe('temporary call data')
  compose({ config: finalConfig, outputRoot: output, inputs: [input('festival-2026', '/', [{ relativePath: 'index.html', bytes: Buffer.from('final edition') }]), input(archive.id, '/ediciones/2024')] })
  expect(existsSync(join(output, 'convocatoria'))).toBe(false)
  expect(existsSync(join(output, 'calls.css'))).toBe(false)
  expect(existsSync(join(output, 'ediciones/2026'))).toBe(false)
  expect(readFileSync(join(output, 'index.html'), 'utf8')).toBe('final edition')
})

describe('normalized distribution boundary', () => {
  it('normalizes one Astro base and rejects unsafe paths and links', () => {
    expect(normalizeRelativePath('nested//./file.txt')).toBe('nested/file.txt')
    for (const value of ['/etc/passwd', 'C:/secret', '../escape', 'a\\b', 'a\0b'])
      expect(() => normalizeRelativePath(value)).toThrow(DistributionError)
    const root = mkdtempSync(join(tmpdir(), 'dist-normalize-'))
    mkdirSync(join(root, 'ediciones/2024'), { recursive: true })
    writeFileSync(join(root, 'ediciones/2024/index.html'), 'ok')
    const normalized = normalizeBuildOutput({ ownerId: archive.id, kind: 'final', sourceRoot: root, destination: '/ediciones/2024', base: publicationBase('/ediciones/2024') })
    expect(normalized.files.map(file => file.relativePath)).toEqual(['index.html'])
    const duplicate = mkdtempSync(join(tmpdir(), 'dist-duplicate-'))
    mkdirSync(join(duplicate, 'ediciones/2024/ediciones/2024'), { recursive: true })
    writeFileSync(join(duplicate, 'ediciones/2024/ediciones/2024/index.html'), 'duplicate')
    expect(() => normalizeBuildOutput({ ownerId: archive.id, kind: 'final', sourceRoot: duplicate, destination: '/ediciones/2024', base: publicationBase('/ediciones/2024') })).toThrow('duplicate publication prefix')
    const outside = mkdtempSync(join(tmpdir(), 'dist-outside-'))
    writeFileSync(join(outside, 'secret.html'), 'secret')
    symlinkSync(join(outside, 'secret.html'), join(root, 'escape.html'))
    expect(() => normalizeBuildOutput({ ownerId: archive.id, kind: 'final', sourceRoot: root, destination: '/ediciones/2024', base: publicationBase('/ediciones/2024') })).toThrow('symlink')
    if (process.platform === 'linux') {
      const fifo = join(duplicate, 'pipe')
      execFileSync('mkfifo', [fifo])
      expect(() => normalizeBuildOutput({ ownerId: archive.id, kind: 'final', sourceRoot: duplicate, destination: '/ediciones/2024', base: publicationBase('/ediciones/2024') })).toThrow('non-regular')
    }
  })

  it.each(['device', 'socket', 'broken-link'] as const)('rejects mocked %s entries', kind => {
    const mocked = mkdtempSync(join(tmpdir(), `dist-${kind}-`)), entry = join(mocked, 'entry')
    writeFileSync(entry, 'fixture')
    const lstat = () => ({ isSymbolicLink: () => kind === 'broken-link', isDirectory: () => false, isFile: () => false }) as Stats
    expect(() => normalizeBuildOutput({ ownerId: archive.id, kind: 'final', sourceRoot: mocked, destination: '/ediciones/2024', base: publicationBase('/ediciones/2024'), lstat })).toThrow(kind === 'broken-link' ? 'symlink' : 'non-regular')
  })

  it('passes isolated build context and loads exactly configured inputs', async () => {
    let context: { packageDir: string; outputDirectory: string; base: string; env: Readonly<Record<string, string>> } | undefined
    const root = mkdtempSync(join(tmpdir(), 'dist-build-'))
    const built = await buildApp({ ownerId: active.id, kind: 'final', packageDir: '.', outputDirectory: root, base: publicationBase('/'), run: value => { context = value; writeFileSync(join(root, 'index.html'), 'home') } })
    expect(context?.outputDirectory).toBe(root)
    expect(context?.env.PUBLICATION_BASE).toBe('/')
    expect(context?.env.DISTRIBUTION_OUTPUT_DIR).toBe(root)
    expect(built.files[0].relativePath).toBe('index.html')
    expect(loadInputs(config(), [built, input(archive.id, '/ediciones/2024')])).toHaveLength(2)
    expect(() => loadInputs(config(), [built])).toThrow('missing build input')
    expect(() => loadInputs(config(), [built, input(active.id, '/'), input(archive.id, '/ediciones/2024')])).toThrow('duplicate input')
    expect(() => loadInputs(config(), [built, input(archive.id, '/ediciones/2024'), input(archive.id, '/ediciones/2024')])).toThrow('duplicate input')
    expect(() => loadInputs(config(), [built, input(archive.id, '/')])).toThrow('boundary mismatch')
    expect(() => loadInputs(config(), [built, input('festival-2023', '/'), input(archive.id, '/ediciones/2024')])).toThrow('unconfigured input')
    const calls = createCallsPublication({ id: 'calls-2026', year: 2026, packageName: 'calls-2026' })
    expect(() => validatePublicationConfig({ ...config(), archives: [{ ...calls, base: publicationBase('/ediciones/2026') }] })).toThrow('final publications only')
  })

  it('composes sorted, hashed output atomically and preserves it on collision', () => {
    const root = mkdtempSync(join(tmpdir(), 'dist-compose-')), output = join(root, '.output')
    const result = compose({ config: config(), outputRoot: output, inputs: [input(archive.id, '/ediciones/2024'), input(active.id, '/')] })
    expect(result.manifest.map(entry => entry.path)).toEqual(['404.html', 'ediciones/2024/index.html', 'index.html', 'robots.txt', 'sitemap-0.xml', 'sitemap-index.xml'])
    expect(readFileSync(join(output, 'index.html'), 'utf8')).toBe(active.id)
    expect(existsSync(join(output, '.distribution-manifest.json'))).toBe(false)
    expect(readFileSync(join(root, '.distribution-manifest.json'), 'utf8')).toBe(JSON.stringify({ configSha256: result.configSha256, manifest: result.manifest }))
    const before = readFileSync(join(output, 'index.html'), 'utf8')
    expect(() => compose({ config: config(), outputRoot: output, inputs: [input(archive.id, '/ediciones/2024'), input(active.id, '/', [{ relativePath: 'index.html', bytes: Buffer.from(active.id) }, { relativePath: 'index.html', bytes: Buffer.from('other') }])] })).toThrow('collision')
    expect(existsSync(output)).toBe(true)
    expect(readFileSync(join(output, 'index.html'), 'utf8')).toBe(before)
    const repeat = compose({ config: config(), outputRoot: output, inputs: [input(active.id, '/'), input(archive.id, '/ediciones/2024')] })
    expect(repeat.manifest).toEqual(result.manifest)
    expect(existsSync(join(root, '.distribution-manifest.json'))).toBe(true)
    expect(result.configSha256).toBe(configurationDigest(config()))
    expect(result.manifestSha256).toBe(createHash('sha256').update(JSON.stringify(result.manifest)).digest('hex'))
    expect(() => validateCandidates([input(active.id, '/'), input(archive.id, '/')])).toThrow(`destination collision: index.html (${active.id}, ${archive.id})`)
  })

  it.each(['copy', 'manifest', 'replace'] as const)('preserves prior output and cleans staging after %s failure', failure => {
    const root = mkdtempSync(join(tmpdir(), `dist-failure-${failure}-`)), output = join(root, '.output')
    mkdirSync(output); writeFileSync(join(output, 'index.html'), 'prior')
    const operations = {
      writeFile: (path: string, data: Uint8Array | string) => { if (failure === 'copy' && path.endsWith('index.html') && path.includes('staging')) throw new Error('copy failure'); if (failure === 'manifest' && path.endsWith('.distribution-manifest.json')) throw new Error('manifest failure'); writeFileSync(path, data) },
      rename: (from: string, to: string) => { if (failure === 'replace' && from.includes('staging') && to === output) throw new Error('replace failure'); return renameSync(from, to) },
    }
    expect(() => compose({ config: config(), outputRoot: output, inputs: [input(active.id, '/'), input(archive.id, '/ediciones/2024')], operations })).toThrow(failure)
    expect(readFileSync(join(output, 'index.html'), 'utf8')).toBe('prior')
    expect(readdirSync(root).filter(name => name.startsWith('.output-staging-'))).toEqual([])
  })
})
