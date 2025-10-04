import type { Event, Track } from '../types/models'
import type { ScheduleInput } from '../types/services'
import { toMinutes } from '../utils'
import { validateScheduleInput, validateNoOverlaps } from './validation'

export interface ProcessedSchedule {
  readonly intervalMinutes: number
  readonly sortedTracks: ReadonlyArray<Track>
  readonly eventsByTrack: Map<string, ReadonlyArray<Event>>
}

export function processSchedule(input: ScheduleInput): ProcessedSchedule {
  validateScheduleInput(input)

  // this must be a validation instead force the map of this tracks, if there is duplication an error must be showed
  // transform to a map only to do a has maybe is overkill? analize this
  const trackMap = new Map(input.tracks.map((cat) => [cat.id, cat]))

  const eventsByTrack = new Map<string, Event[]>()

  for (const event of input.events) {
    if (!trackMap.has(event.trackId)) {
      throw new Error(
        `Event "${event.id}" references non-existent track "${event.trackId}"`,
      )
    }

    const normalizedEvent: Event = {
      ...event,
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

    validateNoOverlaps(sortedEvents, trackId)
    eventsByTrack.set(trackId, sortedEvents)
  }

  return {
    intervalMinutes: input.time.intervalMinutes,
    sortedTracks: [...input.tracks].sort((a, b) => a.order - b.order),
    eventsByTrack,
  }
}
