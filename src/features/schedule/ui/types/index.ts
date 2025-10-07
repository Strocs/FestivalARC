export interface SlotData {
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

export type IndividualSlot = {
  type?: 'individual'
  position: {
    start: number
    span: number
  }
  slot: SlotData
}

export type GroupSlot = {
  type: 'group'
  position: {
    start: number
    span: number
  }
  slots: {
    position: {
      start: number
      span: number
    }
    slot: SlotData
  }[]
}

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
    slots: (IndividualSlot | GroupSlot)[]
  }[]
}
