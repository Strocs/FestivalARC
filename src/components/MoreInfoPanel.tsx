import { useStore } from '@nanostores/react'
import { closePanel, infoPanel, isPanelOpen } from '@store/moreInfoStore'
import { useEffect } from 'react'

export const MoreInfoPanel = () => {
  const isOpen = useStore(isPanelOpen)
  const info = useStore(infoPanel)

  useEffect(() => {
    if (isOpen && window.innerWidth < 1280) {
      document.body.classList.add('overflow-hidden')
    } else {
      document.body.classList.remove('overflow-hidden')
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <article className='h-full xl:h-fit z-50 max-h-[calc(100vh-(var(--footer-height)))] xl:max-h-[calc(100vh-(var(--footer-height)*3))] w-full bg-black xl:bg-black/90 fixed xl:sticky top-[--footer-height] left-0 right-0 xl:top-[calc(var(--footer-height)+6rem)] p-6 text-secondary space-y-4 overflow-y-scroll scroll-thin'>
      <header>
        <h2 className='text-4xl font-bold leading-1'>{info.title}</h2>
        <p className='text-xl'>{info.subTitle}</p>
        <p className='font-light'>
          {typeof info.time === 'string' ? (
            <time dateTime={info.time}>{info.time}hrs</time>
          ) : (
            <>
              <time dateTime={info.time[0]}>{info.time[0]}hrs</time> hasta las{' '}
              <time dateTime={info.time[1]}>{info.time[1]}hrs</time>
            </>
          )}
        </p>
        <ul className='flex gap-2 flex-wrap mt-2'>
          <li className='bg-white/25 font-medium px-2'>{info.day}</li>
          <li className='bg-white/25 font-medium px-2'>{info.category}</li>
          <li className='bg-white/25 font-medium'>
            <a
              target='_blank'
              className='px-2 block hover:text-accent-yellow'
              href={info.location.maps}
            >
              {info.location.name}
            </a>
          </li>
          <li className='bg-white/20 font-medium px-2'>{info.location.city}</li>
        </ul>
      </header>
      <section className='space-y-4 pb-10'>
        <p className='leading-5 font-light max-w-prose'>{info.description}</p>
        {!!info.more_info && (
          <ul className='space-y-2'>
            {info.more_info.map(item => {
              function Item ({ children }: React.PropsWithChildren) {
                return (
                  <li>
                    <p className='leading-5 font-light'>
                      <strong className='font-medium'>{item[0]}</strong>{' '}
                      {children}
                    </p>
                  </li>
                )
              }

              if (item[0].includes('Teaser')) {
                return (
                  <Item key={item[0]}>
                    <a
                      target='_blank'
                      href={item[1]}
                      className='hover:text-accent-yellow underline'
                    >
                      Ver en YouTube
                    </a>
                  </Item>
                )
              }
              return <Item key={item[0]}>{item[1]}</Item>
            })}
          </ul>
        )}

        {!!info.exhibitors && (
          <ul className='space-y-4 pl-4'>
            {info.exhibitors.map(exhibitor => (
              <li key={exhibitor.name}>
                <p className='leading-5 font-light'>
                  <strong className='font-medium text-2xl'>
                    {exhibitor.name}
                  </strong>
                </p>
                {!!exhibitor.artwork && (
                  <p>
                    <strong className='font-medium'>
                      {exhibitor.artwork.type}:{' '}
                    </strong>
                    {exhibitor.artwork.name}
                  </p>
                )}
                <p className='text-sm font-light text-pretty'>
                  {exhibitor.description}
                </p>
                {!!exhibitor.social_media && (
                  <ul className='flex gap-2'>
                    {Object.entries(exhibitor.social_media).map(rrss => (
                      <li>
                        <a target='_blank' className='' href={rrss[1]}>
                          {rrss[0]}
                        </a>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
      <footer className='sticky bottom-0 flex items-center left-0 right-0 justify-between'>
        <button
          className={`px-4 py-0.5 bg-primary ${info.color.backgroundHover} duration-150`}
          onClick={closePanel}
        >
          Cerrar
        </button>
        {!!info.social_media && (
          <nav className='w-fit'>
            <ul className='flex gap-2'>
              {Object.entries(info.social_media).map(([key, value]) => (
                <li key={key}>
                  <a
                    target='_blank'
                    className={`px-2 block bg-primary ${info.color.backgroundHover} duration-150`}
                    href={value}
                  >
                    {key}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        )}
      </footer>
    </article>
  )
}
