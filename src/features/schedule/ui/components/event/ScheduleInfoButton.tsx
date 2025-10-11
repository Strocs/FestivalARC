import { cn } from '@/features/shared/utils'

interface ScheduleInfo {
  itemId?: string
  label?: string
  className?: string
}

type ScheduleInfoButton = ScheduleInfo &
  React.ButtonHTMLAttributes<HTMLButtonElement>

type ScheduleInfoLink = ScheduleInfo &
  React.AnchorHTMLAttributes<HTMLAnchorElement>

export type ScheduleInfoButtonProps = ScheduleInfoButton | ScheduleInfoLink

export function ScheduleInfoButton({
  itemId,
  label,
  className,
  ...props
}: ScheduleInfoButtonProps) {
  const buttonLabel = label || 'Más info'
  const buttonStyle = cn(
    ' w-full py-1.5 whitespace-nowrap transition duration-300',
    !!className ? className : 'text-25-white hover:text-25-accent',
  )

  if (props.hasOwnProperty('onClick')) {
    const buttonProps = props as React.ButtonHTMLAttributes<HTMLButtonElement>

    return (
      <button className={cn(buttonStyle, 'cursor-pointer')} {...buttonProps}>
        {buttonLabel}
      </button>
    )
  }

  if (props.hasOwnProperty('href')) {
    const linkProps = props as React.AnchorHTMLAttributes<HTMLAnchorElement>

    return (
      <a
        target={linkProps.target || '_blank'}
        rel={linkProps.rel || 'noopener noreferrer'}
        href={linkProps.href}
        className={buttonStyle}
        {...linkProps}>
        {buttonLabel}
      </a>
    )
  }
  return null
}
