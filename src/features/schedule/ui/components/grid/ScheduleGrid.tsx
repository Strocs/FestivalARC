import { useMemo } from 'react'
import { TrackSidebar } from '../track/TrackSidebar'
import { GridColumn } from './GridColumn'
import { GridColumns } from './GridColumns'
import { GridTimeSlots } from './GridTimeSlots'
import { NavigationButtons } from '../navigation/NavigationButtons'
import { useHorizontalDrag } from '../../hooks/use-horizontal-scroll'
import { cn } from '@/features/shared/utils'
import type { UIGridLayout } from '../../types'
import { useStageSelection } from '../../hooks/use-stage-selection'

const COLUMN_WIDTH = 320
const GAP_WIDTH = 16
// NOTE: Calc the visible columns based on the curent window width? Analize cost on performance - onResize with debouncing?
const VISIBLE_COLUMNS = 1

export function ScheduleGrid({
  timeColumn,
  columns,
  headerRow: stages,
}: UIGridLayout) {
  const { selectedStageIds, setSelectedStageIds } = useStageSelection(
    stages.map((s) => s.id),
  )

  const filteredRows = useMemo(() => {
    return columns.filter((column) =>
      selectedStageIds.includes(column.header.id),
    )
  }, [columns, selectedStageIds])

  const { isDragging, wrapperRef, goToNext, goToPrev, currentColumnIndex } =
    useHorizontalDrag({
      columnWidth: COLUMN_WIDTH + GAP_WIDTH,
      totalColumns: filteredRows.length,
      visibleColumns: VISIBLE_COLUMNS,
    })

  const canGoNext = currentColumnIndex < columns.length - VISIBLE_COLUMNS
  const canGoPrev = currentColumnIndex > 0

  return (
    <section className='flex flex-col gap-4 overflow-x-clip py-4 md:w-full'>
      <div className='flex w-screen flex-nowrap gap-1 md:gap-4'>
        <section className='sticky top-4 hidden h-fit md:block'>
          <TrackSidebar
            stages={stages}
            selectedStageIds={selectedStageIds}
            onStageSelectionChange={setSelectedStageIds}
            navigation={
              <NavigationButtons
                onNext={goToNext}
                onPrev={goToPrev}
                canGoNext={canGoNext}
                canGoPrev={canGoPrev}
                className='flex items-center justify-between'
              />
            }
          />
        </section>

        <GridColumn length={{ rows: timeColumn.length, columns: 1 }}>
          <GridTimeSlots timeColumn={timeColumn} />
        </GridColumn>

        <section className='flex-1 overflow-x-clip'>
          <div
            ref={wrapperRef}
            className={cn(
              'will-change-transform',
              isDragging && 'cursor-grabbing',
              !isDragging && 'cursor-grab',
            )}>
            <div
              className='grid gap-4'
              style={{
                gridTemplateColumns: `repeat(${columns.length}, 320px)`,
                gridRow: 1,
              }}>
              <GridColumns
                config={{ columnWidth: COLUMN_WIDTH, gapWidth: GAP_WIDTH }}
                filteredRows={filteredRows}
                rowsLength={timeColumn.length}
              />
            </div>
          </div>
        </section>
      </div>
    </section>
  )
}
