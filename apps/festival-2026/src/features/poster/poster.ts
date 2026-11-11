import type { GridColumns, SlotRect } from './poster-grid'

export type PosterRange = 'desktop' | 'tablet' | 'mobile'
export type InformationId = 'hero' | 'title-spill' | 'program' | 'disciplines'
export interface InformationFootprint extends SlotRect { id: InformationId }
export interface PosterPreset { columns: GridColumns, blocks: readonly InformationFootprint[], artistStartRow?: number }

export const slotSize = { width: 160, height: 152 } as const

export const posterIntroPlacement = {
  desktop: { column: 0, row: 0, width: 3, height: 4 },
  tablet: { column: 0, row: 0, width: 3, height: 4 },
  mobile: { column: 0, row: 0, width: 3, height: 2 },
} as const

export const posterTitleExtensionPlacement = {
  desktop: { column: 3, row: 1, width: 1, height: 2 },
  tablet: { column: 3, row: 1, width: 1, height: 2 },
} as const

export const posterProgramPlacement = {
  desktop: { column: 6, row: 5, width: 3, height: 2 },
  tablet: { column: 3, row: 7, width: 3, height: 2 },
  mobile: { column: 0, row: 12, width: 3, height: 1 },
} as const

export const posterDisciplinesPlacement = {
  desktop: { column: 0, row: 9, width: 4, height: 3 },
  tablet: { column: 0, row: 11, width: 3, height: 3 },
  mobile: { column: 0, row: 22, width: 3, height: 2 },
} as const

// Positions are zero-based logical slots, independent of rendered pixel sizes.
export const posterPresets: Record<PosterRange, PosterPreset> = {
  desktop: {
    columns: 10,
    blocks: [
      { id: 'hero', ...posterIntroPlacement.desktop },
      { id: 'title-spill', ...posterTitleExtensionPlacement.desktop },
      { id: 'program', ...posterProgramPlacement.desktop },
      { id: 'disciplines', ...posterDisciplinesPlacement.desktop },
    ],
  },
  tablet: {
    columns: 6,
    blocks: [
      { id: 'hero', ...posterIntroPlacement.tablet },
      { id: 'title-spill', ...posterTitleExtensionPlacement.tablet },
      { id: 'program', ...posterProgramPlacement.tablet },
      { id: 'disciplines', ...posterDisciplinesPlacement.tablet },
    ],
  },
  mobile: {
    columns: 3,
    artistStartRow: 4,
    blocks: [
      { id: 'hero', ...posterIntroPlacement.mobile },
      { id: 'program', ...posterProgramPlacement.mobile },
      { id: 'disciplines', ...posterDisciplinesPlacement.mobile },
    ],
  },
}

export const motifSequence = [
  'lightning', 'rosette-yellow', 'chevrons-right', 'rings', 'orbits-rose',
  'star', 'sparks', 'rosette-pink', 'orbits-cyan', 'chevrons-left', 'rosette-cyan',
] as const
export type PosterMotif = typeof motifSequence[number]
export type MotifFamily = 'lightning' | 'rosette' | 'chevrons' | 'rings' | 'orbits' | 'star' | 'sparks'
export type MotifAccent = 'magenta' | 'cyan' | 'yellow'

export const motifMetadata: Record<PosterMotif, { family: MotifFamily, accent: MotifAccent }> = {
  'lightning': { family: 'lightning', accent: 'cyan' },
  'rosette-yellow': { family: 'rosette', accent: 'yellow' },
  'chevrons-right': { family: 'chevrons', accent: 'magenta' },
  'rings': { family: 'rings', accent: 'magenta' },
  'orbits-rose': { family: 'orbits', accent: 'magenta' },
  'star': { family: 'star', accent: 'magenta' },
  'sparks': { family: 'sparks', accent: 'yellow' },
  'rosette-pink': { family: 'rosette', accent: 'magenta' },
  'orbits-cyan': { family: 'orbits', accent: 'cyan' },
  'chevrons-left': { family: 'chevrons', accent: 'magenta' },
  'rosette-cyan': { family: 'rosette', accent: 'cyan' },
}
