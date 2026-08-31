import { useStore } from '@nanostores/react'
import { closePanel, infoPanel, isPanelOpen } from '@stores/activityInfoStore'
import { useEffect } from 'react'
import { InstagramIcon } from './icons/InstagramIcon'
import { FacebookIcon } from './icons/FacebookIcon'
import { XIcon } from './icons/XIcon'
import { YoutubeIcon } from './icons/YoutubeIcon'
import { SpotifyIcon } from './icons/SpotifyIcon'
import { SoundcloudIcon } from './icons/SoundcloudIcon'
import { TumblrIcon } from './icons/TumblrIcon'
import { FlickrIcon } from './icons/FlickrIcon'
import { ActivityGallery } from './ActivityGallery'
import { ActivityExhibitors } from './ActivityExhibitors'
import { ActivityMoreInfo } from './ActivityMoreInfo'

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

export const ActivityPanel = () => {
  const isOpen = useStore(isPanelOpen)
  const info = useStore(infoPanel)

  const getTicketURL = () => {
    const filter = info.location.tickets?.url.filter(url =>
      info.title.includes(url[0])
    )
    return !!filter && !!filter[0] ? filter[0][1] : '#'
  }

  const ticket = getTicketURL()

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
        {!!info.location.tickets ? (
          <a
            href={ticket}
            className={`block px-2 py-1 text-secondary w-fit my-6 ${info.color.background} hover:bg-primary duration-150`}
          >
            {info.location.tickets.title}
          </a>
        ) : (
          <p
            className={`block px-2 py-1 text-secondary w-fit my-6 ${info.color.background} hover:bg-primary duration-150 cursor-default`}
          >
            Entrada liberada
          </p>
        )}
        <ul className='flex gap-2 flex-wrap my-2'>
          <li className='bg-black/30 text-secondary font-medium px-2 py-1 '>
            {info.day}
          </li>
          <li className='bg-black/30 text-secondary font-medium px-2 py-1 '>
            {info.category}
          </li>
          <li className='bg-black/30 text-secondary font-medium'>
            <a
              target='_blank'
              className='px-2 py-1 block hover:text-accent-yellow '
              href={info.location.maps}
            >
              {info.location.name}
            </a>
          </li>
          <li className='bg-black/30 text-secondary font-medium px-2 py-1 '>
            {info.location.city}
          </li>
        </ul>
      </header>
      <section className='space-y-4 pb-[calc(var(--footer-height)+4rem)] px-6'>
        <p className='leading-5 max-w-prose'>{info.description}</p>
        <ActivityMoreInfo moreInfo={info.more_info} />
        <ActivityExhibitors exhibitors={info.exhibitors} ICONS={ICONS} />
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
        <ActivityGallery gallery={info.gallery} category={info.category} />
      </section>
      <footer className='fixed xl:sticky bottom-0 flex items-center justify-end left-0 right-0 bg-secondary px-6 pt-4 pb-6 shadow-secondary shadow-[0_-30px_20px_0px_var(--tw-shadow-color)] justify-self-end w-full'>
        <button
          className={`px-4 py-0.5 text-white ${info.color.background} hover:bg-primary duration-150`}
          onClick={closePanel}
        >
          Cerrar
        </button>
      </footer>
    </article>
  )
}
