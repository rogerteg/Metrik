import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useTaskCollection } from '../../src/hooks/useTaskCollection';
import { INITIAL_SEED_TASKS } from '../../src/utils/seedData';

describe('useTaskCollection Hook (Feature 010 Multi-Board)', () => {
  const TEST_BOARD_ID = 'test-board-1';
  const STORAGE_KEY = `metrik-tasks-${TEST_BOARD_ID}`;

  beforeEach(() => {
    window.localStorage.clear();
    vi.restoreAllMocks();
  });

  it('initializes with seed data when localStorage is empty', () => {
    const { result } = renderHook(() => useTaskCollection(TEST_BOARD_ID));

    expect(result.current.board.tasks['todo'].length).toBe(
      INITIAL_SEED_TASKS.tasks['todo'].length
    );
    expect(result.current.board.tasks['in-progress'].length).toBe(
      INITIAL_SEED_TASKS.tasks['in-progress'].length
    );

    const saved = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || '{}');
    expect(saved.tasks['todo'].length).toBe(INITIAL_SEED_TASKS.tasks['todo'].length);
  });

  it('adds a task and updates localStorage reactive state', () => {
    const { result } = renderHook(() => useTaskCollection(TEST_BOARD_ID));

    let newTask: any;
    act(() => {
      newTask = result.current.addTask('todo', 'Minha Nova Tarefa');
    });

    expect(newTask.id).toBeDefined();
    expect(newTask.title).toBe('Minha Nova Tarefa');
    expect(newTask.column).toBe('todo');

    const todoTasks = result.current.board.tasks['todo'];
    expect(todoTasks.some((t) => t.id === newTask.id)).toBe(true);

    const saved = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || '{}');
    expect(saved.tasks['todo'].some((t: any) => t.id === newTask.id)).toBe(true);
  });

  it('switches board data when activeBoardId changes', () => {
    // Setup board 1
    const board1Key = 'metrik-tasks-b1';
    window.localStorage.setItem(board1Key, JSON.stringify({
      columns: INITIAL_SEED_TASKS.columns,
      tasks: { ...INITIAL_SEED_TASKS.tasks, todo: [{ id: 'b1-task', title: 'Task 1', column: 'todo' }] }
    }));

    // Setup board 2
    const board2Key = 'metrik-tasks-b2';
    window.localStorage.setItem(board2Key, JSON.stringify({
      columns: INITIAL_SEED_TASKS.columns,
      tasks: { ...INITIAL_SEED_TASKS.tasks, todo: [{ id: 'b2-task', title: 'Task 2', column: 'todo' }] }
    }));

    const { result, rerender } = renderHook(
      ({ id }) => useTaskCollection(id),
      { initialProps: { id: 'b1' } }
    );

    expect(result.current.board.tasks['todo'][0].title).toBe('Task 1');

    rerender({ id: 'b2' });

    expect(result.current.board.tasks['todo'][0].title).toBe('Task 2');
  });

  it('adds a column correctly', () => {
    const { result } = renderHook(() => useTaskCollection(TEST_BOARD_ID));

    act(() => {
      result.current.addColumn('New Phase', 'in_progress', 5);
    });

    const newCol = result.current.board.columns.find(c => c.title === 'New Phase');
    expect(newCol).toBeDefined();
    expect(newCol?.category).toBe('in_progress');
    expect(newCol?.wipLimit).toBe(5);
    expect(result.current.board.tasks[newCol!.id]).toEqual([]);
  });

  it('deletes an empty column correctly', () => {
    const { result } = renderHook(() => useTaskCollection(TEST_BOARD_ID));
    
    act(() => {
      result.current.addColumn('To Delete', 'todo', null);
    });
    
    const newCol = result.current.board.columns.find(c => c.title === 'To Delete');
    
    act(() => {
      result.current.deleteColumn(newCol!.id);
    });
    
    const found = result.current.board.columns.find(c => c.id === newCol!.id);
    expect(found).toBeUndefined();
    expect(result.current.board.tasks[newCol!.id]).toBeUndefined();
  });

  it('updates task title and updatedAt timestamp', () => {
    const { result } = renderHook(() => useTaskCollection(TEST_BOARD_ID));
    const target = result.current.board.tasks['todo'][0];

    act(() => {
      result.current.updateTask(target.id, { title: 'Título Atualizado' });
    });

    const updated = result.current.board.tasks['todo'].find((t) => t.id === target.id);
    expect(updated?.title).toBe('Título Atualizado');
    expect(updated?.updatedAt).toBeDefined();
  });

  it('deletes a task correctly from column and storage', () => {
    const { result } = renderHook(() => useTaskCollection(TEST_BOARD_ID));
    const target = result.current.board.tasks['todo'][0];

    act(() => {
      result.current.deleteTask(target.id);
    });

    const found = result.current.board.tasks['todo'].find((t) => t.id === target.id);
    expect(found).toBeUndefined();

    const saved = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || '{}');
    expect(saved.tasks['todo'].some((t: any) => t.id === target.id)).toBe(false);
  });

  it('discards task if empty on discardIfEmpty call', () => {
    const { result } = renderHook(() => useTaskCollection(TEST_BOARD_ID));

    let emptyTask: any;
    act(() => {
      emptyTask = result.current.addTask('todo', '   ');
    });

    act(() => {
      result.current.discardIfEmpty(emptyTask.id);
    });

    const found = result.current.board.tasks['todo'].find((t) => t.id === emptyTask.id);
    expect(found).toBeUndefined();
  });

  it('clears all tasks across all columns', () => {
    const { result } = renderHook(() => useTaskCollection(TEST_BOARD_ID));

    act(() => {
      result.current.clearTasks();
    });

    expect(result.current.board.tasks['todo']).toEqual([]);
    expect(result.current.board.tasks['in-progress']).toEqual([]);
    expect(result.current.board.tasks['blocked']).toEqual([]);
    expect(result.current.board.tasks['completed']).toEqual([]);
  });

  it('reorders or moves a task between columns using reorderOrMoveTask', () => {
    const { result } = renderHook(() => useTaskCollection(TEST_BOARD_ID));
    const taskToMove = result.current.board.tasks['todo'][0];

    act(() => {
      result.current.reorderOrMoveTask({
        activeTaskId: taskToMove.id,
        targetColumn: 'in-progress',
      });
    });

    const inProgressTasks = result.current.board.tasks['in-progress'];
    const moved = inProgressTasks.find((t) => t.id === taskToMove.id);
    expect(moved).toBeDefined();
    expect(moved?.column).toBe('in-progress');

    // Verify localStorage was updated
    const saved = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || '{}');
    expect(saved.tasks['in-progress'].some((t: any) => t.id === taskToMove.id)).toBe(true);
  });

  it('sets and clears task priority via setTaskPriority', () => {
    const { result } = renderHook(() => useTaskCollection(TEST_BOARD_ID));
    const task = result.current.board.tasks['todo'][0];

    act(() => {
      result.current.setTaskPriority(task.id, 'urgent');
    });

    const updated = result.current.board.tasks['todo'].find((t) => t.id === task.id);
    expect(updated?.priority).toBe('urgent');

    const saved = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || '{}');
    const savedTask = saved.tasks['todo'].find((t: any) => t.id === task.id);
    expect(savedTask.priority).toBe('urgent');
  });

  it('overwrites the board completely and updates localStorage', () => {
    const { result } = renderHook(() => useTaskCollection(TEST_BOARD_ID));

    const newBoard = {
      columns: [
        { id: 'custom-col', title: 'Custom', category: 'todo' as const, wipLimit: null, colorScheme: 'todo' as const }
      ],
      tasks: {
        'custom-col': [
          { id: 'c-1', title: 'Imported Task', column: 'custom-col', createdAt: new Date().toISOString() }
        ]
      }
    };

    act(() => {
      result.current.overwriteBoard(newBoard);
    });

    expect(result.current.board.columns[0].id).toBe('custom-col');
    expect(result.current.board.tasks['custom-col'][0].id).toBe('c-1');

    const saved = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || '{}');
    expect(saved.columns[0].id).toBe('custom-col');
    expect(saved.tasks['custom-col'][0].id).toBe('c-1');
  });
});
