import { fileURLToPath } from 'node:url'
import { resolve } from 'node:path'
import { publicationConfig } from '../../../editions.config.ts'

export const repositoryRoot = resolve(fileURLToPath(new URL('../../..', import.meta.url)))

const TOOL_MECHANICS = {
  'calls-2026': { directory: 'apps/calls-2026', outputDirectory: 'dist' },
  'festival-2023': { directory: 'apps/festival-2023', outputDirectory: 'dist' },
  'festival-2024': { directory: 'apps/festival-2024', outputDirectory: 'dist' },
  'festival-2025': { directory: 'apps/festival-2025', outputDirectory: 'dist' },
}

function app(publication) {
  const { id, packageName } = publication
  const mechanics = TOOL_MECHANICS[id]
  if (!mechanics) throw new Error(`Missing visual review mechanics for ${id}`)
  return Object.freeze({
    id,
    packageName,
    ...mechanics,
    base: publication.base ? `${publication.base.replace(/\/+$/, '')}/` : '/',
    buildCommand: ['pnpm', '--filter', packageName, 'build'],
    previewCommand: ['pnpm', 'exec', 'astro', 'preview'],
  })
}

export const APP_CONFIGS = Object.freeze(Object.fromEntries(
  [publicationConfig.active, ...publicationConfig.archives].map((publication) => [publication.id, app(publication)]),
))

export function resolveApps(selectedIds = []) {
  if (selectedIds.length > 1) throw new Error('Only one --app may be specified at a time')
  const id = selectedIds[0] ?? publicationConfig.active.id
  const appConfig = APP_CONFIGS[id] ?? Object.values(APP_CONFIGS).find(
    (candidate) => candidate.packageName === id,
  )
  if (!appConfig) throw new Error(`Unknown app: ${id}`)
  return [appConfig]
}
