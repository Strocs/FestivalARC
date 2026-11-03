import { readdir } from 'node:fs/promises'
import { extname, join, relative, sep } from 'node:path'

export async function discoverPublicPages(outputDirectory) {
  const files = await collectHtmlFiles(outputDirectory)
  return files
    .filter((filePath) => isPublicHtmlFile(filePath, outputDirectory))
    .map((filePath) => ({
      filePath,
      route: routeFromHtmlFile(filePath, outputDirectory),
    }))
    .sort((left, right) => left.route.localeCompare(right.route))
}

async function collectHtmlFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true })
  const files = []

  for (const entry of entries) {
    const entryPath = join(directory, entry.name)
    if (entry.isDirectory()) {
      files.push(...(await collectHtmlFiles(entryPath)))
    } else if (entry.isFile() && extname(entry.name).toLowerCase() === '.html') {
      files.push(entryPath)
    }
  }

  return files
}

function isPublicHtmlFile(filePath, outputDirectory) {
  const relativePath = relative(outputDirectory, filePath)
  const segments = relativePath.split(sep)
  const fileName = segments.at(-1)

  return fileName !== '404.html'
    && segments[0] !== '404'
    && segments.every((segment) => !segment.startsWith('_'))
}

function routeFromHtmlFile(filePath, outputDirectory) {
  const relativePath = relative(outputDirectory, filePath).split(sep).join('/')
  if (relativePath === 'index.html') return '/'
  if (relativePath.endsWith('/index.html')) {
    return `/${relativePath.slice(0, -'/index.html'.length)}/`
  }

  return `/${relativePath.slice(0, -'.html'.length)}`
}

export function sanitizeRoute(route) {
  const segments = route
    .split('/')
    .filter(Boolean)
    .map((segment) => segment.replace(/[^a-zA-Z0-9._-]+/g, '-'))
    .filter(Boolean)

  return segments.length > 0 ? segments.join('--') : 'home'
}
