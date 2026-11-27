import sprite from './poster-motifs.svg?raw'
import { motifSequence, type PosterMotif } from './poster'

/** Build-only image document: canonical definitions include nested use targets. */
export function createPosterPatternImage(motif: PosterMotif): string {
  if (!motifSequence.includes(motif)) throw new RangeError('Unknown poster motif')
  return sprite
    .replace('<svg xmlns="http://www.w3.org/2000/svg">', '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" preserveAspectRatio="none">')
    .replace('</svg>', `<use href="#${motif}" width="100" height="100"/></svg>`)
}
