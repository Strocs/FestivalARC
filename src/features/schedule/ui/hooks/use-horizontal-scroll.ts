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
    [columnWidth],
  )

  const applyTransform = useCallback((value: number, smooth: boolean) => {
    const wrapper = wrapperRef.current
    if (!wrapper) return

    console.log({ value, animate: smooth })
    offsetRef.current = value
    wrapper.style.transform = `translate3d(${value}px, 0, 0)`
    wrapper.style.transition = smooth ? 'transform 300ms ease-out' : 'none'
  }, [])

  useEffect(() => {
    const newOffset = -currentIndex * columnWidth

    setOffset(newOffset)
    applyTransform(newOffset, shouldAnimate)
  }, [currentIndex, columnWidth, shouldAnimate])

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
        const offsetWithRubberBand = applyRubberBandResistance(
          newOffset,
          minOffset,
          0,
          RUBBER_BAND_RESISTANCE,
        )
        applyTransform(offsetWithRubberBand, false)
      }
    },
    [minOffset, applyTransform],
  )

  const handleDragEnd = useCallback(() => {
    const wasDragging = dragStateRef.current.state === 'dragging'

    dragStateRef.current.state = 'idle'
    setIsDragging(false)

    if (!wasDragging) return

    const currentOffset = offsetRef.current

    const isOverscrolled = currentOffset > 0 || currentOffset < minOffset

    if (isOverscrolled) {
      const targetOffset = currentOffset > 0 ? 0 : minOffset
      const columnIndex = Math.round(-targetOffset / columnWidth)

      setOffset(targetOffset)
      applyTransform(targetOffset, true)

      // Mark as internal change to prevent useEffect from re-applying transform
      goToIndex(columnIndex)
    } else {
      const snappedOffset = snapToColumn(currentOffset)
      const columnIndex = Math.round(-snappedOffset / columnWidth)

      setOffset(snappedOffset)
      applyTransform(snappedOffset, true)

      // Mark as internal change to prevent useEffect from re-applying transform
      goToIndex(columnIndex)
    }
  }, [minOffset, columnWidth])

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
