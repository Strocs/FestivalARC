export function resolveAstroOutput({ distExists, vercelStaticExists }) {
  if (distExists) return 'dist'
  if (vercelStaticExists) return '.vercel/output/static'
  throw new Error('Astro did not produce a static output directory')
}
