import { describe, expect, it } from 'vitest'
import { publicationConfig } from '../../../../editions.config'
import { previousEditionTargets } from './previousEditions'

describe('previous edition targets', () => {
  it('derives sorted labels and links from the publication configuration', () => {
    const targets = previousEditionTargets(publicationConfig)
    const archiveYears = [...publicationConfig.archives]
      .map(({ year }) => year)
      .sort((left, right) => right - left)

    const expectedTargets = [...publicationConfig.archives]
      .sort((left, right) => right.year - left.year)
      .map(({ year, base }) => ({
        year,
        label: `ARC ${year}`,
        href: `${base}/`,
      }))

    expect(targets).toEqual(expectedTargets)
    expect(targets.map(({ year }) => year)).toEqual(archiveYears)
    expect(targets.some(({ year }) => year === publicationConfig.active.year)).toBe(false)
  })
})
