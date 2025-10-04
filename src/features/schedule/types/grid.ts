import type { Track } from './models'

export interface GridData {
  readonly timeSlots: ReadonlyArray<string>
  readonly trackSlots: ReadonlyArray<Track>
  readonly rows: ReadonlyArray<Row>
}

export interface Row {
  readonly trackId: string
  readonly cells: ReadonlyArray<Cell>
}

export type Cell = {
  readonly cell: number
  readonly data?: Event
}
