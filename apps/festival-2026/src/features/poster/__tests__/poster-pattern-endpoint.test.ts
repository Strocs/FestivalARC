import type { APIContext } from 'astro'
import { describe, expect, it } from 'vitest'
import { GET, getStaticPaths } from '../../../pages/patterns/[motif].svg.ts'
import { motifSequence } from '../poster'
import { createPosterPatternImage } from '../poster-pattern-image'

// GET only reads params; Astro supplies the remaining APIContext fields in production.
describe('static isolated motif resources', () => {
  it('publishes each finite canonical variant once', async () => {
    expect(await getStaticPaths()).toEqual(motifSequence.map(motif => ({ params: { motif } })))
  })
  it.each(motifSequence)('serves the complete %s document with SVG MIME', async motif => {
    const response = await GET({ params: { motif } } as unknown as APIContext)
    expect(response.status).toBe(200)
    expect(response.headers.get('Content-Type')).toBe('image/svg+xml')
    expect(await response.text()).toBe(createPosterPatternImage(motif))
  })
  it('does not generate a document for an unknown resource', async () => {
    const response = await GET({ params: { motif: 'unknown' } } as unknown as APIContext)
    expect(response.status).toBe(404)
    expect(await response.text()).toBe('')
  })
})
