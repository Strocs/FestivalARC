import type { artistArtwork } from './artwork'

export type Motif = 'arrows' | 'bolt' | 'star' | 'petals' | 'orbits' | 'spark'
type Tile = { kind: 'artist', artistId: keyof typeof artistArtwork } | { kind: 'pattern', motif: Motif }

// Editorial DOM order, not a second lineup. Retain the existing demo references;
// the title is separate and neither the tile count nor row packing is a contract.
export const composition: readonly Tile[] = [
  { kind: 'pattern', motif: 'arrows' },
  { kind: 'artist', artistId: 'javiera-mena' },
  { kind: 'pattern', motif: 'bolt' },
  { kind: 'artist', artistId: 'javiera-mena' },
  { kind: 'pattern', motif: 'petals' },
  { kind: 'artist', artistId: 'javiera-mena' },
  { kind: 'pattern', motif: 'spark' },
  { kind: 'artist', artistId: 'javiera-mena' },
  { kind: 'pattern', motif: 'star' },
  { kind: 'artist', artistId: 'javiera-mena' },
  { kind: 'pattern', motif: 'orbits' },
  { kind: 'artist', artistId: 'javiera-mena' },
  { kind: 'pattern', motif: 'petals' },
  { kind: 'artist', artistId: 'javiera-mena' },
  { kind: 'pattern', motif: 'orbits' },
  { kind: 'artist', artistId: 'javiera-mena' },
  { kind: 'pattern', motif: 'arrows' },
  { kind: 'artist', artistId: 'javiera-mena' },
  { kind: 'pattern', motif: 'bolt' },
  { kind: 'artist', artistId: 'javiera-mena' },
  { kind: 'pattern', motif: 'spark' },
  { kind: 'artist', artistId: 'javiera-mena' },
  { kind: 'pattern', motif: 'star' },
  { kind: 'artist', artistId: 'javiera-mena' },
]
