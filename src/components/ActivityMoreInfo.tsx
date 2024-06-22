interface Props {
  moreInfo?: Array<string>[]
}

export const ActivityMoreInfo = ({ moreInfo }: Props) => {
  if (!moreInfo) return <></>

  return (
    <ul className='space-y-2'>
      {moreInfo.map(item => {
        function Item ({ children }: React.PropsWithChildren) {
          return (
            <li>
              <p className='leading-5'>
                <strong className='font-medium'>{item[0]}</strong> {children}
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
  )
}
