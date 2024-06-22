import type { Exhibitors } from '@cTypes/types'

interface Props {
  exhibitors: Exhibitors[] | undefined
  ICONS: {
    [key: string]: JSX.Element
  }
}

export const ActivityExhibitors = ({ exhibitors, ICONS }: Props) => {
  if (!exhibitors) return <></>

  return (
    <ul className='space-y-8 pl-4'>
      {exhibitors.map(exhibitor => (
        <li key={exhibitor.name}>
          <ul className='flex gap-2 items-center my-1'>
            <li className='w-fit'>
              <h4 className='leading-5'>
                <strong className='font-medium text-2xl'>
                  {exhibitor.name}
                </strong>
              </h4>
            </li>
            {!!exhibitor.social_media &&
              Object.entries(exhibitor.social_media).map(rrss => (
                <li key={rrss[1]}>
                  <a target='_blank' className='block' href={rrss[1]}>
                    {ICONS[rrss[0]]}
                  </a>
                </li>
              ))}
          </ul>

          {!!exhibitor.artwork && (
            <p>
              <strong className='font-medium'>
                {exhibitor.artwork.type}:{' '}
              </strong>
              {exhibitor.artwork.name}
            </p>
          )}
          {/* {!!exhibitor.social_media && (
            <ul className='flex gap-2 items-center my-1'>
              {Object.entries(exhibitor.social_media).map(rrss => (
                <li key={rrss[1]}>
                  <a target='_blank' className='block' href={rrss[1]}>
                    {ICONS[rrss[0]]}
                  </a>
                </li>
              ))}
            </ul>
          )} */}
          <p className='text-sm font-light text-pretty'>
            {exhibitor.description}
          </p>
        </li>
      ))}
    </ul>
  )
}
