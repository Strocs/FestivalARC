interface ParallaxCache {
  initialTop: number
  imageHeight: number
  viewportHeight: number
  documentHeight: number
  scrollStart: number
  scrollEnd: number
  scrollDistance: number
  totalMovement: number
}

interface ParallaxOptions {
  lerpFactor?: number
  rootMargin?: string
}

export function initParallax(
  element: HTMLElement,
  options: ParallaxOptions = {},
) {
  const { lerpFactor = 0.15, rootMargin = '100px' } = options

  element.style.willChange = 'transform'

  const cache: ParallaxCache = {
    initialTop: 0,
    imageHeight: 0,
    viewportHeight: 0,
    documentHeight: 0,
    scrollStart: 0,
    scrollEnd: 0,
    scrollDistance: 0,
    totalMovement: 0,
  }

  let currentOffset = 0
  let targetOffset = 0
  let isVisible = true

  const lerp = (start: number, end: number, factor: number) =>
    start + (end - start) * factor

  const recalculateCache = () => {
    const rect = element.getBoundingClientRect()
    cache.initialTop = window.scrollY + rect.top
    cache.imageHeight = element.offsetHeight
    cache.viewportHeight = window.innerHeight
    cache.documentHeight = document.documentElement.scrollHeight

    cache.scrollStart = cache.initialTop
    cache.scrollEnd = cache.documentHeight - cache.viewportHeight
    cache.scrollDistance = cache.scrollEnd - cache.scrollStart

    const imageBottomAtStart = cache.initialTop + cache.imageHeight
    const imageBottomAtEnd = cache.documentHeight
    cache.totalMovement = imageBottomAtEnd - imageBottomAtStart
  }

  const calculateTargetOffset = () => {
    const scrolled = window.scrollY

    if (scrolled >= cache.scrollStart) {
      const scrolledFromStart = scrolled - cache.scrollStart
      const scrollProgress = Math.min(
        scrolledFromStart / cache.scrollDistance,
        1,
      )
      return scrollProgress * cache.totalMovement
    }

    return 0
  }

  const loop = () => {
    if (isVisible) {
      targetOffset = calculateTargetOffset()
      currentOffset = lerp(currentOffset, targetOffset, lerpFactor)
      element.style.transform = `translate3d(0, ${Math.round(currentOffset)}px, 0)`
    }
    requestAnimationFrame(loop)
  }

  const observer = new IntersectionObserver(
    (entries) => {
      isVisible = entries[0].isIntersecting
    },
    { rootMargin },
  )
  observer.observe(element)

  window.addEventListener('resize', recalculateCache, { passive: true })

  recalculateCache()
  loop()

  return () => {
    observer.disconnect()
    window.removeEventListener('resize', recalculateCache)
  }
}
