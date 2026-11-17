import type { ModalMotion, MotionGeometry, MotionInput } from './event-modal-motion'
import { createLazyModalMotion, preloadMotion } from './lazy-motion'
import { borrowCardElements } from './event-modal-title'
import { mountDayFilter } from '../poster/poster-day-filter'
import type { FilterMotion, FilterMotionInput } from '../poster/poster-filter-motion'

interface ModalOptions {
  createMotion?: (input: MotionInput) => ModalMotion
  navigate?: (href: string) => void
  createFilterMotion?: (input: FilterMotionInput) => FilterMotion
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
  let phase: Phase = 'closed'
  const filter = mountDayFilter(root, {
    canInteract: () => phase === 'closed', onDisconnect: () => mounted.get(root)?.(),
    ownStyles, createMotion: options.createFilterMotion,
  })
  const filterOnly = () => { filter.destroy(); mounted.delete(root) }
  const dialog = root.querySelector<HTMLDialogElement>('dialog')
  const panel = dialog?.querySelector<HTMLElement>('[data-modal-panel]')
  const content = dialog?.querySelector<HTMLElement>('[data-modal-content]')
  if (!dialog || !panel || !content || typeof dialog.showModal !== 'function') { mounted.set(root, filterOnly); return filterOnly }
  let media: MediaQueryList
  try { media = window.matchMedia('(prefers-reduced-motion: reduce)') } catch { mounted.set(root, filterOnly); return filterOnly }
  const createMotion = options.createMotion ?? createLazyModalMotion
  const navigate = options.navigate ?? (href => window.location.assign(href))
  const abort = new AbortController()
  const { signal } = abort
  let token = 0
  let destroyed = false
  let origin: HTMLAnchorElement | null = null
  let originIndex = 0
  let restoreDialog: (() => void) | undefined
  let restoreSource: (() => void) | undefined
  let unlock: (() => void) | undefined
  let motion: ModalMotion | undefined
  let shared: ReturnType<typeof borrowCardElements>
  let titleSize = 24
  let sourceMetadata: MotionInput['sourceMetadata']
  let backdropDown = false
  let settlementPending = false
  let resize: ResizeObserver | undefined
  let disconnect: MutationObserver | undefined
  const links = () => [...root.querySelectorAll<HTMLAnchorElement>('a[data-event-trigger][href]')]
  const geometry = (): MotionGeometry => {
    if (!origin?.isConnected || !root.contains(origin)) return { sourceRect: null, titleRect: null }
    if (shared) return shared.measure()
    return {
      sourceRect: (origin.querySelector<HTMLElement>('[data-artist-surface]') ?? origin).getBoundingClientRect(),
      titleRect: origin.querySelector<HTMLElement>('[data-artist-name]')?.getBoundingClientRect() ?? null,
    }
  }
  const cleanup = (restoreFocus = true) => {
    ++token
    phase = 'closed'
    settlementPending = false
    const oldMotion = motion; motion = undefined
    oldMotion?.dispose()
    shared?.restore(); shared = undefined
    sourceMetadata = undefined
    restoreSource?.(); restoreSource = undefined
    restoreDialog?.(); restoreDialog = undefined
    unlock?.(); unlock = undefined
    const previousOrigin = origin; origin = null
    backdropDown = false
    if (dialog.open) dialog.close()
    content.replaceChildren()
    if (restoreFocus && root.isConnected) {
      const remaining = links().filter(link => link.isConnected && filter.includes(link.dataset.eventId)
        && !link.closest('[hidden], [inert]') && link.getAttribute('aria-disabled') !== 'true')
      const target = previousOrigin && remaining.includes(previousOrigin) ? previousOrigin : remaining[Math.min(originIndex, remaining.length - 1)]
      target?.focus({ preventScroll: true })
    }
  }
  const lockScroll = () => {
    const body = document.body
    const html = document.documentElement
    const x = window.scrollX; const y = window.scrollY
    const restoreBody = ownStyles(body, ['overflow'])
    const restoreHtml = ownStyles(html, ['overflow', 'scroll-behavior'])
    unlock = () => {
      restoreBody()
      // Prevent CSS smooth scrolling from turning restoration into a second animation.
      html.style.setProperty('scroll-behavior', 'auto')
      html.style.removeProperty('overflow')
      window.scrollTo(x, y)
      restoreHtml()
    }
    // Clip without creating a scroll ancestor that displaces the sticky header.
    body.style.setProperty('overflow', 'clip')
    html.style.setProperty('overflow', 'hidden')
  }
  const makeMotion = (first: MotionGeometry, initiallyOpen = false) => {
    const current = ++token
    motion = createMotion({
      dialog, panel, ...first, titleSize, titleLines: shared?.lines, initiallyOpen, sourceMetadata,
      onOpened: () => {
        if (!destroyed && root.isConnected && token === current && phase === 'opening') {
          phase = 'open'
          if (settlementPending) settle()
        }
      },
      onClosed: () => {
        if (!destroyed && root.isConnected && token === current && phase === 'closing') cleanup()
      },
    })
  }
  const requestClose = () => {
    if (phase === 'closed' || phase === 'closing') return
    phase = 'closing'
    settlementPending = false
    const currentGeometry = geometry()
    try {
      if (media.matches) cleanup()
      else {
        if (!motion) {
          makeMotion(currentGeometry, true)
        }
        motion?.reverse(currentGeometry)
      }
    } catch { cleanup() }
  }
  const settle = () => {
    if (destroyed || phase === 'closed') return
    if (!root.isConnected) { destroy(); return }
    if (phase === 'closing') { cleanup(); return }
    // Mobile viewport/layout notifications must not cut short the entrance.
    if (phase === 'opening' && !media.matches) { settlementPending = true; return }
    settlementPending = false
    ++token
    motion?.dispose(); motion = undefined
    shared?.fit()
    phase = 'open'
  }
  const onClick = (event: MouseEvent) => {
    if (event.defaultPrevented || event.button !== 0 || event.ctrlKey || event.metaKey || event.altKey || event.shiftKey) return
    const target = event.target instanceof Element ? event.target : null
    if (target?.closest('[data-modal-close]') && dialog.contains(target)) { requestClose(); return }
    const link = target?.closest<HTMLAnchorElement>('a[data-event-trigger]')
    if (!link || !root.contains(link)) return
    if (phase !== 'closed' || !filter.includes(link.dataset.eventId)) { event.preventDefault(); return }
    if (link.hasAttribute('download') || (link.target && link.target !== '_self')) return
    const template = [...root.querySelectorAll<HTMLTemplateElement>('template[data-event-template]')]
      .find(node => node.dataset.eventTemplate === link.dataset.eventId)
    if (!template || !template.content.querySelector('#event-modal-title')) return
    event.preventDefault()
    const fallback = link.href
    try {
      filter.settle()
      origin = link
      originIndex = links().indexOf(link)
      // First viewport reads precede showModal and scroll locking.
      const first = geometry()
      const name = link.querySelector<HTMLElement>('[data-artist-name]')
      titleSize = name ? Number.parseFloat(getComputedStyle(name).fontSize) || 24 : 24
      const metadata = link.querySelector<HTMLElement>('[data-artist-meta]')
      const metadataStyle = metadata ? getComputedStyle(metadata) : undefined
      sourceMetadata = metadata && metadataStyle ? {
        element: metadata, opacity: Number.parseFloat(metadataStyle.opacity || '1'),
        visibility: metadataStyle.visibility,
      } : undefined
      if (metadata) restoreSource = ownStyles(metadata, ['opacity', 'visibility'])
      content.replaceChildren(template.content.cloneNode(true))
      const heading = content.querySelector<HTMLElement>('#event-modal-title')!
      shared = borrowCardElements(link, panel, heading, ownStyles)
      if (!shared) throw new Error('Missing card elements')
      phase = 'opening'
      settlementPending = false
      restoreDialog = ownStyles(dialog, ['--event-backdrop'])
      dialog.style.setProperty('--event-backdrop', '1')
      lockScroll()
      dialog.showModal()
      shared.fit()
      heading.focus({ preventScroll: true })
      if (metadata) {
        metadata.style.setProperty('opacity', '0')
        metadata.style.setProperty('visibility', 'hidden')
      }
      if (media.matches) phase = 'open'
      else makeMotion({ ...first, titleLineRects: shared.sourceLineRects })
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
    const warmMotion = () => { if (!media.matches) preloadMotion() }
    root.addEventListener('pointerover', warmMotion, { signal, once: true })
    root.addEventListener('focusin', warmMotion, { signal, once: true })
    root.addEventListener('touchstart', warmMotion, { signal, once: true, passive: true })
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
    filter.destroy()
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

