import { useState, useCallback } from 'react'

interface UseDaySelectionOptions {
  totalDays: number
  initialDay?: number
}

interface UseDaySelectionReturn {
  currentDayIndex: number
  setCurrentDay: (index: number) => void
  goToNextDay: () => void
  goToPreviousDay: () => void
  canGoNext: boolean
  canGoPrev: boolean
}

export function useDaySelection({
  totalDays,
  initialDay = 0,
}: UseDaySelectionOptions): UseDaySelectionReturn {
  const [currentDayIndex, setCurrentDayIndex] = useState(initialDay)

  const setCurrentDay = useCallback(
    (index: number) => {
      if (index >= 0 && index < totalDays) {
        setCurrentDayIndex(index)
      }
    },
    [totalDays],
  )

  const goToNextDay = useCallback(() => {
    setCurrentDayIndex((prev) => Math.min(prev + 1, totalDays - 1))
  }, [totalDays])

  const goToPreviousDay = useCallback(() => {
    setCurrentDayIndex((prev) => Math.max(prev - 1, 0))
  }, [])

  const canGoNext = currentDayIndex < totalDays - 1
  const canGoPrev = currentDayIndex > 0

  return {
    currentDayIndex,
    setCurrentDay,
    goToNextDay,
    goToPreviousDay,
    canGoNext,
    canGoPrev,
  }
}
