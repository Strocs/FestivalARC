import { describe, it, expect } from 'vitest'
import { toMinutes, fromMinutes, generateTimeSlots, calculateSpan } from './index'

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

  it('should reject invalid time format', () => {
    expect(() => toMinutes('25:00')).toThrow(/Time out of range/)
    expect(() => toMinutes('12:60')).toThrow(/Time out of range/)
    expect(() => toMinutes('-1:00')).toThrow(/Time out of range/)
    expect(() => toMinutes('12:-1')).toThrow(/Time out of range/)
  })

  it('should reject non-numeric input', () => {
    expect(() => toMinutes('ab:cd')).toThrow(/Invalid time format/)
    expect(() => toMinutes('12')).toThrow(/Invalid time format/)
    expect(() => toMinutes('')).toThrow(/Invalid time format/)
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
    const slots = generateTimeSlots('18:00', '20:00', 30)
    expect(slots).toEqual(['18:00', '18:30', '19:00', '19:30', '20:00'])
  })

  it('should generate correct time slots with 60 min interval', () => {
    const slots = generateTimeSlots('10:00', '13:00', 60)
    expect(slots).toEqual(['10:00', '11:00', '12:00', '13:00'])
  })

  it('should handle single slot', () => {
    const slots = generateTimeSlots('18:00', '18:30', 30)
    expect(slots).toEqual(['18:00', '18:30'])
  })

  it('should reject invalid time range', () => {
    expect(() => generateTimeSlots('20:00', '18:00', 30)).toThrow(/End time .* must be after start time/)
    expect(() => generateTimeSlots('18:00', '18:00', 30)).toThrow(/End time .* must be after start time/)
  })

  it('should reject invalid interval', () => {
    expect(() => generateTimeSlots('18:00', '20:00', 0)).toThrow(/Interval must be positive/)
    expect(() => generateTimeSlots('18:00', '20:00', -30)).toThrow(/Interval must be positive/)
  })
})

describe('calculateSpan', () => {
  it('should calculate exact spans', () => {
    expect(calculateSpan('20:00', '21:00', 30)).toBe(2)
    expect(calculateSpan('20:00', '22:00', 30)).toBe(4)
    expect(calculateSpan('20:00', '21:00', 60)).toBe(1)
  })

  it('should ceil partial spans', () => {
    expect(calculateSpan('20:00', '20:45', 30)).toBe(2)
    expect(calculateSpan('20:00', '20:15', 30)).toBe(1)
    expect(calculateSpan('20:00', '21:30', 60)).toBe(2)
  })

  it('should handle very short events', () => {
    expect(calculateSpan('20:00', '20:01', 30)).toBe(1)
    expect(calculateSpan('20:00', '20:29', 30)).toBe(1)
  })
})
