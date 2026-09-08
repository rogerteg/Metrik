import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useTaskCollection } from '../../src/hooks/useTaskCollection';
import { ColumnType } from '../../src/types/kanban';

describe('Task Transitions (US4)', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('moves task from Todo to In Progress', () => {
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
  });

  it('moves task from In Progress to Blocked with alert status', () => {
    const { result } = renderHook(() => useTaskCollection());

    let task: any;
    act(() => {
      task = result.current.addTask(ColumnType.IN_PROGRESS, 'Gargalo detectado');
    });

    act(() => {
      result.current.moveTask(task.id, ColumnType.BLOCKED);
    });

    const blocked = result.current.board[ColumnType.BLOCKED].find((t) => t.id === task.id);
    expect(blocked).toBeDefined();
    expect(blocked?.column).toBe(ColumnType.BLOCKED);
  });

  it('moves task from Blocked to Completed', () => {
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
  });

  it('allows moving task backwards (Completed -> Blocked -> In Progress -> Todo)', () => {
    const { result } = renderHook(() => useTaskCollection());

    let task: any;
    act(() => {
      task = result.current.addTask(ColumnType.COMPLETED, 'Item reaberto');
    });

    act(() => {
      result.current.moveTask(task.id, ColumnType.BLOCKED);
    });
    expect(result.current.board[ColumnType.BLOCKED].some((t) => t.id === task.id)).toBe(true);

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
