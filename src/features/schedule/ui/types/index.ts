export interface UIColumnItem {
  id: string
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

export type UIColumn = {
  type?: 'individual' | 'group'
  position: {
    start: number
    span: number
  }
  columnData: UIColumnItem
}

export interface UINestedColumn extends Omit<UIColumn, 'columnData'> {
  columnData: Omit<UIColumn, 'type'>[]
}

export interface UIHeaderItem {
  id: string
  name: string
  color: string
  order: number
  category?: string
}

export interface UIColumns {
  header: UIHeaderItem
  column: (UIColumn | UINestedColumn)[]
}

export interface UIGridLayout {
  timeColumn: ReadonlyArray<string>
  headerRow: ReadonlyArray<UIHeaderItem>
  columns: UIColumns[]
}
