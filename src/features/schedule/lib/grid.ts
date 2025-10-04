import type { GridData, GridRow, GridCell, GridCategory } from '../types'
import type { ProcessedSchedule } from './schedule'
import { generateTimeSlots, calculateSpan, toMinutes } from '../utils'

export function buildGridData(processed: ProcessedSchedule): GridData {
  const { input, eventsByCategory } = processed
  const { startTime, endTime, intervalMinutes } = input.timeConfig
  
  const timeSlots = generateTimeSlots(startTime, endTime, intervalMinutes)
  
  const categories: GridCategory[] = [...input.categories]
    .sort((a, b) => a.order - b.order)
    .map(cat => ({
      id: cat.id,
      name: cat.name,
      color: cat.color
    }))
  
  const rows: GridRow[] = categories.map(category => {
    const events = eventsByCategory.get(category.id) || []
    const cells = buildCellsForCategory(events, timeSlots, intervalMinutes)
    
    return {
      categoryId: category.id,
      cells
    }
  })
  
  return {
    timeSlots,
    categories,
    rows
  }
}

function buildCellsForCategory(
  events: ReadonlyArray<ProcessedSchedule['input']['events'][number]>,
  timeSlots: string[],
  intervalMinutes: number
): GridCell[] {
  const cells: GridCell[] = new Array(timeSlots.length).fill(null).map(() => ({ type: 'empty' }))
  
  const sortedEvents = [...events].sort((a, b) => 
    toMinutes(a.startTime) - toMinutes(b.startTime)
  )
  
  for (const event of sortedEvents) {
    const eventStartMinutes = toMinutes(event.startTime)
    const slotStartMinutes = toMinutes(timeSlots[0])
    
    const slotIndex = Math.floor((eventStartMinutes - slotStartMinutes) / intervalMinutes)
    
    if (slotIndex >= 0 && slotIndex < cells.length) {
      const span = calculateSpan(event.startTime, event.endTime, intervalMinutes)
      
      cells[slotIndex] = {
        type: 'event',
        gridColumn: `span ${span}`,
        data: {
          id: event.id,
          title: event.title,
          description: event.description,
          startTime: event.startTime,
          endTime: event.endTime,
          span,
          metadata: event.metadata
        }
      }
    }
  }
  
  return cells
}
