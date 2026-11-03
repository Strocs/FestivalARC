import { rm } from 'node:fs/promises'
import { spawn } from 'node:child_process'
import { createServer } from 'node:net'
import { join } from 'node:path'
import { chromium, firefox, webkit } from '@playwright/test'
import { repositoryRoot } from './config.mjs'
import { BROWSER_NAMES, capturePages } from './capture.mjs'
import { discoverPublicPages } from './paths.mjs'

export async function captureApp(app, {
  rootDirectory = repositoryRoot,
  outputRoot = join(rootDirectory, 'output', 'playwright'),
  runCommand = runProcess,
  startPreview = spawnPreview,
  waitForPreview = waitForServer,
  discoverPages = discoverPublicPages,
  capturePages: capture = capturePages,
  getAvailablePort = findAvailablePort,
  stopProcess = stopPreview,
  removeOutput = rm,
  browsers = { chromium, firefox, webkit },
  browserNames = BROWSER_NAMES,
} = {}) {
  const appDirectory = join(rootDirectory, app.directory)
  const outputDirectory = join(outputRoot, app.id)
  const environment = {
    ...process.env,
    PUBLICATION_BASE: app.base,
  }

  await runCommand(app.buildCommand, {
    cwd: rootDirectory,
    env: environment,
  })

  const pages = await discoverPages(join(appDirectory, app.outputDirectory))
  if (pages.length === 0) throw new Error(`No public HTML pages found for ${app.id}`)

  await removeOutput(outputRoot, { recursive: true, force: true })
  const port = await getAvailablePort()
  const preview = startPreview(
    [...app.previewCommand, '--host', '127.0.0.1', '--port', String(port)],
    { cwd: appDirectory, env: environment },
  )

  try {
    const origin = `http://127.0.0.1:${port}`
    await waitForPreview(`${origin}${app.base}`, preview)
    await capture({
      origin,
      base: app.base,
      pages,
      outputDirectory,
      browserNames,
      browsers,
    })
  } finally {
    await stopProcess(preview)
  }
}

export async function runCapture(apps, options = {}) {
  for (const app of apps) await captureApp(app, options)
}

function runProcess(command, options) {
  const [executable, ...args] = command
  return new Promise((resolve, reject) => {
    const child = spawn(executable, args, { ...options, stdio: 'inherit' })
    child.once('error', reject)
    child.once('exit', (code, signal) => {
      if (code === 0) resolve()
      else reject(new Error(`${command.join(' ')} exited with ${signal || `status ${code ?? 1}`}`))
    })
  })
}

function spawnPreview(command, options) {
  const [executable, ...args] = command
  const child = spawn(executable, args, {
    ...options,
    stdio: 'inherit',
    detached: process.platform !== 'win32',
  })
  child.on('error', () => {})
  return child
}

async function waitForServer(url, process, {
  timeoutMs = 30_000,
  intervalMs = 100,
} = {}) {
  const deadline = Date.now() + timeoutMs
  let lastError

  while (Date.now() < deadline) {
    if (process.exitCode !== null) {
      throw new Error(`Preview exited before becoming ready${lastError ? `: ${lastError.message}` : ''}`)
    }
    try {
      await fetch(url)
      return
    } catch (error) {
      lastError = error
      await delay(intervalMs)
    }
  }

  throw new Error(`Preview did not become ready at ${url}${lastError ? `: ${lastError.message}` : ''}`)
}

async function findAvailablePort() {
  return new Promise((resolve, reject) => {
    const server = createServer()
    server.once('error', reject)
    server.listen(0, '127.0.0.1', () => {
      const address = server.address()
      server.close((error) => {
        if (error) reject(error)
        else resolve(address.port)
      })
    })
  })
}

async function stopPreview(process) {
  if (!process || process.exitCode !== null || process.killed) return

  terminate(process, 'SIGTERM')
  if (await waitForExit(process, 2_000)) return

  terminate(process, 'SIGKILL')
  await waitForExit(process, 2_000)
}

function terminate(process, signal) {
  try {
    if (globalThis.process.platform === 'win32') process.kill(signal)
    else globalThis.process.kill(-process.pid, signal)
  } catch {
    try {
      process.kill(signal)
    } catch {
      // The process may have exited between the state check and the signal.
    }
  }
}

function waitForExit(process, timeoutMs) {
  if (process.exitCode !== null) return Promise.resolve(true)
  return new Promise((resolve) => {
    const timer = setTimeout(() => resolve(false), timeoutMs)
    process.once('exit', () => {
      clearTimeout(timer)
      resolve(true)
    })
  })
}

function delay(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds))
}
