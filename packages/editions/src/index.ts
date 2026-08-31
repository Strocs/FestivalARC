import { createHash } from 'node:crypto'

declare const baseBrand: unique symbol
declare const editionBrand: unique symbol
declare const callsBrand: unique symbol
export type PublicationBase = string & { readonly [baseBrand]: true }
export type EditionId = `festival-${number}` & { readonly [editionBrand]: true }
export type CallsId = `calls-${number}` & { readonly [callsBrand]: true }
export type FinalPublication = { readonly kind: 'final'; readonly id: EditionId; readonly year: number; readonly packageName: string }
export type CallsPublication = { readonly kind: 'calls'; readonly id: CallsId; readonly year: number; readonly packageName: string; readonly expiresWhenFinalPublished: true }
export type Publication = FinalPublication | CallsPublication
export type ArchivePublication = FinalPublication & { readonly base: PublicationBase }
export type PublicationConfig = { readonly schemaVersion: 1; readonly siteOrigin: `https://${string}`; readonly active: Publication; readonly archives: readonly ArchivePublication[]; readonly global: { readonly notFound: 'distribution'; readonly robots: 'distribution'; readonly sitemap: 'distribution' } }
export type ValidationOptions = { readonly knownWorkspacePackages?: Iterable<string> }

export class PublicationConfigError extends Error {
  constructor(readonly diagnostics: readonly string[]) { super(`Invalid publication configuration: ${diagnostics.join('; ')}`); this.name = 'PublicationConfigError' }
}
export type FinalPublicationInput = { id: string; year: number; packageName: string }
export type CallsLifecycleOptions = ValidationOptions & { readonly callsPackageName?: string }
type PublicationInput = FinalPublicationInput & { kind: 'final' | 'calls'; expiresWhenFinalPublished?: true }
const record = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null && !Array.isArray(value)

export function publicationBase(value: string): PublicationBase {
  if (value !== '/' && !/^\/ediciones\/[1-9]\d{3}$/.test(value)) throw new Error(`Invalid publication base: ${value}`)
  return value as PublicationBase
}
export const createPublicationBase = publicationBase
export function isPublicationBase(value: string): value is PublicationBase { try { publicationBase(value); return true } catch { return false } }
export function baseForPublication(publication: Publication, archive = false): PublicationBase { return publicationBase(archive ? `/ediciones/${publication.year}` : '/') }
function make(input: PublicationInput): Publication {
  if (!Number.isInteger(input.year) || input.year < 1000 || input.year > 9999) throw new Error('Publication year must be a four-digit integer')
  const expected = `${input.kind === 'final' ? 'festival' : 'calls'}-${input.year}`
  if (input.id !== expected) throw new Error(`Publication id must match year: expected ${expected}`)
  if (!input.packageName) throw new Error('Publication packageName is required')
  return input.kind === 'calls' ? { kind: 'calls', id: input.id as CallsId, year: input.year, packageName: input.packageName, expiresWhenFinalPublished: true } : { kind: 'final', id: input.id as EditionId, year: input.year, packageName: input.packageName }
}
export function createFinalPublication(input: FinalPublicationInput): FinalPublication { return make({ ...input, kind: 'final' }) as FinalPublication }
export function createCallsPublication(input: Omit<PublicationInput, 'kind'>): CallsPublication { return make({ ...input, kind: 'calls' }) as CallsPublication }

export function validateCallsRootConfig(input: unknown, options: CallsLifecycleOptions = {}): PublicationConfig {
  const config = validatePublicationConfig(input, options)
  const expectedPackage = options.callsPackageName ?? `calls-${config.active.kind === 'calls' ? config.active.year : '2026'}`
  const diagnostics: string[] = []
  if (config.active.kind !== 'calls') diagnostics.push('calls lifecycle requires a calls publication at the root')
  else if (config.active.packageName !== expectedPackage) diagnostics.push(`calls package must be ${expectedPackage}`)
  if (diagnostics.length) throw new PublicationConfigError(diagnostics)
  return config
}

export function validateFinalPublicationConfig(input: unknown, options: CallsLifecycleOptions = {}): PublicationConfig {
  const config = validatePublicationConfig(input, options)
  const callsPackage = options.callsPackageName
  const publications = [config.active, ...config.archives]
  const diagnostics: string[] = []
  if (config.active.kind === 'calls') diagnostics.push('final publication config cannot select temporary calls')
  if (callsPackage && publications.some((publication) => publication.packageName === callsPackage)) diagnostics.push(`calls package must be removed from final publication config: ${callsPackage}`)
  if (diagnostics.length) throw new PublicationConfigError(diagnostics)
  return config
}

export function replaceCallsWithFinal(input: unknown, replacement: FinalPublication | FinalPublicationInput, options: CallsLifecycleOptions = {}): PublicationConfig {
  const callsConfig = validateCallsRootConfig(input, options)
  const final = 'kind' in replacement ? replacement : createFinalPublication(replacement)
  if (final.year !== callsConfig.active.year) throw new PublicationConfigError(['final replacement year must match the active calls year'])
  return validateFinalPublicationConfig({ ...callsConfig, active: final }, options)
}
function parse(value: unknown, path: string, errors: string[], known?: Set<string>): Publication | undefined {
  if (!record(value) || (value.kind !== 'final' && value.kind !== 'calls')) { errors.push(`${path} must be a final or calls publication`); return }
  const { kind, id, year, packageName } = value
  if (typeof id !== 'string' || typeof year !== 'number' || typeof packageName !== 'string') { errors.push(`${path} must include string id/packageName and numeric year`); return }
  if (!Number.isInteger(year) || year < 1000 || year > 9999) errors.push(`${path}.year must be a four-digit integer`)
  if (id !== `${kind === 'final' ? 'festival' : 'calls'}-${year}`) errors.push(`${path}.id must match year`)
  if (known && !known.has(packageName)) errors.push(`${path}.packageName is an unknown workspace package: ${packageName}`)
  if (kind === 'calls' && value.expiresWhenFinalPublished !== true) errors.push(`${path}.expiresWhenFinalPublished must be true`)
  return kind === 'calls' ? { kind, id: id as CallsId, year, packageName, expiresWhenFinalPublished: true } : { kind, id: id as EditionId, year, packageName }
}
export function validatePublicationConfig(input: unknown, options: ValidationOptions = {}): PublicationConfig {
  const errors: string[] = [], known = options.knownWorkspacePackages && new Set(options.knownWorkspacePackages)
  if (!record(input)) throw new PublicationConfigError(['configuration must be an object'])
  if (input.schemaVersion !== 1) errors.push('schemaVersion must be 1')
  if (typeof input.siteOrigin !== 'string') errors.push('siteOrigin must be an HTTPS URL')
  else try { const origin = new URL(input.siteOrigin); if (origin.protocol !== 'https:' || origin.pathname !== '/' || origin.search || origin.hash) errors.push('siteOrigin must be an HTTPS origin') } catch { errors.push('siteOrigin must be an HTTPS URL') }
  if (!input.active || Array.isArray(input.active)) errors.push('active must contain exactly one publication')
  const active = parse(input.active, 'active', errors, known), archives: ArchivePublication[] = []
  if (!Array.isArray(input.archives)) errors.push('archives must be an array')
  if (Array.isArray(input.archives)) input.archives.forEach((entry, index) => { const path = `archives[${index}]`, parsed = parse(entry, path, errors, known); if (!parsed) return; if (parsed.kind !== 'final') { errors.push(`${path}: archives may contain final publications only`); return }; const base = record(entry) && typeof entry.base === 'string' ? entry.base : ''; if (base !== `/ediciones/${parsed.year}`) { errors.push(`${path}.base must be /ediciones/${parsed.year}`); return }; try { archives.push({ ...parsed, base: publicationBase(base) }) } catch { errors.push(`${path}.base is invalid`) } })
  const global = input.global
  if (!record(global)) errors.push('global must explicitly assign distribution ownership')
  else for (const key of ['notFound', 'robots', 'sitemap']) if (global[key] !== 'distribution') errors.push(`global.${key} must be distribution-owned`)
  if (active) { const ids = [active.id, ...archives.map(a => a.id)], years = archives.map(a => a.year); if (new Set(ids).size !== ids.length) errors.push('publication ids must be unique'); if (new Set(years).size !== years.length) errors.push('duplicate archive year') }
  if (errors.length || !active || !record(global)) throw new PublicationConfigError(errors)
  return { schemaVersion: 1, siteOrigin: input.siteOrigin as `https://${string}`, active, archives, global: { notFound: 'distribution', robots: 'distribution', sitemap: 'distribution' } }
}
export function configurationDigestInput(config: PublicationConfig): string { return JSON.stringify({ schemaVersion: config.schemaVersion, siteOrigin: config.siteOrigin, active: config.active, archives: [...config.archives].sort((a, b) => a.year - b.year), global: config.global }) }
export const publicationConfigDigestInput = configurationDigestInput
export const configDigestInput = configurationDigestInput
export function configurationDigest(config: PublicationConfig): string { return createHash('sha256').update(configurationDigestInput(config), 'utf8').digest('hex') }
export const configDigest = configurationDigest
