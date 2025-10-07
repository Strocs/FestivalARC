import type { NormalizedEvent } from '../../models/event'
import type {
  NormalizedScheduleInput,
  ScheduleInput,
} from '../../models/schedule-input'
import { toMinutes } from '../time/normalize-time'
import { validateScheduleInput } from '../validation/validate-events'
import { groupOverlappingEvents, type EventGroup } from './group-events'

export function normalizeScheduleInput(
  input: ScheduleInput,
): NormalizedScheduleInput {
  validateScheduleInput(input)

  const sortedEvents = new Map<string, (NormalizedEvent | EventGroup)[]>()
  const sortedTracks = [...input.tracks].sort((a, b) => {
    return a.order - b.order
  })

  sortedTracks.forEach((track) => {
    const events = [...input.events]
      .filter((event) => event.trackId === track.id)
      .map((event) => ({
        event,
        time: {
          start: toMinutes(event.time.start),
          end: toMinutes(event.time.end),
        },
      }))
      .sort((a, b) => a.time.start - b.time.start)

    const groupedEvents = groupOverlappingEvents(events)

    sortedEvents.set(track.id, groupedEvents)
  })

  return {
    scheduleTime: {
      start: toMinutes(input.scheduleTime.start),
      end: toMinutes(input.scheduleTime.end),
      intervalMinutes: input.scheduleTime.intervalMinutes,
    },
    sortedTracks,
    sortedEvents,
  }
}
