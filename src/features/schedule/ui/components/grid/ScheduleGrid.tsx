import { useEffect, useMemo, useRef, useState } from 'react'
import { Sidebar } from '../sidebar'
import { GridColumn } from './GridColumn'
import { GridColumns } from './GridColumns'
import { GridTimeSlots } from './GridTimeSlots'
import { NavigationButtons } from '../sidebar/NavigationButtons'
import { DaySelector } from '../sidebar/DaySelector'
import { useHorizontalDrag } from '../../hooks/use-horizontal-scroll'
import { useDaySelection } from '../../hooks/use-day-selection'
import { cn } from '@/features/shared/utils'
import type { UIGridLayout, ScheduleDay } from '../../types'
import { useStageSelection } from '../../hooks/use-stage-selection'
import { ShowHint } from '../general/ShowHint'

const COLUMN_WIDTH = 320
const GAP_WIDTH = 16
// NOTE: Calc the visible columns based on the curent window width? Analize cost on performance - onResize with debouncing?
const VISIBLE_COLUMNS = 1

type ScheduleGridProps = UIGridLayout | { days: ReadonlyArray<ScheduleDay> }

function isSingleDay(props: ScheduleGridProps): props is UIGridLayout {
  return 'timeColumn' in props
}

export function ScheduleGrid(props: ScheduleGridProps) {
  const days = isSingleDay(props) ? [{ label: '', data: props }] : props.days

  const { currentDayIndex, setCurrentDay } = useDaySelection({
    totalDays: days.length,
    initialDay: 0,
  })

  const {
    timeColumn,
    columns,
    headerRow: stages,
  } = useMemo(() => days[currentDayIndex].data, [days, currentDayIndex])
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

  const showDaySelector = !isSingleDay(props)

  return (
    <section className='relative flex flex-col gap-4 overflow-x-clip py-4 md:w-full'>
      <ShowHint isDragging={isDragging} />
      <div className='flex w-screen flex-col flex-nowrap gap-2 md:flex-row md:gap-4'>
        <Sidebar
          stages={stages}
          selectedStageIds={selectedStageIds}
          onStageSelectionChange={setSelectedStageIds}
          daySelector={
            showDaySelector
              ? (isExpanded) => (
                  <DaySelector
                    days={days}
                    currentDayIndex={currentDayIndex}
                    onDayChange={setCurrentDay}
                    isExpanded={isExpanded}
                  />
                )
              : undefined
          }
          navigation={
            <NavigationButtons
              onNext={goToNext}
              onPrev={goToPrev}
              canGoNext={canGoNext}
              canGoPrev={canGoPrev}
              className='hidden items-center justify-between rounded-xs px-4 py-2 md:flex'
            />
          }
        />

        <section className='flex gap-2'>
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
        </section>
      </div>
    </section>
  )
}
