import test from 'node:test'
import assert from 'node:assert/strict'
import { main, parseArgs } from '../src/cli.mjs'

test('parses app and repeatable browser options', () => {
  assert.deepEqual(parseArgs([
    '--app', 'festival-2025',
    '--browser', 'chromium',
    '--browser=webkit',
  ]), {
    apps: ['festival-2025'],
    browsers: ['chromium', 'webkit'],
    help: false,
  })
})

test('defaults to all browsers when none are selected', () => {
  assert.deepEqual(parseArgs([]), {
    apps: [],
    browsers: ['chromium', 'firefox', 'webkit'],
    help: false,
  })
})

test('rejects missing values and unknown browsers', () => {
  assert.throws(() => parseArgs(['--app']), /requires a value/)
  assert.throws(() => parseArgs(['--browser']), /requires a value/)
  assert.throws(() => parseArgs(['--browser', 'safari']), /Unknown browser.*safari/)
  assert.throws(() => parseArgs(['--unknown']), /Unknown option/)
})

test('defaults to active, replaces the default with one app, and rejects two apps', async () => {
  const calls = []
  const capture = async (apps) => calls.push(apps.map(({ id }) => id))
  await main([], { capture })
  await main(['--app', 'festival-2024'], { capture })
  assert.deepEqual(calls, [['calls-2026'], ['festival-2024']])
  await assert.rejects(main(['--app', 'calls-2026', '--app', 'festival-2024'], { capture }),
    /Only one --app may be specified at a time/)
})

test('forwards the selected browsers to capture', async () => {
  const calls = []
  await main(['--app', 'calls-2026', '--browser', 'chromium'], {
    capture: async (apps, options) => calls.push({ apps, options }),
    outputRoot: '/output/playwright',
  })

  assert.deepEqual(calls[0].options.browserNames, ['chromium'])
  assert.equal(calls[0].apps[0].id, 'calls-2026')
})
