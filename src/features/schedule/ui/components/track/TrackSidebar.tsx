import { useState, useEffect } from 'react'
import type { UIHeaderItem } from '../../types'
import { cn } from '@/features/shared/utils'
import { CollapseButton } from '../sidebar/CollapseButton'
import { StageSelection } from '../sidebar/StageSelection'

interface TrackSidebarProps {
  stages: ReadonlyArray<UIHeaderItem>
  selectedStageIds: string[]
  onStageSelectionChange: (stageIds: string[]) => void
  daySelector?: (isExpanded: boolean) => React.ReactNode
  navigation?: React.ReactNode
}

const STORAGE_KEY = 'festivalarc-sidebar-expanded'

export function TrackSidebar({
  stages,
  selectedStageIds,
  onStageSelectionChange,
  daySelector,
  navigation,
}: TrackSidebarProps) {
  const [isExpanded, setIsExpanded] = useState(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(STORAGE_KEY)
      return stored ? JSON.parse(stored) : true
    }
    return true
  })

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(isExpanded))
    }
  }, [isExpanded])

  return (
    <aside
      className={cn(
        'sticky top-2 z-10 flex h-fit w-full shrink-0 flex-col gap-2 px-3 transition-[width] duration-300 ease-in-out md:top-4 md:px-4',
        isExpanded ? 'md:w-72' : 'md:w-30',
      )}>
      <div className='bg-25-black hidden rounded-xs px-4 py-2 md:block'>
        <CollapseButton
          isExpanded={isExpanded}
          onToggle={() => setIsExpanded(!isExpanded)}
        />
      </div>

      {daySelector?.(isExpanded)}

      <StageSelection
        stages={stages}
        selectedStageIds={selectedStageIds}
        onStageSelectionChange={onStageSelectionChange}
        isExpanded={isExpanded}
      />

      {navigation}
    </aside>
  )
}
