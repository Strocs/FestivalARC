import { useEffect, useState, useRef } from 'react'
import {
  getValidTrackIds,
  trackSelectionStorage,
} from '../../storage/track-selection-storage'

export function useStageSelection(
  stagesIds: string[],
  onSelectionChange?: () => void,
) {
  const [selectedStageIds, setSelectedStageIds] = useState<string[]>(stagesIds)
  const isInitialMount = useRef(true)

  useEffect(() => {
    const storedIds = trackSelectionStorage.get()
    const validStoredIds = getValidTrackIds(storedIds, stagesIds)

    if (validStoredIds.length > 0) {
      setSelectedStageIds(validStoredIds)
    }
  }, [])

  useEffect(() => {
    trackSelectionStorage.set(selectedStageIds)

    if (!isInitialMount.current && onSelectionChange) {
      onSelectionChange()
    }

    if (isInitialMount.current) {
      isInitialMount.current = false
    }
  }, [selectedStageIds, onSelectionChange])

  return {
    selectedStageIds,
    setSelectedStageIds,
  }
}
