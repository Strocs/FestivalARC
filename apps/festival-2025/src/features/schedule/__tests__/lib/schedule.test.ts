import { describe, it, expect } from 'vitest'
import { normalizeScheduleInput } from '../../core/layout/normalize-schedule'
import type { ScheduleInput } from '../../models/schedule-input'

describe('normalizeScheduleInput', () => {
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
        payload: { title: 'Event 1' },
      },
      {
        id: 'evt2',
        trackId: 'cat2',
        time: {
          start: '20:00',
          end: '21:00',
        },
        payload: { title: 'Event 2' },
      },
    ],
  }

  it('should normalize valid input successfully', () => {
    const result = normalizeScheduleInput(validInput)

    expect(result.scheduleTime.start).toBe(1080)
    expect(result.scheduleTime.end).toBe(1380)
    expect(result.scheduleTime.intervalMinutes).toBe(30)
    expect(result.sortedTracks.length).toBe(2)
    expect(result.sortedEvents.size).toBe(2)
  })

  it('should group events by track', () => {
    const result = normalizeScheduleInput(validInput)

    const cat1Events = result.sortedEvents.get('cat1')
    const cat2Events = result.sortedEvents.get('cat2')

    expect(cat1Events?.length).toBe(1)
    expect(cat2Events?.length).toBe(1)
    expect(cat1Events?.[0]).toHaveProperty('event')
    expect(cat2Events?.[0]).toHaveProperty('event')
  })

  it('should reject missing scheduleTime', () => {
    const input = { ...validInput, scheduleTime: undefined as any }
    expect(() => normalizeScheduleInput(input)).toThrow(
      /timeConfig is required/,
    )
  })

  it('should reject missing tracks', () => {
    const input = { ...validInput, tracks: [] }
    expect(() => normalizeScheduleInput(input)).toThrow(
      /At least one category is required/,
    )
  })

  it('should reject missing events array', () => {
    const input = { ...validInput, events: undefined as any }
    expect(() => normalizeScheduleInput(input)).toThrow(
      /events array is required/,
    )
  })

  it('should reject invalid time range', () => {
    const input = {
      ...validInput,
      scheduleTime: { ...validInput.scheduleTime, end: '17:00' },
    }
    expect(() => normalizeScheduleInput(input)).toThrow(
      /must be after startTime/,
    )
  })

  it('should reject non-positive interval', () => {
    const input = {
      ...validInput,
      scheduleTime: { ...validInput.scheduleTime, intervalMinutes: 0 },
    }
    expect(() => normalizeScheduleInput(input)).toThrow(
      /intervalMinutes must be positive/,
    )
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
    expect(() => normalizeScheduleInput(input)).toThrow(
      /has invalid time range/,
    )
  })

  it('should reject event outside schedule range', () => {
    const input = {
      ...validInput,
      events: [
        {
          id: 'evt1',
          trackId: 'cat1',
          time: {
            start: '17:00',
            end: '18:00',
          },
        },
      ],
    }
    expect(() => normalizeScheduleInput(input)).toThrow(
      /is outside schedule range/,
    )
  })

  it('should sort tracks by order', () => {
    const input: ScheduleInput = {
      scheduleTime: {
        start: '18:00',
        end: '20:00',
        intervalMinutes: 30,
      },
      tracks: [
        { id: 'cat3', order: 3 },
        { id: 'cat1', order: 1 },
        { id: 'cat2', order: 2 },
      ],
      events: [],
    }

    const result = normalizeScheduleInput(input)

    expect(result.sortedTracks.map((t) => t.id)).toEqual([
      'cat1',
      'cat2',
      'cat3',
    ])
  })

  it('should sort events by start time within track', () => {
    const input: ScheduleInput = {
      scheduleTime: {
        start: '18:00',
        end: '23:00',
        intervalMinutes: 30,
      },
      tracks: [{ id: 'cat1', order: 1 }],
      events: [
        {
          id: 'evt2',
          trackId: 'cat1',
          time: {
            start: '20:00',
            end: '21:00',
          },
        },
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

    const result = normalizeScheduleInput(input)
    const cat1Events = result.sortedEvents.get('cat1')!

    expect(cat1Events[0]).toHaveProperty('event')
    if ('event' in cat1Events[0]) {
      expect(cat1Events[0].event.id).toBe('evt1')
    }
    if ('event' in cat1Events[1]) {
      expect(cat1Events[1].event.id).toBe('evt2')
    }
  })

  it('should convert time strings to minutes', () => {
    const result = normalizeScheduleInput(validInput)

    expect(result.scheduleTime.start).toBe(1080)
    expect(result.scheduleTime.end).toBe(1380)

    const cat1Events = result.sortedEvents.get('cat1')!
    if ('event' in cat1Events[0]) {
      expect(cat1Events[0].time.start).toBe(1080)
      expect(cat1Events[0].time.end).toBe(1140)
    }
  })
})
