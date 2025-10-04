import type { ScheduleInput } from '../types'
import { toMinutes } from '../utils'

export interface ProcessedSchedule {
  readonly input: ScheduleInput
  readonly categoryMap: Map<string, ScheduleInput['categories'][number]>
  readonly eventsByCategory: Map<string, ReadonlyArray<ScheduleInput['events'][number]>>
}

export function processSchedule(input: ScheduleInput): ProcessedSchedule {
  validateInput(input)
  
  const categoryMap = new Map(
    input.categories.map(cat => [cat.id, cat])
  )
  
  const eventsByCategory = new Map<string, ScheduleInput['events'][number][]>()
  
  for (const event of input.events) {
    if (!categoryMap.has(event.categoryId)) {
      throw new Error(`Event "${event.id}" references non-existent category "${event.categoryId}"`)
    }
    
    const categoryEvents = eventsByCategory.get(event.categoryId) || []
    categoryEvents.push(event)
    eventsByCategory.set(event.categoryId, categoryEvents)
  }
  
  for (const [categoryId, events] of eventsByCategory) {
    validateNoOverlaps(events, categoryId)
  }
  
  return {
    input,
    categoryMap,
    eventsByCategory
  }
}

function validateNoOverlaps(
  events: ReadonlyArray<ScheduleInput['events'][number]>,
  categoryId: string
): void {
  if (events.length <= 1) return

  const sorted = [...events].sort((a, b) => 
    toMinutes(a.startTime) - toMinutes(b.startTime)
  )
  
  for (let i = 0; i < sorted.length - 1; i++) {
    const current = sorted[i]
    const next = sorted[i + 1]
    
    const currentEnd = toMinutes(current.endTime)
    const nextStart = toMinutes(next.startTime)
    
    if (nextStart < currentEnd) {
      throw new Error(
        `Events overlap in category "${categoryId}":\n` +
        `  - Event "${current.id}" (${current.startTime} - ${current.endTime})\n` +
        `  - Event "${next.id}" (${next.startTime} - ${next.endTime})\n` +
        `Events in the same category cannot overlap.`
      )
    }
  }
}

function validateInput(input: ScheduleInput): void {
  if (!input.timeConfig) {
    throw new Error('timeConfig is required')
  }
  
  if (!input.categories || input.categories.length === 0) {
    throw new Error('At least one category is required')
  }
  
  if (!input.events) {
    throw new Error('events array is required')
  }
  
  const start = toMinutes(input.timeConfig.startTime)
  const end = toMinutes(input.timeConfig.endTime)
  
  if (end <= start) {
    throw new Error(
      `timeConfig.endTime (${input.timeConfig.endTime}) must be after startTime (${input.timeConfig.startTime})`
    )
  }
  
  if (input.timeConfig.intervalMinutes <= 0) {
    throw new Error(`timeConfig.intervalMinutes must be positive, got ${input.timeConfig.intervalMinutes}`)
  }
  
  for (const event of input.events) {
    const eventStart = toMinutes(event.startTime)
    const eventEnd = toMinutes(event.endTime)
    
    if (eventEnd <= eventStart) {
      throw new Error(`Event "${event.id}" has invalid time range: ${event.startTime} - ${event.endTime}`)
    }
    
    if (eventStart < start || eventEnd > end) {
      throw new Error(
        `Event "${event.id}" (${event.startTime} - ${event.endTime}) is outside schedule range (${input.timeConfig.startTime} - ${input.timeConfig.endTime})`
      )
    }
  }
}
