import { describe, it, expect } from 'vitest'
import { buildScheduleLayout } from '../../core/layout/build-layout'
import { normalizeScheduleInput } from '../../core/layout/normalize-schedule'
import type { ScheduleInput } from '../../models/schedule-input'

describe('buildScheduleLayout', () => {
  const createNormalizedSchedule = (input: ScheduleInput) => {
    return normalizeScheduleInput(input)
  }

  it('should generate correct time slots', () => {
    const input: ScheduleInput = {
      scheduleTime: {
        start: '18:00',
        end: '20:00',
        intervalMinutes: 30,
      },
      tracks: [{ id: 'cat1', order: 1 }],
      events: [],
    }

    const normalized = createNormalizedSchedule(input)
    const result = buildScheduleLayout(normalized)

    expect(result.timeSlots).toEqual([
      '18:00',
      '18:30',
      '19:00',
      '19:30',
      '20:00',
    ])
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

    const normalized = createNormalizedSchedule(input)
    const result = buildScheduleLayout(normalized)

    expect(result.trackSlots.map((c) => c.id)).toEqual(['cat1', 'cat2', 'cat3'])
  })

  it('should create entries for each track', () => {
    const input: ScheduleInput = {
      scheduleTime: {
        start: '18:00',
        end: '20:00',
        intervalMinutes: 30,
      },
      tracks: [
        { id: 'cat1', order: 1 },
        { id: 'cat2', order: 2 },
      ],
      events: [],
    }

    const normalized = createNormalizedSchedule(input)
    const result = buildScheduleLayout(normalized)

    expect(result.trackSlots.length).toBe(2)
    expect(result.eventsByTrack.size).toBe(2)
    expect(result.eventsByTrack.get('cat1')).toEqual([])
    expect(result.eventsByTrack.get('cat2')).toEqual([])
  })

  it('should place event with correct position', () => {
    const input: ScheduleInput = {
      scheduleTime: {
        start: '18:00',
        end: '20:00',
        intervalMinutes: 30,
      },
      tracks: [{ id: 'cat1', order: 1 }],
      events: [
        {
          id: 'evt1',
          trackId: 'cat1',
          time: {
            start: '18:30',
            end: '19:00',
          },
        },
      ],
    }

    const normalized = createNormalizedSchedule(input)
    const result = buildScheduleLayout(normalized)

    const cat1Events = result.eventsByTrack.get('cat1')!
    expect(cat1Events.length).toBe(1)

    const layoutEvent = cat1Events[0]
    if ('event' in layoutEvent) {
      expect(layoutEvent.position.start).toBe(1)
      expect(layoutEvent.position.span).toBe(1)
      expect(layoutEvent.event.id).toBe('evt1')
    }
  })

  it('should calculate correct span for multi-slot events', () => {
    const input: ScheduleInput = {
      scheduleTime: {
        start: '18:00',
        end: '20:00',
        intervalMinutes: 30,
      },
      tracks: [{ id: 'cat1', order: 1 }],
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

    const normalized = createNormalizedSchedule(input)
    const result = buildScheduleLayout(normalized)

    const cat1Events = result.eventsByTrack.get('cat1')!
    const layoutEvent = cat1Events[0]

    if ('event' in layoutEvent) {
      expect(layoutEvent.position.start).toBe(0)
      expect(layoutEvent.position.span).toBe(2)
    }
  })

  it('should handle multiple events in same track', () => {
    const input: ScheduleInput = {
      scheduleTime: {
        start: '18:00',
        end: '21:00',
        intervalMinutes: 30,
      },
      tracks: [{ id: 'cat1', order: 1 }],
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
            start: '20:00',
            end: '21:00',
          },
        },
      ],
    }

    const normalized = createNormalizedSchedule(input)
    const result = buildScheduleLayout(normalized)

    const cat1Events = result.eventsByTrack.get('cat1')!
    expect(cat1Events.length).toBe(2)

    if ('event' in cat1Events[0]) {
      expect(cat1Events[0].event.id).toBe('evt1')
      expect(cat1Events[0].position.start).toBe(0)
    }

    if ('event' in cat1Events[1]) {
      expect(cat1Events[1].event.id).toBe('evt2')
      expect(cat1Events[1].position.start).toBe(4)
    }
  })

  it('should preserve event payload', () => {
    const input: ScheduleInput = {
      scheduleTime: {
        start: '18:00',
        end: '20:00',
        intervalMinutes: 30,
      },
      tracks: [{ id: 'cat1', order: 1 }],
      events: [
        {
          id: 'evt1',
          trackId: 'cat1',
          time: {
            start: '18:00',
            end: '19:00',
          },
          payload: { title: 'Event 1', category: 'Rock' },
        },
      ],
    }

    const normalized = createNormalizedSchedule(input)
    const result = buildScheduleLayout(normalized)

    const layoutEvent = result.eventsByTrack.get('cat1')![0]
    if ('event' in layoutEvent) {
      expect(layoutEvent.event.payload).toEqual({
        title: 'Event 1',
        category: 'Rock',
      })
    }
  })

  it('should group overlapping events', () => {
    const input: ScheduleInput = {
      scheduleTime: {
        start: '18:00',
        end: '21:00',
        intervalMinutes: 30,
      },
      tracks: [{ id: 'cat1', order: 1 }],
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
            start: '18:30',
            end: '19:30',
          },
        },
      ],
    }

    const normalized = createNormalizedSchedule(input)
    const result = buildScheduleLayout(normalized)

    const cat1Events = result.eventsByTrack.get('cat1')!
    expect(cat1Events.length).toBe(1)

    const layoutItem = cat1Events[0]
    expect(layoutItem).toHaveProperty('type', 'group')

    if ('type' in layoutItem && layoutItem.type === 'group') {
      expect(layoutItem.events.length).toBe(2)
      expect(layoutItem.position.start).toBe(0)
      expect(layoutItem.position.span).toBe(3)
    }
  })

  it('should calculate position relative to schedule start', () => {
    const input: ScheduleInput = {
      scheduleTime: {
        start: '10:00',
        end: '12:00',
        intervalMinutes: 30,
      },
      tracks: [{ id: 'cat1', order: 1 }],
      events: [
        {
          id: 'evt1',
          trackId: 'cat1',
          time: {
            start: '10:30',
            end: '11:00',
          },
        },
      ],
    }

    const normalized = createNormalizedSchedule(input)
    const result = buildScheduleLayout(normalized)

    const layoutEvent = result.eventsByTrack.get('cat1')![0]
    if ('event' in layoutEvent) {
      expect(layoutEvent.position.start).toBe(1)
    }
  })
})
