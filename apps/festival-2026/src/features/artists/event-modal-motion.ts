import { gsap } from 'gsap'

export interface MotionGeometry {
  sourceRect: DOMRect | null
  titleRect: DOMRect | null
}
export interface MotionInput extends MotionGeometry {
  dialog: HTMLDialogElement
  panel: HTMLElement
  titleSize: number
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
  const meta = panel.querySelector<HTMLElement>('[data-modal-meta]')
  const details = [...panel.querySelectorAll<HTMLElement>('[data-modal-details], footer')]
  const finalRect = panel.getBoundingClientRect()
  const finalTitle = title?.getBoundingClientRect()
  const finalSize = title ? getComputedStyle(title).fontSize : '24px'
  const elements = [dialog, panel, surface, title, meta, ...details].filter((node): node is HTMLElement => !!node)
  const styles = elements.map(node => [node, node.getAttribute('style')] as const)
  // A single text-only visual proxy leaves the semantic heading, final typography
  // and panel geometry in flow. Its changing font size cannot resize the dialog.
  const proxy = title && finalTitle ? document.createElement('span') : null
  if (proxy && title && finalTitle) {
    proxy.dataset.modalTitleProxy = ''
    proxy.setAttribute('aria-hidden', 'true')
    proxy.inert = true
    proxy.textContent = title.textContent
    proxy.className = title.className
    Object.assign(proxy.style, {
      position: 'absolute', pointerEvents: 'none', margin: '0',
      left: `${finalTitle.left - finalRect.left}px`, top: `${finalTitle.top - finalRect.top}px`,
      width: `${finalTitle.width}px`, fontSize: finalSize,
    })
  }
  let geometry: MotionGeometry = input
  let disposed = false
  let closing = false
  let fade: gsap.core.Timeline | undefined
  const timeline = gsap.timeline({
    paused: true,
    defaults: { duration: 0.45, ease: 'power3.inOut' },
    onComplete: () => { if (!disposed && !closing) input.onOpened() },
    onReverseComplete: () => { if (!disposed && closing) input.onClosed() },
  })
  const dispose = () => {
    if (disposed) return
    disposed = true
    fade?.revert()
    timeline.revert()
    proxy?.remove()
    for (const [node, style] of styles) {
      if (style === null) node.removeAttribute('style')
      else node.setAttribute('style', style)
    }
  }
  try {
    if (proxy) panel.append(proxy)
    timeline.addLabel('surface', 0)
    timeline.fromTo(surface, {
      transformOrigin: '0 0',
      x: () => geometry.sourceRect ? geometry.sourceRect.left - finalRect.left : 0,
      y: () => geometry.sourceRect ? geometry.sourceRect.top - finalRect.top : 0,
      scaleX: () => geometry.sourceRect && finalRect.width ? geometry.sourceRect.width / finalRect.width : 1,
      scaleY: () => geometry.sourceRect && finalRect.height ? geometry.sourceRect.height / finalRect.height : 1,
      autoAlpha: geometry.sourceRect ? 1 : 0,
    }, { x: 0, y: 0, scaleX: 1, scaleY: 1, autoAlpha: 1 }, 'surface')
    timeline.fromTo(dialog, { '--event-backdrop': 0 }, { '--event-backdrop': 1 }, 'surface')
    timeline.addLabel('header', 0)
    if (proxy) timeline.fromTo(proxy, {
      x: () => geometry.titleRect && finalTitle ? geometry.titleRect.left - finalTitle.left : 0,
      y: () => geometry.titleRect && finalTitle ? geometry.titleRect.top - finalTitle.top : 0,
      fontSize: geometry.titleRect ? input.titleSize : finalSize,
    }, { x: 0, y: 0, fontSize: finalSize }, 'header')
    if (meta) timeline.fromTo(meta, { y: 12, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.25 }, 'header+=0.12')
    timeline.addLabel('reveal', 0.22)
    if (details.length) timeline.fromTo(details, { y: 10, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.23 }, 'reveal')
    timeline.addLabel('settled', 0.45)
    if (title && proxy) {
      timeline.fromTo(title, { opacity: 0 }, { opacity: 1, duration: 0 }, 'settled')
      timeline.to(proxy, { autoAlpha: 0, duration: 0 }, 'settled')
    }
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
        // Refresh function-based starting coordinates without seeking the open endpoint.
        timeline.invalidate().progress(progress, true)
        if (progress === 0) input.onClosed()
        else timeline.reverse()
      }
    },
    dispose,
  }
}
