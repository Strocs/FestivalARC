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

test('always stops preview when capture fails', async () => {
  const events = []
  const preview = { exitCode: null }

  await assert.rejects(
    captureApp(app, {
      rootDirectory: '/repo',
      outputRoot: '/repo/output/playwright',
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
