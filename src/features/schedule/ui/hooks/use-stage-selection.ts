import { useEffect, useState } from 'react'
import {
  getValidTrackIds,
  trackSelectionStorage,
} from '../../storage/track-selection-storage'

export function useStageSelection(stagesIds: string[]) {
  const [selectedStageIds, setSelectedStageIds] = useState<string[]>(stagesIds)

  useEffect(() => {
    const storedIds = trackSelectionStorage.get()
    const validStoredIds = getValidTrackIds(storedIds, stagesIds)

    if (validStoredIds.length > 0) {
      setSelectedStageIds(validStoredIds)
    }
  }, [])

  useEffect(() => {
    trackSelectionStorage.set(selectedStageIds)
  }, [selectedStageIds])

  return {
    selectedStageIds,
    setSelectedStageIds,
  }
}
