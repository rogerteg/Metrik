import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AnalyticsDashboard } from '../../src/components/AnalyticsDashboard';
import { TaskModel } from '../../src/types/kanban';

describe('AnalyticsDashboard Component (Feature 011 Integration)', () => {
  const sampleTasks: TaskModel[] = [
    {
      id: 't1',
      title: 'Task Alpha',
      column: 'done',
      createdAt: '2026-09-01T09:00:00Z',
      startedAt: '2026-09-02T09:00:00Z',
      completedAt: '2026-09-03T09:00:00Z',
    },
    {
      id: 't2',
      title: 'Task Beta',
      column: 'in_progress',
      createdAt: '2026-09-02T09:00:00Z',
      startedAt: '2026-09-03T09:00:00Z',
    },
    {
      id: 't3',
      title: 'Task Gamma',
      column: 'todo',
      createdAt: '2026-09-03T09:00:00Z',
    }
  ];

  it('renders summary metrics bar and all three analytics charts', () => {
    render(<AnalyticsDashboard tasks={sampleTasks} />);

    // Metrics Bar & Charts
    expect(screen.getAllByText(/Throughput/i).length).toBeGreaterThanOrEqual(2);
    expect(screen.getByText(/Lead Time Médio/i)).toBeInTheDocument();
    expect(screen.getByText(/Cycle Time Médio/i)).toBeInTheDocument();

    // Cumulative Flow Diagram
    expect(screen.getByText('Diagrama de Fluxo Cumulativo (CFD)')).toBeInTheDocument();
    expect(screen.getByTestId('cfd-svg')).toBeInTheDocument();

    // Throughput Chart
    expect(screen.getByText('Throughput (Últimos 14 dias)')).toBeInTheDocument();

    // Lead Time Scatter
    expect(screen.getByText(/Lead Time \(Dias\)/i)).toBeInTheDocument();
  });
});
