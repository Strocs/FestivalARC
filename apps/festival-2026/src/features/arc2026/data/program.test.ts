import { describe, expect, it } from 'vitest'
import { readLocalProgram } from './local'
import { activitiesForArtist, demoLabel, formatActivityTime, validateProgram } from './program'

describe('ARC 2026 local demonstration program', () => {
  it('keeps one artist with multiple distinct, explicitly ordered activities and disciplines', () => {
    const program = readLocalProgram()
    expect(program.artists.map(({ id }) => id)).toEqual(['javiera-mena'])
    expect(program.artists[0].disciplines.length).toBeGreaterThan(1)
    const reversed = { ...program, activities: [...program.activities].reverse() }
    expect(activitiesForArtist(validateProgram(reversed), 'javiera-mena').map(({ id }) => id))
      .toEqual(['presentacion-ejemplo', 'encuentro-ejemplo'])
    expect(validateProgram(reversed).activities.map(({ order }) => order)).toEqual([1, 2])
    expect(program.activities.every(({ venueId }) => program.venues.some(({ id }) => id === venueId)))
      .toBe(true)
  })

  it('exposes demo marking on every entity and Chilean presentation of explicit example times', () => {
    const program = readLocalProgram()
    expect([...program.artists, ...program.activities, ...program.venues].every(({ demo }) => demo === true))
      .toBe(true)
    expect(demoLabel).toBe('Demostración: artista, actividades, horarios y espacios no confirmados.')
    expect(formatActivityTime(program.activities[0].startsAt))
      .toBe('miércoles, 28 de octubre de 2026, 18:00')
    expect(program.activities.every(({ externalUrl }) => externalUrl === undefined)).toBe(true)
  })

  it('validates local content, relationships, demo flags and timezone-aware dates without mutating input', () => {
    const program = readLocalProgram()
    const snapshot = structuredClone(program)
    for (const patch of [
      { artistId: 'missing' }, { venueId: 'missing' }, { demo: false },
      { startsAt: '2026-10-28T18:00:00' }, { externalUrl: 'javascript:alert(1)' },
    ]) {
      expect(() => validateProgram({
        ...program, activities: [{ ...program.activities[0], ...patch }, program.activities[1]],
      })).toThrow()
    }
    expect(() => validateProgram({ ...program, artists: [{ ...program.artists[0], demo: false }] })).toThrow()
    expect(() => validateProgram({ ...program, venues: [{ ...program.venues[0], demo: false }] })).toThrow()
    expect(() => validateProgram({ ...program, activities: [program.activities[0], program.activities[0]] })).toThrow()
    expect(program).toEqual(snapshot)
  })

  it('accepts an optional external registration link without requiring booking data', () => {
    const program = readLocalProgram()
    const activity = { ...program.activities[0], externalUrl: 'https://example.org/inscripcion' }
    expect(validateProgram({ ...program, activities: [activity] }).activities[0].externalUrl)
      .toBe('https://example.org/inscripcion')
  })
})
