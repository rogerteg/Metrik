import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThroughputAnalyticsView } from '../../src/components/ThroughputAnalyticsView';
import { TaskModel } from '../../src/types/kanban';

describe('ThroughputAnalyticsView Component (Feature 021)', () => {
  const mockTasks: TaskModel[] = [
    {
      id: 'task-1',
      title: 'Task 1',
      column: 'done',
      createdAt: '2026-09-01T10:00:00.000Z',
      completedAt: '2026-09-05T12:00:00.000Z',
    },
    {
      id: 'task-2',
      title: 'Task 2',
      column: 'done',
      createdAt: '2026-09-01T10:00:00.000Z',
      completedAt: '2026-09-05T15:00:00.000Z',
    },
    {
      id: 'task-3',
      title: 'Task 3',
      column: 'done',
      createdAt: '2026-09-02T10:00:00.000Z',
      completedAt: '2026-09-08T16:00:00.000Z',
    },
  ];

  it('renders empty guidance state when there are no completed tasks', () => {
    render(<ThroughputAnalyticsView tasks={[]} />);
    expect(screen.getByTestId('throughput-empty-state')).toBeInTheDocument();
    expect(screen.getByText(/Nenhuma Tarefa Concluída no Período/i)).toBeInTheDocument();
  });

  it('renders histogram, run chart and summary cards when tasks exist', () => {
    render(<ThroughputAnalyticsView tasks={mockTasks} />);
    
    expect(screen.getByTestId('throughput-analytics-view')).toBeInTheDocument();
    expect(screen.getByTestId('throughput-histogram-svg')).toBeInTheDocument();
    expect(screen.getByTestId('throughput-run-chart-svg')).toBeInTheDocument();
    
    // Resumo executivo presente
    expect(screen.getByText(/Total Concluído/i)).toBeInTheDocument();
    expect(screen.getByText(/Média Diária/i)).toBeInTheDocument();
    expect(screen.getByText(/85% \(SLE\)/i)).toBeInTheDocument();
    expect(screen.getByText(/95% \(Certeza\)/i)).toBeInTheDocument();
  });

  it('updates time window when user clicks a different period button', () => {
    render(<ThroughputAnalyticsView tasks={mockTasks} />);
    
    const btn60D = screen.getByRole('button', { name: '60D' });
    expect(btn60D).toBeInTheDocument();
    
    fireEvent.click(btn60D);
    expect(btn60D).toHaveClass('active');
  });
});
