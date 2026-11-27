import type { APIRoute } from 'astro'
import { motifSequence } from '../../features/poster/poster'
import { createPosterPatternImage } from '../../features/poster/poster-pattern-image'

export function getStaticPaths() {
  return motifSequence.map(motif => ({ params: { motif } }))
}

export const GET: APIRoute = ({ params }) => {
  const motif = motifSequence.find(value => value === params.motif)
  return motif
    ? new Response(createPosterPatternImage(motif), { headers: { 'Content-Type': 'image/svg+xml' } })
    : new Response(null, { status: 404 })
}
