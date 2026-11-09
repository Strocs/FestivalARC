import type { GridColumns, SlotRect } from '../lib/poster-grid'

export type PosterRange = 'desktop' | 'tablet' | 'mobile'
export type InformationId = 'hero' | 'title-spill' | 'program' | 'disciplines'
export interface InformationFootprint extends SlotRect { id: InformationId }
export interface PosterPreset { columns: GridColumns, blocks: readonly InformationFootprint[] }

export const slotSize = { width: 160, height: 152 } as const

// Positions are zero-based logical slots, independent of rendered pixel sizes.
export const posterPresets: Record<PosterRange, PosterPreset> = {
  desktop: {
    columns: 10,
    blocks: [
      { id: 'hero', column: 0, row: 0, width: 3, height: 4 },
      { id: 'title-spill', column: 3, row: 1, width: 1, height: 2 },
      { id: 'program', column: 6, row: 5, width: 3, height: 2 },
      { id: 'disciplines', column: 0, row: 9, width: 4, height: 3 },
    ],
  },
  tablet: {
    columns: 6,
    blocks: [
      { id: 'hero', column: 0, row: 0, width: 3, height: 4 },
      { id: 'title-spill', column: 3, row: 1, width: 1, height: 2 },
      { id: 'program', column: 3, row: 7, width: 3, height: 2 },
      { id: 'disciplines', column: 0, row: 11, width: 3, height: 3 },
    ],
  },
  mobile: {
    columns: 2,
    blocks: [
      { id: 'hero', column: 0, row: 0, width: 2, height: 2 },
      { id: 'program', column: 0, row: 10, width: 2, height: 1 },
      { id: 'disciplines', column: 0, row: 20, width: 2, height: 2 },
    ],
  },
}

export const motifSequence = [
  'lightning', 'rosette-yellow', 'chevrons-right', 'rings', 'orbits-rose',
  'star', 'sparks', 'rosette-pink', 'orbits-cyan', 'chevrons-left', 'rosette-cyan',
] as const
export type PosterMotif = typeof motifSequence[number]
