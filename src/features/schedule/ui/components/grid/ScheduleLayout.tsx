'use server'

import { Sidebar } from '../sidebar'
import { GridColumn } from './GridColumn'
import { GridTimeSlots } from './GridTimeSlots'
import type { UIScheduleDay } from '../../types'
import { FloatingButton } from '../general/FloatingButton'
import { GridSchedule } from './GridSchedule'
import { ColumnsProvider } from '../../stores/schedule-columns-store'
import { DaysProvider } from '../../stores/days-store'

interface ScheduleLayoutProps {
  groups: UIScheduleDay[]
}

export function ScheduleLayout({ groups }: ScheduleLayoutProps) {
  // Initial Data
  const initialDay = 0 // Allow get this from implementation
  const { timeColumn, columns, headerRow: stages } = groups[initialDay].data
  const listOfColumns = groups.map((group) => group.data.columns)

  const days = groups
    .map((day) => day.label)
    .filter((label) => label) as string[]

  return (
    <section className='relative flex flex-col gap-4 overflow-x-clip py-4 [--header-height:50px] [--item-height:180px] md:w-full md:[--header-height:60px] md:[--item-height:200px]'>
      <div className='flex w-screen flex-col flex-nowrap gap-2 md:flex-row md:gap-4'>
        <ColumnsProvider columns={columns}>
          <DaysProvider days={days}>
            <Sidebar stages={stages} />
            <section className='-mt-[150px] flex gap-2 md:mt-auto'>
              {/* Time Column */}
              <GridColumn length={{ rows: timeColumn.length, columns: 1 }}>
                <GridTimeSlots timeColumn={timeColumn} />
              </GridColumn>

              {/* Schedule Grid */}
              <section className='flex-1 overflow-x-clip'>
                <GridSchedule
                  groups={listOfColumns}
                  rowsLenght={timeColumn.length}
                />
              </section>
            </section>
          </DaysProvider>
        </ColumnsProvider>
      </div>

      <FloatingButton label='Volver arriba' />
    </section>
  )
}
