import type { Event, NormalizedEvent } from '../types/models'
import type { ScheduleInput } from '../types/services'
import { toMinutes } from '../utils'

export function validateScheduleInput(input: ScheduleInput): void {
  if (!input.time) {
    throw new Error('timeConfig is required')
  }

  if (!input.tracks || input.tracks.length === 0) {
    throw new Error('At least one category is required')
  }

  if (!input.events) {
    throw new Error('events array is required')
  }

  const start = toMinutes(input.time.start)
  const end = toMinutes(input.time.end)

  if (end <= start) {
    throw new Error(
      `timeConfig.endTime (${input.time.end}) must be after startTime (${input.time.start})`,
    )
  }

  if (input.time.intervalMinutes <= 0) {
    throw new Error(
      `timeConfig.intervalMinutes must be positive, got ${input.time.intervalMinutes}`,
    )
  }

  for (const event of input.events) {
    const eventStart = toMinutes(event.time.start)
    const eventEnd = toMinutes(event.time.end)

    if (eventEnd <= eventStart) {
      throw new Error(
        `Event "${event.id}" has invalid time range: ${event.time.start} - ${event.time.end}`,
      )
    }

    if (eventStart < start || eventEnd > end) {
      throw new Error(
        `Event "${event.id}" (${event.time.start} - ${event.time.end}) is outside schedule range (${input.time.start} - ${input.time.end})`,
      )
    }
  }
}

export function validateNoOverlaps(
  events: ReadonlyArray<NormalizedEvent>,
  categoryId: string,
): void {
  if (events.length <= 1) return

  for (let i = 0; i < events.length - 1; i++) {
    const current = events[i]
    const next = events[i + 1]

    if (next.time.startMinutes < current.time.endMinutes) {
      throw new Error(
        `Events overlap in category "${categoryId}":\n` +
          `  - Event "${current.id}" (${current.time.start} - ${current.time.end})\n` +
          `  - Event "${next.id}" (${next.time.start} - ${next.time.end})\n` +
          `Events in the same category cannot overlap.`,
      )
    }
  }
}
