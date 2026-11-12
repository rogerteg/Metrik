import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import CascadeImpactGraphView from '../../src/components/MonteCarlo/CascadeImpactGraphView';
import { TaskModel } from '../../src/types/kanban';

describe('CascadeImpactGraphView (Feature 058 - US1)', () => {
  const sampleTasks: TaskModel[] = [
    {
      id: 'task-root',
      title: 'Bloqueio no Gateway de Pagamento',
      column: 'col-dev',
      createdAt: new Date(Date.now() - 6 * 86400000).toISOString(),
      blocked: true,
      blockedAt: new Date(Date.now() - 5 * 86400000).toISOString(),
      links: [
        {
          id: 'l1',
          targetTaskId: 'task-dep-1',
          relationType: 'blocks',
          targetBoardId: 'b1',
          targetTeamId: 't1',
          createdAt: new Date().toISOString(),
        },
      ],
    },
    {
      id: 'task-dep-1',
      title: 'Checkout Transparente',
      column: 'col-dev',
      createdAt: new Date(Date.now() - 4 * 86400000).toISOString(),
      links: [
        {
          id: 'l2',
          targetTaskId: 'task-dep-2',
          relationType: 'blocks',
          targetBoardId: 'b1',
          targetTeamId: 't1',
          createdAt: new Date().toISOString(),
        },
      ],
    },
    {
      id: 'task-dep-2',
      title: 'Emissão de Nota Fiscal',
      column: 'col-todo',
      createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    },
  ];

  it('renders positive empty state when no tasks are blocked', () => {
    render(<CascadeImpactGraphView tasks={[]} />);
    expect(screen.getByText(/Nenhum impedimento ativo em cascata/i)).toBeInTheDocument();
  });

  it('displays root blocked task, cost of delay badge and dependent tasks', () => {
    const onSelectTask = vi.fn();
    render(
      <CascadeImpactGraphView
        tasks={sampleTasks}
        selectedTaskId="task-root"
        onSelectTask={onSelectTask}
      />,
    );

    expect(screen.getByText(/Bloqueio no Gateway de Pagamento/i)).toBeInTheDocument();
    expect(screen.getByText(/Custo do Atraso Estimado/i)).toBeInTheDocument();
    expect(screen.getByText(/Checkout Transparente/i)).toBeInTheDocument();
    expect(screen.getByText(/Emissão de Nota Fiscal/i)).toBeInTheDocument();

    const chip = screen.getByText('#task-dep-1');
    fireEvent.click(chip);
    expect(onSelectTask).toHaveBeenCalledWith('task-dep-1');
  });

  it('displays circular dependency alert when cycle is detected', () => {
    const cyclicTasks: TaskModel[] = [
      {
        id: 'cycle-1',
        title: 'Tarefa A',
        column: 'col-dev',
        blocked: true,
        createdAt: new Date().toISOString(),
        links: [
          {
            id: 'la',
            targetTaskId: 'cycle-2',
            relationType: 'blocks',
            targetBoardId: 'b1',
            targetTeamId: 't1',
            createdAt: '',
          },
        ],
      },
      {
        id: 'cycle-2',
        title: 'Tarefa B',
        column: 'col-dev',
        createdAt: new Date().toISOString(),
        links: [
          {
            id: 'lb',
            targetTaskId: 'cycle-1',
            relationType: 'blocks',
            targetBoardId: 'b1',
            targetTeamId: 't1',
            createdAt: '',
          },
        ],
      },
    ];

    render(<CascadeImpactGraphView tasks={cyclicTasks} selectedTaskId="cycle-1" />);
    expect(screen.getByText(/Dependência circular detectada/i)).toBeInTheDocument();
  });
});
