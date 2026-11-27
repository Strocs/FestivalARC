import type { PublicationConfig } from '@festivalarc/editions'

const posterPrefix = 'poster-variants/'
const scopes = [
  ['home', 'index.html'],
  ['music', 'musica/index.html'],
  ['stage', 'artes-escenicas/index.html'],
] as const
const days = ['all', 'saturday', 'sunday']
const orders = ['original', 'time', 'location']

export const isPosterVariant = (path: string) => path.startsWith(posterPrefix) && /\.html$/i.test(path)

type AppFile = { path: string; owner: string; bytes: Uint8Array }

// The public routes must have no filesystem match so Vercel evaluates the
// conditional rewrites. Flatten both default and filtered documents to .html.
export function packageVercelPosters(config: PublicationConfig, files: readonly AppFile[]): AppFile[] {
  if (config.active.id !== 'festival-2026') throw new Error('Vercel poster rewrites require festival-2026 as the active publication')

  const byPath = new Map(files.map(file => [file.path, file]))
  for (const [scope, defaultPath] of scopes) {
    if (scope !== 'home') {
      const publicPath = defaultPath.slice(0, -'/index.html'.length)
      const collision = [publicPath, `${publicPath}.html`].find(path => byPath.has(path))
      if (collision) throw new Error(`Vercel poster route has a filesystem match: ${collision}`)
    }
    for (const day of days) for (const order of orders) {
      const directory = `${posterPrefix}${scope}/${day}-${order}`
      const source = day === 'all' && order === 'original' ? defaultPath : `${directory}/index.html`
      const destination = `${directory}.html`
      const file = byPath.get(source)
      if (!file || file.owner !== config.active.id) throw new Error(`Missing Vercel poster document: ${source}`)
      if (byPath.has(destination)) throw new Error(`Vercel poster destination collision: ${destination}`)
      byPath.delete(source)
      byPath.set(destination, { ...file, path: destination })
    }
  }
  return [...byPath.values()]
}
