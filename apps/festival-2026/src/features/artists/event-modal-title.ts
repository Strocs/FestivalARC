export interface SourceTitleSnapshot {
  element: HTMLElement
  width: number
  height: number
  fontSize: number
  lineOffsets: number[]
}

const typography = [
  'font-family', 'font-weight', 'font-style', 'font-stretch', 'font-kerning',
  'font-feature-settings', 'font-variation-settings', 'letter-spacing',
  'word-spacing', 'text-transform', 'text-align', 'color', 'direction',
]

/** Freeze the rendered card composition before dialog focus changes its context. */
export function captureSourceTitle(source: HTMLElement, rect = source.getBoundingClientRect()): SourceTitleSnapshot {
  const computed = getComputedStyle(source)
  const element = source.cloneNode(true) as HTMLElement
  const originals = [source, ...source.querySelectorAll<HTMLElement>('*')]
  const copies = [element, ...element.querySelectorAll<HTMLElement>('*')]
  for (const [index, copy] of copies.entries()) {
    const display = getComputedStyle(originals[index]).display
    copy.removeAttribute('id')
    copy.removeAttribute('class')
    copy.removeAttribute('style')
    // Container-query break/gap decisions must not be recomputed in the modal.
    copy.style.display = display
  }
  for (const property of typography) element.style.setProperty(property, computed.getPropertyValue(property))
  const fontSize = Number.parseFloat(computed.fontSize) || 24
  const lineHeight = Number.parseFloat(computed.lineHeight)
  Object.assign(element.style, {
    display: 'block', width: 'max-content', margin: '0', padding: '0',
    fontSize: `${fontSize}px`, lineHeight: Number.isFinite(lineHeight) ? String(lineHeight / fontSize) : 'normal',
    whiteSpace: 'nowrap', visibility: 'visible', opacity: '1',
  })
  const sourceNodes = [...source.childNodes]
  const nodes = [...element.childNodes]
  const lineOffsets: number[] = []
  element.replaceChildren()
  const makeLine = () => {
    const line = document.createElement('span')
    line.dataset.modalTitleLine = ''
    Object.assign(line.style, { display: 'inline-block', verticalAlign: 'baseline', textAlign: 'left' })
    return line
  }
  let line = makeLine()
  let first = 0
  const finishLine = (last: number) => {
    if (!line.hasChildNodes()) return
    const range = document.createRange()
    range.setStartBefore(sourceNodes[first])
    range.setEndAfter(sourceNodes[last])
    const bounds = range.getBoundingClientRect?.()
    lineOffsets.push(bounds ? Math.max(0, bounds.left - rect.left) : 0)
    element.append(line)
    line = makeLine()
  }
  for (const [index, node] of nodes.entries()) {
    if (node instanceof HTMLElement && node.tagName === 'BR' && node.style.display !== 'none') {
      finishLine(index - 1)
      element.append(node)
      first = index + 1
    } else line.append(node)
  }
  finishLine(nodes.length - 1)
  element.removeAttribute('data-artist-name')
  element.setAttribute('aria-hidden', 'true')
  element.inert = true
  return { element, width: rect.width, height: rect.height, fontSize, lineOffsets }
}

/** Keep the semantic heading identical to the travelling card composition. */
export function applySourceTitle(title: HTMLElement, snapshot: SourceTitleSnapshot, closeLeft?: number): void {
  title.replaceChildren(...snapshot.element.cloneNode(true).childNodes)
  for (const property of [...typography, 'line-height', 'white-space']) {
    title.style.setProperty(property, snapshot.element.style.getPropertyValue(property))
  }
  // Anchor the intrinsic text block at the header start, not its horizontal center.
  Object.assign(title.style, { width: 'fit-content', maxWidth: '100%', textAlign: 'left' })
  // Re-read the responsive CSS size when rebuilding after a resize.
  title.style.removeProperty('font-size')
  const fontSize = Number.parseFloat(getComputedStyle(title).fontSize) || 24
  const rect = title.getBoundingClientRect()
  const roomBeforeClose = closeLeft === undefined ? rect.width : closeLeft - rect.left - 12
  const width = roomBeforeClose > 0 ? Math.min(rect.width, roomBeforeClose) : rect.width
  if (width < rect.width) title.style.maxWidth = `${width}px`
  if (width > 0 && snapshot.width > 0) {
    title.style.fontSize = `${Math.min(fontSize, snapshot.fontSize * width / snapshot.width)}px`
  }
}
