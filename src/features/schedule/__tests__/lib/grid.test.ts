import { describe, it, expect } from 'vitest'
import { buildGridData } from '../../lib/grid'
import { processSchedule } from '../../lib/schedule'
import type { ScheduleInput } from '../../types/services'

describe('buildGridData', () => {
  const createProcessedSchedule = (input: ScheduleInput) => {
    return processSchedule(input)
  }

  it('should generate correct time slots', () => {
    const input: ScheduleInput = {
      time: {
        start: '18:00',
        end: '20:00',
        intervalMinutes: 30,
      },
      tracks: [{ id: 'cat1', name: 'Category 1', color: '#ff0000', order: 1 }],
      events: [],
    }

    const processed = createProcessedSchedule(input)
    const result = buildGridData(processed)

    expect(result.timeSlots).toEqual([
      '18:00',
      '18:30',
      '19:00',
      '19:30',
      '20:00',
    ])
  })

  it('should sort categories by order', () => {
    const input: ScheduleInput = {
      time: {
        start: '18:00',
        end: '20:00',
        intervalMinutes: 30,
      },
      tracks: [
        { id: 'cat3', name: 'Category 3', color: '#0000ff', order: 3 },
        { id: 'cat1', name: 'Category 1', color: '#ff0000', order: 1 },
        { id: 'cat2', name: 'Category 2', color: '#00ff00', order: 2 },
      ],
      events: [],
    }

    const processed = createProcessedSchedule(input)
    const result = buildGridData(processed)

    expect(result.tracks.map((c) => c.id)).toEqual(['cat1', 'cat2', 'cat3'])
  })

  it('should create rows for each category', () => {
    const input: ScheduleInput = {
      time: {
        start: '18:00',
        end: '20:00',
        intervalMinutes: 30,
      },
      tracks: [
        { id: 'cat1', name: 'Category 1', color: '#ff0000', order: 1 },
        { id: 'cat2', name: 'Category 2', color: '#00ff00', order: 2 },
      ],
      events: [],
    }

    const processed = createProcessedSchedule(input)
    const result = buildGridData(processed)

    expect(result.rows.length).toBe(2)
    expect(result.rows[0].trackId).toBe('cat1')
    expect(result.rows[1].trackId).toBe('cat2')
  })

  it('should create empty cells for categories with no events', () => {
    const input: ScheduleInput = {
      time: {
        start: '18:00',
        end: '19:00',
        intervalMinutes: 30,
      },
      tracks: [{ id: 'cat1', name: 'Category 1', color: '#ff0000', order: 1 }],
      events: [],
    }

    const processed = createProcessedSchedule(input)
    const result = buildGridData(processed)

    expect(result.rows[0].cells.length).toBe(3)
    expect(result.rows[0].cells.every((cell) => cell.type === 'empty')).toBe(
      true,
    )
  })

  it('should place event in correct slot', () => {
    const input: ScheduleInput = {
      time: {
        start: '18:00',
        end: '20:00',
        intervalMinutes: 30,
      },
      tracks: [{ id: 'cat1', name: 'Category 1', color: '#ff0000', order: 1 }],
      events: [
        {
          id: 'evt1',
          title: 'Event 1',
          subTitle: '',
          description: 'Description 1',
          trackId: 'cat1',
          time: {
            start: '18:30',
            end: '19:00',
          },
        },
      ],
    }

    const processed = createProcessedSchedule(input)
    const result = buildGridData(processed)

    const cells = result.rows[0].cells
    expect(cells[0].type).toBe('empty')
    expect(cells[1].type).toBe('event')
    if (cells[1].type === 'event') {
      expect(cells[1].data.id).toBe('evt1')
      expect(cells[1].data.span).toBe(1)
      expect(cells[1].gridColumn).toBe('span 1')
    }
  })

  it('should calculate correct span for multi-slot events', () => {
    const input: ScheduleInput = {
      time: {
        start: '18:00',
        end: '20:00',
        intervalMinutes: 30,
      },
      tracks: [{ id: 'cat1', name: 'Category 1', color: '#ff0000', order: 1 }],
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
      ],
    }

    const processed = createProcessedSchedule(input)
    const result = buildGridData(processed)

    const cells = result.rows[0].cells
    expect(cells[0].type).toBe('event')
    if (cells[0].type === 'event') {
      expect(cells[0].data.span).toBe(2)
      expect(cells[0].gridColumn).toBe('span 2')
    }
  })

  it('should not create span cells after event', () => {
    const input: ScheduleInput = {
      time: {
        start: '18:00',
        end: '20:00',
        intervalMinutes: 30,
      },
      tracks: [{ id: 'cat1', name: 'Category 1', color: '#ff0000', order: 1 }],
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
      ],
    }

    const processed = createProcessedSchedule(input)
    const result = buildGridData(processed)

    const cells = result.rows[0].cells
    expect(cells[1].type).toBe('empty')
    expect(cells[2].type).toBe('empty')
  })

  it('should handle multiple events in same category', () => {
    const input: ScheduleInput = {
      time: {
        start: '18:00',
        end: '21:00',
        intervalMinutes: 30,
      },
      tracks: [{ id: 'cat1', name: 'Category 1', color: '#ff0000', order: 1 }],
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
            start: '20:00',
            end: '21:00',
          },
        },
      ],
    }

    const processed = createProcessedSchedule(input)
    const result = buildGridData(processed)

    const cells = result.rows[0].cells
    expect(cells[0].type).toBe('event')
    expect(cells[4].type).toBe('event')
    if (cells[0].type === 'event' && cells[4].type === 'event') {
      expect(cells[0].data.id).toBe('evt1')
      expect(cells[4].data.id).toBe('evt2')
    }
  })

  it('should preserve event metadata', () => {
    const input: ScheduleInput = {
      time: {
        start: '18:00',
        end: '20:00',
        intervalMinutes: 30,
      },
      tracks: [{ id: 'cat1', name: 'Category 1', color: '#ff0000', order: 1 }],
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
          metadata: { category: 'Rock', gallery: [] },
        },
      ],
    }

    const processed = createProcessedSchedule(input)
    const result = buildGridData(processed)

    const cell = result.rows[0].cells[0]
    if (cell.type === 'event') {
      expect(cell.data.metadata).toEqual({ category: 'Rock', gallery: [] })
    }
  })
})
