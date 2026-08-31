import { cpSync, existsSync, mkdirSync, mkdtempSync, readdirSync, rmSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { spawnSync } from 'node:child_process'
import { resolveAstroOutput } from './build-output.mjs'

const outputDirectory = process.env.DISTRIBUTION_OUTPUT_DIR
const buildDirectory = outputDirectory
  ? mkdtempSync(join(resolve('.'), '.distribution-build-'))
  : resolve('dist')
const environment = {
  ...process.env,
  NODE_ENV: 'production',
  ...(outputDirectory ? { DISTRIBUTION_OUTPUT_DIR: buildDirectory } : {}),
}

if (!outputDirectory) rmSync(buildDirectory, { recursive: true, force: true })
try {
  const result = spawnSync('astro', ['build'], { stdio: 'inherit', env: environment })
  if (result.error) throw result.error
  if (result.status !== 0) throw new Error(`Astro build exited with status ${result.status ?? 1}`)

  if (!outputDirectory) {
    const outputPath = resolveAstroOutput({
      distExists: existsSync(resolve('dist')),
      vercelStaticExists: existsSync(resolve('.vercel/output/static'))
    })
    if (outputPath !== 'dist') {
      rmSync(resolve('dist'), { recursive: true, force: true })
      cpSync(resolve(outputPath), resolve('dist'), { recursive: true })
    }
    for (const file of readdirSync(resolve('dist')).filter((name) => /^(404|robots|sitemap)/.test(name))) rmSync(resolve('dist', file), { recursive: true, force: true })
  } else {
    const destination = resolve(outputDirectory)
    rmSync(destination, { recursive: true, force: true })
    mkdirSync(destination, { recursive: true })
    cpSync(buildDirectory, destination, { recursive: true })
    for (const file of readdirSync(destination).filter((name) => /^(404|robots|sitemap)/.test(name))) rmSync(resolve(destination, file), { recursive: true, force: true })
  }
} finally {
  if (outputDirectory) rmSync(buildDirectory, { recursive: true, force: true })
  rmSync(resolve('.vercel'), { recursive: true, force: true })
}
