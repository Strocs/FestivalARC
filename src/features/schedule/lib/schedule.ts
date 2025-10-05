import type { NormalizedEvent } from '../types/models'
import type { NormalizedScheduleInput, ScheduleInput } from '../types/services'
import { toMinutes } from '../utils'
import { validateScheduleInput, validateNoOverlaps } from './validation'

export function normalizeScheduleInput(
  input: ScheduleInput,
): NormalizedScheduleInput {
  validateScheduleInput(input)

  // Create maps to search and set with more efficency
  const trackMap = new Map(input.tracks.map((track) => [track.id, track]))
  const eventsByTrack = new Map<string, NormalizedEvent[]>()

  for (const event of input.events) {
    if (!trackMap.has(event.trackId)) {
      throw new Error(
        `Event "${event.id}" references non-existent track "${event.trackId}"`,
      )
    }

    // Normalize event times to minutes
    const normalizedEvent: NormalizedEvent = {
      event,
      time: {
        start: toMinutes(event.time.start),
        end: toMinutes(event.time.end),
      },
    }

    eventsByTrack.set(event.trackId, [
      ...(eventsByTrack.get(event.trackId) || []),
      normalizedEvent,
    ])
  }

  for (const [trackId, events] of eventsByTrack) {
    const sortedEvents = [...events].sort((a, b) => a.time.start - b.time.start)

    // TODO: schedule must allow overlaps in some cases (e.g., parallel sessions) - revisit this
    // NOTE: when an overlap is detected, we need o create a parallel track in the same trackId to handle it
    validateNoOverlaps(sortedEvents, trackId)
    eventsByTrack.set(trackId, sortedEvents)
  }

  return {
    scheduleTime: {
      start: toMinutes(input.scheduleTime.start),
      end: toMinutes(input.scheduleTime.end),
      intervalMinutes: input.scheduleTime.intervalMinutes,
    },
    sortedTracks: [...input.tracks].sort((a, b) => a.order - b.order),
    eventsByTrack,
  }
}
