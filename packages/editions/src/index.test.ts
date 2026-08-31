import { describe, expect, it } from 'vitest'
import { configurationDigest, createCallsPublication, createFinalPublication, publicationBase, replaceCallsWithFinal, validateCallsRootConfig, validateFinalPublicationConfig, validatePublicationConfig } from './index.js'

const known = ['festivalarc-2025', 'festivalarc-2024', 'calls-2026']
const final2025 = () => createFinalPublication({ id: 'festival-2025', year: 2025, packageName: 'festivalarc-2025' })
const valid = () => ({ schemaVersion: 1, siteOrigin: 'https://festivalarc.com', active: final2025(), archives: [], global: { notFound: 'distribution', robots: 'distribution', sitemap: 'distribution' } })

describe('publication contracts', () => {
  it('accepts final, archive, and temporary calls members', () => {
    const config = validatePublicationConfig({ ...valid(), archives: [{ ...createFinalPublication({ id: 'festival-2024', year: 2024, packageName: 'festivalarc-2024' }), base: publicationBase('/ediciones/2024') }] }, { knownWorkspacePackages: known })
    expect(config.archives[0].base).toBe('/ediciones/2024')
    expect(configurationDigest(config)).toMatch(/^[a-f0-9]{64}$/)
    expect(validatePublicationConfig({ ...valid(), active: createCallsPublication({ id: 'calls-2026', year: 2026, packageName: 'calls-2026' }) }, { knownWorkspacePackages: known }).active.kind).toBe('calls')
  })

  it('models the reversible calls-to-final replacement without mutating the calls config', () => {
    const calls = validateCallsRootConfig({ ...valid(), active: createCallsPublication({ id: 'calls-2026', year: 2026, packageName: 'calls-2026' }) }, { knownWorkspacePackages: known, callsPackageName: 'calls-2026' })
    const replacement = replaceCallsWithFinal(calls, { id: 'festival-2026', year: 2026, packageName: 'festivalarc-2026' }, { knownWorkspacePackages: [...known, 'festivalarc-2026'], callsPackageName: 'calls-2026' })
    expect(calls.active.kind).toBe('calls')
    expect(replacement.active).toEqual({ kind: 'final', id: 'festival-2026', year: 2026, packageName: 'festivalarc-2026' })
    expect(() => validateFinalPublicationConfig({ ...valid(), active: createCallsPublication({ id: 'calls-2026', year: 2026, packageName: 'calls-2026' }) }, { knownWorkspacePackages: known, callsPackageName: 'calls-2026' })).toThrow('cannot select temporary calls')
    expect(() => validateFinalPublicationConfig({ ...valid(), active: { kind: 'final', id: 'festival-2025', year: 2025, packageName: 'calls-2026' } }, { knownWorkspacePackages: known, callsPackageName: 'calls-2026' })).toThrow('must be removed')
    expect(() => replaceCallsWithFinal(calls, { id: 'festival-2025', year: 2025, packageName: 'festivalarc-2025' }, { knownWorkspacePackages: known, callsPackageName: 'calls-2026' })).toThrow('year must match')
  })

  it.each([
    [{ active: undefined }, 'active must contain exactly one publication'],
    [{ active: [] }, 'active must contain exactly one publication'],
    [{ active: { kind: 'final', id: 'festival-20', year: 20, packageName: 'festivalarc-2025' } }, 'active.year must be a four-digit integer'],
    [{ active: { kind: 'final', id: 'festival-2024', year: 2025, packageName: 'festivalarc-2025' } }, 'active.id must match year'],
    [{ active: { kind: 'final', id: 'festival-2025', year: 2025, packageName: 'missing' } }, 'unknown workspace package'],
    [{ archives: [{ kind: 'calls', id: 'calls-2026', year: 2026, packageName: 'calls-2026', expiresWhenFinalPublished: true, base: '/ediciones/2026' }] }, 'archives may contain final publications only'],
    [{ archives: [{ kind: 'final', id: 'festival-2024', year: 2024, packageName: 'festivalarc-2024', base: '/ediciones/2024' }, { kind: 'final', id: 'festival-2024', year: 2024, packageName: 'festivalarc-2024', base: '/ediciones/2024' }] }, 'publication ids must be unique'],
    [{ archives: [{ kind: 'final', id: 'festival-2024', year: 2024, packageName: 'festivalarc-2024', base: '/wrong/2024' }] }, 'base must be /ediciones/2024'],
    [{ schemaVersion: 2 }, 'schemaVersion must be 1'],
    [{ global: { notFound: 'edition', robots: 'distribution', sitemap: 'distribution' } }, 'global.notFound must be distribution-owned'],
  ] as const)('rejects invalid configuration %#', (override, diagnostic) => {
    expect(() => validatePublicationConfig({ ...valid(), ...override }, { knownWorkspacePackages: known })).toThrow(diagnostic)
  })
})
