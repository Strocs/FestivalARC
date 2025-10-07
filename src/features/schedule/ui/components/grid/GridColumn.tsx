import { cn } from '@/features/shared/utils'

interface Track {
  id: string
  name: string
  color: string
  category?: string
}

interface GridColumnProps {
  rowsLength: number
  children: React.ReactNode
  header?: Track
}

export function GridColumn({ rowsLength, children, header }: GridColumnProps) {
  return (
    <section
      className='relative grid gap-6'
      style={{
        gridTemplateRows: `40px repeat(${rowsLength}, 200px)`,
      }}>
      <span
        className={cn(
          header &&
            'text-25-white flex h-full items-center justify-center text-center font-bold capitalize',
        )}
        style={{ backgroundColor: header?.color || 'transparent' }}>
        {header?.name} {header?.category && ` - ${header?.category}`}
      </span>
      {children}
    </section>
  )
}
