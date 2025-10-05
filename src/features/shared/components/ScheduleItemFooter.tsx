import { cloneElement, isValidElement } from 'react'
import { ScheduleInfoButton } from './ScheduleInfoButton'

interface ScheduleItemFooter {
  itemId: string
  footer?: {
    leftButton?:
      | React.ReactNode
      | {
          onClick?: () => void
          href?: string
          label?: string
          className?: string
        }
    rightLink?: {
      href: string
      label?: string
    }
  }
}

export function ScheduleItemFooter({ itemId, footer }: ScheduleItemFooter) {
  if (!footer) return null

  const { leftButton, rightLink } = footer

  const renderLeftButton = () => {
    if (!leftButton) return null

    // NOTE: We use 'as any' because cloneElement has some typing issues with props
    // TODO: fix this properly
    if (isValidElement(leftButton)) {
      return cloneElement(leftButton, {
        itemId,
        ...(typeof leftButton.props === 'object' ? leftButton.props : {}),
      } as any)
    }

    if (typeof leftButton === 'object') {
      return <ScheduleInfoButton itemId={itemId} {...leftButton} />
    }
    return null
  }

  return (
    <footer className='text-fm-white flex h-fit min-h-8 w-full items-center justify-center gap-2 self-end text-center'>
      {renderLeftButton()}
      <hr className='border-2025-white w-4 rotate-90 border-1' />
      {!!rightLink && (
        <a
          target='_blank'
          rel='noopener noreferrer'
          className='hover:text-2025-yellow w-full py-1.5 whitespace-nowrap transition duration-300'
          href={rightLink.href}>
          {rightLink.label || 'Link'}
        </a>
      )}
    </footer>
  )
}
