interface Props {
  size?: number
}

export const FlickrIcon = ({ size = 24 }: Props) => {
  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      width={size}
      height={size}
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      strokeWidth='1.5'
      strokeLinecap='round'
      strokeLinejoin='round'
      className='fill-transparent hover:fill-secondary transition-[fill] duration-150 group'
    >
      <path stroke='none' d='M0 0h24v24H0z' fill='none' />
      <path d='M7 12m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0' />
      <path d='M17 12m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0' />
    </svg>
  )
}
