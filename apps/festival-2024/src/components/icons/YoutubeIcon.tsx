interface Props {
  size?: number
}

export const YoutubeIcon = ({ size = 32 }: Props) => {
  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      width={size}
      height={size}
      viewBox='0 0 24 24'
      stroke='currentColor'
      strokeWidth='1.5'
      strokeLinecap='round'
      strokeLinejoin='round'
      className='fill-transparent hover:fill-secondary transition-[fill] duration-150 group'
    >
      <path stroke='none' d='M0 0h24v24H0z' fill='none'></path>
      <path d='M2 8a4 4 0 0 1 4 -4h12a4 4 0 0 1 4 4v8a4 4 0 0 1 -4 4h-12a4 4 0 0 1 -4 -4v-8z'></path>
      <path
        className='landscape:group-hover:fill-black landscape:group-hover:stroke-black group-hover:fill-accent-blue group-hover:stroke-accent-blue transition-[stroke,fill] duration-150'
        d='M10 9l5 3l-5 3z'
      ></path>
    </svg>
  )
}
