import { EventItem } from '../event/EventItem'
import { EventGroup } from '../event/EventGroup'
import { cn } from '@/features/shared/utils'
import type { IndividualSlot, GroupSlot } from '../../types'
import { GridColumn } from './GridColumn'

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

interface GridEventsProps {
  filteredRows: FilteredRow[]
  tracks: Track[]
  rowsLength: number
}

function isGroupSlot(slot: IndividualSlot | GroupSlot): slot is GroupSlot {
  return slot.type === 'group'
}

export function GridEvents({
  filteredRows,
  tracks,
  rowsLength,
}: GridEventsProps) {
  return filteredRows.map(({ track, slots }, trackIndex) => {
    return (
      <GridColumn key={track.id} rowsLength={rowsLength} header={track}>
        {slots.map((item) => {
          if (isGroupSlot(item)) {
            return (
              <EventGroup
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
              <EventItem
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
      </GridColumn>
    )
  })
}
