import type { NormalizedEvent } from '../types/models'
import type { NormalizedScheduleInput, ScheduleInput } from '../types/services'
import { toMinutes } from '../utils'
import { validateScheduleInput } from './validation'
import { groupOverlappingEvents, type EventGroup } from './grouping'

export function normalizeScheduleInput(
  input: ScheduleInput,
): NormalizedScheduleInput {
  validateScheduleInput(input)

  let sortedEvents = new Map<string, (NormalizedEvent | EventGroup)[]>()
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
