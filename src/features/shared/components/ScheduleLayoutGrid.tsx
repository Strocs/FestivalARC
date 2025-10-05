import { Fragment } from '@astrojs/react/jsx-runtime'

export interface ScheduleLayoutGridProps {
  data: {
    timeSlots: string[]
    rows: {
      track: {
        id: string
        name: string
        color: string
      }
      cells: {
        span: number
        cell?: {
          id: string
          trackId: string
          header: {
            title: string
            subTitle: string
          }
          body: {
            duration?: string
            location?: {
              name: string
              url?: string
            }
            time: {
              start: string
              end: string
            }
          }
          footer: {
            infoButton?: string
            inscription?: string
          }
          labels?: {
            left?: string
            right?: string
          }
        }
      }[]
    }[]
  }
}

const getOrientation = {
  horizontal: {
    template: (columns: number) => ({
      gridTemplateColumns: `250px repeat(${columns}, minmax(280px, 1fr))`,
    }),
    span: (span: number) => ({
      gridColumn: `span ${span}`,
    }),
  },
  vertical: {
    template: (rows: number, columns: number) => ({
      gridTemplateRows: `80px repeat(${rows}, minmax(120px, 1fr))`,
      gridTemplateColumns: `250px repeat(${columns}, minmax(280px, 1fr))`,
    }),
    span: (span: number) => ({
      gridRow: `span ${span}`,
    }),
  },
}

export function ScheduleLayoutGrid({ data }: ScheduleLayoutGridProps) {
  const { timeSlots, rows } = data
  const orientation = 'horizontal'

  return (
    <div className='w-full overflow-x-auto py-4'>
      <div
        className='grid min-w-[800px] gap-2'
        style={{
          ...getOrientation[orientation].template(timeSlots.length),
        }}>
        <div className='flex items-center justify-center rounded-lg bg-[#170d19] p-3 text-center text-sm font-bold text-white'>
          Escenario / Hora
        </div>

        {timeSlots.map((slot) => (
          <div
            key={slot}
            className='flex items-center justify-center rounded-lg bg-[#170d19] p-3 text-center font-bold text-white'>
            {slot}
          </div>
        ))}

        {rows.map(({ track, cells }) => {
          return (
            <Fragment key={track.id}>
              {/* Header */}
              <div
                key={track.id}
                className='rounded-lg py-4 text-center font-bold text-white'
                style={{ background: `${track.color}`, gridColumn: 1 }}>
                {track.name}
              </div>

              {cells.map(({ span, cell }, index) => {
                if (!cell)
                  return (
                    <div
                      key={'empty-' + span + index}
                      style={{
                        ...getOrientation[orientation].span(span),
                      }}></div>
                  )

                return (
                  <div
                    key={cell.trackId + '-' + cell.id}
                    className='rounded-lg border-2 bg-white p-3'
                    style={{ ...getOrientation[orientation].span(span) }}>
                    <div className='flex h-full flex-col gap-2'>
                      <h3 className='m-0 text-lg font-bold text-[#170d19]'>
                        {cell.header.title}
                      </h3>
                      <p className='m-0 text-xs font-semibold text-gray-400'>
                        {cell.body.time.start} - {cell.body.time.end}
                      </p>
                    </div>
                  </div>
                )
              })}
            </Fragment>
          )
        })}
      </div>
    </div>
  )
}
