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
  mobile: { column: 0, row: 0, width: 4, height: 2 },
} as const
export const posterIntroPlacement = {
  desktop: { column: 0, row: 0, width: 3, height: 4 },
  tablet: { column: 0, row: 0, width: 3, height: 4 },
  mobile: { column: 0, row: 0, width: 4, height: 2 },
} as const
export const posterTitleExtensionPlacement = {
  desktop: { column: 3, row: 1, width: 1, height: 2 },
  tablet: { column: 3, row: 1, width: 1, height: 2 },
} as const
export const posterDisciplinesPlacement = {
  desktop: { column: 6, row: 5, width: 4, height: 3 },
  tablet: { column: 3, row: 7, width: 3, height: 3 },
  mobile: { column: 0, row: 12, width: 4, height: 2 },
} as const
export const posterProgramPlacement = {
  desktop: { column: 0, row: 9, width: 3, height: 1 },
  tablet: { column: 0, row: 11, width: 3, height: 1 },
  mobile: { column: 0, row: 22, width: 4, height: 1 },
} as const
export const posterPlacePlacement = {
  desktop: { column: 6, row: 13, width: 3, height: 2 },
  tablet: { column: 3, row: 18, width: 3, height: 2 },
  mobile: { column: 0, row: 36, width: 4, height: 1 },
} as const
export const posterSocialsPlacement = {
  instagram: {
    desktop: { column: 1, row: 18, width: 3, height: 1 },
    tablet: { column: 3, row: 28, width: 3, height: 1 },
    mobile: { column: 0, row: 56, width: 4, height: 1 },
  },
  facebook: {
    desktop: { column: 6, row: 20, width: 3, height: 1 },
    tablet: { column: 0, row: 32, width: 3, height: 1 },
    mobile: { column: 0, row: 70, width: 4, height: 2 },
  },
  twitter: {
    desktop: { column: 1, row: 22, width: 3, height: 1 },
    tablet: { column: 3, row: 36, width: 3, height: 1 },
    mobile: { column: 0, row: 84, width: 4, height: 1 },
  },
} as const

export const homeInformation: readonly PosterInformationBlock[] = [
  { id: 'intro', positions: posterIntroPlacement, fixed: true },
  { id: 'title-extension', positions: posterTitleExtensionPlacement, fixed: true },
  { id: 'program', positions: posterProgramPlacement },
  { id: 'disciplines', positions: posterDisciplinesPlacement },
  { id: 'place', positions: posterPlacePlacement },
  { id: 'instagram', positions: posterSocialsPlacement.instagram },
  { id: 'facebook', positions: posterSocialsPlacement.facebook },
  { id: 'twitter', positions: posterSocialsPlacement.twitter },
]
export const categoryInformation: readonly PosterInformationBlock[] = [
  { id: 'category-title', positions: categoryTitlePlacement, fixed: true },
]
