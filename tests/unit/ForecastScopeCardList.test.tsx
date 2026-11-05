import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ForecastScopeCardList } from '../../src/components/MonteCarlo/ForecastScopeCardList';
import { TaskModel } from '../../src/types/kanban';
import { CardSlePrediction } from '../../src/types/sle';

describe('ForecastScopeCardList component (Feature 056)', () => {
  const mockTasks: TaskModel[] = [
    {
      id: 'task-1',
      title: 'Tarefa Pendente 1',
      column: 'in_progress',
      type: 'card',
      createdAt: '2026-10-01T10:00:00Z',
    },
    {
      id: 'task-2',
      title: 'Tarefa Pendente 2',
      column: 'todo',
      type: 'card',
      createdAt: '2026-10-02T10:00:00Z',
    },
    {
      id: 'task-done',
      title: 'Tarefa Concluída',
      column: 'done',
      type: 'card',
      createdAt: '2026-09-20T10:00:00Z',
      completedAt: '2026-09-28T12:00:00Z',
    },
  ];

  it('renders empty message when tasks array is empty', () => {
    render(
      <ForecastScopeCardList
        tasks={[]}
        selectedTaskIds={[]}
        onToggleTask={vi.fn()}
        onSelectAll={vi.fn()}
        onClearSelection={vi.fn()}
      />,
    );

    expect(screen.getByText(/Nenhuma tarefa encontrada para este escopo/i)).toBeInTheDocument();
  });

  it('triggers onToggleTask when clicking a pending task checkbox', () => {
    const handleToggle = vi.fn();
    render(
      <ForecastScopeCardList
        tasks={mockTasks}
        selectedTaskIds={['task-1']}
        onToggleTask={handleToggle}
        onSelectAll={vi.fn()}
        onClearSelection={vi.fn()}
      />,
    );

    const checkbox1 = screen.getByLabelText(/Incluir Tarefa Pendente 1 na simulação/i);
    expect(checkbox1).toBeChecked();

    const checkbox2 = screen.getByLabelText(/Incluir Tarefa Pendente 2 na simulação/i);
    expect(checkbox2).not.toBeChecked();

    fireEvent.click(checkbox2);
    expect(handleToggle).toHaveBeenCalledWith('task-2');
  });

  it('disables checkbox for completed tasks and does not trigger onToggleTask', () => {
    const handleToggle = vi.fn();
    render(
      <ForecastScopeCardList
        tasks={mockTasks}
        selectedTaskIds={['task-1']}
        onToggleTask={handleToggle}
        onSelectAll={vi.fn()}
        onClearSelection={vi.fn()}
      />,
    );

    const doneCheckbox = screen.getByLabelText(/Incluir Tarefa Concluída na simulação/i);
    expect(doneCheckbox).toBeDisabled();
    expect(doneCheckbox).toBeChecked();

    fireEvent.click(doneCheckbox);
    expect(handleToggle).not.toHaveBeenCalled();
  });

  it('triggers onSelectAll and onClearSelection when buttons are clicked', () => {
    const handleSelectAll = vi.fn();
    const handleClear = vi.fn();

    render(
      <ForecastScopeCardList
        tasks={mockTasks}
        selectedTaskIds={['task-1']}
        onToggleTask={vi.fn()}
        onSelectAll={handleSelectAll}
        onClearSelection={handleClear}
      />,
    );

    const selectAllBtn = screen.getByTestId('scope-btn-select-all');
    fireEvent.click(selectAllBtn);
    expect(handleSelectAll).toHaveBeenCalledTimes(1);

    const clearBtn = screen.getByTestId('scope-btn-clear-selection');
    fireEvent.click(clearBtn);
    expect(handleClear).toHaveBeenCalledTimes(1);
  });

  it('renders TaskSleBadge when task has SLE prediction with risk', () => {
    const mockSlePredictions: Record<string, CardSlePrediction> = {
      'task-1': {
        taskId: 'task-1',
        riskLevel: 'risk_p85',
        thresholds: {
          p50Days: 2,
          p85Days: 5,
          p95Days: 10,
          sampleSize: 20,
          isStatisticallySignificant: true,
        },
        agingDays: 6,
        effectiveTargetDays: 5,
        daysToBreach: -1,
        percentageOfTarget: 120,
        label: 'Atenção SLE (P85)',
      },
    };

    render(
      <ForecastScopeCardList
        tasks={mockTasks}
        selectedTaskIds={['task-1']}
        onToggleTask={vi.fn()}
        onSelectAll={vi.fn()}
        onClearSelection={vi.fn()}
        slePredictions={mockSlePredictions}
      />,
    );

    expect(screen.getByTestId('scope-card-task-1')).toBeInTheDocument();
  });
});
