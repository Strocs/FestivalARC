import type { UIHeaderItem } from '../../types'

interface TrackSidebarProps {
  stages: ReadonlyArray<UIHeaderItem>
  selectedStageIds: string[]
  onStageSelectionChange: (stageIds: string[]) => void
  navigation?: React.ReactNode
}

export function TrackSidebar({
  stages,
  selectedStageIds,
  onStageSelectionChange,
  navigation,
}: TrackSidebarProps) {
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
    <aside className='bg-25-black ml-4 flex h-fit w-56 shrink-0 flex-col gap-2 p-4 pt-8'>
      <section className='flex flex-col'>
        {sortedStages.map((stage) => (
          <label
            key={stage.id}
            className='hover:bg-25-white/10 flex min-h-13 cursor-pointer items-center gap-3 rounded p-2'>
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
            <p className='text-25-white leading-none'>
              {stage.name}
              {stage.category && (
                <>
                  <br />
                  <span className='text-25-white/70 text-sm capitalize'>
                    {stage.category}
                  </span>
                </>
              )}
            </p>
          </label>
        ))}

        <div className='flex items-center justify-center gap-2 pt-2'>
          <button
            onClick={handleSelectAll}
            className='hover:text-25-white cursor-pointer text-sm text-gray-400'
            type='button'>
            Todos
          </button>
          <span className='text-gray-600'>|</span>
          <button
            onClick={handleDeselectAll}
            className='hover:text-25-white cursor-pointer text-sm text-gray-400'
            type='button'>
            Ninguno
          </button>
        </div>

        {navigation}
      </section>
    </aside>
  )
}
