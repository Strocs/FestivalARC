import test from 'node:test'
import assert from 'node:assert/strict'
import { publicationConfig } from '../../../editions.config.ts'
import { APP_CONFIGS, resolveApps } from '../src/config.mjs'

test('derives every publication from the shared configuration', () => {
  const publications = [publicationConfig.active, ...publicationConfig.archives]
  assert.deepEqual(Object.keys(APP_CONFIGS).sort(), publications.map(({ id }) => id).sort())
  for (const publication of publications) {
    assert.equal(APP_CONFIGS[publication.id].packageName, publication.packageName)
    assert.equal(APP_CONFIGS[publication.id].base, publication.base ? `${publication.base}/` : '/')
  }

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

test('defaults to the active publication and accepts one explicit selection', () => {
  assert.deepEqual(resolveApps(), [APP_CONFIGS[publicationConfig.active.id]])
  assert.deepEqual(resolveApps(['festival-2024']), [APP_CONFIGS['festival-2024']])
  assert.throws(() => resolveApps(['missing']), /Unknown app.*missing/)
})
