import { useMemo } from 'react'
import { ScheduleSidebar, useStageSelection } from './ScheduleSidebar'
import type { ScheduleLayoutGridProps } from './types'
import { ScheduleGridColumn } from './ScheduleGridColumn'
import { ScheduleGridEvents } from './ScheduleGridEvents'
import { ScheduleGridTimeSlots } from './ScheduleGridTimeSlots'
import { ScheduleNavigationButtons } from './ScheduleNavigationButtons'
import { useHorizontalDrag } from './useHorizontalDrag'
import { cn } from '../utils'

const COLUMN_WIDTH = 320
const GAP_WIDTH = 16
const COLUMN_WIDTH_WITH_GAP = COLUMN_WIDTH + GAP_WIDTH
const VISIBLE_COLUMNS = 3

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

  const { isDragging, wrapperRef, goToNext, goToPrev, currentColumnIndex } =
    useHorizontalDrag({
      columnWidth: COLUMN_WIDTH_WITH_GAP,
      totalColumns: tracks.length,
      visibleColumns: VISIBLE_COLUMNS,
    })

  const canGoNext = currentColumnIndex < tracks.length - VISIBLE_COLUMNS
  const canGoPrev = currentColumnIndex > 0

  return (
    <div className='flex flex-col gap-4 py-4'>
      <div className='flex items-center justify-between px-4'>
        <h2 className='text-25-white text-2xl font-bold'>
          Programación del Festival
        </h2>
        <ScheduleNavigationButtons
          onNext={goToNext}
          onPrev={goToPrev}
          canGoNext={canGoNext}
          canGoPrev={canGoPrev}
        />
      </div>

      <div className='flex flex-nowrap gap-4'>
        <ScheduleSidebar
          stages={stages}
          selectedStageIds={selectedStageIds}
          onStageSelectionChange={setSelectedStageIds}
        />

        <ScheduleGridColumn rowsLength={timeSlots.length}>
          <ScheduleGridTimeSlots timeSlots={timeSlots} />
        </ScheduleGridColumn>

        <div className='flex-1 overflow-x-clip'>
          <div
            ref={wrapperRef}
            className={cn(
              isDragging && 'cursor-grabbing',
              !isDragging && 'cursor-grab',
            )}
            style={{
              willChange: isDragging ? 'transform' : 'auto',
            }}>
            <div
              className='grid gap-4'
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
        </div>
      </div>
    </div>
  )
}
