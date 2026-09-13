import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DependencySoftBlockModal } from '../../src/components/DependencySoftBlockModal';
import { CrossSquadTaskSummary } from '../../src/types/taskTypes';

describe('Feature 024 - User Story 4: DependencySoftBlockModal Component', () => {
  const blockingTasks: CrossSquadTaskSummary[] = [
    {
      taskId: 'block-1',
      taskTitle: 'Endpoint de Pagamentos Backend',
      taskType: 'card',
      columnId: 'col-doing',
      columnTitle: 'Em Progresso',
      columnCategory: 'in_progress',
      boardId: 'b-back',
      boardName: 'Quadro Backend',
      teamId: 't-back',
      teamName: 'Squad Backend',
      isExternalSquad: true,
      isDone: false,
    },
  ];

  it('renders modal with warning message and list of pending blockers', () => {
    render(
      <DependencySoftBlockModal
        isOpen={true}
        taskTitle="Checkout SPA Web"
        blockingTasks={blockingTasks}
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />
    );

    expect(screen.getByText(/Dependência Pendente/i)).toBeInTheDocument();
    expect(screen.getByText(/Checkout SPA Web/i)).toBeInTheDocument();
    expect(screen.getByText(/Endpoint de Pagamentos Backend/i)).toBeInTheDocument();
    expect(screen.getByText(/Squad Backend/i)).toBeInTheDocument();
  });

  it('calls onCancel when clicking Cancelar button', () => {
    const onCancel = vi.fn();
    render(
      <DependencySoftBlockModal
        isOpen={true}
        taskTitle="Checkout SPA Web"
        blockingTasks={blockingTasks}
        onConfirm={vi.fn()}
        onCancel={onCancel}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /Cancelar/i }));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it('calls onConfirm when clicking Confirmar Conclusão button', () => {
    const onConfirm = vi.fn();
    render(
      <DependencySoftBlockModal
        isOpen={true}
        taskTitle="Checkout SPA Web"
        blockingTasks={blockingTasks}
        onConfirm={onConfirm}
        onCancel={vi.fn()}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /Confirmar Conclusão/i }));
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it('does not render when isOpen is false', () => {
    render(
      <DependencySoftBlockModal
        isOpen={false}
        taskTitle="Checkout SPA Web"
        blockingTasks={blockingTasks}
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />
    );

    expect(screen.queryByText(/Dependência Pendente/i)).not.toBeInTheDocument();
  });
});

describe('Feature 024 - User Story 4: Soft Block & Initiative Progress Flow', () => {
  it('resolves cross-board pending blockers from localStorage in getPendingBlockers', async () => {
    const { getPendingBlockers } = await import('../../src/utils/taskRelations');

    const remoteBoardId = 'remote-board-123';
    const remoteData = {
      name: 'Quadro Backend',
      columns: [
        { id: 'col-todo', title: 'A Fazer', category: 'todo' },
        { id: 'col-done', title: 'Concluído', category: 'done' },
      ],
      tasks: {
        'col-todo': [
          {
            id: 'remote-task-1',
            title: 'API Gateway Auth Service',
            column: 'col-todo',
            type: 'card',
          },
        ],
      },
    };
    localStorage.setItem(`metrik-tasks-${remoteBoardId}`, JSON.stringify(remoteData));

    const sourceTask: any = {
      id: 'source-task-1',
      title: 'Frontend Login Screen',
      column: 'col-in-progress',
      links: [
        {
          id: 'l-1',
          targetTaskId: 'remote-task-1',
          relationType: 'is_blocked_by',
          targetBoardId: remoteBoardId,
          targetTeamId: 'team-backend',
        },
      ],
    };

    const localColumns: any[] = [
      { id: 'col-in-progress', title: 'Em Andamento', category: 'in_progress' },
      { id: 'col-done', title: 'Finalizado', category: 'done' },
    ];

    const pending = getPendingBlockers(sourceTask, [sourceTask], localColumns);
    expect(pending).toHaveLength(1);
    expect(pending[0].taskId).toBe('remote-task-1');
    expect(pending[0].taskTitle).toBe('API Gateway Auth Service');
    expect(pending[0].isExternalSquad).toBe(true);

    localStorage.removeItem(`metrik-tasks-${remoteBoardId}`);
  });

  it('renders initiative progress bar and pending blocker chip in Task card', async () => {
    const { Task } = await import('../../src/components/Task');
    const initiativeTask: any = {
      id: 'init-1',
      title: 'Reformulação do Checkout',
      column: 'col-doing',
      type: 'initiative',
      links: [
        {
          id: 'link-1',
          targetTaskId: 'task-b',
          relationType: 'is_blocked_by',
          targetBoardId: 'b-1',
          targetTeamId: 't-1',
        },
      ],
    };

    render(
      <Task
        task={initiativeTask}
        onUpdateTitle={vi.fn()}
        onDelete={vi.fn()}
        onDiscardIfEmpty={vi.fn()}
        initiativeProgress={{ total: 4, completed: 3, percentage: 75 }}
        pendingBlockersCount={1}
      />
    );

    expect(screen.getByTestId('task-initiative-progress')).toBeInTheDocument();
    expect(screen.getByText(/3\/4 \(75%\)/i)).toBeInTheDocument();
    expect(screen.getByTestId('task-pending-blocker-chip')).toBeInTheDocument();
    expect(screen.getByText(/1 bloqueador pendente/i)).toBeInTheDocument();
  });
});

