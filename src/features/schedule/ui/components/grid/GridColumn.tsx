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
    <section
      className='relative grid gap-6'
      style={{
        gridTemplateRows: `60px repeat(${length.rows}, 200px)`,
        contentVisibility: config ? 'auto' : 'visible',
        containIntrinsicSize: config
          ? `${config.columnWidth + config.gapWidth / 2} ${length.columns * config.columnWidth + config.gapWidth}px`
          : 'auto',
      }}>
      <span
        className={cn(
          header &&
            'text-25-white font-neris flex h-full items-center justify-center p-2 text-center text-xl leading-none font-bold capitalize',
        )}
        style={{ backgroundColor: header?.color || 'transparent' }}>
        {header?.name} {header?.category && ` - ${header?.category}`}
      </span>
      {children}
    </section>
  )
}
