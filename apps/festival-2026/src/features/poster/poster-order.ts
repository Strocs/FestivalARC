import { days } from './poster-filter-layout'

interface ScheduledParticipant {
  day?: string
  time?: string
  location?: string
}

export type PosterOrders = Record<'time' | 'location', number[]>

export function createPosterOrder(participants: readonly ScheduledParticipant[]): PosterOrders {
  const collator = new Intl.Collator('es', { sensitivity: 'base', numeric: true })
  const entries = participants.map(({ day, time, location }, index) => {
    const [hours, minutes] = time?.match(/^([01]?\d|2[0-3]):([0-5]\d)$/)?.slice(1).map(Number) ?? []
    const start = day === days.saturday ? 0 : day === days.sunday ? 1440 : Infinity
    return { index, start: start + (hours === undefined ? Infinity : hours * 60 + minutes), location: location?.trim() || '' }
  })
  const chronological = (a: typeof entries[number], b: typeof entries[number]) => a.start - b.start || a.index - b.index
  const time = [...entries].sort(chronological).map(({ index }) => index)
  const location = entries.sort((a, b) =>
    Number(!a.location) - Number(!b.location) || collator.compare(a.location, b.location) || chronological(a, b),
  ).map(({ index }) => index)
  return { time, location }
}
