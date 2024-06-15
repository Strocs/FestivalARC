interface DAY {
  day: string
  color: string
  schedule: []
}

export const DAYS: DAY[] = [
  { day: 'Jueves 27', color: 'border border-4 border-day-1 hover:bg-day-1', schedule: [] },
  { day: 'Viernes 28', color: 'border border-4 border-day-2 hover:bg-day-2', schedule: [] },
  { day: 'Sábado 29', color: 'border border-4 border-day-3 hover:bg-day-3', schedule: [] },
  { day: 'Domingo 30', color: 'border border-4 border-day-4 hover:bg-day-4', schedule: [] },
]