import type { DayKey } from './poster-filter-layout'
import type { PosterOrders } from './poster-order'

const days = { all: '', saturday: 'sabado', sunday: 'domingo' } as const
const orders = { original: '', time: 'horario', location: 'escenario' } as const

export interface PosterFilterState {
  day: DayKey
  order: keyof typeof orders
}

export const posterVariantStates: readonly PosterFilterState[] = (Object.keys(days) as DayKey[])
  .flatMap(day => (Object.keys(orders) as PosterFilterState['order'][])
    .filter(order => day !== 'all' || order !== 'original')
    .map(order => ({ day, order })))

export function readPosterFilters(params: URLSearchParams): PosterFilterState {
  const day = params.get('dia')
  const order = params.get('orden')
  return {
    day: day === days.saturday ? 'saturday' : day === days.sunday ? 'sunday' : 'all',
    order: order === orders.time ? 'time' : order === orders.location ? 'location' : 'original',
  }
}

export function writePosterFilters(url: URL, day: DayKey, sort: keyof PosterOrders | undefined): void {
  for (const [key, value] of [['dia', days[day]], ['orden', orders[sort ?? 'original']]]) {
    if (value) url.searchParams.set(key, value)
    else url.searchParams.delete(key)
  }
}
