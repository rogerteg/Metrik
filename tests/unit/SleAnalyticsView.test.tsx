import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SleAnalyticsView } from '../../src/components/SleAnalyticsView';
import { TaskModel } from '../../src/types/kanban';
import { ServiceLevelExpectation } from '../../src/types/analytics';

describe('SleAnalyticsView component (Feature 030)', () => {
  const mockTasks: TaskModel[] = [
    {
      id: 't1',
      title: 'Fast task',
      column: 'done',
      createdAt: '2026-09-01T00:00:00Z',
      completedAt: '2026-09-03T00:00:00Z', // 2 days
    },
    {
      id: 't2',
      title: 'Slow task',
      column: 'done',
      createdAt: '2026-09-01T00:00:00Z',
      completedAt: '2026-09-12T00:00:00Z', // 11 days
    },
  ];

  const mockSle: ServiceLevelExpectation = {
    targetPercentile: 85,
    observedDays: 9.7,
    targetDays: 7,
    complianceRate: 50,
    sampleSize: 2,
    calculatedAt: '2026-09-17T12:00:00Z',
  };

  it('renders SLE headline indicators and compliance metrics', () => {
    render(
      <SleAnalyticsView
        tasks={mockTasks}
        sle={mockSle}
      />
    );

    expect(screen.getByText(/Expectativas de Nível de Serviço \(SLEs\)/i)).toBeInTheDocument();
    expect(screen.getByTestId('sle-observed-metric')).toHaveTextContent('9.7d');
    expect(screen.getByTestId('sle-compliance-metric')).toHaveTextContent('50%');
    expect(screen.getByText(/Amostra de 2 tarefas concluídas/i)).toBeInTheDocument();
  });

  it('allows updating target days via input', () => {
    const handleUpdateTarget = vi.fn();
    render(
      <SleAnalyticsView
        tasks={mockTasks}
        sle={mockSle}
        onUpdateTargetDays={handleUpdateTarget}
      />
    );

    const input = screen.getByTestId('target-days-input');
    fireEvent.change(input, { target: { value: '10' } });

    expect(handleUpdateTarget).toHaveBeenCalledWith(10);
  });
});
