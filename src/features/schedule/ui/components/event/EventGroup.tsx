import { EventItem } from './EventItem'
import type { UIHeaderItem, UINestedColumn } from '../../types'

interface EventGroupProps {
  group: UINestedColumn
  header: UIHeaderItem
}

export function EventGroup({ group, header }: EventGroupProps) {
  const totalRows = group.position.span

  return (
    <li
      className='group relative bg-white/30'
      style={{
        gridRow: `${group.position.start} / span ${group.position.span}`,
      }}>
      <ul
        className='grid h-full gap-6'
        style={{
          gridTemplateRows: `repeat(${totalRows}, 200px)`,
        }}>
        {group.columnData.map((item, index) => {
          return (
            <li
              key={item.columnData.id}
              className='pointer-events-none relative rounded'
              style={{
                gridRow: `${item.position.start} / span ${item.position.span}`,
                gridColumn: 1,
                zIndex: index,
              }}>
              <EventItem
                id={item.columnData.id}
                trackId={header.id}
                eventTime={{
                  start: item.columnData.body.time.start,
                  end: item.columnData.body.time.end,
                }}
                header={item.columnData.header}
                footer={{
                  leftButton: item.columnData.footer.infoButton,
                  rightLink: item.columnData.footer.inscription,
                }}
                activityType={item.columnData.labels?.left}
                duration={item.columnData.body.duration}
                color={header.color}
                location={header.category || header.name}
                stackOffset={index * 1.2}
              />
            </li>
          )
        })}
      </ul>
    </li>
  )
}
