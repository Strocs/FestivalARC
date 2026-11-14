import { createModalMotion, type ModalMotion, type MotionGeometry, type MotionInput } from './event-modal-motion'
import { applySourceTitle, captureSourceTitle, type SourceTitleSnapshot } from './event-modal-title'

interface ModalOptions {
  createMotion?: (input: MotionInput) => ModalMotion
  navigate?: (href: string) => void
}
type Phase = 'closed' | 'opening' | 'open' | 'closing'
const mounted = new WeakMap<HTMLElement, () => void>()

/** Restore only owned declarations, including their original priority/absence. */
function ownStyles(node: HTMLElement, properties: string[]): () => void {
  const absent = !node.hasAttribute('style')
  const saved = properties.map(property => [property, node.style.getPropertyValue(property), node.style.getPropertyPriority(property)] as const)
  return () => {
    for (const [property, value, priority] of saved) {
      if (value) node.style.setProperty(property, value, priority)
      else node.style.removeProperty(property)
    }
    if (absent && !node.style.cssText) node.removeAttribute('style')
  }
}

/** The sole lifecycle owner for one page scope. No catalog or URL-state dependency. */
export function mountEventModal(root: HTMLElement, options: ModalOptions = {}): () => void {
  const existing = mounted.get(root)
  if (existing) return existing
  const dialog = root.querySelector<HTMLDialogElement>('dialog')
  const panel = dialog?.querySelector<HTMLElement>('[data-modal-panel]')
  const content = dialog?.querySelector<HTMLElement>('[data-modal-content]')
  if (!dialog || !panel || !content || typeof dialog.showModal !== 'function') return () => {}
  let media: MediaQueryList
  try { media = window.matchMedia('(prefers-reduced-motion: reduce)') } catch { return () => {} }
  const createMotion = options.createMotion ?? createModalMotion
  const navigate = options.navigate ?? (href => window.location.assign(href))
  const abort = new AbortController()
  const { signal } = abort
  let phase: Phase = 'closed'
  let token = 0
  let destroyed = false
  let origin: HTMLAnchorElement | null = null
  let originIndex = 0
  let restoreDialog: (() => void) | undefined
  let restoreSource: (() => void) | undefined
  let unlock: (() => void) | undefined
  let motion: ModalMotion | undefined
  let sourceTitle: SourceTitleSnapshot | undefined
  let backdropDown = false
  let resize: ResizeObserver | undefined
  let disconnect: MutationObserver | undefined
  const links = () => [...root.querySelectorAll<HTMLAnchorElement>('a[data-event-trigger][href]')]
  const geometry = (): MotionGeometry => {
    if (!origin?.isConnected || !root.contains(origin)) return { sourceRect: null, titleRect: null }
    return {
      sourceRect: (origin.querySelector<HTMLElement>('[data-artist-surface]') ?? origin).getBoundingClientRect(),
      titleRect: origin.querySelector<HTMLElement>('[data-artist-name]')?.getBoundingClientRect() ?? null,
    }
  }
  const cleanup = (restoreFocus = true) => {
    ++token
    phase = 'closed'
    const oldMotion = motion; motion = undefined
    oldMotion?.dispose()
    sourceTitle = undefined
    restoreSource?.(); restoreSource = undefined
    restoreDialog?.(); restoreDialog = undefined
    unlock?.(); unlock = undefined
    const previousOrigin = origin; origin = null
    backdropDown = false
    if (dialog.open) dialog.close()
    content.replaceChildren()
    if (restoreFocus && root.isConnected) {
      const remaining = links().filter(link => link.isConnected && !link.hidden && link.getAttribute('aria-disabled') !== 'true')
      const target = previousOrigin?.isConnected ? previousOrigin : remaining[Math.min(originIndex, remaining.length - 1)]
      target?.focus({ preventScroll: true })
    }
  }
  const lockScroll = () => {
    const body = document.body
    const html = document.documentElement
    const x = window.scrollX; const y = window.scrollY
    const gap = Math.max(0, window.innerWidth - html.clientWidth)
    const padding = Number.parseFloat(getComputedStyle(body).paddingRight) || 0
    const restoreBody = ownStyles(body, ['overflow', 'padding-right'])
    const restoreHtml = ownStyles(html, ['overflow', 'scroll-behavior'])
    unlock = () => {
      restoreBody()
      // Prevent CSS smooth scrolling from turning restoration into a second animation.
      html.style.setProperty('scroll-behavior', 'auto')
      html.style.removeProperty('overflow')
      window.scrollTo(x, y)
      restoreHtml()
    }
    body.style.setProperty('overflow', 'hidden')
    if (gap) body.style.setProperty('padding-right', `${padding + gap}px`)
    html.style.setProperty('overflow', 'hidden')
  }
  const prepareTitle = (first?: MotionGeometry) => {
    if (first) {
      const name = origin?.querySelector<HTMLElement>('[data-artist-name]')
      sourceTitle = name && first.titleRect ? captureSourceTitle(name, first.titleRect) : undefined
    }
    const title = content.querySelector<HTMLElement>('#event-modal-title')
    if (title && sourceTitle) {
      const closeLeft = dialog.querySelector<HTMLElement>('[data-modal-close]')?.getBoundingClientRect().left
      applySourceTitle(title, sourceTitle, closeLeft)
    }
  }
  const makeMotion = (first: MotionGeometry, titleSize: number, initiallyOpen = false) => {
    const current = ++token
    motion = createMotion({
      dialog, panel, ...first, titleSize, initiallyOpen, sourceTitle,
      onOpened: () => {
        if (!destroyed && root.isConnected && token === current && phase === 'opening') phase = 'open'
      },
      onClosed: () => {
        if (!destroyed && root.isConnected && token === current && phase === 'closing') cleanup()
      },
    })
  }
  const requestClose = () => {
    if (phase === 'closed' || phase === 'closing') return
    phase = 'closing'
    const currentGeometry = geometry()
    try {
      if (media.matches) cleanup()
      else {
        if (!motion) {
          prepareTitle(currentGeometry)
          makeMotion(currentGeometry, sourceTitle?.fontSize ?? 24, true)
        }
        motion?.reverse(currentGeometry)
      }
    } catch { cleanup() }
  }
  const settle = () => {
    if (destroyed || phase === 'closed') return
    if (!root.isConnected) { destroy(); return }
    if (phase === 'closing') { cleanup(); return }
    ++token
    motion?.dispose(); motion = undefined
    prepareTitle(geometry())
    phase = 'open'
  }
  const onClick = (event: MouseEvent) => {
    if (event.defaultPrevented || event.button !== 0 || event.ctrlKey || event.metaKey || event.altKey || event.shiftKey) return
    const target = event.target instanceof Element ? event.target : null
    if (target?.closest('[data-modal-close]') && dialog.contains(target)) { requestClose(); return }
    const link = target?.closest<HTMLAnchorElement>('a[data-event-trigger]')
    if (!link || !root.contains(link)) return
    if (phase !== 'closed') { event.preventDefault(); return }
    if (link.hasAttribute('download') || (link.target && link.target !== '_self')) return
    const template = [...root.querySelectorAll<HTMLTemplateElement>('template[data-event-template]')]
      .find(node => node.dataset.eventTemplate === link.dataset.eventId)
    if (!template || !template.content.querySelector('#event-modal-title')) return
    event.preventDefault()
    const fallback = link.href
    try {
      origin = link
      originIndex = links().indexOf(link)
      // First viewport reads precede showModal and scroll locking.
      const first = geometry()
      const name = link.querySelector<HTMLElement>('[data-artist-name]')
      const titleSize = name ? Number.parseFloat(getComputedStyle(name).fontSize) || 24 : 24
      sourceTitle = name && first.titleRect ? captureSourceTitle(name, first.titleRect) : undefined
      content.replaceChildren(template.content.cloneNode(true))
      phase = 'opening'
      restoreDialog = ownStyles(dialog, ['--event-backdrop'])
      dialog.style.setProperty('--event-backdrop', '1')
      lockScroll()
      dialog.showModal()
      prepareTitle()
      dialog.querySelector<HTMLElement>('#event-modal-title')?.focus({ preventScroll: true })
      restoreSource = ownStyles(link, ['visibility'])
      link.style.setProperty('visibility', 'hidden')
      if (media.matches) phase = 'open'
      else makeMotion(first, titleSize)
    } catch {
      cleanup(false)
      navigate(fallback)
    }
  }
  const outside = (event: PointerEvent) => {
    if (event.target !== dialog) return false
    const rect = panel.getBoundingClientRect()
    return event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom
  }
  try {
    root.addEventListener('click', onClick, { signal })
    dialog.addEventListener('cancel', event => { event.preventDefault(); requestClose() }, { signal })
    dialog.addEventListener('close', () => { if (!dialog.open && phase !== 'closed') cleanup() }, { signal })
    dialog.addEventListener('pointerdown', event => { backdropDown = outside(event) }, { signal })
    dialog.addEventListener('pointerup', event => {
      const deliberate = backdropDown && outside(event)
      backdropDown = false
      if (deliberate) requestClose()
    }, { signal })
    dialog.addEventListener('pointercancel', () => { backdropDown = false }, { signal })
    window.addEventListener('resize', settle, { signal })
    window.visualViewport?.addEventListener('resize', settle, { signal })
    media.addEventListener('change', settle)
    content.addEventListener('load', settle, { signal, capture: true })
    document.fonts?.addEventListener('loadingdone', settle, { signal })
    // Promise continuations are not cancellable; their connection/token guard is.
    const fontToken = token
    void document.fonts?.ready.then(() => { if (!destroyed && root.isConnected && token === fontToken) settle() })
    resize = typeof ResizeObserver === 'undefined' ? undefined : new ResizeObserver(settle)
    resize?.observe(root)
    disconnect = new MutationObserver(() => { if (!root.isConnected) destroy() })
    disconnect.observe(document.documentElement, { childList: true, subtree: true })
  } catch {
    // A partially initialized enhancement must not leave intercepted dead anchors.
    destroy()
    return destroy
  }
  function destroy() {
    if (destroyed) return
    destroyed = true
    mounted.delete(root)
    abort.abort()
    media.removeEventListener?.('change', settle)
    resize?.disconnect()
    disconnect?.disconnect()
    cleanup(root.isConnected)
  }
  mounted.set(root, destroy)
  return destroy
}

/** Browser-owned connection lifecycle; repeated script execution is harmless. */
export function registerEventModal(): void {
  if (customElements.get('arc-event-modal')) return
  customElements.define('arc-event-modal', class extends HTMLElement {
    private teardown?: () => void
    connectedCallback() {
      const root = this.closest<HTMLElement>('[data-event-scope]')
      if (!root || this.teardown) return
      try { this.teardown = mountEventModal(root) } catch { /* Ordinary anchors remain the fallback. */ }
    }
    disconnectedCallback() { this.teardown?.(); this.teardown = undefined }
  })
}
