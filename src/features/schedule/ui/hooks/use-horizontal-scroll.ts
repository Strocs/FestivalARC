import { useState, useRef, useEffect, useCallback } from 'react'

interface UseHorizontalDragProps {
  columnWidth: number
  totalColumns: number
  visibleColumns: number
  onPositionChange?: (columnIndex: number) => void
}

interface UseHorizontalDragReturn {
  offset: number
  isDragging: boolean
  wrapperRef: React.RefObject<HTMLDivElement | null>
  goToColumn: (index: number) => void
  goToNext: () => void
  goToPrev: () => void
  currentColumnIndex: number
}

export function useHorizontalDrag({
  columnWidth,
  totalColumns,
  visibleColumns,
  onPositionChange,
}: UseHorizontalDragProps): UseHorizontalDragReturn {
  const [offset, setOffset] = useState(0)
  const [currentColumnIndex, setCurrentColumnIndex] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const dragStateRef = useRef({
    startX: 0,
    startOffset: 0,
    isDragging: false,
  })
  const offsetRef = useRef(0)

  const maxOffset = Math.max(0, (totalColumns - visibleColumns) * columnWidth)
  const minOffset = -maxOffset

  const clampOffset = useCallback(
    (value: number) => {
      return Math.max(minOffset, Math.min(0, value))
    },
    [minOffset],
  )

  const snapToColumn = useCallback(
    (currentOffset: number) => {
      const columnIndex = Math.round(-currentOffset / columnWidth)
      const snappedOffset = -columnIndex * columnWidth
      return clampOffset(snappedOffset)
    },
    [columnWidth, clampOffset],
  )

  const applyTransform = useCallback((value: number, smooth: boolean) => {
    const wrapper = wrapperRef.current
    if (!wrapper) return

    offsetRef.current = value
    wrapper.style.transform = `translate3d(${value}px, 0, 0)`
    wrapper.style.transition = smooth ? 'transform 300ms ease-out' : 'none'
  }, [])

  const goToColumn = useCallback(
    (index: number) => {
      const clampedIndex = Math.max(
        0,
        Math.min(index, totalColumns - visibleColumns),
      )
      const newOffset = -clampedIndex * columnWidth
      setOffset(newOffset)
      setCurrentColumnIndex(clampedIndex)
      applyTransform(newOffset, true)
      onPositionChange?.(clampedIndex)
    },
    [
      columnWidth,
      totalColumns,
      visibleColumns,
      onPositionChange,
      applyTransform,
    ],
  )

  const goToNext = useCallback(() => {
    goToColumn(currentColumnIndex + 1)
  }, [currentColumnIndex, goToColumn])

  const goToPrev = useCallback(() => {
    goToColumn(currentColumnIndex - 1)
  }, [currentColumnIndex, goToColumn])

  const handleDragStart = useCallback((clientX: number) => {
    dragStateRef.current = {
      startX: clientX,
      startOffset: offsetRef.current,
      isDragging: true,
    }
    setIsDragging(true)
  }, [])

  const handleDragMove = useCallback(
    (clientX: number) => {
      if (!dragStateRef.current.isDragging) return

      const deltaX = clientX - dragStateRef.current.startX
      const newOffset = dragStateRef.current.startOffset + deltaX
      const clampedOffset = clampOffset(newOffset)
      applyTransform(clampedOffset, false)
    },
    [clampOffset, applyTransform],
  )

  const handleDragEnd = useCallback(() => {
    if (!dragStateRef.current.isDragging) return

    dragStateRef.current.isDragging = false
    setIsDragging(false)

    const snappedOffset = snapToColumn(offsetRef.current)
    const columnIndex = Math.round(-snappedOffset / columnWidth)

    setOffset(snappedOffset)
    setCurrentColumnIndex(columnIndex)
    applyTransform(snappedOffset, true)
    onPositionChange?.(columnIndex)
  }, [snapToColumn, columnWidth, onPositionChange, applyTransform])

  useEffect(() => {
    const wrapper = wrapperRef.current
    if (!wrapper) return

    const onMouseDown = (e: MouseEvent) => {
      e.preventDefault()
      handleDragStart(e.clientX)
    }

    const onMouseMove = (e: MouseEvent) => {
      handleDragMove(e.clientX)
    }

    const onMouseUp = () => {
      handleDragEnd()
    }

    const onTouchStart = (e: TouchEvent) => {
      handleDragStart(e.touches[0].clientX)
    }

    const onTouchMove = (e: TouchEvent) => {
      handleDragMove(e.touches[0].clientX)
    }

    const onTouchEnd = () => {
      handleDragEnd()
    }

    wrapper.addEventListener('mousedown', onMouseDown)
    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', onMouseUp)

    wrapper.addEventListener('touchstart', onTouchStart, { passive: false })
    window.addEventListener('touchmove', onTouchMove, { passive: true })
    window.addEventListener('touchend', onTouchEnd, { passive: true })

    return () => {
      wrapper.removeEventListener('mousedown', onMouseDown)
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseup', onMouseUp)

      wrapper.removeEventListener('touchstart', onTouchStart)
      window.removeEventListener('touchmove', onTouchMove)
      window.removeEventListener('touchend', onTouchEnd)
    }
  }, [handleDragStart, handleDragMove, handleDragEnd])

  return {
    offset,
    isDragging,
    wrapperRef,
    goToColumn,
    goToNext,
    goToPrev,
    currentColumnIndex,
  }
}
