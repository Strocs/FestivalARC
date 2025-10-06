import { ScheduleGridHeader } from './ScheduleGridHeader'
import { ScheduleGridTimeSlots } from './ScheduleGridTimeSlots'
import { ScheduleGridEvents } from './ScheduleGridEvents'
import type { GroupSlot, IndividualSlot } from './types'

interface Track {
  id: string
  name: string
  color: string
  category?: string
}

interface FilteredRow {
  track: Track
  slots: (IndividualSlot | GroupSlot)[]
}

interface ScheduleGridProps {
  timeSlots: string[]
  tracks: Track[]
  filteredRows: FilteredRow[]
}

export function ScheduleGrid({
  timeSlots,
  tracks,
  filteredRows,
}: ScheduleGridProps) {
  return (
    <div
      className='font-neris grid max-w-[320px] min-w-[300px] gap-x-2'
      style={{
        gridTemplateRows: `50px repeat(${timeSlots.length}, 30px minmax(100px, 1fr))`,
        gridTemplateColumns: `70px repeat(${tracks.length}, minmax(320px, 1fr))`,
      }}>
      <ScheduleGridHeader tracks={tracks} />

      <ScheduleGridTimeSlots timeSlots={timeSlots} />

      <ScheduleGridEvents filteredRows={filteredRows} tracks={tracks} />
    </div>
  )
}
