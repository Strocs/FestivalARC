import { ScheduleItem } from './ScheduleItem'
import type { GroupSlot } from './types'

interface ScheduleEventGroupProps {
  group: GroupSlot
  trackIndex: number
  trackColor: string
  trackName: string
}

export function ScheduleEventGroup({
  group,
  trackIndex,
  trackColor,
  trackName,
}: ScheduleEventGroupProps) {
  const adjustedStart = group.position.start * 2 + 3
  const adjustedSpan = group.position.span * 2 - 1

  const totalRows = group.position.span

  return (
    <div
      className='group relative bg-white/30'
      style={{
        gridRow: `${adjustedStart} / span ${adjustedSpan}`,
        gridColumn: trackIndex + 2,
      }}>
      <div
        className='grid h-full gap-[30px]'
        style={{
          gridTemplateRows: `repeat(${totalRows}, 200px)`,
          gridTemplateColumns: '1fr',
        }}>
        {group.slots.map((item, index) => {
          const internalAdjustedStart = item.position.start + 1
          const internalAdjustedSpan = item.position.span

          return (
            <div
              key={item.slot.id}
              className='pointer-events-none relative'
              style={{
                gridRow: `${internalAdjustedStart} / span ${internalAdjustedSpan}`,
                gridColumn: 1,
                zIndex: index,
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
                color={trackColor}
                location={trackName}
                stackOffset={index * 1.2}
              />
            </div>
          )
        })}
      </div>
    </div>
  )
}
