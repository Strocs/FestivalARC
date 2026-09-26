import test from 'node:test'
import assert from 'node:assert/strict'
import { captureApp } from '../src/runner.mjs'

const app = {
  id: 'festival-2025',
  packageName: 'festivalarc-2025',
  directory: 'apps/festival-2025',
  base: '/',
  outputDirectory: 'dist',
  buildCommand: ['pnpm', '--filter', 'festivalarc-2025', 'build'],
  previewCommand: ['pnpm', 'exec', 'astro', 'preview'],
}

test('wipes the entire screenshot root only after build and discovery', async () => {
  const events = []
  await captureApp(app, {
    rootDirectory: '/repo',
    outputRoot: '/repo/output/playwright',
    runCommand: async () => events.push('build'),
    discoverPages: async () => {
      events.push('discover')
      return [{ route: '/', filePath: '/repo/dist/index.html' }]
    },
    removeOutput: async (path, options) => {
      assert.equal(path, '/repo/output/playwright')
      assert.deepEqual(options, { recursive: true, force: true })
      events.push('wipe')
    },
    getAvailablePort: async () => 4555,
    startPreview: () => { events.push('preview'); return { exitCode: null } },
    waitForPreview: async () => {},
    capturePages: async () => {},
    stopProcess: async () => {},
  })
  assert.deepEqual(events, ['build', 'discover', 'wipe', 'preview'])
})

test('failed build leaves the previous screenshot set intact', async () => {
  const events = []
  await assert.rejects(captureApp(app, {
    rootDirectory: '/repo',
    outputRoot: '/repo/output/playwright',
    runCommand: async () => { events.push('build'); throw new Error('build failed') },
    removeOutput: async () => events.push('wipe'),
    discoverPages: async () => events.push('discover'),
    startPreview: () => events.push('preview'),
  }), /build failed/)
  assert.deepEqual(events, ['build'])
})

test('always stops preview when capture fails', async () => {
  const events = []
  const preview = { exitCode: null }

  await assert.rejects(
    captureApp(app, {
      rootDirectory: '/repo',
      outputRoot: '/repo/output/playwright',
      removeOutput: async () => {},
      runCommand: async (command, options) => events.push({ type: 'run', command, options }),
      startPreview: (command, options) => {
        events.push({ type: 'preview', command, options })
        return preview
      },
      waitForPreview: async () => events.push({ type: 'wait' }),
      discoverPages: async () => [{ route: '/', filePath: '/repo/dist/index.html' }],
      capturePages: async () => {
        events.push({ type: 'capture' })
        throw new Error('screenshot failed')
      },
      getAvailablePort: async () => 4555,
      stopProcess: async (process) => {
        events.push({ type: 'stop', process })
      },
    }),
    /screenshot failed/,
  )

  assert.deepEqual(events.map(({ type }) => type), ['run', 'preview', 'wait', 'capture', 'stop'])
  assert.equal(events.at(-1).process, preview)
})
