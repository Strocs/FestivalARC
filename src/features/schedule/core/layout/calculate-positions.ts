import { fromMinutes } from '../time/normalize-time'

export function generateTimeSlots(
  startTime: number,
  endTime: number,
  intervalMinutes: number,
): string[] {
  if (endTime <= startTime) {
    throw new Error(
      `End time (${endTime}) must be after start time (${startTime})`,
    )
  }

  if (intervalMinutes <= 0) {
    throw new Error(`Interval must be positive, got ${intervalMinutes}`)
  }

  const slots: string[] = []
  for (
    let current = startTime;
    current <= endTime;
    current += intervalMinutes
  ) {
    slots.push(fromMinutes(current))
  }

  return slots
}
