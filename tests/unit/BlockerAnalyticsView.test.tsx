import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BlockerAnalyticsView } from '../../src/components/BlockerAnalyticsView';
import { BlockerDynamicsSummary } from '../../src/types/analytics';
import { TaskModel } from '../../src/types/kanban';

describe('BlockerAnalyticsView component (Feature 030)', () => {
  const dayMs = 24 * 60 * 60 * 1000;

  const mockTasks: TaskModel[] = [
    {
      id: 't1',
      title: 'Tarefa Bloqueada por Dependência',
      column: 'in_progress',
      createdAt: '2026-09-01T00:00:00Z',
      blocked: true,
      blockedReason: 'Dependência de API',
      totalBlockedMs: 2 * dayMs,
    },
    {
      id: 't2',
      title: 'Tarefa Bloqueada por Aprovação',
      column: 'done',
      createdAt: '2026-09-01T00:00:00Z',
      completedAt: '2026-09-05T00:00:00Z',
      blocked: false,
      blockedReason: 'Aprovação de Compliance',
      totalBlockedMs: 3 * dayMs,
    },
  ];

  const mockSummary: BlockerDynamicsSummary = {
    totalBlockedTasks: 2,
    accumulatedBlockedMs: 5 * dayMs,
    impactOnLeadTimePercentage: 45.5,
    clusters: [
      {
        reason: 'Aprovação de Compliance',
        occurrenceCount: 1,
        percentage: 50,
        totalDurationMs: 3 * dayMs,
        avgDurationDays: 3,
      },
      {
        reason: 'Dependência de API',
        occurrenceCount: 1,
        percentage: 50,
        totalDurationMs: 2 * dayMs,
        avgDurationDays: 2,
      },
    ],
  };

  it('renders clustering mode by default with cause breakdown', () => {
    render(
      <BlockerAnalyticsView
        tasks={mockTasks}
        summary={mockSummary}
        mode="clustering"
        onSelectMode={vi.fn()}
      />
    );

    expect(screen.getByRole('button', { name: /Blocker Clustering/i })).toBeInTheDocument();
    expect(screen.getByText('Aprovação de Compliance')).toBeInTheDocument();
    expect(screen.getByText('Dependência de API')).toBeInTheDocument();
    expect(screen.getAllByText(/50%/i).length).toBeGreaterThanOrEqual(2);
  });

  it('renders dynamics mode with accumulated time and lead time impact', () => {
    render(
      <BlockerAnalyticsView
        tasks={mockTasks}
        summary={mockSummary}
        mode="dynamics"
        onSelectMode={vi.fn()}
      />
    );

    expect(screen.getByRole('button', { name: /Blocker Dynamics/i })).toBeInTheDocument();
    expect(screen.getByTestId('metric-total-blocked')).toHaveTextContent('2');
    expect(screen.getByTestId('metric-impact-percentage')).toHaveTextContent('45.5%');
    expect(screen.getByText('Tarefa Bloqueada por Dependência')).toBeInTheDocument();
  });

  it('allows toggling between clustering and dynamics modes', () => {
    const handleSelectMode = vi.fn();
    render(
      <BlockerAnalyticsView
        tasks={mockTasks}
        summary={mockSummary}
        mode="clustering"
        onSelectMode={handleSelectMode}
      />
    );

    const dynamicsTab = screen.getByRole('button', { name: /Blocker Dynamics/i });
    fireEvent.click(dynamicsTab);

    expect(handleSelectMode).toHaveBeenCalledWith('dynamics');
  });
});
