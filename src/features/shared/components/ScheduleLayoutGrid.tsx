import { useMemo } from 'react'
import { ScheduleSidebar, useStageSelection } from './ScheduleSidebar'
import type { ScheduleLayoutGridProps } from './types'
import { ScheduleGridColumn } from './ScheduleGridColumn'
import { ScheduleGridEvents } from './ScheduleGridEvents'
import { ScheduleGridTimeSlots } from './ScheduleGridTimeSlots'

export function ScheduleLayoutGrid({
  timeSlots,
  rows,
}: ScheduleLayoutGridProps) {
  const stages = useMemo(() => {
    return rows.map(({ track }) => track)
  }, [rows])

  const { selectedStageIds, setSelectedStageIds } = useStageSelection(stages)

  const filteredRows = useMemo(() => {
    return rows.filter((row) => selectedStageIds.includes(row.track.id))
  }, [rows, selectedStageIds])

  const tracks = filteredRows.map((row) => row.track)

  return (
    <div className='flex flex-nowrap gap-4 py-4'>
      <ScheduleSidebar
        stages={stages}
        selectedStageIds={selectedStageIds}
        onStageSelectionChange={setSelectedStageIds}
      />

      <ScheduleGridColumn rowsLength={timeSlots.length}>
        <ScheduleGridTimeSlots timeSlots={timeSlots} />
      </ScheduleGridColumn>

      <div
        className='grid flex-1 gap-4 overflow-x-clip'
        style={{
          gridTemplateColumns: `repeat(${tracks.length}, 320px)`,
          gridRow: 1,
        }}>
        <ScheduleGridEvents
          filteredRows={filteredRows}
          tracks={tracks}
          rowsLength={timeSlots.length}
        />
      </div>
    </div>
  )
}
