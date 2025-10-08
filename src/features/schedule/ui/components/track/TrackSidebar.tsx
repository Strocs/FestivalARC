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
        'ml-8 flex h-fit shrink-0 flex-col gap-2 transition-all duration-300 ease-in-out',
        isExpanded ? 'w-60' : 'w-22',
      )}>
      <div className='bg-25-black rounded-xs px-4 py-2'>
        <CollapseButton
          isExpanded={isExpanded}
          onToggle={() => setIsExpanded(!isExpanded)}
        />
      </div>

      {daySelector?.(isExpanded)}

      <div className='bg-25-black rounded-xs p-4'>
        <StageSelection
          stages={stages}
          selectedStageIds={selectedStageIds}
          onStageSelectionChange={onStageSelectionChange}
          isExpanded={isExpanded}
        />
      </div>

      {navigation}
    </aside>
  )
}
