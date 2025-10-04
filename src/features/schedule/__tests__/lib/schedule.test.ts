import { describe, it, expect } from 'vitest'
import { processSchedule } from '../../lib/schedule'
import type { ScheduleInput } from '../../types/services'

describe('processSchedule', () => {
  const validInput: ScheduleInput = {
    time: {
      start: '18:00',
      end: '23:00',
      intervalMinutes: 30,
    },
    tracks: [
      { id: 'cat1', name: 'Category 1', color: '#ff0000', order: 1 },
      { id: 'cat2', name: 'Category 2', color: '#00ff00', order: 2 },
    ],
    events: [
      {
        id: 'evt1',
        title: 'Event 1',
        subTitle: '',
        description: 'Description 1',
        trackId: 'cat1',
        time: {
          start: '18:00',
          end: '19:00',
        },
      },
      {
        id: 'evt2',
        title: 'Event 2',
        subTitle: '',
        description: 'Description 2',
        trackId: 'cat2',
        time: {
          start: '20:00',
          end: '21:00',
        },
      },
    ],
  }

  it('should process valid input successfully', () => {
    const result = processSchedule(validInput)

    expect(result.startMinutes).toBe(1080)
    expect(result.endMinutes).toBe(1380)
    expect(result.intervalMinutes).toBe(30)
    expect(result.sortedTracks.length).toBe(2)
    expect(result.eventsByTrack.size).toBe(2)
  })

  it('should group events by category', () => {
    const result = processSchedule(validInput)

    const cat1Events = result.eventsByTrack.get('cat1')
    const cat2Events = result.eventsByTrack.get('cat2')

    expect(cat1Events?.length).toBe(1)
    expect(cat2Events?.length).toBe(1)
    expect(cat1Events?.[0].id).toBe('evt1')
    expect(cat2Events?.[0].id).toBe('evt2')
  })

  it('should reject missing timeConfig', () => {
    const input = { ...validInput, time: undefined as any }
    expect(() => processSchedule(input)).toThrow(/timeConfig is required/)
  })

  it('should reject missing categories', () => {
    const input = { ...validInput, tracks: [] }
    expect(() => processSchedule(input)).toThrow(
      /At least one category is required/,
    )
  })

  it('should reject missing events array', () => {
    const input = { ...validInput, events: undefined as any }
    expect(() => processSchedule(input)).toThrow(/events array is required/)
  })

  it('should reject invalid time range', () => {
    const input = {
      ...validInput,
      time: { ...validInput.time, end: '17:00' },
    }
    expect(() => processSchedule(input)).toThrow(/must be after startTime/)
  })

  it('should reject non-positive interval', () => {
    const input = {
      ...validInput,
      time: { ...validInput.time, intervalMinutes: 0 },
    }
    expect(() => processSchedule(input)).toThrow(
      /intervalMinutes must be positive/,
    )
  })

  it('should reject event with invalid time range', () => {
    const input = {
      ...validInput,
      events: [
        {
          id: 'evt1',
          title: 'Event 1',
          subTitle: '',
          description: 'Description 1',
          trackId: 'cat1',
          time: {
            start: '20:00',
            end: '19:00',
          },
        },
      ],
    }
    expect(() => processSchedule(input)).toThrow(/has invalid time range/)
  })

  it('should reject event outside schedule range', () => {
    const input = {
      ...validInput,
      events: [
        {
          id: 'evt1',
          title: 'Event 1',
          subTitle: '',
          description: 'Description 1',
          trackId: 'cat1',
          time: {
            start: '17:00',
            end: '18:00',
          },
        },
      ],
    }
    expect(() => processSchedule(input)).toThrow(/is outside schedule range/)
  })

  it('should reject event with non-existent category', () => {
    const input = {
      ...validInput,
      events: [
        {
          id: 'evt1',
          title: 'Event 1',
          subTitle: '',
          description: 'Description 1',
          trackId: 'nonexistent',
          time: {
            start: '18:00',
            end: '19:00',
          },
        },
      ],
    }
    expect(() => processSchedule(input)).toThrow(
      /references non-existent category/,
    )
  })

  describe('overlap validation', () => {
    it('should reject overlapping events in same category', () => {
      const input = {
        ...validInput,
        events: [
          {
            id: 'evt1',
            title: 'Event 1',
            subTitle: '',
            description: 'Description 1',
            trackId: 'cat1',
            time: {
              start: '18:00',
              end: '19:00',
            },
          },
          {
            id: 'evt2',
            title: 'Event 2',
            subTitle: '',
            description: 'Description 2',
            trackId: 'cat1',
            time: {
              start: '18:30',
              end: '19:30',
            },
          },
        ],
      }
      expect(() => processSchedule(input)).toThrow(/Events overlap in category/)
    })

    it('should allow events in same category that touch but do not overlap', () => {
      const input = {
        ...validInput,
        events: [
          {
            id: 'evt1',
            title: 'Event 1',
            subTitle: '',
            description: 'Description 1',
            trackId: 'cat1',
            time: {
              start: '18:00',
              end: '19:00',
            },
          },
          {
            id: 'evt2',
            title: 'Event 2',
            subTitle: '',
            description: 'Description 2',
            trackId: 'cat1',
            time: {
              start: '19:00',
              end: '20:00',
            },
          },
        ],
      }
      expect(() => processSchedule(input)).not.toThrow()
    })

    it('should allow overlapping events in different categories', () => {
      const input = {
        ...validInput,
        events: [
          {
            id: 'evt1',
            title: 'Event 1',
            subTitle: '',
            description: 'Description 1',
            trackId: 'cat1',
            time: {
              start: '18:00',
              end: '19:00',
            },
          },
          {
            id: 'evt2',
            title: 'Event 2',
            subTitle: '',
            description: 'Description 2',
            trackId: 'cat2',
            time: {
              start: '18:30',
              end: '19:30',
            },
          },
        ],
      }
      expect(() => processSchedule(input)).not.toThrow()
    })

    it('should detect overlap when second event starts before first ends', () => {
      const input = {
        ...validInput,
        events: [
          {
            id: 'evt1',
            title: 'Event 1',
            subTitle: '',
            description: 'Description 1',
            trackId: 'cat1',
            time: {
              start: '18:00',
              end: '19:30',
            },
          },
          {
            id: 'evt2',
            title: 'Event 2',
            subTitle: '',
            description: 'Description 2',
            trackId: 'cat1',
            time: {
              start: '19:00',
              end: '20:00',
            },
          },
        ],
      }
      expect(() => processSchedule(input)).toThrow(/Events overlap in category/)
    })
  })
})
