import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useTaskCollection } from '../../src/hooks/useTaskCollection';
import { ColumnType } from '../../src/types/kanban';

describe('Task Transitions & Timestamps (US4 & Feature 002)', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('moves task from Todo to In Progress and registers startedAt', () => {
    const { result } = renderHook(() => useTaskCollection());

    let task: any;
    act(() => {
      task = result.current.addTask(ColumnType.TO_DO, 'Mover este cartão');
    });

    expect(result.current.board[ColumnType.TO_DO].some((t) => t.id === task.id)).toBe(true);

    act(() => {
      result.current.moveTask(task.id, ColumnType.IN_PROGRESS);
    });

    expect(result.current.board[ColumnType.TO_DO].some((t) => t.id === task.id)).toBe(false);
    const moved = result.current.board[ColumnType.IN_PROGRESS].find((t) => t.id === task.id);
    expect(moved).toBeDefined();
    expect(moved?.column).toBe(ColumnType.IN_PROGRESS);
    expect(moved?.startedAt).toBeDefined();
  });

  it('moves task from In Progress to Blocked preserving startedAt', () => {
    const { result } = renderHook(() => useTaskCollection());

    let task: any;
    act(() => {
      task = result.current.addTask(ColumnType.IN_PROGRESS, 'Gargalo detectado');
    });

    const initialStartedAt = task.startedAt;

    act(() => {
      result.current.moveTask(task.id, ColumnType.BLOCKED);
    });

    const blocked = result.current.board[ColumnType.BLOCKED].find((t) => t.id === task.id);
    expect(blocked).toBeDefined();
    expect(blocked?.column).toBe(ColumnType.BLOCKED);
    expect(blocked?.startedAt).toBe(initialStartedAt);
  });

  it('moves task from Blocked to Completed and registers completedAt', () => {
    const { result } = renderHook(() => useTaskCollection());

    let task: any;
    act(() => {
      task = result.current.addTask(ColumnType.BLOCKED, 'Item desbloqueado');
    });

    act(() => {
      result.current.moveTask(task.id, ColumnType.COMPLETED);
    });

    const completed = result.current.board[ColumnType.COMPLETED].find((t) => t.id === task.id);
    expect(completed).toBeDefined();
    expect(completed?.column).toBe(ColumnType.COMPLETED);
    expect(completed?.completedAt).toBeDefined();
    expect(completed?.startedAt).toBeDefined();
  });

  it('clears completedAt when task is reopened from Completed', () => {
    const { result } = renderHook(() => useTaskCollection());

    let task: any;
    act(() => {
      task = result.current.addTask(ColumnType.COMPLETED, 'Item reaberto');
    });

    expect(task.completedAt).toBeDefined();

    act(() => {
      result.current.moveTask(task.id, ColumnType.BLOCKED);
    });

    const blocked = result.current.board[ColumnType.BLOCKED].find((t) => t.id === task.id);
    expect(blocked?.completedAt).toBeUndefined();

    act(() => {
      result.current.moveTask(task.id, ColumnType.IN_PROGRESS);
    });
    expect(result.current.board[ColumnType.IN_PROGRESS].some((t) => t.id === task.id)).toBe(true);

    act(() => {
      result.current.moveTask(task.id, ColumnType.TO_DO);
    });
    expect(result.current.board[ColumnType.TO_DO].some((t) => t.id === task.id)).toBe(true);
  });
});
