import type { PosterRange } from './poster'
import type { SlotRect } from './poster-grid'

export type PosterPositions = Partial<Record<PosterRange, SlotRect>>
export interface PosterInformationBlock {
  id: string
  positions: PosterPositions
  fixed?: boolean
}

// Original page-authored geometry, not the similarly named poster.ts presets.
export const categoryTitlePlacement = {
  desktop: { column: 0, row: 0, width: 4, height: 4 },
  tablet: { column: 0, row: 0, width: 3, height: 4 },
  mobile: { column: 0, row: 0, width: 8, height: 4 },
} as const
export const posterIntroPlacement = {
  desktop: { column: 0, row: 0, width: 3, height: 4 },
  tablet: { column: 0, row: 0, width: 3, height: 4 },
  mobile: { column: 0, row: 0, width: 8, height: 4 },
} as const
export const posterTitleExtensionPlacement = {
  desktop: { column: 3, row: 1, width: 1, height: 2 },
  tablet: { column: 3, row: 1, width: 1, height: 2 },
} as const
export const posterDisciplinesPlacement = {
  desktop: { column: 6, row: 5, width: 4, height: 3 },
  tablet: { column: 3, row: 7, width: 3, height: 3 },
  mobile: { column: 0, row: 24, width: 8, height: 4 },
} as const
export const posterProgramPlacement = {
  desktop: { column: 0, row: 9, width: 3, height: 1 },
  tablet: { column: 0, row: 11, width: 3, height: 1 },
  mobile: { column: 0, row: 44, width: 8, height: 2 },
} as const
export const posterPlacePlacement = {
  desktop: { column: 6, row: 12, width: 3, height: 2 },
  tablet: { column: 3, row: 18, width: 3, height: 2 },
  mobile: { column: 0, row: 72, width: 8, height: 2 },
} as const
export const posterSocialsPlacement = {
  desktop: { column: 7, row: 18, width: 3, height: 2 },
  tablet: { column: 3, row: 28, width: 3, height: 2 },
  mobile: { column: 0, row: 112, width: 8, height: 2 },
} as const

export const homeInformation: readonly PosterInformationBlock[] = [
  { id: 'intro', positions: posterIntroPlacement, fixed: true },
  { id: 'title-extension', positions: posterTitleExtensionPlacement, fixed: true },
  { id: 'disciplines', positions: posterDisciplinesPlacement },
  { id: 'place', positions: posterPlacePlacement },
  { id: 'socials', positions: posterSocialsPlacement },
]
export const categoryInformation: readonly PosterInformationBlock[] = [
  { id: 'category-title', positions: categoryTitlePlacement, fixed: true },
]
