import { cn } from '@/features/shared/utils'
import type { UIHeaderItem } from '../../types'

interface GridColumnProps {
  length: {
    rows: number
    columns: number
  }
  children: React.ReactNode
  header?: UIHeaderItem
  config?: {
    columnWidth: number
    gapWidth: number
  }
}

export function GridColumn({
  length,
  children,
  header,
  config,
}: GridColumnProps) {
  return (
    <ul
      className='relative grid gap-6'
      style={{
        gridTemplateRows: `60px repeat(${length.rows}, 200px)`,
        contentVisibility: config ? 'auto' : 'visible',
        containIntrinsicSize: config
          ? `${config.columnWidth + config.gapWidth / 2} ${length.columns * config.columnWidth + config.gapWidth}px`
          : 'auto',
      }}>
      {header ? (
        <li
          className={cn(
            header &&
              'font-neris sticky top-4 z-50 flex h-full flex-col justify-center rounded text-center font-bold capitalize',
          )}
          style={{ backgroundColor: header.color }}>
          <h2 className='text-2xl leading-none text-[#f7f7f7]'>
            {header.name}
          </h2>
          {header.category && (
            <>
              <span className='text-25-white/90 block text-lg leading-none'>
                {header.category}
              </span>
            </>
          )}
        </li>
      ) : (
        <div className='opacity-0'></div>
      )}
      {children}
    </ul>
  )
}
