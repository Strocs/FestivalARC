import type { GridLayout, LayoutEvent, LayoutEventGroup } from '../types/layout'
import type { NormalizedEvent, ScheduleTime } from '../types/models'
import type { NormalizedScheduleInput } from '../types/services'
import type { EventGroup } from './grouping'
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
  normalizedEvents: Map<string, ReadonlyArray<NormalizedEvent | EventGroup>>,
  trackTime: ScheduleTime<number>,
): Map<string, ReadonlyArray<LayoutEvent | LayoutEventGroup>> {
  if (trackTime.start >= trackTime.end) {
    throw new Error('Invalid track time range configuration')
  }

  return new Map(
    Array.from(normalizedEvents, ([trackId, items]) => [
      trackId,
      items.map((item) => {
        if ('events' in item) {
          return buildLayoutEventGroup(item, trackTime)
        }
        return buildLayoutEvent(item, trackTime)
      }),
    ]),
  )
}

function buildLayoutEvent(
  normalized: NormalizedEvent,
  trackTime: ScheduleTime<number>,
): LayoutEvent {
  return {
    position: {
      start: Math.floor(
        (normalized.time.start - trackTime.start) / trackTime.intervalMinutes,
      ),
      span: Math.ceil(
        (normalized.time.end - normalized.time.start) /
          trackTime.intervalMinutes,
      ),
    },
    event: normalized.event,
  }
}

function buildLayoutEventGroup(
  group: EventGroup,
  trackTime: ScheduleTime<number>,
): LayoutEventGroup {
  const groupStart = Math.floor(
    (group.timeRange.start - trackTime.start) / trackTime.intervalMinutes,
  )
  const groupSpan = Math.ceil(
    (group.timeRange.end - group.timeRange.start) / trackTime.intervalMinutes,
  )

  return {
    type: 'group',
    position: { start: groupStart, span: groupSpan },
    events: group.events.map((normalized) => ({
      position: {
        start: Math.floor(
          (normalized.time.start - group.timeRange.start) /
            trackTime.intervalMinutes,
        ),
        span: Math.ceil(
          (normalized.time.end - normalized.time.start) /
            trackTime.intervalMinutes,
        ),
      },
      event: normalized.event,
    })),
  }
}
