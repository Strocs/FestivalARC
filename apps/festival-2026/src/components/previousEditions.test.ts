import { describe, expect, it } from 'vitest'
import { publicationConfig } from '../../../../editions.config'
import { previousEditionTargets } from './previousEditions'

describe('previous edition destinations', () => {
  it('derives sorted labels and links from configuration without including the active edition', () => {
    const before = structuredClone(publicationConfig)
    const targets = previousEditionTargets(publicationConfig)
    const expectedTargets = [...publicationConfig.archives]
      .sort((left, right) => right.year - left.year)
      .map(({ year, base }) => ({
        year,
        label: `ARC ${year}`,
        href: `${base}/`,
      }))

    expect(targets).toEqual(expectedTargets)
    expect(targets.some(({ year }) => year === publicationConfig.active.year)).toBe(false)
    expect(publicationConfig).toEqual(before)
  })
})
