import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ScheduleLayout } from '../components/grid/ScheduleLayout'
import type { UIScheduleDay } from '../types'

describe('FASE 0: Setup - Baseline Tests', () => {
  const mockData: { groups: UIScheduleDay[] } = {
    groups: [
      {
        data: {
          timeColumn: ['10:00', '11:00', '12:00'],
          headerRow: [
            { id: 'stage-1', name: 'Stage 1', color: '#FF0000', order: 1 },
            { id: 'stage-2', name: 'Stage 2', color: '#00FF00', order: 2 },
          ],
          columns: [
            {
              header: {
                id: 'stage-1',
                name: 'Stage 1',
                color: '#FF0000',
                order: 1,
              },
              column: [
                {
                  type: 'individual',
                  position: { start: 2, span: 2 },
                  columnData: {
                    id: 'event-1',
                    header: {
                      title: 'Event 1',
                      subTitle: 'Artist 1',
                    },
                    body: {
                      time: {
                        start: '10:00',
                        end: '11:00',
                      },
                    },
                    footer: {},
                  },
                },
              ],
            },
            {
              header: {
                id: 'stage-2',
                name: 'Stage 2',
                color: '#00FF00',
                order: 2,
              },
              column: [
                {
                  type: 'individual',
                  position: { start: 2, span: 2 },
                  columnData: {
                    id: 'event-2',
                    header: {
                      title: 'Event 2',
                      subTitle: 'Artist 2',
                    },
                    body: {
                      time: {
                        start: '10:00',
                        end: '11:00',
                      },
                    },
                    footer: {},
                  },
                },
              ],
            },
          ],
        },
      },
    ],
  }
  it('should render ScheduleLayout without errors', () => {
    expect(() => {
      render(<ScheduleLayout {...mockData} />)
    }).not.toThrow()
  })

  it('should render stage headers', () => {
    render(<ScheduleLayout {...mockData} />)
    const stage1Elements = screen.getAllByText('Stage 1')
    const stage2Elements = screen.getAllByText('Stage 2')
    expect(stage1Elements.length).toBeGreaterThan(0)
    expect(stage2Elements.length).toBeGreaterThan(0)
  })

  it('should render events', () => {
    render(<ScheduleLayout {...mockData} />)
    expect(screen.getByText('Event 1')).toBeInTheDocument()
    expect(screen.getByText('Event 2')).toBeInTheDocument()
  })

  it('should render time slots', () => {
    render(<ScheduleLayout {...mockData} />)
    expect(screen.getByText('10:00')).toBeInTheDocument()
    expect(screen.getByText('11:00')).toBeInTheDocument()
  })

  it('should render sidebar with stage selection', () => {
    render(<ScheduleLayout {...mockData} />)
    const sidebar = screen.getByRole('complementary')
    expect(sidebar).toBeInTheDocument()
  })
})
