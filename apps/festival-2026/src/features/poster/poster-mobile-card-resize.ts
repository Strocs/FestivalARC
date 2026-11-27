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

// Keep name fitting tied to design geometry. Metadata always lays out in flow,
// even when neither computed font sizes nor the viewport reveal text inflation.
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
      const box = nameBox.getBoundingClientRect()
      const spacing = getComputedStyle(nameBox)
      const insets = getComputedStyle(content)
      return [{ content, props: {
        '--poster-name-row': `${box.height}px`,
        '--poster-name-width': `${box.width}px`,
        '--poster-name-padding': spacing.padding,
        '--poster-name-top': insets.top,
        '--poster-name-bottom': insets.bottom,
      } }]
    }))
    for (const { content, props } of baselines) {
      for (const [key, value] of Object.entries(props)) content.style.setProperty(key, value)
    }
  }
  refresh.set(grid, update)
  window.addEventListener('resize', update)
  document.fonts?.addEventListener('loadingdone', update)
  update()
}
