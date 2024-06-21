interface Props {
  size?: number
}

export const InstagramIcon = ({ size = 32 }: Props) => {
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
      <path d='M4 4m0 4a4 4 0 0 1 4 -4h8a4 4 0 0 1 4 4v8a4 4 0 0 1 -4 4h-8a4 4 0 0 1 -4 -4z'></path>
      <path
        className='landscape:group-hover:stroke-black group-hover:stroke-accent-blue transition-[stroke] duration-150'
        d='M12 12m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0'
      ></path>
      <path
        className='landscape:group-hover:stroke-black group-hover:stroke-accent-blue transition-[stroke] duration-150'
        d='M16.5 7.5l0 .01'
      ></path>
    </svg>
  )
}
