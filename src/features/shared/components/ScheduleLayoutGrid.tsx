import { Fragment, useMemo } from 'react'
import { ScheduleSidebar, useStageSelection } from './ScheduleSidebar'
import { ScheduleItem } from './ScheduleItem'
import { cn } from '../utils'

export interface ScheduleLayoutGridProps {
  timeSlots: string[]
  rows: {
    track: {
      id: string
      name: string
      color: string
      order: number
      category?: string
    }
    slots: {
      position: {
        start: number
        span: number
      }
      slot: {
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

export function ScheduleLayoutGrid({
  timeSlots,
  rows,
}: ScheduleLayoutGridProps) {
  const stages = useMemo(() => {
    return rows.map(({ track }) => track)
  }, [rows])

  const { selectedStageIds, setSelectedStageIds } = useStageSelection(stages)

  const filteredRows = useMemo(() => {
    return rows.filter((row) => selectedStageIds.includes(row.track.id))
  }, [rows, selectedStageIds])

  const tracks = filteredRows.map((row) => row.track)

  return (
    <div className='flex gap-4 py-4'>
      <ScheduleSidebar
        stages={stages}
        selectedStageIds={selectedStageIds}
        onStageSelectionChange={setSelectedStageIds}
      />

      <div className='flex-1'>
        <div
          className='font-neris grid max-w-[320px] min-w-[300px] gap-x-2 gap-y-6'
          style={{
            gridTemplateRows: `40px repeat(${timeSlots.length}, minmax(100px, 1fr))`,
            gridTemplateColumns: `70px repeat(${tracks.length}, minmax(320px, 1fr))`,
          }}>
          <div className='text-25-white bg-25-black flex items-center justify-center text-center font-bold'>
            Horario
          </div>

          {tracks.map((track) => (
            <div
              key={track.id}
              className='text-25-white flex items-center justify-center text-center font-bold'
              style={{ backgroundColor: track.color }}>
              {track.name} {track.category && ` - ${track.category}`}
            </div>
          ))}

          {timeSlots.map((time, index) => (
            <time
              dateTime={time}
              className='font-nerus text-25-white -mt-4 text-2xl font-bold'
              key={time + index}
              style={{ gridRow: index + 2, gridColumn: 1 }}>
              {time}
            </time>
          ))}

          {filteredRows.map(({ track, slots }, trackIndex) => {
            return (
              <Fragment key={track.id}>
                {slots.map((item) => {
                  return (
                    <div
                      key={item.slot.trackId + '-' + item.slot.id}
                      className={cn(
                        'relative',
                        item.position.span > 1 && 'bg-white/30',
                      )}
                      style={{
                        gridRow: `${item.position.start + 2} / span ${item.position.span}`,
                        gridColumn: trackIndex + 2,
                      }}>
                      <ScheduleItem
                        id={item.slot.id}
                        trackId={item.slot.trackId}
                        eventTime={{
                          start: item.slot.body.time.start,
                          end: item.slot.body.time.end,
                        }}
                        header={item.slot.header}
                        footer={{
                          leftButton: item.slot.footer.infoButton,
                          rightLink: item.slot.footer.inscription,
                        }}
                        activityType={item.slot.labels?.left}
                        duration={item.slot.body.duration}
                        color={tracks[trackIndex].color}
                        location={tracks[trackIndex].name.split('(')[0]}
                      />
                    </div>
                  )
                })}
              </Fragment>
            )
          })}
        </div>
      </div>
    </div>
  )
}
