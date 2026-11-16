import { gsap } from 'gsap'
import type { SourceTitleSnapshot } from './event-modal-title'

export interface MotionGeometry {
  sourceRect: DOMRect | null
  titleRect: DOMRect | null
}
export interface MotionInput extends MotionGeometry {
  dialog: HTMLDialogElement
  panel: HTMLElement
  titleSize: number
  sourceTitle?: SourceTitleSnapshot
  sourceMetadata?: { element: HTMLElement, opacity: number, visibility: string }
  initiallyOpen?: boolean
  onOpened: () => void
  onClosed: () => void
}
export interface ModalMotion {
  reverse: (geometry: MotionGeometry) => void
  dispose: () => void
}

/** One read batch per transition; surface transforms never scale readable content. */
export function createModalMotion(input: MotionInput): ModalMotion {
  const { dialog, panel } = input
  const surface = panel.querySelector<HTMLElement>('[data-modal-surface]')!
  const title = panel.querySelector<HTMLElement>('#event-modal-title')
  const close = panel.querySelector<HTMLElement>('[data-modal-close]')
  const meta = panel.querySelector<HTMLElement>('[data-modal-meta]')
  const details = [...panel.querySelectorAll<HTMLElement>('[data-modal-details], footer')]
  const flightDuration = 0.3
  const revealDuration = 0.15
  const finalRect = panel.getBoundingClientRect()
  const finalTitle = title?.getBoundingClientRect()
  const finalSize = title ? getComputedStyle(title).fontSize || '24px' : '24px'
  const elements = [dialog, panel, surface, title, close, meta, ...details].filter((node): node is HTMLElement => !!node)
  const styles = elements.map(node => [node, node.getAttribute('style')] as const)
  // Retain the card's lines while position, size and line offsets travel together.
  const snapshot = input.sourceTitle
  const proxy = title && finalTitle
    ? snapshot ? snapshot.element.cloneNode(true) as HTMLElement : document.createElement('span')
    : null
  if (proxy && title && finalTitle) {
    proxy.dataset.modalTitleProxy = ''
    proxy.setAttribute('aria-hidden', 'true')
    proxy.inert = true
    if (!snapshot) {
      proxy.textContent = title.textContent
      proxy.className = title.className
    }
    Object.assign(proxy.style, {
      position: 'absolute', pointerEvents: 'none', margin: '0',
      left: `${finalTitle.left - finalRect.left}px`, top: `${finalTitle.top - finalRect.top}px`,
      width: `${finalTitle.width}px`, fontSize: finalSize, opacity: '1', textAlign: 'left',
    })
  }
  let geometry: MotionGeometry = input
  let disposed = false
  let closing = false
  let fade: gsap.core.Timeline | undefined
  const timeline = gsap.timeline({
    paused: true,
    defaults: { duration: flightDuration, ease: 'power3.inOut' },
    onComplete: () => { if (!disposed && !closing) input.onOpened() },
    onReverseComplete: () => { if (!disposed && closing) input.onClosed() },
  })
  const flights: gsap.core.Animation[] = []
  const dispose = () => {
    if (disposed) return
    disposed = true
    fade?.revert()
    timeline.revert()
    // Disposal also occurs while still modal (resize/fonts/reduced motion).
    // Never return source paint to its visible endpoint until owner cleanup.
    if (input.sourceMetadata) {
      input.sourceMetadata.element.style.setProperty('opacity', '0')
      input.sourceMetadata.element.style.setProperty('visibility', 'hidden')
    }
    proxy?.remove()
    for (const [node, style] of styles) {
      if (style === null) node.removeAttribute('style')
      else node.setAttribute('style', style)
    }
  }
  try {
    if (proxy && title) {
      // Keep one visual title for the entire round trip. Opacity preserves the
      // real heading's layout, accessible name and focus target.
      title.style.opacity = '0'
      panel.append(proxy)
    }
    for (const node of [close, meta, ...details]) {
      if (node) Object.assign(node.style, { opacity: '0', visibility: 'hidden' })
    }
    if (input.sourceMetadata) {
      const { element, opacity, visibility } = input.sourceMetadata
      timeline.fromTo(element, { autoAlpha: visibility === 'visible' ? opacity : 0 }, {
        autoAlpha: 0, duration: revealDuration,
      }, 0)
    }
    timeline.addLabel('surface', 0)
    timeline.fromTo(surface, {
      transformOrigin: '0 0',
      x: () => geometry.sourceRect ? geometry.sourceRect.left - finalRect.left : 0,
      y: () => geometry.sourceRect ? geometry.sourceRect.top - finalRect.top : 0,
      scaleX: () => geometry.sourceRect && finalRect.width ? geometry.sourceRect.width / finalRect.width : 1,
      scaleY: () => geometry.sourceRect && finalRect.height ? geometry.sourceRect.height / finalRect.height : 1,
      autoAlpha: geometry.sourceRect ? 1 : 0,
    }, { x: 0, y: 0, scaleX: 1, scaleY: 1, autoAlpha: 1 }, 'surface')
    flights.push(timeline.recent() as gsap.core.Tween)
    timeline.fromTo(dialog, { '--event-backdrop': 0 }, { '--event-backdrop': 1 }, 'surface')
    timeline.addLabel('header', 0)
    if (proxy) {
      timeline.fromTo(proxy, {
        x: () => geometry.titleRect && finalTitle
          ? geometry.titleRect.left - finalTitle.left
          : 0,
        y: () => geometry.titleRect && finalTitle ? geometry.titleRect.top - finalTitle.top : 0,
        fontSize: geometry.titleRect ? snapshot?.fontSize ?? input.titleSize : finalSize,
        autoRound: false,
      }, { x: 0, y: 0, fontSize: finalSize, autoRound: false }, 'header')
      flights.push(timeline.recent() as gsap.core.Tween)
      const lines = [...proxy.querySelectorAll<HTMLElement>('[data-modal-title-line]')]
      if (lines.length) {
        timeline.fromTo(lines, {
          x: (index: number) => geometry.titleRect ? snapshot?.lineOffsets[index] ?? 0 : 0,
        }, { x: 0 }, 'header')
        flights.push(timeline.recent() as gsap.core.Tween)
      }
    }
    timeline.addLabel('reveal', flightDuration)
    if (meta) timeline.fromTo(meta, { y: 12, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: revealDuration }, 'reveal')
    if (details.length) timeline.fromTo(details, { y: 10, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: revealDuration }, 'reveal')
    timeline.addLabel('settled', flightDuration)
    if (close) timeline.fromTo(close, { autoAlpha: 0 }, { autoAlpha: 1, duration: revealDuration }, 'settled')
    if (input.initiallyOpen) timeline.progress(1, true).pause()
    else timeline.play()
  } catch (error) {
    dispose()
    throw error
  }
  return {
    reverse(next) {
      if (disposed || closing) return
      closing = true
      if (!next.sourceRect) {
        // Keep current paint, abandon the stale flight, and fade to a safe endpoint.
        timeline.pause()
        fade = gsap.timeline({ onComplete: () => { if (!disposed) input.onClosed() } })
        fade.to(panel, { autoAlpha: 0, duration: 0.2 }, 0)
        fade.to(dialog, { '--event-backdrop': 0, duration: 0.2 }, 0)
      } else {
        const progress = timeline.progress()
        geometry = next
        // Refresh only spatial coordinates, preserving content visibility.
        for (const flight of flights) flight.invalidate()
        timeline.progress(progress, true)
        if (progress === 0) input.onClosed()
        else timeline.reverse()
      }
    },
    dispose,
  }
}
