import { EventItem } from '../event/EventItem'
import { EventGroup } from '../event/EventGroup'
import { cn } from '@/features/shared/utils'
import type { UIColumn, UINestedColumn, UIColumns } from '../../types'
import { GridColumn } from './GridColumn'

interface GridColumnsProps {
  filteredRows: UIColumns[]
  rowsLength: number
  config: {
    columnWidth: number
    gapWidth: number
  }
}

function isGroupColumn(
  slot: UIColumn | UINestedColumn,
): slot is UINestedColumn {
  return slot.type === 'group'
}

export function GridColumns({
  filteredRows,
  rowsLength,
  config,
}: GridColumnsProps) {
  return filteredRows.map(({ header, column }) => {
    return (
      <GridColumn
        key={header.id}
        length={{
          columns: filteredRows.length,
          rows: rowsLength,
        }}
        header={header}
        config={config}>
        {column.map((item) => {
          if (isGroupColumn(item)) {
            return (
              <EventGroup
                key={`group-${header.id}-${item.position.start}`}
                group={item}
                header={{
                  id: header.id,
                  color: header.color,
                  name: header.name,
                }}
              />
            )
          }

          return (
            <div
              key={item.columnData.id}
              className={cn(
                'group relative',
                item.position.span > 1 && 'bg-25-white/30',
              )}
              style={{
                gridRow: `${item.position.start} / span ${item.position.span}`,
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
                location={header.name}
              />
            </div>
          )
        })}
      </GridColumn>
    )
  })
}
