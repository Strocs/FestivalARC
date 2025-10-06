import { describe, it, expect } from 'vitest'
import { validateScheduleInput } from '../../lib/validation'
import type { ScheduleInput } from '../../types/services'

describe('validateScheduleInput', () => {
  const validInput: ScheduleInput = {
    scheduleTime: {
      start: '18:00',
      end: '23:00',
      intervalMinutes: 30,
    },
    tracks: [
      { id: 'cat1', order: 1 },
      { id: 'cat2', order: 2 },
    ],
    events: [
      {
        id: 'evt1',
        trackId: 'cat1',
        time: {
          start: '18:00',
          end: '19:00',
        },
      },
    ],
  }

  it('should accept valid input', () => {
    expect(() => validateScheduleInput(validInput)).not.toThrow()
  })

  describe('scheduleTime validation', () => {
    it('should reject missing scheduleTime', () => {
      const input = { ...validInput, scheduleTime: undefined as any }
      expect(() => validateScheduleInput(input)).toThrow(
        /timeConfig is required/,
      )
    })

    it('should reject when endTime is before startTime', () => {
      const input = {
        ...validInput,
        scheduleTime: { ...validInput.scheduleTime, end: '17:00' },
      }
      expect(() => validateScheduleInput(input)).toThrow(
        /must be after startTime/,
      )
    })

    it('should reject when endTime equals startTime', () => {
      const input = {
        ...validInput,
        scheduleTime: { ...validInput.scheduleTime, end: '18:00' },
      }
      expect(() => validateScheduleInput(input)).toThrow(
        /must be after startTime/,
      )
    })

    it('should reject zero interval', () => {
      const input = {
        ...validInput,
        scheduleTime: { ...validInput.scheduleTime, intervalMinutes: 0 },
      }
      expect(() => validateScheduleInput(input)).toThrow(
        /intervalMinutes must be positive/,
      )
    })

    it('should reject negative interval', () => {
      const input = {
        ...validInput,
        scheduleTime: { ...validInput.scheduleTime, intervalMinutes: -30 },
      }
      expect(() => validateScheduleInput(input)).toThrow(
        /intervalMinutes must be positive/,
      )
    })
  })

  describe('tracks validation', () => {
    it('should reject missing tracks', () => {
      const input = { ...validInput, tracks: undefined as any }
      expect(() => validateScheduleInput(input)).toThrow(
        /At least one category is required/,
      )
    })

    it('should reject empty tracks array', () => {
      const input = { ...validInput, tracks: [] }
      expect(() => validateScheduleInput(input)).toThrow(
        /At least one category is required/,
      )
    })

    it('should accept single track', () => {
      const input = {
        ...validInput,
        tracks: [{ id: 'cat1', order: 1 }],
      }
      expect(() => validateScheduleInput(input)).not.toThrow()
    })
  })

  describe('events validation', () => {
    it('should reject missing events', () => {
      const input = { ...validInput, events: undefined as any }
      expect(() => validateScheduleInput(input)).toThrow(
        /events array is required/,
      )
    })

    it('should accept empty events array', () => {
      const input = { ...validInput, events: [] }
      expect(() => validateScheduleInput(input)).not.toThrow()
    })

    it('should reject event with invalid time range', () => {
      const input = {
        ...validInput,
        events: [
          {
            id: 'evt1',
            trackId: 'cat1',
            time: {
              start: '20:00',
              end: '19:00',
            },
          },
        ],
      }
      expect(() => validateScheduleInput(input)).toThrow(
        /has invalid time range/,
      )
    })

    it('should reject event with equal start and end time', () => {
      const input = {
        ...validInput,
        events: [
          {
            id: 'evt1',
            trackId: 'cat1',
            time: {
              start: '19:00',
              end: '19:00',
            },
          },
        ],
      }
      expect(() => validateScheduleInput(input)).toThrow(
        /has invalid time range/,
      )
    })

    it('should reject event starting before schedule start', () => {
      const input = {
        ...validInput,
        events: [
          {
            id: 'evt1',
            trackId: 'cat1',
            time: {
              start: '17:00',
              end: '18:30',
            },
          },
        ],
      }
      expect(() => validateScheduleInput(input)).toThrow(
        /is outside schedule range/,
      )
    })

    it('should reject event ending after schedule end', () => {
      const input = {
        ...validInput,
        events: [
          {
            id: 'evt1',
            trackId: 'cat1',
            time: {
              start: '22:30',
              end: '23:30',
            },
          },
        ],
      }
      expect(() => validateScheduleInput(input)).toThrow(
        /is outside schedule range/,
      )
    })

    it('should accept event at schedule boundaries', () => {
      const input = {
        ...validInput,
        events: [
          {
            id: 'evt1',
            trackId: 'cat1',
            time: {
              start: '18:00',
              end: '23:00',
            },
          },
        ],
      }
      expect(() => validateScheduleInput(input)).not.toThrow()
    })

    it('should validate multiple events', () => {
      const input = {
        ...validInput,
        events: [
          {
            id: 'evt1',
            trackId: 'cat1',
            time: {
              start: '18:00',
              end: '19:00',
            },
          },
          {
            id: 'evt2',
            trackId: 'cat1',
            time: {
              start: '17:00',
              end: '18:00',
            },
          },
        ],
      }
      expect(() => validateScheduleInput(input)).toThrow(
        /is outside schedule range/,
      )
    })
  })
})
