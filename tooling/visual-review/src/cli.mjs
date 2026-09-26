import { rm } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { join } from 'node:path'
import { resolveApps, repositoryRoot } from './config.mjs'
import { BROWSER_NAMES } from './capture.mjs'
import { runCapture } from './runner.mjs'

export function parseArgs(argv) {
  const apps = []
  const browsers = []
  let help = false

  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index]
    if (argument === '--' || argument === '') continue
    if (argument === '--help' || argument === '-h') {
      help = true
      continue
    }
    if (argument === '--app') {
      const value = argv[index + 1]
      if (!value || value.startsWith('-')) throw new Error('--app requires a value')
      apps.push(value)
      index += 1
      continue
    }
    if (argument.startsWith('--app=')) {
      const value = argument.slice('--app='.length)
      if (!value) throw new Error('--app requires a value')
      apps.push(value)
      continue
    }
    if (argument === '--browser') {
      const value = argv[index + 1]
      if (!value || value.startsWith('-')) throw new Error('--browser requires a value')
      addBrowser(browsers, value)
      index += 1
      continue
    }
    if (argument.startsWith('--browser=')) {
      const value = argument.slice('--browser='.length)
      if (!value) throw new Error('--browser requires a value')
      addBrowser(browsers, value)
      continue
    }
    throw new Error(`Unknown option: ${argument}`)
  }

  return {
    apps,
    browsers: browsers.length > 0 ? browsers : [...BROWSER_NAMES],
    help,
  }
}

export async function cleanOutput(outputRoot = join(repositoryRoot, 'output', 'playwright')) {
  await rm(outputRoot, { recursive: true, force: true })
}

export async function main(argv = process.argv.slice(2), {
  capture = runCapture,
  outputRoot,
} = {}) {
  const options = parseArgs(argv)
  if (options.help) {
    console.log(usage())
    return
  }

  await capture(resolveApps(options.apps), {
    browserNames: options.browsers,
    ...(outputRoot ? { outputRoot } : {}),
  })
}

function usage() {
  return `Usage: visual-capture [--app <app>]... [--browser <browser>]...\n\nApps default to all configured apps. Browsers default to chromium, firefox, and webkit. Repeat --app or --browser to select multiple values.\nAllowed browsers: ${BROWSER_NAMES.join('|')}.`
}

function addBrowser(browsers, value) {
  if (!BROWSER_NAMES.includes(value)) throw new Error(`Unknown browser: ${value}`)
  browsers.push(value)
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  main().catch((error) => {
    console.error(error.message)
    process.exitCode = 1
  })
}
