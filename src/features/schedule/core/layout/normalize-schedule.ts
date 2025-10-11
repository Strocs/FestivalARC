import type { NormalizedEvent, ScheduleEvent } from '../../models/event'
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

  // Create a map to get events by trackId efficiently
  const eventsByTrackId = new Map<string, ScheduleEvent[]>()
  for (const event of input.events) {
    if (!eventsByTrackId.has(event.trackId)) {
      eventsByTrackId.set(event.trackId, [])
    }
    eventsByTrackId.get(event.trackId)!.push(event)
  }

  const sortedEvents = new Map<string, (NormalizedEvent | EventGroup)[]>()
  const sortedTracks = [...input.tracks].sort((a, b) => a.order - b.order)

  sortedTracks.forEach((track) => {
    const trackEvents = eventsByTrackId.get(track.id) || []

    const normalizedEvents = trackEvents
      .map((event) => ({
        event,
        time: {
          start: toMinutes(event.time.start),
          end: toMinutes(event.time.end),
        },
      }))
      .sort((a, b) => a.time.start - b.time.start)

    const groupedEvents = groupOverlappingEvents(normalizedEvents)

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
