import { createHash } from 'node:crypto'
import { execFileSync } from 'node:child_process'
import { lstatSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, renameSync, rmSync, writeFileSync } from 'node:fs'
import { dirname, join, posix, resolve, sep } from 'node:path'
import type { Stats } from 'node:fs'
import type { Publication, PublicationBase, PublicationConfig } from '@festivalarc/editions'
import { baseForPublication, configurationDigest, validatePublicationConfig } from '@festivalarc/editions'

type EntryStat = Pick<Stats, 'isSymbolicLink' | 'isDirectory' | 'isFile'>
export type NormalizedFile = Readonly<{ relativePath: string; bytes: Uint8Array }>
export type NormalizedInput = Readonly<{
  ownerId: string; kind: Publication['kind']; sourceRoot: string; destination: string
  base: PublicationBase; files: readonly NormalizedFile[]
}>
export type BuildContext = Readonly<{ packageDir: string; outputDirectory: string; base: PublicationBase; env: Readonly<Record<string, string>> }>
export type BuildAdapterOptions = Omit<BuildContext, 'env'> & Readonly<{
  ownerId: string; kind: Publication['kind']; command?: string
  run?: (context: BuildContext) => void | Promise<void>
}>
export type ManifestEntry = Readonly<{ path: string; owner: string; bytes: number; sha256: string }>
export type ComposeRequest = Readonly<{
  config: PublicationConfig; inputs: readonly NormalizedInput[]; outputRoot: string
  operations?: Readonly<{ writeFile?: (path: string, data: Uint8Array | string) => void; rename?: (from: string, to: string) => void }>
}>
export type ComposeResult = Readonly<{
  outputRoot: string; manifest: readonly ManifestEntry[]; manifestSha256: string; configSha256: string
}>

export class DistributionError extends Error {
  constructor(readonly diagnostics: readonly string[]) {
    super(`Invalid distribution input: ${diagnostics.join('; ')}`); this.name = 'DistributionError'
  }
}

export function normalizeRelativePath(value: string): string {
  if (!value || value.includes('\0') || value.includes('\\') || value.startsWith('/') || /^[A-Za-z]:[/\\]/.test(value))
    throw new DistributionError([`unsafe path: ${value}`])
  const parts = value.split('/')
  if (parts.some(part => part === '..')) throw new DistributionError([`path traversal: ${value}`])
  const normalized = posix.normalize(parts.filter(Boolean).join('/'))
  if (!normalized || normalized === '.' || normalized.startsWith('../')) throw new DistributionError([`unsafe path: ${value}`])
  return normalized
}

function walk(root: string, current = root, lstat: (path: string) => EntryStat = lstatSync): NormalizedFile[] {
  const result: NormalizedFile[] = []
  for (const name of readdirSync(current)) {
    const absolute = join(current, name), stat = lstat(absolute)
    if (stat.isSymbolicLink()) throw new DistributionError([`symlink is not allowed: ${absolute}`])
    if (stat.isDirectory()) result.push(...walk(root, absolute, lstat))
    else if (stat.isFile()) result.push({ relativePath: normalizeRelativePath(absolute.slice(root.length + 1).split(sep).join('/')), bytes: readFileSync(absolute) })
    else throw new DistributionError([`non-regular file is not allowed: ${absolute}`])
  }
  return result
}

export function normalizeBuildOutput(options: Readonly<{
  ownerId: string; kind: Publication['kind']; sourceRoot: string; destination: string; base: PublicationBase; lstat?: (path: string) => EntryStat
}>): NormalizedInput {
  const root = resolve(options.sourceRoot), prefix = options.base === '/' ? '' : options.base.slice(1)
  const files = walk(root, root, options.lstat).map(file => {
    const path = file.relativePath
    const hasPrefix = prefix && (path === prefix || path.startsWith(`${prefix}/`))
    if (hasPrefix && path.slice(prefix.length + 1).startsWith(`${prefix}/`)) throw new DistributionError([`duplicate publication prefix: ${path}`])
    return { ...file, relativePath: hasPrefix ? path.slice(prefix.length + 1) : path }
  }).filter(file => file.relativePath)
  return { ownerId: options.ownerId, kind: options.kind, sourceRoot: root, destination: options.destination, base: options.base, files }
}

export async function buildApp(options: BuildAdapterOptions): Promise<NormalizedInput> {
  const outputDirectory = resolve(options.outputDirectory)
  mkdirSync(outputDirectory, { recursive: true })
  const context: BuildContext = { packageDir: resolve(options.packageDir), outputDirectory, base: options.base, env: { ...process.env, PUBLICATION_BASE: options.base, DISTRIBUTION_OUTPUT_DIR: outputDirectory } as Record<string, string> }
  if (options.run) await options.run(context)
  else execFileSync(options.command ?? 'pnpm', ['--dir', context.packageDir, 'run', 'build'], {
    stdio: 'inherit', env: context.env
  })
  return normalizeBuildOutput({ ...options, sourceRoot: outputDirectory, destination: options.base })
}

export function loadInputs(config: PublicationConfig, inputs: readonly NormalizedInput[]): readonly NormalizedInput[] {
  const checked = validatePublicationConfig(config), expected = new Map<string, { kind: Publication['kind']; destination: string; base: PublicationBase }>()
  expected.set(checked.active.id, { kind: checked.active.kind, destination: '/', base: baseForPublication(checked.active) })
  for (const archive of checked.archives) expected.set(archive.id, { kind: 'final', destination: archive.base, base: archive.base })
  const diagnostics: string[] = [], seen = new Set<string>()
  for (const input of inputs) {
    const wanted = expected.get(input.ownerId)
    if (!wanted) { diagnostics.push(`unconfigured input: ${input.ownerId}`); continue }
    if (seen.has(input.ownerId)) diagnostics.push(`duplicate input: ${input.ownerId}`)
    seen.add(input.ownerId)
    if (input.kind !== wanted.kind || input.destination !== wanted.destination || input.base !== wanted.base)
      diagnostics.push(`input boundary mismatch: ${input.ownerId}`)
  }
  for (const id of expected.keys()) if (!seen.has(id)) diagnostics.push(`missing build input: ${id}`)
  if (diagnostics.length) throw new DistributionError(diagnostics)
  return [...inputs].sort((a, b) => a.ownerId < b.ownerId ? -1 : a.ownerId > b.ownerId ? 1 : 0)
}

const reserved = new Set(['404.html', 'robots.txt', 'sitemap-index.xml', 'sitemap-0.xml', '.distribution-manifest.json'])
const globalName = (path: string) => /^(404\.html|robots\.txt|sitemap(?:-index|-\d+)?\.xml|\.distribution-manifest\.json)$/.test(path.split('/').pop() ?? '')
function candidates(inputs: readonly NormalizedInput[]): Array<{ path: string; owner: string; bytes: Uint8Array }> {
  const claims = new Map<string, string>(), result: Array<{ path: string; owner: string; bytes: Uint8Array }> = [], errors: string[] = []
  for (const input of inputs) for (const file of input.files) {
    let relative: string
    try { relative = normalizeRelativePath(file.relativePath) } catch (error) { errors.push((error as Error).message); continue }
    const path = input.destination === '/' ? relative : `${input.destination.slice(1)}/${relative}`
    if ((input.destination === '/' && reserved.has(relative)) || globalName(relative)) errors.push(`global path is distribution-owned: ${relative}`)
    const previous = claims.get(path)
    if (previous) errors.push(`destination collision: ${path} (${previous}, ${input.ownerId})`)
    claims.set(path, input.ownerId); result.push({ path, owner: input.ownerId, bytes: file.bytes })
  }
  if (errors.length) throw new DistributionError(errors)
  return result.sort((a, b) => a.path < b.path ? -1 : a.path > b.path ? 1 : a.owner < b.owner ? -1 : a.owner > b.owner ? 1 : 0)
}
export const validateCandidates = candidates

export type DistributionFile = Readonly<{ path: string; bytes: Uint8Array }>

export function generateNotFoundHtml(): string {
  return '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Page not found</title><style>body{margin:0;padding:4rem 1.5rem;background:#fff;color:#222;font:16px system-ui,sans-serif}main{max-width:40rem;margin:auto}h1{font-size:2rem}</style></head><body><main><h1>Page not found</h1><p>The requested page could not be found.</p></main></body></html>'
}

function publicPath(path: string): string {
  if (path === 'index.html') return '/'
  if (path.endsWith('/index.html')) return `/${path.slice(0, -'index.html'.length)}`
  return `/${path}`
}

export function routeInventory(config: PublicationConfig, files: readonly { path: string; owner: string; bytes: Uint8Array }[]): string[] {
  const origin = config.siteOrigin.replace(/\/$/, '')
  return [...new Set(files.filter(file => file.owner === config.active.id && /\.html$/i.test(file.path) && !globalName(file.path) && !/(^|\/)evidence\//.test(file.path)).map(file => `${origin}${publicPath(file.path)}`))].sort()
}

const robotsMeta = '<meta name="robots" content="noindex, follow">'
const metaTag = /<meta\b(?:[^"'<>]|"[^"]*"|'[^']*')*>/gi
const metaAttribute = (tag: string, name: string): string | undefined => {
  const attributes = /([^\s=/>]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g
  for (const match of tag.slice(5, -1).matchAll(attributes)) if (match[1].toLowerCase() === name) return match[2] ?? match[3] ?? match[4]
  return undefined
}

function noindexArchivedHtml(html: string, path: string): Uint8Array {
  const head = /(<head\b[^>]*>)([\s\S]*?)(<\/head\s*>)/i.exec(html)
  if (!head || head.index === undefined) throw new DistributionError([`archived HTML missing head: ${path}`])
  let found = false
  const content = head[2].replace(metaTag, tag => {
    if (metaAttribute(tag, 'name')?.trim().toLowerCase() !== 'robots') return tag
    if (found) return ''
    found = true
    return robotsMeta
  })
  const transformed = `${html.slice(0, head.index)}${head[1]}${found ? content : `${robotsMeta}${content}`}${head[3]}${html.slice(head.index + head[0].length)}`
  return bytes(transformed)
}

function transformArchivedHtml(config: PublicationConfig, files: readonly { path: string; owner: string; bytes: Uint8Array }[]): Array<{ path: string; owner: string; bytes: Uint8Array }> {
  const archives = new Set<string>(config.archives.map(archive => archive.id))
  return files.map(file => archives.has(file.owner) && /\.html$/i.test(file.path)
    ? { ...file, bytes: noindexArchivedHtml(Buffer.from(file.bytes).toString('utf8'), file.path) }
    : file)
}

const xmlEscape = (value: string) => value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;')
const bytes = (value: string) => Buffer.from(value, 'utf8')

export function generateDiscoveryFiles(config: PublicationConfig, urls: readonly string[], shardSize = 50_000): DistributionFile[] {
  if (!Number.isInteger(shardSize) || shardSize < 1) throw new DistributionError(['sitemap shard size must be positive'])
  const ordered = [...new Set(urls)].sort(), shards: DistributionFile[] = []
  for (let index = 0; index < Math.max(1, Math.ceil(ordered.length / shardSize)); index++) {
    const entries = ordered.slice(index * shardSize, (index + 1) * shardSize)
    shards.push({ path: `sitemap-${index}.xml`, bytes: bytes(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${entries.map(url => `<url><loc>${xmlEscape(url)}</loc></url>`).join('')}</urlset>\n`) })
  }
  const origin = config.siteOrigin.replace(/\/$/, '')
  const index = `<?xml version="1.0" encoding="UTF-8"?><sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${shards.map(file => `<sitemap><loc>${origin}/${file.path}</loc></sitemap>`).join('')}</sitemapindex>\n`
  return [{ path: 'robots.txt', bytes: bytes(`User-agent: *\nAllow: /\nSitemap: ${origin}/sitemap-index.xml\n`) }, ...shards, { path: 'sitemap-index.xml', bytes: bytes(index) }]
}

const explicitGlobal = new Set(['404.html', 'robots.txt', 'sitemap-index.xml'])
function isAllowedReference(value: string, input: NormalizedInput, config: PublicationConfig, sourcePath: string): boolean {
  const raw = value.trim()
  if (!raw || raw.startsWith('#')) return true
  let path = raw.split(/[?#]/, 1)[0]
  if (/^(?:[a-z][a-z\d+.-]*:|\/\/)/i.test(raw)) {
    let url: URL
    try { url = new URL(raw, config.siteOrigin) } catch { return true }
    if (url.origin !== config.siteOrigin) return true
    path = url.pathname
  }
  if (path.startsWith('/') && (explicitGlobal.has(path.slice(1)) || /^sitemap-\d+\.xml$/.test(path.slice(1)))) return true
  const current = input.destination === '/' ? sourcePath : `${input.destination.slice(1)}/${sourcePath}`
  const target = path.startsWith('/') ? posix.normalize(path) : posix.normalize(posix.join('/', posix.dirname(current), path))
  if (input.base === '/') return true
  const own = `/${input.base.slice(1)}`
  if (target === own || target.startsWith(`${own}/`)) return true
  if (target.startsWith('/ediciones/')) return config.archives.some(archive => target === archive.base || target.startsWith(`${archive.base}/`))
  return true
}

export function scanReferences(config: PublicationConfig, inputs: readonly NormalizedInput[]): readonly string[] {
  const diagnostics: string[] = []
  const inspect = (input: NormalizedInput, file: NormalizedFile, attribute: string, value: string) => {
    for (const candidate of attribute === 'srcset' ? value.split(',').map(part => part.trim().split(/\s+/, 1)[0]) : [value])
      if (!isAllowedReference(candidate, input, config, file.relativePath)) diagnostics.push(`archive base escape: ${input.ownerId} ${file.relativePath} ${attribute} ${candidate}`)
  }
  for (const input of inputs) for (const file of input.files) {
    const text = Buffer.from(file.bytes).toString('utf8')
    if (/\.html$/i.test(file.relativePath)) for (const match of text.matchAll(/\b(href|src|action|poster|srcset)\s*=\s*["']([^"']*)["']/gi)) inspect(input, file, match[1], match[2])
    if (/\.css$/i.test(file.relativePath)) for (const match of text.matchAll(/url\(\s*["']?([^"')]+)["']?\s*\)/gi)) inspect(input, file, 'url()', match[1])
  }
  if (diagnostics.length) throw new DistributionError(diagnostics)
  return diagnostics
}

export function compose(request: ComposeRequest): ComposeResult {
  const config = validatePublicationConfig(request.config), inputs = loadInputs(config, request.inputs), appFiles = transformArchivedHtml(config, candidates(inputs))
  scanReferences(config, inputs)
  const files = [{ path: '404.html', bytes: bytes(generateNotFoundHtml()), owner: 'distribution' }, ...appFiles, ...generateDiscoveryFiles(config, routeInventory(config, appFiles)).map(file => ({ ...file, owner: 'distribution' }))]
    .sort((a, b) => a.path < b.path ? -1 : a.path > b.path ? 1 : a.owner < b.owner ? -1 : a.owner > b.owner ? 1 : 0)
  const manifest = files.map(file => ({ path: file.path, owner: file.owner, bytes: file.bytes.byteLength, sha256: createHash('sha256').update(file.bytes).digest('hex') }))
  const manifestText = JSON.stringify(manifest), outputRoot = resolve(request.outputRoot), stage = mkdtempSync(join(dirname(outputRoot), `.${outputRoot.split(sep).pop()}-staging-`)), write = request.operations?.writeFile ?? writeFileSync, rename = request.operations?.rename ?? renameSync
  try {
    for (const file of files) { const target = join(stage, ...file.path.split('/')); mkdirSync(dirname(target), { recursive: true }); write(target, file.bytes) }
    write(join(dirname(outputRoot), '.distribution-manifest.json'), JSON.stringify({ configSha256: configurationDigest(config), manifest }))
    const backup = `${outputRoot}.previous`
    if (lstatSafe(outputRoot)) { rmSync(backup, { recursive: true, force: true }); rename(outputRoot, backup) }
    try { rename(stage, outputRoot) } catch (error) { if (lstatSafe(backup)) rename(backup, outputRoot); throw error }
    rmSync(backup, { recursive: true, force: true })
    return { outputRoot, manifest, manifestSha256: createHash('sha256').update(manifestText).digest('hex'), configSha256: configurationDigest(config) }
  } catch (error) { if (lstatSafe(stage)) rmSync(stage, { recursive: true, force: true }); throw error }
}
function lstatSafe(path: string): boolean { try { lstatSync(path); return true } catch { return false } }

export const normalizeInput = normalizeBuildOutput
export const composeDistribution = compose
