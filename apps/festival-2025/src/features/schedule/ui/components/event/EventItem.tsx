import { cn } from '@/features/shared/utils'
import { ScheduleInfoButton } from './ScheduleInfoButton'
import { EventModal } from './EventModal'
import { useEventModal } from '../../hooks/use-event-modal'
import { useMemo } from 'react'

export interface EventItemProps {
  id: string
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
  description?: string
  galleryUrl?: string
}

export const EventItem = ({
  id,
  header,
  footer,
  eventTime,
  activityType,
  duration,
  color,
  location,
  stackOffset = 0,
  description,
  galleryUrl,
}: EventItemProps) => {
  const { title, subTitle } = header
  const { leftButton, rightLink: inscriptionLink } = footer
  const { isOpen, openModal, closeModal } = useEventModal()

  // add height of headers
  const stickyTop = useMemo(
    () =>
      `calc(var(--sticky-top-height) + ${stackOffset} * var(--item-height))`,
    [stackOffset],
  )

  return (
    <section
      id={id}
      className={cn([
        'before:bg-25-white after:bg-25-black group-hover:text-25-white text-25-black sticky z-10 before:rounded-sm after:rounded-b-sm group-hover:after:rounded-sm',
        '[--sticky-top-height:4rem] md:[--sticky-top-height:7rem]',
        'pointer-events-none',
        'grid h-fit min-h-[var(--item-height)] w-full min-w-[320px] gap-2 px-4 pt-8 leading-4 shadow-lg duration-300',
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

      {/* <span className='bg-25-white text-25-black absolute -top-2 right-4 w-fit px-2 font-sans text-xs uppercase'> */}
      {/*   {location.includes('Instalación') ? '' : location} */}
      {/* </span> */}

      <header>
        <h4
          aria-label={title}
          className='text-25-black h-fit font-bold tracking-wide uppercase duration-300 group-hover:text-yellow-200'>
          {title}
        </h4>
        {subTitle &&
          subTitle.split('\n').map((line) => (
            <div key={line} className=''>
              <span className='text-sm leading-3 font-light'>{line}</span>
            </div>
          ))}
      </header>
      <section>
        <p className='text-sm'>
          {!eventTime.end ? (
            <time>{eventTime.start}hrs</time>
          ) : (
            <>
              <time className='font-semibold'>{eventTime.start}hrs</time> hasta
              las <time className='font-semibold'>{eventTime.end}hrs</time>
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
          <ScheduleInfoButton onClick={openModal} label={leftButton} />
        )}
        {!!leftButton && !!inscriptionLink && (
          <hr className='border-25-white mt-1 w-6 rotate-90 border-1 leading-none' />
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

      <EventModal
        isOpen={isOpen}
        onClose={closeModal}
        event={{
          title,
          subTitle,
          activityType,
          location,
          eventTime,
          duration,
          description,
          color,
          inscriptionLink,
          imageUrl: galleryUrl,
        }}
      />
    </section>
  )
}
