// Sample mobile poster geometry synchronously at its design root size, then
// restore the user's text size before the browser paints.
export function withMobilePosterBaseline<T>(read: () => T): T {
  const root = document.documentElement
  if (!(parseFloat(getComputedStyle(root).fontSize) > 16.01)) return read()
  const value = root.style.getPropertyValue('font-size')
  const priority = root.style.getPropertyPriority('font-size')
  root.style.setProperty('font-size', '16px', 'important')
  try {
    return read()
  } finally {
    root.style.setProperty('font-size', value, priority)
  }
}

// Poster names are fitted against the original name box, not the added copy space.
export function mountMobileCardResize(grid: HTMLElement) {
  const mobile = matchMedia('(width < 48rem)')
  const cards = [...grid.querySelectorAll<HTMLElement>('[data-poster-artist]')].flatMap((slot) => {
    const content = slot.querySelector<HTMLElement>('[data-artist-content]')
    const nameBox = slot.querySelector<HTMLElement>('[data-artist-name-box]')
    const meta = slot.querySelector<HTMLElement>('[data-artist-meta]')
    return content && nameBox && meta ? [{ slot, content, nameBox, meta }] : []
  })
  const tracksProperty = '--poster-expanded-simple-tracks'
  let frame: number | undefined
  const update = () => {
    frame = undefined
    grid.style.removeProperty(tracksProperty)
    for (const { slot, content } of cards) {
      slot.style.removeProperty('--poster-expanded-card-height')
      content.style.removeProperty('--poster-expanded-name-row')
      content.style.removeProperty('--poster-expanded-content-top')
      content.style.removeProperty('--poster-expanded-content-bottom')
      content.style.removeProperty('--poster-expanded-name-width')
      content.style.removeProperty('--poster-expanded-name-padding')
    }
    if (!mobile.matches) return

    const expanded = cards.flatMap((card) => {
      if (card.slot.hidden || !card.slot.getClientRects().length) return []
      const text = [...card.meta.querySelectorAll<HTMLElement>('time, [data-artist-location], [data-artist-view]')]
      if (!text.some((element) => parseFloat(getComputedStyle(element).fontSize) > 12.01)) return []
      return [{ ...card, text, height: card.meta.offsetHeight }]
    })
    if (!expanded.length) return

    // Measure the original layout at the same width before adding extra space.
    const inlineSizes = expanded.flatMap(({ text }) => text.map((element) => ({
      element,
      value: element.style.getPropertyValue('font-size'),
      priority: element.style.getPropertyPriority('font-size'),
    })))
    for (const { element } of inlineSizes) element.style.setProperty('font-size', '12px', 'important')
    const baselines = withMobilePosterBaseline(() => expanded.map(({ slot, content, nameBox, meta, height }) => {
      const box = nameBox.getBoundingClientRect()
      const spacing = getComputedStyle(nameBox)
      const insets = getComputedStyle(content)
      return {
        slot, content, nameHeight: box.height, nameWidth: box.width,
        namePadding: `${spacing.paddingTop} ${spacing.paddingRight} ${spacing.paddingBottom} ${spacing.paddingLeft}`,
        top: insets.top, bottom: insets.bottom,
        height: slot.getBoundingClientRect().height + Math.max(0, height - meta.offsetHeight),
      }
    }))
    for (const { element, value, priority } of inlineSizes) element.style.setProperty('font-size', value, priority)

    if (grid.hasAttribute('data-poster-simple')) {
      const tracks = grid.style.getPropertyValue('--poster-simple-tracks')
      if (tracks) grid.style.setProperty(tracksProperty, tracks.replace(/\b\d+(?:\.\d+)?px\b/g, 'minmax($&, auto)'))
    }
    for (const { slot, content, nameHeight, nameWidth, namePadding, top, bottom, height } of baselines) {
      slot.style.setProperty('--poster-expanded-card-height', `${height}px`)
      content.style.setProperty('--poster-expanded-name-row', `${nameHeight}px`)
      content.style.setProperty('--poster-expanded-content-top', top)
      content.style.setProperty('--poster-expanded-content-bottom', bottom)
      content.style.setProperty('--poster-expanded-name-width', `${nameWidth}px`)
      content.style.setProperty('--poster-expanded-name-padding', namePadding)
    }
  }
  const schedule = () => { frame ??= requestAnimationFrame(update) }
  const resize = new ResizeObserver(schedule)
  resize.observe(grid)
  for (const { meta } of cards) {
    resize.observe(meta)
    // A font can change without resizing a single-line metadata box.
    for (const element of meta.querySelectorAll('time, [data-artist-location], [data-artist-view]')) {
      const probe = document.createElement('span')
      probe.setAttribute('aria-hidden', 'true')
      probe.style.cssText = 'position:absolute;visibility:hidden;width:1em;height:1em;pointer-events:none'
      element.append(probe)
      resize.observe(probe)
    }
  }
  new MutationObserver(schedule).observe(grid, { attributes: true, attributeFilter: ['data-poster-simple', 'data-poster-ordered'] })
  mobile.addEventListener('change', schedule)
  window.addEventListener('resize', schedule)
  schedule()
}
