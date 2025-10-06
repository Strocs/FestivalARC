import type { NormalizedEvent } from '../types/models'
import type { ScheduleInput } from '../types/services'
import { toMinutes } from '../utils'

export function validateScheduleInput(input: ScheduleInput): void {
  if (!input.scheduleTime) {
    throw new Error('timeConfig is required')
  }

  if (!input.tracks || input.tracks.length === 0) {
    throw new Error('At least one category is required')
  }

  if (!input.events) {
    throw new Error('events array is required')
  }

  const start = toMinutes(input.scheduleTime.start)
  const end = toMinutes(input.scheduleTime.end)

  if (end <= start) {
    throw new Error(
      `timeConfig.endTime (${input.scheduleTime.end}) must be after startTime (${input.scheduleTime.start})`,
    )
  }

  if (input.scheduleTime.intervalMinutes <= 0) {
    throw new Error(
      `timeConfig.intervalMinutes must be positive, got ${input.scheduleTime.intervalMinutes}`,
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
        `Event "${event.id}" (${event.time.start} - ${event.time.end}) is outside schedule range (${input.scheduleTime.start} - ${input.scheduleTime.end})`,
      )
    }
  }
}

export function validateNoOverlaps(
  events: ReadonlyArray<NormalizedEvent>,
  trackId: string,
): void {
  if (events.length <= 1) return

  for (let i = 0; i < events.length - 1; i++) {
    const { event, time } = events[i]
    const { event: nextEvent, time: nextTime } = events[i + 1]

    if (nextTime.start < time.end) {
      throw new Error(
        `Events overlap in category "${trackId}":\n` +
          `  - Event "${event.id}" (${event.time.start} - ${event.time.end})\n` +
          `  - Event "${nextEvent.id}" (${nextEvent.time.start} - ${nextEvent.time.end})\n` +
          `Events in the same category cannot overlap.`,
      )
    }
  }
}
