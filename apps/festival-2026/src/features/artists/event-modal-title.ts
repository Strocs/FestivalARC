import type { MotionGeometry } from './event-modal-motion'

/** Borrow the real card nodes; preserve only styles, never duplicate their DOM. */
export function borrowCardElements(
  origin: HTMLElement, panel: HTMLElement, heading: HTMLElement,
  ownStyles: (node: HTMLElement, properties: string[]) => () => void,
) {
  const surface = origin.querySelector<HTMLElement>('[data-artist-surface]')
  const name = origin.querySelector<HTMLElement>('[data-artist-name]')
  if (!surface || !name) return undefined
  const metadata = origin.querySelector<HTMLElement>('[data-artist-meta]')
  const nodes = [surface, name, ...(metadata ? [metadata] : [])]
  const positions = nodes.map(node => ({ node, parent: node.parentNode!, next: node.nextSibling }))
  const breaks = [...name.querySelectorAll<HTMLElement>('[data-gap], [data-break]')]
  const displays = breaks.map(node => getComputedStyle(node).display)
  const children = [...name.childNodes]
  // Split only at the card's already-visible BRs, never at individual words.
  const groups: Node[][] = [[]]
  for (const child of children) {
    if (child instanceof HTMLElement && child.tagName === 'BR' && getComputedStyle(child).display !== 'none') {
      groups.push([child], [])
    } else groups[groups.length - 1].push(child)
  }
  const lines = groups.filter(group => group.length && !(group[0] instanceof HTMLBRElement)).map(group => {
    const element = document.createElement('span')
    Object.assign(element.style, { display: 'inline-block', verticalAlign: 'baseline' })
    return { element, children: group }
  })
  const lineRects = () => lines.map(line => {
    const range = document.createRange()
    range.setStartBefore(line.children[0])
    range.setEndAfter(line.children[line.children.length - 1])
    return typeof range.getBoundingClientRect === 'function' ? range.getBoundingClientRect() : null
  })
  const sourceLineRects = lineRects()
  const wrap = () => {
    for (const line of lines) {
      name.insertBefore(line.element, line.children[0])
      line.element.append(...line.children)
    }
  }
  const styled = [surface, name, ...breaks]
  // Keep geometry ownership separate from the controller's opacity/visibility.
  const metadataChildren = metadata ? [...metadata.children].filter((node): node is HTMLElement => node instanceof HTMLElement) : []
  const metadataProperties = ['position', 'top', 'right', 'bottom', 'left', 'width', 'height', 'max-width', 'margin-top', 'margin-right', 'margin-bottom', 'margin-left', 'box-sizing', 'z-index', 'pointer-events', 'font-size', 'font-family', 'font-weight', 'font-style', 'line-height', 'letter-spacing', 'transition-property', 'transform', 'translate']
  const childProperties = ['transition-property', 'transform', 'translate']
  const metadataStyles = [metadata, ...metadataChildren].filter((node): node is HTMLElement => !!node)
    .map(node => ownStyles(node, node === metadata ? metadataProperties : childProperties))
  const measureMetadata = () => {
    if (!metadata) return undefined
    const rect = metadata.getBoundingClientRect()
    const style = getComputedStyle(metadata)
    return {
      rect,
      font: {
        fontSize: style.fontSize, fontFamily: style.fontFamily, fontWeight: style.fontWeight,
        fontStyle: style.fontStyle, lineHeight: style.lineHeight, letterSpacing: style.letterSpacing,
      },
      children: metadataChildren.map(node => {
        const childStyle = getComputedStyle(node)
        return { transform: childStyle.transform, translate: childStyle.translate }
      }),
    }
  }
  const freezeMetadata = (layout: ReturnType<typeof measureMetadata>) => {
    if (!metadata || !layout) return
    Object.assign(metadata.style, layout.font, {
      // Fixed coordinates keep badges source-anchored, outside the surface flight.
      position: 'fixed', top: `${layout.rect.top}px`, right: 'auto', bottom: 'auto', left: `${layout.rect.left}px`,
      width: `${layout.rect.width}px`, height: `${layout.rect.height}px`, maxWidth: 'none',
      marginTop: '0', marginRight: '0', marginBottom: '0', marginLeft: '0',
      boxSizing: 'border-box', zIndex: '1', pointerEvents: 'none',
      transitionProperty: 'none', transform: 'none', translate: 'none',
    })
    metadataChildren.forEach((node, index) => {
      Object.assign(node.style, layout.children[index], { transitionProperty: 'none' })
    })
  }
  const sourceMetadataLayout = measureMetadata()
  const originalStyles = styled.map(node => node.getAttribute('style'))
  const fontSize = Number.parseFloat(getComputedStyle(name).fontSize) || 24
  const width = name.getBoundingClientRect().width
  const restoreStyles = (styles: (string | null)[]) => {
    styled.forEach((node, index) => {
      const style = styles[index]
      if (style === null) node.removeAttribute('style')
      else node.setAttribute('style', style)
    })
  }
  const restore = () => {
    name.replaceChildren(...children)
    for (const { node, parent, next } of positions) {
      parent.insertBefore(node, next?.parentNode === parent ? next : null)
    }
    restoreStyles(originalStyles)
    metadataStyles.forEach(restoreStyle => restoreStyle())
  }
  const fit = () => {
    const size = Number.parseFloat(getComputedStyle(heading).fontSize) || 24
    const room = heading.getBoundingClientRect().width
    name.style.fontSize = `${room > 0 && width > 0 ? Math.min(size, fontSize * room / width) : size}px`
  }
  try {
    // Freeze only responsive breaks before leaving the card's query container.
    breaks.forEach((node, index) => { node.style.display = displays[index] })
    Object.assign(surface.style, {
      position: 'absolute', inset: '0', margin: '0', zIndex: '-1',
      translate: 'none', transition: 'none',
    })
    wrap()
    Object.assign(name.style, { width: 'max-content', margin: '0', fontSize: `${fontSize}px`, textAlign: 'left' })
    panel.prepend(surface)
    heading.replaceChildren(name)
    if (metadata) {
      freezeMetadata(sourceMetadataLayout)
      panel.append(metadata)
    }
  } catch (error) {
    restore()
    throw error
  }
  return {
    restore,
    fit,
    lines: lines.map(line => line.element),
    sourceLineRects,
    measure(): MotionGeometry {
      // Temporarily return the same nodes for a fresh close destination. Restore
      // current animation styles before paint; no placeholder or clone is needed.
      const destinations = nodes.map(node => ({ node, parent: node.parentNode!, next: node.nextSibling }))
      const styles = styled.map(node => node.getAttribute('style'))
      let metadataLayout = sourceMetadataLayout
      try {
        restore()
        metadataLayout = measureMetadata()
        return { sourceRect: surface.getBoundingClientRect(), titleRect: name.getBoundingClientRect(), titleLineRects: lineRects() }
      } finally {
        for (const { node, parent, next } of destinations) {
          parent.insertBefore(node, next?.parentNode === parent ? next : null)
        }
        wrap()
        restoreStyles(styles)
        freezeMetadata(metadataLayout)
      }
    },
  }
}
