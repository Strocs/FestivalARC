import type { NormalizedEvent } from '../../models/event'

export interface EventGroup {
  events: NormalizedEvent[]
  timeRange: {
    start: number
    end: number
  }
}

export function groupOverlappingEvents(
  events: ReadonlyArray<NormalizedEvent>,
): (NormalizedEvent | EventGroup)[] {
  if (events.length === 0) return []

  const result: (NormalizedEvent | EventGroup)[] = []
  let currentGroup: EventGroup | null = null

  for (let i = 0; i < events.length; i++) {
    const event = events[i]
    const nextEvent = events[i + 1]
    if (!currentGroup) {
      if (nextEvent && eventsOverlap(event, nextEvent)) {
        currentGroup = {
          events: [event],
          timeRange: {
            start: event.time.start,
            end: event.time.end,
          },
        }
      } else {
        result.push(event)
      }
      continue
    }

    if (groupOverlapsWith(currentGroup, event)) {
      currentGroup.events.push(event)
      currentGroup.timeRange.end = Math.max(
        currentGroup.timeRange.end,
        event.time.end,
      )
    } else {
      result.push(currentGroup)
      currentGroup = null

      const nextEvent = events[i + 1]
      if (nextEvent && eventsOverlap(event, nextEvent)) {
        currentGroup = {
          events: [event],
          timeRange: {
            start: event.time.start,
            end: event.time.end,
          },
        }
      } else {
        result.push(event)
      }
    }
  }

  if (currentGroup) {
    result.push(currentGroup)
  }

  return result
}

function eventsOverlap(a: NormalizedEvent, b: NormalizedEvent): boolean {
  return a.time.start < b.time.end && b.time.start < a.time.end
}

function groupOverlapsWith(group: EventGroup, event: NormalizedEvent): boolean {
  return event.time.start < group.timeRange.end
}
