interface Props {
  urlArray: string[][] | undefined
  title: string
}

export const getTicketURL = ({ urlArray, title }: Props): string => {
  const filter = urlArray?.filter(url =>
    title.includes(url[0])
  )
  return !!filter && !!filter[0] ? filter[0][1] : '#'
}