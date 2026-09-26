import test from 'node:test'
import assert from 'node:assert/strict'
import { APP_CONFIGS, resolveApps } from '../src/config.mjs'

test('declares every real app with its package, build output, preview, and base', () => {
  assert.deepEqual(Object.keys(APP_CONFIGS), [
    'festival-2025',
    'calls-2026',
    'festival-2023',
    'festival-2024',
  ])

  assert.deepEqual(
    Object.fromEntries(Object.entries(APP_CONFIGS).map(([id, app]) => [id, {
      packageName: app.packageName,
      directory: app.directory,
      base: app.base,
      outputDirectory: app.outputDirectory,
    }])),
    {
      'festival-2025': {
        packageName: 'festivalarc-2025',
        directory: 'apps/festival-2025',
        base: '/ediciones/2025/',
        outputDirectory: 'dist',
      },
      'calls-2026': {
        packageName: 'calls-2026',
        directory: 'apps/calls-2026',
        base: '/',
        outputDirectory: 'dist',
      },
      'festival-2023': {
        packageName: 'festival-arc-2023',
        directory: 'apps/festival-2023',
        base: '/ediciones/2023/',
        outputDirectory: 'dist',
      },
      'festival-2024': {
        packageName: 'festival-arc-2024',
        directory: 'apps/festival-2024',
        base: '/ediciones/2024/',
        outputDirectory: 'dist',
      },
    },
  )
})

test('resolves repeated app selections and rejects unknown apps', () => {
  assert.deepEqual(resolveApps(['festival-2024', 'calls-2026', 'festival-2024']), [
    APP_CONFIGS['festival-2024'],
    APP_CONFIGS['calls-2026'],
  ])
  assert.throws(() => resolveApps(['missing']), /Unknown app.*missing/)
})
