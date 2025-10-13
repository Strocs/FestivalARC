import { useState, useRef, useEffect, useCallback } from 'react'
import { useColumnsStore } from '../stores/schedule-columns-store'

interface UseHorizontalDragProps {
  columnWidth: number
  totalColumns: number
  visibleColumns: number
}

interface UseHorizontalDragReturn {
  offset: number
  isDragging: boolean
  wrapperRef: React.RefObject<HTMLDivElement | null>
}

type DragState = 'idle' | 'detecting' | 'dragging'

const DRAG_THRESHOLD = 10
const RUBBER_BAND_RESISTANCE = 0.3

function applyRubberBandResistance(
  offset: number,
  min: number,
  max: number,
  resistance: number,
): number {
  if (offset >= min && offset <= max) return offset

  if (offset > max) {
    const overscroll = offset - max
    return max + overscroll * resistance
  }

  if (offset < min) {
    const overscroll = min - offset
    return min - overscroll * resistance
  }

  return offset
}

export function useHorizontalDrag({
  columnWidth,
  totalColumns,
  visibleColumns,
}: UseHorizontalDragProps): UseHorizontalDragReturn {
  const currentIndex = useColumnsStore((state) => state.currentIndex)
  const shouldAnimate = useColumnsStore((state) => state.shouldAnimate)
  const goToIndex = useColumnsStore((state) => state.goToIndex)

  const [offset, setOffset] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const dragStateRef = useRef<{
    state: DragState
    startX: number
    startY: number
    startOffset: number
  }>({
    state: 'idle',
    startX: 0,
    startY: 0,
    startOffset: 0,
  })
  const offsetRef = useRef(0)

  const maxOffset = Math.max(0, (totalColumns - visibleColumns) * columnWidth)
  const minOffset = -maxOffset

  const minOffsetRef = useRef(minOffset)
  const maxOffsetRef = useRef(maxOffset)
  const columnWidthRef = useRef(columnWidth)

  useEffect(() => {
    minOffsetRef.current = minOffset
    maxOffsetRef.current = maxOffset
    columnWidthRef.current = columnWidth
  }, [minOffset, maxOffset, columnWidth])

  const clampOffset = useCallback((value: number) => {
    const min = minOffsetRef.current
    return Math.max(min, Math.min(0, value))
  }, [])

  const snapToColumn = useCallback(
    (currentOffset: number) => {
      const width = columnWidthRef.current
      const columnIndex = Math.round(-currentOffset / width)
      const snappedOffset = -columnIndex * width
      return clampOffset(snappedOffset)
    },
    [clampOffset],
  )

  const applyTransform = useCallback((value: number, smooth: boolean) => {
    const wrapper = wrapperRef.current
    if (!wrapper) return

    offsetRef.current = value
    wrapper.style.transform = `translate3d(${value}px, 0, 0)`
    wrapper.style.transition = smooth ? 'transform 300ms ease-out' : 'none'
  }, [])

  useEffect(() => {
    const newOffset = -currentIndex * columnWidth

    setOffset(newOffset)
    applyTransform(newOffset, shouldAnimate)
  }, [currentIndex, columnWidth, shouldAnimate, applyTransform, setOffset])

  const handleDragStart = useCallback((clientX: number, clientY: number) => {
    dragStateRef.current = {
      state: 'detecting',
      startX: clientX,
      startY: clientY,
      startOffset: offsetRef.current,
    }
  }, [])

  const handleDragMove = useCallback(
    (clientX: number, clientY: number) => {
      const state = dragStateRef.current.state

      if (state === 'idle') return

      if (state === 'detecting') {
        const deltaX = Math.abs(clientX - dragStateRef.current.startX)
        const deltaY = Math.abs(clientY - dragStateRef.current.startY)
        const distanceSquared = deltaX * deltaX + deltaY * deltaY

        if (distanceSquared < DRAG_THRESHOLD * DRAG_THRESHOLD) {
          return
        }

        if (deltaX > deltaY) {
          dragStateRef.current.state = 'dragging'
          setIsDragging(true)
        } else {
          dragStateRef.current.state = 'idle'
          return
        }
      }

      if (dragStateRef.current.state === 'dragging') {
        const deltaX = clientX - dragStateRef.current.startX
        const newOffset = dragStateRef.current.startOffset + deltaX
        const min = minOffsetRef.current
        const offsetWithRubberBand = applyRubberBandResistance(
          newOffset,
          min,
          0,
          RUBBER_BAND_RESISTANCE,
        )
        applyTransform(offsetWithRubberBand, false)
      }
    },
    [applyTransform],
  )

  const handleDragEnd = useCallback(() => {
    const wasDragging = dragStateRef.current.state === 'dragging'

    dragStateRef.current.state = 'idle'
    setIsDragging(false)

    if (!wasDragging) return

    const currentOffset = offsetRef.current
    const min = minOffsetRef.current
    const width = columnWidthRef.current

    const isOverscrolled = currentOffset > 0 || currentOffset < min

    if (isOverscrolled) {
      const targetOffset = currentOffset > 0 ? 0 : min
      const columnIndex = Math.round(-targetOffset / width)

      setOffset(targetOffset)
      applyTransform(targetOffset, true)

      goToIndex(columnIndex)
    } else {
      const snappedOffset = snapToColumn(currentOffset)
      const columnIndex = Math.round(-snappedOffset / width)

      setOffset(snappedOffset)
      applyTransform(snappedOffset, true)

      goToIndex(columnIndex)
    }
  }, [snapToColumn, applyTransform, goToIndex])

  useEffect(() => {
    const wrapper = wrapperRef.current
    if (!wrapper) return

    const onMouseDown = (e: MouseEvent) => {
      e.preventDefault()
      handleDragStart(e.clientX, e.clientY)
    }

    const onMouseMove = (e: MouseEvent) => {
      if (dragStateRef.current.state === 'dragging') {
        e.preventDefault()
      }
      handleDragMove(e.clientX, e.clientY)
    }

    const onMouseUp = () => {
      handleDragEnd()
    }

    const onTouchStart = (e: TouchEvent) => {
      const touch = e.touches[0]
      handleDragStart(touch.clientX, touch.clientY)
    }

    const onTouchMove = (e: TouchEvent) => {
      if (dragStateRef.current.state === 'dragging') {
        e.preventDefault()
      }
      const touch = e.touches[0]
      handleDragMove(touch.clientX, touch.clientY)
    }

    const onTouchEnd = () => {
      handleDragEnd()
    }

    wrapper.addEventListener('mousedown', onMouseDown)
    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', onMouseUp)

    wrapper.addEventListener('touchstart', onTouchStart, { passive: false })
    window.addEventListener('touchmove', onTouchMove, { passive: false })
    window.addEventListener('touchend', onTouchEnd, { passive: true })

    return () => {
      wrapper.removeEventListener('mousedown', onMouseDown)
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseup', onMouseUp)

      wrapper.removeEventListener('touchstart', onTouchStart)
      window.removeEventListener('touchmove', onTouchMove)
      wrapper.removeEventListener('touchend', onTouchEnd)
    }
  }, [handleDragStart, handleDragMove, handleDragEnd])

  return {
    offset,
    isDragging,
    wrapperRef,
  }
}
