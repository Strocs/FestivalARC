import { useStore } from '@nanostores/react'
import { closePanel, infoPanel, isPanelOpen } from '@stores/moreInfoStore.ts'
import { useEffect } from 'react'
import { InstagramIcon } from './icons/InstagramIcon'
import { FacebookIcon } from './icons/FacebookIcon'
import { XIcon } from './icons/XIcon'
import { YoutubeIcon } from './icons/YoutubeIcon'
import { SpotifyIcon } from './icons/SpotifyIcon'
import { SoundcloudIcon } from './icons/SoundcloudIcon'
import { TumblrIcon } from './icons/TumblrIcon'
import { FlickrIcon } from './icons/FlickrIcon'
import { Gallery } from './Gallery'

interface Icons {
  [key: string]: JSX.Element
}

const ICONS: Icons = {
  ig: <InstagramIcon size={24} />,
  fb: <FacebookIcon size={24} />,
  x: <XIcon size={24} />,
  yt: <YoutubeIcon size={24} />,
  spotify: <SpotifyIcon size={24} />,
  soundcloud: <SoundcloudIcon size={24} />,
  tumblr: <TumblrIcon size={24} />,
  flickr: <FlickrIcon size={24} />
}

export const MoreInfoPanel = () => {
  const isOpen = useStore(isPanelOpen)
  const info = useStore(infoPanel)

  useEffect(() => {
    if (isOpen && window.innerWidth < 1280) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  if (!isOpen) return <></>

  return (
    <article className='h-full xl:h-fit z-50 max-h-[calc(100dvh-(var(--footer-height)))] xl:max-h-[calc(100vh-(var(--footer-height)*3))] w-full bg-secondary fixed xl:sticky top-[--footer-height] left-0 right-0 xl:top-[calc(var(--footer-height)+6rem)] text-black space-y-4 overflow-y-scroll scroll-thin shadow-xl bg-white-image xl:bg-none'>
      <header className='p-6'>
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
          <li className='bg-black/30 text-secondary font-medium px-2 py-1 leading-4'>
            {info.day}
          </li>
          <li className='bg-black/30 text-secondary font-medium px-2 py-1 leading-4'>
            {info.category}
          </li>
          <li className='bg-black/30 text-secondary font-medium'>
            <a
              target='_blank'
              className='px-2 py-1 block hover:text-accent-yellow leading-4'
              href={info.location.maps}
            >
              {info.location.name}
            </a>
          </li>
          <li className='bg-black/30 text-secondary font-medium px-2 py-1 leading-4'>
            {info.location.city}
          </li>
        </ul>
      </header>
      <section className='space-y-4 pb-[calc(var(--footer-height)+4rem)] px-6'>
        <p className='leading-5 max-w-prose'>{info.description}</p>
        {!!info.more_info && (
          <ul className='space-y-2'>
            {info.more_info.map(item => {
              function Item ({ children }: React.PropsWithChildren) {
                return (
                  <li>
                    <p className='leading-5'>
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
          <ul className='space-y-8 pl-4'>
            {info.exhibitors.map(exhibitor => (
              <li key={exhibitor.name}>
                <h4 className='leading-5'>
                  <strong className='font-medium text-2xl'>
                    {exhibitor.name}
                  </strong>
                </h4>
                {!!exhibitor.artwork && (
                  <p>
                    <strong className='font-medium'>
                      {exhibitor.artwork.type}:{' '}
                    </strong>
                    {exhibitor.artwork.name}
                  </p>
                )}
                {!!exhibitor.social_media && (
                  <ul className='flex gap-2 items-center my-1'>
                    {Object.entries(exhibitor.social_media).map(rrss => (
                      <li key={rrss[1]}>
                        <a target='_blank' className='block' href={rrss[1]}>
                          {ICONS[rrss[0]]}
                        </a>
                      </li>
                    ))}
                  </ul>
                )}
                <p className='text-sm font-light text-pretty'>
                  {exhibitor.description}
                </p>
              </li>
            ))}
          </ul>
        )}
        <Gallery gallery={info.gallery} category={info.category} />
      </section>
      <footer className='fixed xl:sticky bottom-0 flex items-center left-0 right-0 justify-between bg-secondary px-6 pt-4 pb-6 shadow-secondary shadow-[0_-20px_20px_0px_var(--tw-shadow-color)] justify-self-end w-full'>
        <button
          className={`px-4 py-0.5 bg-primary text-white ${info.color.backgroundHover} duration-150`}
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
                    className={`block duration-150`}
                    href={value}
                  >
                    {ICONS[key]}
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
