export interface ParallaxConfig {
  speed: number
}

export function initParallax(elementSelector: string, config: ParallaxConfig) {
  const element = document.querySelector<HTMLElement>(elementSelector)

  if (!element) {
    console.warn(`Parallax: Element "${elementSelector}" not found`)
    return
  }

  let ticking = false
  const { speed } = config

  element.style.willChange = 'transform'

  const updateParallax = () => {
    const scrolled = window.scrollY
    const offset = scrolled * (1 - speed)
    element.style.transform = `translateY(-${offset}px)`
    ticking = false
  }

  window.addEventListener('scroll', () => {
    if (!ticking) {
      window.requestAnimationFrame(updateParallax)
      ticking = true
    }
  })

  updateParallax()
}
