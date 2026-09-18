import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { computeBoardSummaryMetrics } from '../../src/utils/boardMetrics';
import { BoardModel, BoardState, ColumnModel, TaskModel } from '../../src/types/kanban';

describe('computeBoardSummaryMetrics utility (Feature 031 - T003)', () => {
  const mockBoard: BoardModel = {
    id: 'board-alpha',
    name: 'Quadro Alfa',
    teamId: 'team-core',
    createdAt: '2026-09-01T00:00:00Z',
    lastAccessed: '2026-09-17T00:00:00Z',
  };

  const mockColumns: ColumnModel[] = [
    { id: 'col-todo', title: 'A Fazer', category: 'todo', wipLimit: null, colorScheme: 'todo' },
    { id: 'col-doing', title: 'Em Progresso', category: 'in_progress', wipLimit: 3, colorScheme: 'progress' },
    { id: 'col-review', title: 'Revisão', category: 'in_progress', wipLimit: 2, colorScheme: 'progress' },
    { id: 'col-done', title: 'Concluído', category: 'done', wipLimit: null, colorScheme: 'completed' },
  ];

  const createTask = (id: string, colId: string): TaskModel => ({
    id,
    title: `Tarefa ${id}`,
    column: colId,
    createdAt: '2026-09-10T10:00:00Z',
  });

  const mockTasks: Record<string, TaskModel[]> = {
    'col-todo': [createTask('t1', 'col-todo'), createTask('t2', 'col-todo')],
    'col-doing': [createTask('t3', 'col-doing'), createTask('t4', 'col-doing')],
    'col-review': [createTask('t5', 'col-review')],
    'col-done': [createTask('t6', 'col-done'), createTask('t7', 'col-done'), createTask('t8', 'col-done')],
  };

  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('calculates columns count and total tasks count from embedded board state', () => {
    const boardWithState = {
      ...mockBoard,
      columns: mockColumns,
      tasks: mockTasks,
    };

    const metrics = computeBoardSummaryMetrics(boardWithState, 'board-alpha');

    expect(metrics.boardId).toBe('board-alpha');
    expect(metrics.columnsCount).toBe(4);
    expect(metrics.totalTasksCount).toBe(8);
  });

  it('accurately segregates WIP tasks (in_progress) and done tasks', () => {
    const boardWithState = {
      ...mockBoard,
      columns: mockColumns,
      tasks: mockTasks,
    };

    const metrics = computeBoardSummaryMetrics(boardWithState, 'board-other');

    // col-doing (2) + col-review (1) = 3 WIP tasks
    expect(metrics.wipTasksCount).toBe(3);
    // col-done (3) = 3 Done tasks
    expect(metrics.doneTasksCount).toBe(3);
  });

  it('correctly sets isActive boolean when matching activeBoardId', () => {
    const boardWithState = {
      ...mockBoard,
      columns: mockColumns,
      tasks: mockTasks,
    };

    expect(computeBoardSummaryMetrics(boardWithState, 'board-alpha').isActive).toBe(true);
    expect(computeBoardSummaryMetrics(boardWithState, 'board-beta').isActive).toBe(false);
    expect(computeBoardSummaryMetrics(boardWithState, null).isActive).toBe(false);
  });

  it('handles empty boards and missing columns/tasks gracefully without throwing', () => {
    const emptyBoard: BoardModel = {
      id: 'empty-board',
      name: 'Vazio',
      createdAt: '2026-09-01T00:00:00Z',
      lastAccessed: '2026-09-01T00:00:00Z',
    };

    const metrics = computeBoardSummaryMetrics(emptyBoard, null);

    expect(metrics.boardId).toBe('empty-board');
    expect(metrics.columnsCount).toBe(0);
    expect(metrics.totalTasksCount).toBe(0);
    expect(metrics.wipTasksCount).toBe(0);
    expect(metrics.doneTasksCount).toBe(0);
    expect(metrics.isActive).toBe(false);
  });

  it('reads board state from localStorage when not directly attached to board model', () => {
    const savedState: BoardState = {
      columns: [
        { id: 'c1', title: 'To Do', category: 'todo', wipLimit: null, colorScheme: 'todo' },
        { id: 'c2', title: 'Dev', category: 'in_progress', wipLimit: 2, colorScheme: 'progress' },
      ],
      tasks: {
        c1: [createTask('t-a', 'c1')],
        c2: [createTask('t-b', 'c2'), createTask('t-c', 'c2')],
      },
    };

    localStorage.setItem(`metrik-tasks-${mockBoard.id}`, JSON.stringify(savedState));

    const metrics = computeBoardSummaryMetrics(mockBoard, mockBoard.id);

    expect(metrics.columnsCount).toBe(2);
    expect(metrics.totalTasksCount).toBe(3);
    expect(metrics.wipTasksCount).toBe(2);
    expect(metrics.doneTasksCount).toBe(0);
    expect(metrics.isActive).toBe(true);
  });

  it('allows optional injected state to override localStorage or board properties', () => {
    const injectedState: BoardState = {
      columns: [
        { id: 'done-col', title: 'Finalizado', category: 'done', wipLimit: null, colorScheme: 'completed' },
      ],
      tasks: {
        'done-col': [createTask('t-done-1', 'done-col')],
      },
    };

    const metrics = computeBoardSummaryMetrics(mockBoard, 'other-id', injectedState);

    expect(metrics.columnsCount).toBe(1);
    expect(metrics.totalTasksCount).toBe(1);
    expect(metrics.wipTasksCount).toBe(0);
    expect(metrics.doneTasksCount).toBe(1);
    expect(metrics.isActive).toBe(false);
  });
});
