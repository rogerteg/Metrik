import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BoardTask } from '../../src/components/BoardTask';
import { BoardState, TaskModel, SprintModel } from '../../src/types/kanban';

describe('BoardTask Component', () => {
  const mockBoard: BoardState & { id: string; name: string } = {
    id: 'board-1',
    name: 'Main Board',
    columns: [
      { id: 'col-todo', title: 'To Do', category: 'todo', wipLimit: null, colorScheme: 'todo' },
      {
        id: 'col-wip',
        title: 'Doing',
        category: 'in_progress',
        wipLimit: null,
        colorScheme: 'progress',
      },
      { id: 'col-done', title: 'Done', category: 'done', wipLimit: null, colorScheme: 'completed' },
    ],
    tasks: {},
  };

  const mockTask: TaskModel = {
    id: 't-101',
    title: 'Implement Search Bar',
    column: 'col-wip',
    createdAt: '2026-10-01T09:00:00Z',
    sprintId: 'sp-1',
    type: 'card',
  };

  const mockSprints: SprintModel[] = [
    {
      id: 'sp-1',
      name: 'Sprint 42',
      status: 'active',
      createdAt: '2026-10-01T00:00:00Z',
    },
  ];

  const defaultProps = {
    task: mockTask,
    columnId: 'col-wip',
    board: mockBoard,
    allBoardTasks: [mockTask],
    isGuest: false,
    isAdmin: true,
    currentUser: { id: 'u1', name: 'Alice' },
    autoSaveComments: true,
    autoSaveDebounceMs: 200,
    sprints: mockSprints,
    onSelect: vi.fn(),
    onUpdateTask: vi.fn(),
    onDelete: vi.fn(),
    onDiscardIfEmpty: vi.fn(),
    onUpdatePriority: vi.fn(),
    onAddTag: vi.fn(),
    onRemoveTag: vi.fn(),
    onToggleBlocked: vi.fn(),
    onDropTask: vi.fn(),
    onMoveTask: vi.fn(),
    addTaskComment: vi.fn(),
    editTaskComment: vi.fn(),
    deleteTaskComment: vi.fn(),
    addSubtaskComment: vi.fn(),
    editSubtaskComment: vi.fn(),
    deleteSubtaskComment: vi.fn(),
  };

  it('renders task card with sprint name badge and triggers onSelect on click', () => {
    render(<BoardTask {...defaultProps} />);

    expect(screen.getByText('Implement Search Bar')).toBeInTheDocument();
    expect(screen.getByText(/Sprint 42/)).toBeInTheDocument();

    const taskCard = screen.getByText('Implement Search Bar').closest('.task-card');
    expect(taskCard).toBeInTheDocument();
    if (taskCard) {
      fireEvent.click(taskCard);
      expect(defaultProps.onSelect).toHaveBeenCalledWith('t-101');
    }
  });

  it('handles navigation left and right between columns', () => {
    render(<BoardTask {...defaultProps} />);

    // In 'col-wip' (index 1), canMoveLeft and canMoveRight are both true
    const moveLeftBtn = screen.getByRole('button', { name: /Mover para coluna anterior/i });
    const moveRightBtn = screen.getByRole('button', { name: /Mover para próxima coluna/i });

    fireEvent.click(moveLeftBtn);
    expect(defaultProps.onMoveTask).toHaveBeenCalledWith('t-101', 'col-todo');

    fireEvent.click(moveRightBtn);
    expect(defaultProps.onMoveTask).toHaveBeenCalledWith('t-101', 'col-done');
  });

  it('disables moving when task is blocked or user is guest', () => {
    const blockedTask: TaskModel = {
      ...mockTask,
      blocked: true,
      blockedReason: 'API down',
    };

    const { rerender } = render(<BoardTask {...defaultProps} task={blockedTask} />);

    expect(
      screen.queryByRole('button', { name: /Mover para coluna anterior/i }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: /Mover para próxima coluna/i }),
    ).not.toBeInTheDocument();

    rerender(<BoardTask {...defaultProps} isGuest={true} />);

    expect(
      screen.queryByRole('button', { name: /Mover para coluna anterior/i }),
    ).not.toBeInTheDocument();
  });

  it('computes initiative progress when task is an initiative', () => {
    const initiativeTask: TaskModel = {
      ...mockTask,
      id: 'init-1',
      type: 'initiative',
      links: [
        {
          id: 'l1',
          targetTaskId: 't-child-1',
          targetBoardId: 'board-1',
          targetTeamId: 'team-1',
          relationType: 'child',
          createdAt: '2026-10-01T00:00:00Z',
        },
        {
          id: 'l2',
          targetTaskId: 't-child-2',
          targetBoardId: 'board-1',
          targetTeamId: 'team-1',
          relationType: 'child',
          createdAt: '2026-10-01T00:00:00Z',
        },
      ],
    };

    const childTaskDone: TaskModel = {
      id: 't-child-1',
      title: 'Child 1',
      column: 'col-done',
      createdAt: '2026-10-01T00:00:00Z',
    };

    const childTaskTodo: TaskModel = {
      id: 't-child-2',
      title: 'Child 2',
      column: 'col-todo',
      createdAt: '2026-10-01T00:00:00Z',
    };

    render(
      <BoardTask
        {...defaultProps}
        task={initiativeTask}
        allBoardTasks={[initiativeTask, childTaskDone, childTaskTodo]}
      />,
    );

    expect(screen.getByText('Iniciativa')).toBeInTheDocument();
    expect(screen.getByText(/1\/2/)).toBeInTheDocument();
    expect(screen.getByText(/50%/)).toBeInTheDocument();
  });
});
