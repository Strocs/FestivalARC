import { useState } from 'react'

export interface Stage {
  id: string
  name: string
  color: string
  order: number
  category?: string
}

interface ScheduleSidebarProps {
  stages: Stage[]
  selectedStageIds: string[]
  onStageSelectionChange: (stageIds: string[]) => void
}

export function ScheduleSidebar({
  stages,
  selectedStageIds,
  onStageSelectionChange,
}: ScheduleSidebarProps) {
  const handleToggleStage = (stageId: string) => {
    if (selectedStageIds.includes(stageId)) {
      onStageSelectionChange(selectedStageIds.filter((id) => id !== stageId))
    } else {
      onStageSelectionChange([...selectedStageIds, stageId])
    }
  }

  const handleSelectAll = () => {
    onStageSelectionChange(stages.map((stage) => stage.id))
  }

  const handleDeselectAll = () => {
    onStageSelectionChange([])
  }

  const sortedStages = [...stages].sort((a, b) => a.order - b.order)

  return (
    <aside className='sticky top-4 flex h-fit w-64 flex-col gap-4 bg-[#170d19] px-4 pt-4 pb-8'>
      <div className='flex items-center justify-between'>
        <h3 className='m-0 text-sm font-bold text-white'>Escenarios</h3>
        <div className='flex gap-2'>
          <button
            onClick={handleSelectAll}
            className='text-xs text-gray-400 hover:text-white'
            type='button'>
            Todos
          </button>
          <span className='text-gray-600'>|</span>
          <button
            onClick={handleDeselectAll}
            className='text-xs text-gray-400 hover:text-white'
            type='button'>
            Ninguno
          </button>
        </div>
      </div>

      <div className='flex flex-col'>
        {sortedStages.map((stage) => (
          <label
            key={stage.id}
            className='flex cursor-pointer items-center gap-3 rounded p-2 hover:bg-[#2a1a2f]'>
            <input
              type='checkbox'
              checked={selectedStageIds.includes(stage.id)}
              onChange={() => handleToggleStage(stage.id)}
              className='h-4 w-4 shrink-0 cursor-pointer'
            />
            <div
              className='h-3 w-3 shrink-0 rounded-full'
              style={{ backgroundColor: stage.color }}
            />
            <span className='text-sm text-white'>
              {stage.name} {stage.category && ' - ' + stage.category}
            </span>
          </label>
        ))}
      </div>
    </aside>
  )
}

export function useStageSelection(stages: Stage[]) {
  const stagesIds = stages.map((s) => s.id)
  const [selectedStageIds, setSelectedStageIds] = useState<string[]>([
    stagesIds[0],
    stagesIds[1],
    stagesIds[2],
    stagesIds[3],
  ])

  return {
    selectedStageIds,
    setSelectedStageIds,
  }
}
