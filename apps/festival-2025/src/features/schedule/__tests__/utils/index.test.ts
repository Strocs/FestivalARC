import { describe, it, expect } from 'vitest'
import { toMinutes, fromMinutes } from '../../core/time/normalize-time'
import { generateTimeSlots } from '../../core/layout/calculate-positions'

describe('toMinutes', () => {
  it('should convert valid time to minutes', () => {
    expect(toMinutes('00:00')).toBe(0)
    expect(toMinutes('14:30')).toBe(870)
    expect(toMinutes('23:59')).toBe(1439)
  })

  it('should handle edge cases', () => {
    expect(toMinutes('00:01')).toBe(1)
    expect(toMinutes('01:00')).toBe(60)
    expect(toMinutes('12:00')).toBe(720)
  })

  it('should accept minutes directly', () => {
    expect(toMinutes(0)).toBe(0)
    expect(toMinutes(870)).toBe(870)
    expect(toMinutes(1439)).toBe(1439)
  })

  it('should reject invalid time format', () => {
    expect(() => toMinutes('25:00')).toThrow(/Time out of range/)
    expect(() => toMinutes('12:60')).toThrow(/Time out of range/)
    expect(() => toMinutes('-1:00')).toThrow(/Invalid time format/)
    expect(() => toMinutes('12:-1')).toThrow(/Invalid time format/)
  })

  it('should reject non-numeric input', () => {
    expect(() => toMinutes('ab:cd')).toThrow(/Invalid time format/)
    expect(() => toMinutes('12')).toThrow(/Invalid time format/)
    expect(() => toMinutes('')).toThrow(/Invalid time format/)
  })

  it('should reject out of range minutes', () => {
    expect(() => toMinutes(-1)).toThrow(/Minutes out of range/)
    expect(() => toMinutes(1440)).toThrow(/Minutes out of range/)
  })
})

describe('fromMinutes', () => {
  it('should convert minutes to time string', () => {
    expect(fromMinutes(0)).toBe('00:00')
    expect(fromMinutes(870)).toBe('14:30')
    expect(fromMinutes(1439)).toBe('23:59')
  })

  it('should handle edge cases', () => {
    expect(fromMinutes(1)).toBe('00:01')
    expect(fromMinutes(60)).toBe('01:00')
    expect(fromMinutes(720)).toBe('12:00')
  })

  it('should pad single digit hours and minutes', () => {
    expect(fromMinutes(65)).toBe('01:05')
    expect(fromMinutes(545)).toBe('09:05')
  })

  it('should reject out of range minutes', () => {
    expect(() => fromMinutes(-1)).toThrow(/Minutes out of range/)
    expect(() => fromMinutes(1440)).toThrow(/Minutes out of range/)
    expect(() => fromMinutes(2000)).toThrow(/Minutes out of range/)
  })
})

describe('generateTimeSlots', () => {
  it('should generate correct time slots with 30 min interval', () => {
    const slots = generateTimeSlots(1080, 1200, 30)
    expect(slots).toEqual(['18:00', '18:30', '19:00', '19:30', '20:00'])
  })

  it('should generate correct time slots with 60 min interval', () => {
    const slots = generateTimeSlots(600, 780, 60)
    expect(slots).toEqual(['10:00', '11:00', '12:00', '13:00'])
  })

  it('should handle single slot', () => {
    const slots = generateTimeSlots(1080, 1110, 30)
    expect(slots).toEqual(['18:00', '18:30'])
  })

  it('should reject invalid time range', () => {
    expect(() => generateTimeSlots(1200, 1080, 30)).toThrow(
      /End time .* must be after start time/,
    )
    expect(() => generateTimeSlots(1080, 1080, 30)).toThrow(
      /End time .* must be after start time/,
    )
  })

  it('should reject invalid interval', () => {
    expect(() => generateTimeSlots(1080, 1200, 0)).toThrow(
      /Interval must be positive/,
    )
    expect(() => generateTimeSlots(1080, 1200, -30)).toThrow(
      /Interval must be positive/,
    )
  })
})
