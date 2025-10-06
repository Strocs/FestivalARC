import type { GridLayout, LayoutEvent } from '../types/layout'
import type { NormalizedEvent, ScheduleTime } from '../types/models'
import type { NormalizedScheduleInput } from '../types/services'
import { generateTimeSlots } from '../utils'

export function buildScheduleLayout(
  normalizedInput: NormalizedScheduleInput,
): GridLayout {
  const { scheduleTime, sortedTracks, sortedEvents } = normalizedInput

  const timeSlots = generateTimeSlots(
    scheduleTime.start,
    scheduleTime.end,
    scheduleTime.intervalMinutes,
  )

  const eventsByTrack = buildEventsWithPosition(sortedEvents, scheduleTime)

  return {
    timeSlots,
    trackSlots: sortedTracks,
    eventsByTrack,
  }
}

function buildEventsWithPosition(
  normalizedEvent: Map<string, ReadonlyArray<NormalizedEvent>>,
  trackTime: ScheduleTime<number>,
): Map<string, ReadonlyArray<LayoutEvent>> {
  if (trackTime.start >= trackTime.end) {
    throw new Error('Invalid track time range configuration')
  }

  return new Map(
    Array.from(normalizedEvent, ([trackId, events]) => [
      trackId,
      [...events].map(({ event, time }) => ({
        position: {
          start: Math.floor(
            (time.start - trackTime.start) / trackTime.intervalMinutes,
          ),
          span: Math.ceil((time.end - time.start) / trackTime.intervalMinutes),
        },
        event,
      })),
    ]),
  )
}
