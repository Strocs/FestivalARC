import { describe, it, expect } from 'vitest'
import {
  groupOverlappingEvents,
  type EventGroup,
} from '../../core/layout/group-events'
import type { NormalizedEvent } from '../../models/event'

describe('groupOverlappingEvents', () => {
  it('should return empty array for empty input', () => {
    const result = groupOverlappingEvents([])
    expect(result).toEqual([])
  })

  it('should keep single event unchanged', () => {
    const events: NormalizedEvent[] = [
      {
        event: {
          id: 'evt1',
          trackId: 'track1',
          time: { start: '18:00', end: '19:00' },
        },
        time: { start: 1080, end: 1140 },
      },
    ]

    const result = groupOverlappingEvents(events)
    expect(result.length).toBe(1)
    expect(result[0]).toEqual(events[0])
  })

  it('should keep non-overlapping events separate', () => {
    const events: NormalizedEvent[] = [
      {
        event: {
          id: 'evt1',
          trackId: 'track1',
          time: { start: '18:00', end: '19:00' },
        },
        time: { start: 1080, end: 1140 },
      },
      {
        event: {
          id: 'evt2',
          trackId: 'track1',
          time: { start: '19:00', end: '20:00' },
        },
        time: { start: 1140, end: 1200 },
      },
    ]

    const result = groupOverlappingEvents(events)
    expect(result.length).toBe(2)
    expect(result[0]).toEqual(events[0])
    expect(result[1]).toEqual(events[1])
  })

  it('should group two overlapping events', () => {
    const events: NormalizedEvent[] = [
      {
        event: {
          id: 'evt1',
          trackId: 'track1',
          time: { start: '18:00', end: '19:00' },
        },
        time: { start: 1080, end: 1140 },
      },
      {
        event: {
          id: 'evt2',
          trackId: 'track1',
          time: { start: '18:30', end: '19:30' },
        },
        time: { start: 1110, end: 1170 },
      },
    ]

    const result = groupOverlappingEvents(events)
    expect(result.length).toBe(1)

    const group = result[0] as EventGroup
    expect(group).toHaveProperty('events')
    expect(group).toHaveProperty('timeRange')
    expect(group.events.length).toBe(2)
    expect(group.timeRange.start).toBe(1080)
    expect(group.timeRange.end).toBe(1170)
  })

  it('should group three overlapping events', () => {
    const events: NormalizedEvent[] = [
      {
        event: {
          id: 'evt1',
          trackId: 'track1',
          time: { start: '18:00', end: '19:00' },
        },
        time: { start: 1080, end: 1140 },
      },
      {
        event: {
          id: 'evt2',
          trackId: 'track1',
          time: { start: '18:30', end: '19:30' },
        },
        time: { start: 1110, end: 1170 },
      },
      {
        event: {
          id: 'evt3',
          trackId: 'track1',
          time: { start: '19:00', end: '20:00' },
        },
        time: { start: 1140, end: 1200 },
      },
    ]

    const result = groupOverlappingEvents(events)
    expect(result.length).toBe(1)

    const group = result[0] as EventGroup
    expect(group.events.length).toBe(3)
    expect(group.timeRange.start).toBe(1080)
    expect(group.timeRange.end).toBe(1200)
  })

  it('should create multiple groups for separate overlapping clusters', () => {
    const events: NormalizedEvent[] = [
      {
        event: {
          id: 'evt1',
          trackId: 'track1',
          time: { start: '18:00', end: '19:00' },
        },
        time: { start: 1080, end: 1140 },
      },
      {
        event: {
          id: 'evt2',
          trackId: 'track1',
          time: { start: '18:30', end: '19:30' },
        },
        time: { start: 1110, end: 1170 },
      },
      {
        event: {
          id: 'evt3',
          trackId: 'track1',
          time: { start: '20:00', end: '21:00' },
        },
        time: { start: 1200, end: 1260 },
      },
      {
        event: {
          id: 'evt4',
          trackId: 'track1',
          time: { start: '20:30', end: '21:30' },
        },
        time: { start: 1230, end: 1290 },
      },
    ]

    const result = groupOverlappingEvents(events)
    expect(result.length).toBe(2)

    const group1 = result[0] as EventGroup
    const group2 = result[1] as EventGroup

    expect(group1.events.length).toBe(2)
    expect(group2.events.length).toBe(2)
  })

  it('should handle mix of grouped and individual events', () => {
    const events: NormalizedEvent[] = [
      {
        event: {
          id: 'evt1',
          trackId: 'track1',
          time: { start: '18:00', end: '19:00' },
        },
        time: { start: 1080, end: 1140 },
      },
      {
        event: {
          id: 'evt2',
          trackId: 'track1',
          time: { start: '18:30', end: '19:30' },
        },
        time: { start: 1110, end: 1170 },
      },
      {
        event: {
          id: 'evt3',
          trackId: 'track1',
          time: { start: '20:00', end: '21:00' },
        },
        time: { start: 1200, end: 1260 },
      },
    ]

    const result = groupOverlappingEvents(events)
    expect(result.length).toBe(2)

    const group = result[0] as EventGroup
    expect(group).toHaveProperty('events')
    expect(group.events.length).toBe(2)

    const individual = result[1] as NormalizedEvent
    expect(individual).toHaveProperty('event')
    expect(individual.event.id).toBe('evt3')
  })

  it('should keep events in input order within group', () => {
    const events: NormalizedEvent[] = [
      {
        event: {
          id: 'evt1',
          trackId: 'track1',
          time: { start: '18:00', end: '19:30' },
        },
        time: { start: 1080, end: 1170 },
      },
      {
        event: {
          id: 'evt2',
          trackId: 'track1',
          time: { start: '18:30', end: '19:00' },
        },
        time: { start: 1110, end: 1140 },
      },
    ]

    const result = groupOverlappingEvents(events)
    const group = result[0] as EventGroup

    expect(group.events[0].event.id).toBe('evt1')
    expect(group.events[1].event.id).toBe('evt2')
  })

  it('should handle events that are already sorted', () => {
    const events: NormalizedEvent[] = [
      {
        event: {
          id: 'evt1',
          trackId: 'track1',
          time: { start: '18:00', end: '19:00' },
        },
        time: { start: 1080, end: 1140 },
      },
      {
        event: {
          id: 'evt2',
          trackId: 'track1',
          time: { start: '19:30', end: '20:30' },
        },
        time: { start: 1170, end: 1230 },
      },
    ]

    const result = groupOverlappingEvents(events)
    expect(result.length).toBe(2)
    expect(result[0]).toEqual(events[0])
    expect(result[1]).toEqual(events[1])
  })

  it('should extend group range to include all overlapping events', () => {
    const events: NormalizedEvent[] = [
      {
        event: {
          id: 'evt1',
          trackId: 'track1',
          time: { start: '18:00', end: '18:30' },
        },
        time: { start: 1080, end: 1110 },
      },
      {
        event: {
          id: 'evt2',
          trackId: 'track1',
          time: { start: '18:15', end: '19:00' },
        },
        time: { start: 1095, end: 1140 },
      },
      {
        event: {
          id: 'evt3',
          trackId: 'track1',
          time: { start: '18:45', end: '20:00' },
        },
        time: { start: 1125, end: 1200 },
      },
    ]

    const result = groupOverlappingEvents(events)
    expect(result.length).toBe(1)

    const group = result[0] as EventGroup
    expect(group.timeRange.start).toBe(1080)
    expect(group.timeRange.end).toBe(1200)
  })
})
