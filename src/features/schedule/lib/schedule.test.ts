import { describe, it, expect } from 'vitest'
import { processSchedule } from './schedule'
import type { ScheduleInput } from '../types'

describe('processSchedule', () => {
  const validInput: ScheduleInput = {
    timeConfig: {
      startTime: '18:00',
      endTime: '23:00',
      intervalMinutes: 30
    },
    categories: [
      { id: 'cat1', name: 'Category 1', color: '#ff0000', order: 1 },
      { id: 'cat2', name: 'Category 2', color: '#00ff00', order: 2 }
    ],
    events: [
      {
        id: 'evt1',
        title: 'Event 1',
        description: 'Description 1',
        categoryId: 'cat1',
        startTime: '18:00',
        endTime: '19:00'
      },
      {
        id: 'evt2',
        title: 'Event 2',
        description: 'Description 2',
        categoryId: 'cat2',
        startTime: '20:00',
        endTime: '21:00'
      }
    ]
  }

  it('should process valid input successfully', () => {
    const result = processSchedule(validInput)
    
    expect(result.input).toBe(validInput)
    expect(result.categoryMap.size).toBe(2)
    expect(result.categoryMap.has('cat1')).toBe(true)
    expect(result.categoryMap.has('cat2')).toBe(true)
    expect(result.eventsByCategory.size).toBe(2)
  })

  it('should group events by category', () => {
    const result = processSchedule(validInput)
    
    const cat1Events = result.eventsByCategory.get('cat1')
    const cat2Events = result.eventsByCategory.get('cat2')
    
    expect(cat1Events?.length).toBe(1)
    expect(cat2Events?.length).toBe(1)
    expect(cat1Events?.[0].id).toBe('evt1')
    expect(cat2Events?.[0].id).toBe('evt2')
  })

  it('should reject missing timeConfig', () => {
    const input = { ...validInput, timeConfig: undefined as any }
    expect(() => processSchedule(input)).toThrow(/timeConfig is required/)
  })

  it('should reject missing categories', () => {
    const input = { ...validInput, categories: [] }
    expect(() => processSchedule(input)).toThrow(/At least one category is required/)
  })

  it('should reject missing events array', () => {
    const input = { ...validInput, events: undefined as any }
    expect(() => processSchedule(input)).toThrow(/events array is required/)
  })

  it('should reject invalid time range', () => {
    const input = {
      ...validInput,
      timeConfig: { ...validInput.timeConfig, endTime: '17:00' }
    }
    expect(() => processSchedule(input)).toThrow(/must be after startTime/)
  })

  it('should reject non-positive interval', () => {
    const input = {
      ...validInput,
      timeConfig: { ...validInput.timeConfig, intervalMinutes: 0 }
    }
    expect(() => processSchedule(input)).toThrow(/intervalMinutes must be positive/)
  })

  it('should reject event with invalid time range', () => {
    const input = {
      ...validInput,
      events: [
        {
          id: 'evt1',
          title: 'Event 1',
          description: 'Description 1',
          categoryId: 'cat1',
          startTime: '20:00',
          endTime: '19:00'
        }
      ]
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
          description: 'Description 1',
          categoryId: 'cat1',
          startTime: '17:00',
          endTime: '18:00'
        }
      ]
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
          description: 'Description 1',
          categoryId: 'nonexistent',
          startTime: '18:00',
          endTime: '19:00'
        }
      ]
    }
    expect(() => processSchedule(input)).toThrow(/references non-existent category/)
  })

  describe('overlap validation', () => {
    it('should reject overlapping events in same category', () => {
      const input = {
        ...validInput,
        events: [
          {
            id: 'evt1',
            title: 'Event 1',
            description: 'Description 1',
            categoryId: 'cat1',
            startTime: '18:00',
            endTime: '19:00'
          },
          {
            id: 'evt2',
            title: 'Event 2',
            description: 'Description 2',
            categoryId: 'cat1',
            startTime: '18:30',
            endTime: '19:30'
          }
        ]
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
            description: 'Description 1',
            categoryId: 'cat1',
            startTime: '18:00',
            endTime: '19:00'
          },
          {
            id: 'evt2',
            title: 'Event 2',
            description: 'Description 2',
            categoryId: 'cat1',
            startTime: '19:00',
            endTime: '20:00'
          }
        ]
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
            description: 'Description 1',
            categoryId: 'cat1',
            startTime: '18:00',
            endTime: '19:00'
          },
          {
            id: 'evt2',
            title: 'Event 2',
            description: 'Description 2',
            categoryId: 'cat2',
            startTime: '18:30',
            endTime: '19:30'
          }
        ]
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
            description: 'Description 1',
            categoryId: 'cat1',
            startTime: '18:00',
            endTime: '19:30'
          },
          {
            id: 'evt2',
            title: 'Event 2',
            description: 'Description 2',
            categoryId: 'cat1',
            startTime: '19:00',
            endTime: '20:00'
          }
        ]
      }
      expect(() => processSchedule(input)).toThrow(/Events overlap in category/)
    })
  })
})
