import { useEffect, useState, useRef } from 'react'

interface UseContainerVisibilityOptions {
  threshold?: number
  rootMargin?: string
}

export function useContainerVisibility({
  threshold = 0.1,
  rootMargin = '0px',
}: UseContainerVisibilityOptions = {}) {
  const [isVisible, setIsVisible] = useState(false)
  const containerRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting)
      },
      {
        threshold,
        rootMargin,
      },
    )

    observer.observe(container)

    return () => {
      observer.disconnect()
    }
  }, [threshold, rootMargin])

  return { containerRef, isVisible }
}
