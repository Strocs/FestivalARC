import { fileURLToPath } from 'node:url'
import { resolve } from 'node:path'

export const repositoryRoot = resolve(fileURLToPath(new URL('../../..', import.meta.url)))

export const APP_CONFIGS = Object.freeze({
  'festival-2025': app('festival-2025', {
    packageName: 'festivalarc-2025',
    directory: 'apps/festival-2025',
    base: '/ediciones/2025/',
  }),
  'calls-2026': app('calls-2026', {
    packageName: 'calls-2026',
    directory: 'apps/calls-2026',
    base: '/',
  }),
  'festival-2023': app('festival-2023', {
    packageName: 'festival-arc-2023',
    directory: 'apps/festival-2023',
    base: '/ediciones/2023/',
  }),
  'festival-2024': app('festival-2024', {
    packageName: 'festival-arc-2024',
    directory: 'apps/festival-2024',
    base: '/ediciones/2024/',
  }),
})

function app(id, { packageName, directory, base }) {
  return Object.freeze({
    id,
    packageName,
    directory,
    base,
    outputDirectory: 'dist',
    buildCommand: ['pnpm', '--filter', packageName, 'build'],
    previewCommand: ['pnpm', 'exec', 'astro', 'preview'],
  })
}

export function resolveApps(selectedIds = []) {
  const ids = selectedIds.length > 0 ? selectedIds : Object.keys(APP_CONFIGS)
  const seen = new Set()

  return ids.map((id) => {
    const appConfig = APP_CONFIGS[id] ?? Object.values(APP_CONFIGS).find(
      (candidate) => candidate.packageName === id,
    )
    if (!appConfig) throw new Error(`Unknown app: ${id}`)
    if (seen.has(appConfig)) return null
    seen.add(appConfig)
    return appConfig
  }).filter(Boolean)
}
