import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { cn } from '@/features/shared/utils'

export interface EventModalProps {
  isOpen: boolean
  onClose: () => void
  event: {
    title: string
    subTitle?: string
    activityType?: string
    location: string
    eventTime: {
      start: string
      end: string
    }
    duration?: string
    description?: string
    color: string
    inscriptionLink?: string
    imageUrl?: string
  }
}

export const EventModal = ({ isOpen, onClose, event }: EventModalProps) => {
  const modalRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isOpen) return

    document.body.style.overflow = 'hidden'

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }

    document.addEventListener('keydown', handleEscape)

    return () => {
      document.body.style.overflow = ''
      document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen, onClose])

  // Handle back gesture (popstate) to close the panel instead of navigating back
  useEffect(() => {
    if (!isOpen) return
    const handlePopState = () => {
      if (isOpen) {
        onClose()
      }
    }

    window.addEventListener('popstate', handlePopState)
    return () => {
      window.removeEventListener('popstate', handlePopState)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  const modalContent = (
    <article
      className='font-neris fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm'
      onClick={handleOverlayClick}>
      <section
        ref={modalRef}
        className={cn([
          'relative flex max-h-[95dvh] w-full max-w-prose flex-col md:max-h-[90dvh]',
          'bg-25-white rounded-sm shadow-2xl',
        ])}>
        <button
          onClick={onClose}
          className='bg-25-blue text-25-white hover:bg-25-primary absolute top-auto right-3 bottom-3 z-6 flex size-8 cursor-pointer items-center justify-center rounded-full transition-colors duration-300 md:-top-5 md:-right-5 md:size-10 xl:top-3 xl:bottom-auto'
          aria-label='Cerrar modal'>
          {/* Change to svg X shape  */}
          <svg
            width='24'
            height='24'
            viewBox='0 0 24 24'
            fill='none'
            stroke='currentColor'
            strokeWidth='2'
            strokeLinecap='round'
            strokeLinejoin='round'>
            <path stroke='none' d='M0 0h24v24H0z' fill='none' />
            <path d='M18 6l-12 12' />
            <path d='M6 6l12 12' />
          </svg>
        </button>

        <span
          className='text-25-white absolute -top-2 -left-2 inline-block -skew-y-6 px-4 py-2 text-lg font-bold uppercase md:-top-4 md:-left-4 md:text-xl'
          style={{ backgroundColor: event.color }}>
          {event.activityType || 'Actividad'}
        </span>
        {
          /* Placeholder image, replace with actual event image if available */
          true && (
            <img
              src={event.imageUrl}
              alt={'Imagen de ' + event.title}
              className='bg-25-black/30 h-40 w-full shrink-0 rounded-t-sm object-cover object-center md:h-64'
            />
          )
        }

        <section className='scroll-thin min-h-0 flex-1 overflow-y-auto p-8'>
          <header className='mb-6'>
            <h2 className='text-3xl leading-none font-bold uppercase'>
              {event.title}
            </h2>
            {event.subTitle &&
              event.subTitle.split('\n').map((line, idx) => (
                <p
                  key={idx}
                  className='my-1 text-lg leading-none text-gray-700'>
                  {line}
                </p>
              ))}
          </header>

          <ul className='mb-6 grid space-y-2'>
            <li className='flex items-center gap-2 text-gray-600'>
              <span className='font-semibold'>📍</span>
              <span>{event.location}</span>
            </li>

            <li className='flex items-center gap-2 text-gray-600'>
              <span className='font-semibold'>🕐</span>
              {!event.eventTime.end ? (
                <span>{event.eventTime.start}hrs</span>
              ) : (
                <span>
                  {event.eventTime.start}hrs - {event.eventTime.end}hrs
                </span>
              )}
            </li>

            {event.duration && (
              <li className='flex items-center gap-2 text-gray-600'>
                <span className='font-semibold'>⏱️</span>
                <span>{event.duration}</span>
              </li>
            )}
          </ul>

          {event.description && (
            <section className='pb-4'>
              <h3 className='text-xl font-bold'>Descripción</h3>
              <p className='whitespace-pre-line text-gray-700'>
                {event.description}
              </p>
            </section>
          )}

          {event.inscriptionLink && (
            <div className='border-t border-gray-200 pt-4'>
              <a
                href={event.inscriptionLink}
                target='_blank'
                rel='noopener noreferrer'
                className='inline-block w-full rounded-sm bg-black px-6 py-3 text-center font-bold text-white uppercase transition-colors hover:bg-gray-800'>
                Inscríbete aquí
              </a>
            </div>
          )}
        </section>
      </section>
    </article>
  )

  return createPortal(modalContent, document.body)
}
