import type { PublicationConfig } from '@festivalarc/editions'

export type PreviousEditionTarget = Readonly<{
  year: number
  label: string
  href: string
}>

export function previousEditionTargets(
  config: PublicationConfig,
): readonly PreviousEditionTarget[] {
  return [...config.archives]
    .sort((left, right) => right.year - left.year)
    .map((edition) => ({
      year: edition.year,
      label: `ARC ${edition.year}`,
      href: `${edition.base}/`,
    }))
}
