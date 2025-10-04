
export interface GridData {
  readonly timeSlots: ReadonlyArray<string>
  readonly categories: ReadonlyArray<GridCategory>
  readonly rows: ReadonlyArray<GridRow>
}

export interface GridCategory {
  readonly id: string
  readonly name: string
  readonly color: string
}

export interface GridRow {
  readonly categoryId: string
  readonly cells: ReadonlyArray<GridCell>
}

export type GridCell =
  | { readonly type: 'event'; readonly data: GridEvent; readonly gridColumn: string }
  | { readonly type: 'empty' }

export interface GridEvent {
  readonly id: string
  readonly title: string
  readonly description: string
  readonly startTime: string
  readonly endTime: string
  readonly span: number
  readonly metadata?: Record<string, unknown>
}
