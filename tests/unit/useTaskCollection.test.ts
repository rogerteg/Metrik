import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useTaskCollection, STORAGE_KEY } from '../../src/hooks/useTaskCollection';
import { ColumnType } from '../../src/types/kanban';
import { INITIAL_SEED_TASKS } from '../../src/utils/seedData';

describe('useTaskCollection Hook (US3)', () => {
  beforeEach(() => {
    window.localStorage.clear();
    vi.restoreAllMocks();
  });

  it('initializes with seed data when localStorage is empty', () => {
    const { result } = renderHook(() => useTaskCollection());

    expect(result.current.board[ColumnType.TO_DO].length).toBe(
      INITIAL_SEED_TASKS[ColumnType.TO_DO].length
    );
    expect(result.current.board[ColumnType.IN_PROGRESS].length).toBe(
      INITIAL_SEED_TASKS[ColumnType.IN_PROGRESS].length
    );

    const saved = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || '{}');
    expect(saved[ColumnType.TO_DO].length).toBe(INITIAL_SEED_TASKS[ColumnType.TO_DO].length);
  });

  it('adds a task and updates localStorage reactive state', () => {
    const { result } = renderHook(() => useTaskCollection());

    let newTask: any;
    act(() => {
      newTask = result.current.addTask(ColumnType.TO_DO, 'Minha Nova Tarefa');
    });

    expect(newTask.id).toBeDefined();
    expect(newTask.title).toBe('Minha Nova Tarefa');
    expect(newTask.column).toBe(ColumnType.TO_DO);

    const todoTasks = result.current.board[ColumnType.TO_DO];
    expect(todoTasks.some((t) => t.id === newTask.id)).toBe(true);

    const saved = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || '{}');
    expect(saved[ColumnType.TO_DO].some((t: any) => t.id === newTask.id)).toBe(true);
  });

  it('updates task title and updatedAt timestamp', () => {
    const { result } = renderHook(() => useTaskCollection());
    const target = result.current.board[ColumnType.TO_DO][0];

    act(() => {
      result.current.updateTask(target.id, { title: 'Título Atualizado' });
    });

    const updated = result.current.board[ColumnType.TO_DO].find((t) => t.id === target.id);
    expect(updated?.title).toBe('Título Atualizado');
    expect(updated?.updatedAt).toBeDefined();
  });

  it('deletes a task correctly from column and storage', () => {
    const { result } = renderHook(() => useTaskCollection());
    const target = result.current.board[ColumnType.TO_DO][0];

    act(() => {
      result.current.deleteTask(target.id);
    });

    const found = result.current.board[ColumnType.TO_DO].find((t) => t.id === target.id);
    expect(found).toBeUndefined();

    const saved = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || '{}');
    expect(saved[ColumnType.TO_DO].some((t: any) => t.id === target.id)).toBe(false);
  });

  it('discards task if empty on discardIfEmpty call (FR-013)', () => {
    const { result } = renderHook(() => useTaskCollection());

    let emptyTask: any;
    act(() => {
      emptyTask = result.current.addTask(ColumnType.TO_DO, '   ');
    });

    act(() => {
      result.current.discardIfEmpty(emptyTask.id);
    });

    const found = result.current.board[ColumnType.TO_DO].find((t) => t.id === emptyTask.id);
    expect(found).toBeUndefined();
  });

  it('recovers gracefully with seed data when localStorage contains corrupted JSON', () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    window.localStorage.setItem(STORAGE_KEY, '{ invalid_json_corrupt');

    const { result } = renderHook(() => useTaskCollection());

    expect(result.current.board[ColumnType.TO_DO].length).toBe(
      INITIAL_SEED_TASKS[ColumnType.TO_DO].length
    );
    expect(consoleErrorSpy).toHaveBeenCalled();
  });

  it('clears all tasks across all columns', () => {
    const { result } = renderHook(() => useTaskCollection());

    act(() => {
      result.current.clearTasks();
    });

    expect(result.current.board[ColumnType.TO_DO]).toEqual([]);
    expect(result.current.board[ColumnType.IN_PROGRESS]).toEqual([]);
    expect(result.current.board[ColumnType.BLOCKED]).toEqual([]);
    expect(result.current.board[ColumnType.COMPLETED]).toEqual([]);
  });

  it('resets board to initial seed tasks', () => {
    const { result } = renderHook(() => useTaskCollection());

    act(() => {
      result.current.clearTasks();
    });
    expect(result.current.board[ColumnType.TO_DO].length).toBe(0);

    act(() => {
      result.current.resetToSeed();
    });
    expect(result.current.board[ColumnType.TO_DO].length).toBe(
      INITIAL_SEED_TASKS[ColumnType.TO_DO].length
    );
  });

  it('reorders or moves a task between columns using reorderOrMoveTask', () => {
    const { result } = renderHook(() => useTaskCollection());
    const taskToMove = result.current.board[ColumnType.TO_DO][0];

    act(() => {
      result.current.reorderOrMoveTask({
        activeTaskId: taskToMove.id,
        targetColumn: ColumnType.IN_PROGRESS,
      });
    });

    const inProgressTasks = result.current.board[ColumnType.IN_PROGRESS];
    const moved = inProgressTasks.find((t) => t.id === taskToMove.id);
    expect(moved).toBeDefined();
    expect(moved?.column).toBe(ColumnType.IN_PROGRESS);
    expect(moved?.startedAt).toBeDefined();

    // Verify localStorage was updated
    const saved = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || '{}');
    expect(saved[ColumnType.IN_PROGRESS].some((t: any) => t.id === taskToMove.id)).toBe(true);
  });

  it('sets and clears task priority via setTaskPriority', () => {
    const { result } = renderHook(() => useTaskCollection());
    const task = result.current.board[ColumnType.TO_DO][0];

    act(() => {
      result.current.setTaskPriority(task.id, 'urgent');
    });

    const updated = result.current.board[ColumnType.TO_DO].find((t) => t.id === task.id);
    expect(updated?.priority).toBe('urgent');

    const saved = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || '{}');
    const savedTask = saved[ColumnType.TO_DO].find((t: any) => t.id === task.id);
    expect(savedTask.priority).toBe('urgent');

    act(() => {
      result.current.setTaskPriority(task.id, undefined);
    });

    const cleared = result.current.board[ColumnType.TO_DO].find((t) => t.id === task.id);
    expect(cleared?.priority).toBeUndefined();
  });

  it('adds and removes task tags with deduplication and sanitization', () => {
    const { result } = renderHook(() => useTaskCollection());
    const task = result.current.board[ColumnType.TO_DO][0];

    // Add tag
    act(() => {
      result.current.addTaskTag(task.id, '  Frontend  ');
    });

    let current = result.current.board[ColumnType.TO_DO].find((t) => t.id === task.id);
    expect(current?.tags).toEqual(['Frontend']);

    // Attempt to add duplicate tag (case-insensitive)
    act(() => {
      result.current.addTaskTag(task.id, 'frontend');
      result.current.addTaskTag(task.id, '   ');
    });

    current = result.current.board[ColumnType.TO_DO].find((t) => t.id === task.id);
    expect(current?.tags).toEqual(['Frontend']);

    // Add second tag
    act(() => {
      result.current.addTaskTag(task.id, 'UI');
    });

    current = result.current.board[ColumnType.TO_DO].find((t) => t.id === task.id);
    expect(current?.tags).toEqual(['Frontend', 'UI']);

    // Remove first tag
    act(() => {
      result.current.removeTaskTag(task.id, 'FRONTEND');
    });

    current = result.current.board[ColumnType.TO_DO].find((t) => t.id === task.id);
    expect(current?.tags).toEqual(['UI']);
  });
});

