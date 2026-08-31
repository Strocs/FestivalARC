interface Props {
  size?: number
}

export const LinkArrowIcon = ({ size = 24 }: Props) => {
  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      width={size}
      height={size}
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
      className='inline -mt-0.5'
    >
      <path stroke='none' d='M0 0h24v24H0z' fill='none'></path>
      <path d='M17 7l-10 10'></path>
      <path d='M8 7l9 0l0 9'></path>
    </svg>
  )
}
