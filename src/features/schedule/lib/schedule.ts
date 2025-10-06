import type { NormalizedEvent } from '../types/models'
import type { NormalizedScheduleInput, ScheduleInput } from '../types/services'
import { toMinutes } from '../utils'
import { validateScheduleInput, validateNoOverlaps } from './validation'

export function normalizeScheduleInput(
  input: ScheduleInput,
): NormalizedScheduleInput {
  validateScheduleInput(input)

  let sortedEvents = new Map<string, NormalizedEvent[]>()
  // Create maps to search and set with more efficency
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

    // TODO: schedule must allow overlaps in some cases (e.g., parallel sessions) - revisit this
    // NOTE: when an overlap is detected, we need o create a parallel track in the same trackId to handle it
    validateNoOverlaps(events, track.id)

    sortedEvents.set(track.id, events)
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
