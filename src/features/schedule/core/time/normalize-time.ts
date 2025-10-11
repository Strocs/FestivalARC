export function toMinutes(time: string | number): number {
  if (typeof time === 'number') {
    if (time < 0 || time >= 1440) {
      throw new Error(`Minutes out of range: ${time}`)
    }
    return time
  }

  if (typeof time !== 'string' || !/^\d{1,2}:\d{2}$/.test(time)) {
    throw new Error(`Invalid time format: "${time}". Expected "HH:MM"`)
  }

  const [hours, minutes] = time.split(':').map(Number)

  if (isNaN(hours) || isNaN(minutes)) {
    throw new Error(`Invalid time format: "${time}". Expected "HH:MM"`)
  }

  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
    throw new Error(`Time out of range: "${time}"`)
  }

  return hours * 60 + minutes
}

export function fromMinutes(totalMinutes: number): string {
  if (totalMinutes < 0 || totalMinutes >= 1440) {
    throw new Error(`Minutes out of range: ${totalMinutes}`)
  }

  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`
}
