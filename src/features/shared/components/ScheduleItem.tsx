import { cn } from '@/features/shared/utils'
import { ScheduleInfoButton } from './ScheduleInfoButton'

export interface ScheduleItemProps {
  id: string
  trackId: string
  header: {
    title: string
    subTitle?: string
  }
  eventTime: {
    start: string
    end: string
  }
  footer: {
    leftButton?: string
    rightLink?: string
  }
  activityType?: string
  duration?: string
  color: string
  location: string
  stackOffset?: number
}

export const ScheduleItem = ({
  id,
  trackId,
  header,
  footer,
  eventTime,
  activityType,
  duration,
  color,
  location,
  stackOffset = 0,
}: ScheduleItemProps) => {
  const { title, subTitle } = header
  const { leftButton, rightLink: inscriptionLink } = footer

  const stickyTop = `calc(1.5rem + ${stackOffset * 200}px)`

  return (
    <li
      id={id}
      className={cn([
        'before:bg-25-white after:bg-25-black group-hover:text-25-white text-25-black sticky z-10',
        'pointer-events-none',
        'grid h-fit min-h-[200px] w-full gap-2 px-4 pt-8 leading-4 shadow-lg duration-300',
        "before:absolute before:-z-20 before:h-full before:w-full before:content-['']",
        "after:absolute after:bottom-0 after:-z-10 after:h-7 after:w-full after:duration-300 after:content-[''] group-hover:after:h-full",
      ])}
      style={{ top: stickyTop }}>
      <span
        className={cn(
          'absolute -top-3 -skew-y-6 bg-black px-4 py-2 font-bold text-white uppercase',
        )}
        style={{ backgroundColor: color }}>
        {activityType || 'Actividad'}
      </span>
      <span className='bg-25-white text-25-black absolute -top-2 right-4 w-fit px-2 font-sans text-xs uppercase'>
        {location}
      </span>
      <header>
        <h2 className='h-fit font-bold tracking-wide text-black uppercase duration-300 group-hover:text-yellow-200'>
          {title}
        </h2>
        <span className='text-sm leading-3 font-light'>{subTitle}</span>
      </header>
      <section className='flex flex-col'>
        <p className='text-sm'>
          {!eventTime.end ? (
            <time>{eventTime.start}hrs</time>
          ) : (
            <>
              <time>{eventTime.start}hrs</time> hasta las{' '}
              <time>{eventTime.end}hrs</time>
            </>
          )}
        </p>
        {!!duration && <p className='text-sm'>Duración: {duration}</p>}
      </section>
      <footer
        className={cn(
          'text-fm-white flex h-fit min-h-8 w-full items-center justify-center gap-2 self-end text-center',
          'pointer-events-auto',
        )}>
        {!!leftButton && (
          <ScheduleInfoButton
            onClick={() => console.log(trackId)}
            label={leftButton}
          />
        )}
        {!!leftButton && !!inscriptionLink && (
          <hr className='border-2025-white w-4 rotate-90 border-1' />
        )}
        {!!inscriptionLink && (
          <a
            target='_blank'
            rel='noopener noreferrer'
            className='w-full py-1.5 whitespace-nowrap text-white transition duration-300 hover:text-yellow-200'
            href={inscriptionLink}>
            Inscríbete aquí
          </a>
        )}
      </footer>
    </li>
  )
}
