import type { ScheduleInput } from '../../models/schedule-input'
import { toMinutes } from '../time/normalize-time'

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
