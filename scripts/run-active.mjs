import { spawn } from 'node:child_process'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { dirname, resolve } from 'node:path'

const task = process.argv[2]
if (!task) {
  console.error('usage: node scripts/run-active.mjs <turbo-task> [-- <args...>]')
  process.exit(1)
}

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const configUrl = pathToFileURL(resolve(root, 'editions.config.ts')).href
const { publicationConfig } = await import(configUrl)
const args = ['exec', 'turbo', 'run', task, `--filter=${publicationConfig.active.packageName}`]
let extraArgs = process.argv.slice(3)
if (extraArgs[0] === '--') extraArgs = extraArgs.slice(1)
if (extraArgs.length) args.push('--', ...extraArgs)

const child = spawn('pnpm', args, { cwd: root, stdio: 'inherit' })
child.on('exit', (code, signal) => {
  if (signal) process.kill(process.pid, signal)
  else process.exit(code)
})
child.on('error', (error) => {
  console.error(error)
  process.exit(1)
})
