import type { NormalizedEvent } from '../types/models'

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

  const sortedEvents = [...events].sort((a, b) => a.time.start - b.time.start)

  const result: (NormalizedEvent | EventGroup)[] = []
  let currentGroup: EventGroup | null = null

  for (const event of sortedEvents) {
    if (!currentGroup) {
      const nextEvent = sortedEvents[sortedEvents.indexOf(event) + 1]
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
      currentGroup.events.sort((a, b) => a.time.end - b.time.end)
      result.push(currentGroup)
      currentGroup = null

      const nextEvent = sortedEvents[sortedEvents.indexOf(event) + 1]
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
    currentGroup.events.sort((a, b) => a.time.end - b.time.end)
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
