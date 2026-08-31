import { describe, expect, it } from 'vitest'
import { publicationConfig } from '../../../../editions.config'
import { previousEditionTargets } from './previousEditions'

describe('previous edition targets', () => {
  it('derives sorted labels and links from the publication configuration', () => {
    const targets = previousEditionTargets(publicationConfig)
    const archiveYears = [...publicationConfig.archives]
      .map(({ year }) => year)
      .sort((left, right) => right - left)

    expect(targets).toHaveLength(publicationConfig.archives.length)
    expect(targets.map(({ year }) => year)).toEqual(archiveYears)
    expect(targets.every(({ year, label, href }) => (
      label === `Festival ${year}` && href === `/ediciones/${year}/`
    ))).toBe(true)
    expect(targets.some(({ year }) => year === publicationConfig.active.year)).toBe(false)
  })
})
