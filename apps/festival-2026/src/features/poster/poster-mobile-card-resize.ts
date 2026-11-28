// Sample mobile poster geometry synchronously at its design root size, then
// restore the user's text size before the browser paints.
export function withMobilePosterBaseline<T>(grid: HTMLElement, read: () => T): T {
  const root = document.documentElement
  const value = root.style.getPropertyValue('font-size')
  const priority = root.style.getPropertyPriority('font-size')
  const normalizeRoot = getComputedStyle(root).fontSize !== '16px'
  grid.setAttribute('data-poster-sampling-tracks', '')
  if (normalizeRoot) root.style.setProperty('font-size', '16px', 'important')
  try {
    return read()
  } finally {
    if (normalizeRoot) root.style.setProperty('font-size', value, priority)
    grid.removeAttribute('data-poster-sampling-tracks')
  }
}

const refresh = new WeakMap<HTMLElement, () => void>()

export function refreshMobileCardBaselines(grid: HTMLElement) {
  refresh.get(grid)?.()
}

// Preserve the design's vertical insets. The live title uses its own inline
// container and supplies its own height, independent of sampled metadata.
export function mountMobileCardResize(grid: HTMLElement) {
  const mobile = matchMedia('(width < 48rem)')
  const cards = [...grid.querySelectorAll<HTMLElement>('[data-poster-artist]')].flatMap(slot => {
    const content = slot.querySelector<HTMLElement>('[data-artist-content]')
    const nameBox = slot.querySelector<HTMLElement>('[data-artist-name-box]')
    return content && nameBox ? [{ slot, content, nameBox }] : []
  })
  const update = () => {
    if (!mobile.matches) return
    const baselines = withMobilePosterBaseline(grid, () => cards.flatMap(({ slot, content, nameBox }) => {
      if (slot.hidden || !slot.getClientRects().length) return []
      const spacing = getComputedStyle(nameBox)
      const insets = getComputedStyle(content)
      return [{ content, props: {
        '--poster-name-padding': spacing.padding,
        '--poster-name-top': insets.top,
        '--poster-name-bottom': insets.bottom,
      } }]
    }))
    for (const { content, props } of baselines) {
      for (const [key, value] of Object.entries(props)) content.style.setProperty(key, value)
    }
  }
  let lastWidth = window.innerWidth
  refresh.set(grid, update)
  window.addEventListener('resize', () => {
    if (window.innerWidth === lastWidth) return
    lastWidth = window.innerWidth
    update()
  }, { passive: true })
  document.fonts?.addEventListener('loadingdone', update)
  update()
}
