import { readFileSync, readdirSync } from 'node:fs'
import { mkdtempSync, rmSync } from 'node:fs'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { dirname, join, resolve } from 'node:path'
import { baseForPublication } from '@festivalarc/editions'
import type { PublicationConfig } from '@festivalarc/editions'
import { buildApp, compose } from './index.js'

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../../..')
const { publicationConfig } = await import(pathToFileURL(join(repositoryRoot, 'editions.config.ts')).href) as { publicationConfig: PublicationConfig }
const appDirectories = new Map<string, string>()
for (const directory of readdirSync(join(repositoryRoot, 'apps'))) {
  const packageDirectory = join(repositoryRoot, 'apps', directory)
  try {
    const manifest = JSON.parse(readFileSync(join(packageDirectory, 'package.json'), 'utf8')) as { name?: string }
    if (manifest.name) appDirectories.set(manifest.name, packageDirectory)
  } catch {
    // Non-package directories cannot be selected by a validated publication config.
  }
}

const publications = [
  { publication: publicationConfig.active, base: baseForPublication(publicationConfig.active), destination: '/' },
  ...publicationConfig.archives.map((publication) => ({ publication, base: publication.base, destination: publication.base })),
]
const missing = publications.filter(({ publication }) => !appDirectories.has(publication.packageName))
if (missing.length) throw new Error(`Configured publication package is missing: ${missing.map(({ publication }) => publication.packageName).join(', ')}`)

const stagingRoot = mkdtempSync(join(repositoryRoot, '.distribution-build-'))
try {
  const inputs = []
  for (const { publication, base, destination } of publications) {
    inputs.push(await buildApp({
      ownerId: publication.id,
      kind: publication.kind,
      packageDir: appDirectories.get(publication.packageName)!,
      outputDirectory: join(stagingRoot, publication.id),
      base,
    }))
  }
  const result = compose({ config: publicationConfig, inputs, outputRoot: join(repositoryRoot, '.output') })
  console.log(`Composed ${result.manifest.length} files into ${result.outputRoot}`)
  console.log(`Manifest SHA-256: ${result.manifestSha256}`)
  console.log(`Configuration SHA-256: ${result.configSha256}`)
} finally {
  rmSync(stagingRoot, { recursive: true, force: true })
}
