import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { EventModal } from '../EventModal'

const event = {
  title: 'Apertura',
  location: 'La Serena',
  eventTime: { start: '18:00', end: '19:00' },
  color: '#000000',
}

describe('EventModal lifecycle', () => {
  it('closes from Escape and restores body scrolling on unmount', () => {
    const onClose = vi.fn()
    const { unmount } = render(
      <EventModal isOpen onClose={onClose} event={event} />,
    )

    expect(screen.getByRole('heading', { name: 'Apertura' })).toBeVisible()
    expect(document.body.style.overflow).toBe('hidden')

    fireEvent.keyDown(document, { key: 'Escape' })
    expect(onClose).toHaveBeenCalledTimes(1)

    unmount()
    expect(document.body.style.overflow).toBe('')
  })

  it('closes when browser history changes while open', () => {
    const onClose = vi.fn()
    render(<EventModal isOpen onClose={onClose} event={event} />)

    window.dispatchEvent(new PopStateEvent('popstate'))

    expect(onClose).toHaveBeenCalledTimes(1)
  })
})
