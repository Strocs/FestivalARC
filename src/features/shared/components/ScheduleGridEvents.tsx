import { ScheduleItem } from './ScheduleItem'
import { ScheduleEventGroup } from './ScheduleEventGroup'
import { cn } from '../utils'
import type { IndividualSlot, GroupSlot } from './types'
import { ScheduleGridColumn } from './ScheduleGridColumn'

interface Track {
  id: string
  name: string
  color: string
  category?: string
}

interface FilteredRow {
  track: Track
  slots: (IndividualSlot | GroupSlot)[]
}

interface ScheduleGridEventsProps {
  filteredRows: FilteredRow[]
  tracks: Track[]
  rowsLength: number
}

function isGroupSlot(slot: IndividualSlot | GroupSlot): slot is GroupSlot {
  return slot.type === 'group'
}

export function ScheduleGridEvents({
  filteredRows,
  tracks,
  rowsLength,
}: ScheduleGridEventsProps) {
  return filteredRows.map(({ track, slots }, trackIndex) => {
    return (
      <ScheduleGridColumn key={track.id} rowsLength={rowsLength} header={track}>
        {slots.map((item) => {
          if (isGroupSlot(item)) {
            return (
              <ScheduleEventGroup
                key={`group-${track.id}-${item.position.start}`}
                group={item}
                trackColor={tracks[trackIndex].color}
                trackName={tracks[trackIndex].name}
              />
            )
          }

          const adjustedStart = item.position.start + 2
          const adjustedSpan = item.position.span

          return (
            <div
              key={item.slot.trackId + '-' + item.slot.id}
              className={cn(
                'group relative',
                item.position.span > 1 && 'bg-25-white/30',
              )}
              style={{
                gridRow: `${adjustedStart} / span ${adjustedSpan}`,
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
                location={tracks[trackIndex].name}
              />
            </div>
          )
        })}
      </ScheduleGridColumn>
    )
  })
}
