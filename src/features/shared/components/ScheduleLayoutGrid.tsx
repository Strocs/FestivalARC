import { useMemo } from 'react'
import { ScheduleSidebar, useStageSelection } from './ScheduleSidebar'
import { ScheduleGrid } from './ScheduleGrid'
import type { ScheduleLayoutGridProps } from './types'

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
    <div className='flex gap-4 py-4'>
      <ScheduleSidebar
        stages={stages}
        selectedStageIds={selectedStageIds}
        onStageSelectionChange={setSelectedStageIds}
      />

      <div className='flex-1'>
        <ScheduleGrid
          timeSlots={timeSlots}
          tracks={tracks}
          filteredRows={filteredRows}
        />
      </div>
    </div>
  )
}
