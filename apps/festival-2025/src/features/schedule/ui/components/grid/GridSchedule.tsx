import { cn } from '@/features/shared/utils'
import { useHorizontalDrag } from '../../hooks/use-horizontal-scroll'
import { useColumnsStore } from '../../stores/schedule-columns-store'
import { GridColumns } from './GridColumns'
import { useDaysStore } from '../../stores/days-store'
import type { UIColumns } from '../../types'
import { useEffect } from 'react'

interface GridScheduleProps {
  rowsLenght: number
  groups: UIColumns[][]
}

const COLUMN_WIDTH = 320
const GAP_WIDTH = 16
const VISIBLE_COLUMNS = 1

export function GridSchedule({ rowsLenght, groups }: GridScheduleProps) {
  const currentDayIndex = useDaysStore((state) => state.currentDayIndex)
  const setColumns = useColumnsStore((state) => state.setColumns)

  // Update columns when day changes
  useEffect(() => {
    setColumns(groups[currentDayIndex])
  }, [currentDayIndex])

  const filteredColumns = useColumnsStore((state) => state.filteredColumns)

  const { wrapperRef, isDragging } = useHorizontalDrag({
    columnWidth: COLUMN_WIDTH + GAP_WIDTH,
    totalColumns: filteredColumns.length,
    visibleColumns: VISIBLE_COLUMNS,
  })

  return (
    <div
      ref={wrapperRef}
      suppressHydrationWarning
      className={cn(
        'will-change-transform',
        isDragging && 'cursor-grabbing',
        !isDragging && 'cursor-grab',
      )}>
      <div
        className='grid gap-4'
        style={{
          gridTemplateColumns: `repeat(${filteredColumns.length}, 320px)`,
        }}>
        <GridColumns
          config={{ columnWidth: COLUMN_WIDTH, gapWidth: GAP_WIDTH }}
          filteredRows={filteredColumns}
          rowsLength={rowsLenght}
        />
      </div>
    </div>
  )
}
