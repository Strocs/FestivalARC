import { useMemo, useEffect, useRef } from 'react'
import { Sidebar } from '../sidebar'
import { GridColumn } from './GridColumn'
import { GridColumns } from './GridColumns'
import { GridTimeSlots } from './GridTimeSlots'
import { NavigationButtons } from '../sidebar/NavigationButtons'
import { DaySelector } from '../sidebar/DaySelector'
import { StageNavigator } from '../sidebar/StageNavigator'
import { useHorizontalDrag } from '../../hooks/use-horizontal-scroll'
import { useDaySelection } from '../../hooks/use-day-selection'
import { useContainerVisibility } from '../../hooks/use-container-visibility'
import { useStageNavigator } from '../../hooks/use-stage-navigator'
import { cn } from '@/features/shared/utils'
import type { UIGridLayout, ScheduleDay } from '../../types'
import { useStageSelection } from '../../hooks/use-stage-selection'
import { FloatingButton } from '../general/FloatingButton'

const COLUMN_WIDTH = 320
const GAP_WIDTH = 16
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

  const {
    isDragging,
    wrapperRef,
    goToNext,
    goToPrev,
    currentColumnIndex,
    resetPosition,
    goToColumn,
  } = useHorizontalDrag({
    columnWidth: COLUMN_WIDTH + GAP_WIDTH,
    totalColumns: filteredRows.length,
    visibleColumns: VISIBLE_COLUMNS,
  })

  const { containerRef, isVisible } = useContainerVisibility({
    threshold: 0.1,
    rootMargin: '0px',
  })

  const {
    isOpen: isStageNavigatorOpen,
    toggle: toggleStageNavigator,
    close: closeStageNavigator,
    dropdownRef: stageNavigatorRef,
  } = useStageNavigator()

  const previousSelectionRef = useRef<string[]>(selectedStageIds)
  const currentColumnRef = useRef(currentColumnIndex)

  useEffect(() => {
    currentColumnRef.current = currentColumnIndex
  }, [currentColumnIndex])

  useEffect(() => {
    const previous = previousSelectionRef.current
    const current = selectedStageIds

    const wasAll = previous.length === stages.length
    const isAll = current.length === stages.length
    const wasNone = previous.length === 0
    const isNone = current.length === 0

    if ((isAll && !wasAll) || (isNone && !wasNone)) {
      resetPosition()
    } else if (current.length > previous.length && !isAll) {
      const addedId = current.find((id) => !previous.includes(id))
      if (addedId) {
        const addedIndexInOriginal = columns.findIndex(
          (col) => col.header.id === addedId,
        )

        const currentColumn = filteredRows[currentColumnRef.current]
        const currentIndexInOriginal = currentColumn
          ? columns.findIndex(
              (col) => col.header.id === currentColumn.header.id,
            )
          : -1

        if (
          addedIndexInOriginal !== -1 &&
          currentIndexInOriginal !== -1 &&
          addedIndexInOriginal < currentIndexInOriginal
        ) {
          const targetIndexInFiltered = filteredRows.findIndex(
            (row) => row.header.id === addedId,
          )
          if (targetIndexInFiltered !== -1) {
            goToColumn(targetIndexInFiltered)
          }
        }
      }
    } else if (current.length < previous.length) {
      const removedId = previous.find((id) => !current.includes(id))

      if (removedId) {
        const removedIndexInOriginal = columns.findIndex(
          (col) => col.header.id === removedId,
        )

        const currentColumn = filteredRows[currentColumnRef.current]
        const currentIndexInOriginal = currentColumn
          ? columns.findIndex(
              (col) => col.header.id === currentColumn.header.id,
            )
          : -1

        if (
          removedIndexInOriginal !== -1 &&
          currentIndexInOriginal !== -1 &&
          removedIndexInOriginal < currentIndexInOriginal
        ) {
          const newPosition = Math.max(0, currentColumnRef.current - 1)
          goToColumn(newPosition, false)
        } else {
          if (
            currentColumnRef.current >= filteredRows.length &&
            filteredRows.length > 0
          ) {
            goToColumn(filteredRows.length - 1)
          }
        }
      }
    }

    previousSelectionRef.current = current
  }, [
    selectedStageIds,
    resetPosition,
    goToColumn,
    filteredRows,
    stages.length,
    columns,
  ])

  const canGoNext = currentColumnIndex < columns.length - VISIBLE_COLUMNS
  const canGoPrev = currentColumnIndex > 0

  const showDaySelector = !isSingleDay(props)

  const handleFloatingButtonClick = () => {
    containerRef.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    })
  }

  const handleStageNavigate = (stageId: string) => {
    const stageIndexInFiltered = filteredRows.findIndex(
      (row) => row.header.id === stageId,
    )

    if (stageIndexInFiltered !== -1) {
      goToColumn(stageIndexInFiltered)
      handleFloatingButtonClick()
    }

    closeStageNavigator()
  }

  return (
    <section
      ref={containerRef}
      className='relative flex flex-col gap-4 overflow-x-clip py-4 [--header-height:50px] [--item-height:180px] md:w-full md:[--header-height:60px] md:[--item-height:200px]'>
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
          stageNavigator={
            <StageNavigator
              stages={filteredRows.map((row) => row.header)}
              currentStageIndex={currentColumnIndex}
              onStageClick={handleStageNavigate}
              isOpen={isStageNavigatorOpen}
              onToggle={toggleStageNavigator}
              dropdownRef={stageNavigatorRef}
            />
          }
        />

        <section className='-mt-[150px] flex gap-2 md:mt-auto'>
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

      <FloatingButton
        isVisible={isVisible}
        onClick={handleFloatingButtonClick}
        label='Volver arriba'
      />
    </section>
  )
}
