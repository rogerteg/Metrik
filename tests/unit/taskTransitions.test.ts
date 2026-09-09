import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useTaskCollection } from '../../src/hooks/useTaskCollection';

describe('Task Transitions & Timestamps (US4 & Feature 002)', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('moves task from Todo to In Progress and registers startedAt', () => {
    const { result } = renderHook(() => useTaskCollection());

    let task: any;
    act(() => {
      task = result.current.addTask('todo', 'Mover este cartão');
    });

    expect(result.current.board.tasks['todo'].some((t) => t.id === task.id)).toBe(true);

    act(() => {
      result.current.moveTask(task.id, 'in-progress');
    });

    expect(result.current.board.tasks['todo'].some((t) => t.id === task.id)).toBe(false);
    const moved = result.current.board.tasks['in-progress'].find((t) => t.id === task.id);
    expect(moved).toBeDefined();
    expect(moved?.column).toBe('in-progress');
    expect(moved?.startedAt).toBeDefined();
  });

  it('moves task from In Progress to Blocked preserving startedAt', () => {
    const { result } = renderHook(() => useTaskCollection());

    let task: any;
    act(() => {
      task = result.current.addTask('in-progress', 'Gargalo detectado');
    });

    const initialStartedAt = task.startedAt;

    act(() => {
      result.current.moveTask(task.id, 'blocked');
    });

    const blocked = result.current.board.tasks['blocked'].find((t) => t.id === task.id);
    expect(blocked).toBeDefined();
    expect(blocked?.column).toBe('blocked');
    expect(blocked?.startedAt).toBe(initialStartedAt);
  });

  it('moves task from Blocked to Completed and registers completedAt', () => {
    const { result } = renderHook(() => useTaskCollection());

    let task: any;
    act(() => {
      task = result.current.addTask('blocked', 'Item desbloqueado');
    });

    act(() => {
      result.current.moveTask(task.id, 'completed');
    });

    const completed = result.current.board.tasks['completed'].find((t) => t.id === task.id);
    expect(completed).toBeDefined();
    expect(completed?.column).toBe('completed');
    expect(completed?.completedAt).toBeDefined();
    expect(completed?.startedAt).toBeDefined();
  });

  it('clears completedAt when task is reopened from Completed', () => {
    const { result } = renderHook(() => useTaskCollection());

    let task: any;
    act(() => {
      task = result.current.addTask('completed', 'Item reaberto');
    });

    expect(task.completedAt).toBeDefined();

    act(() => {
      result.current.moveTask(task.id, 'blocked');
    });

    const blocked = result.current.board.tasks['blocked'].find((t) => t.id === task.id);
    expect(blocked?.completedAt).toBeUndefined();

    act(() => {
      result.current.moveTask(task.id, 'in-progress');
    });
    expect(result.current.board.tasks['in-progress'].some((t) => t.id === task.id)).toBe(true);

    act(() => {
      result.current.moveTask(task.id, 'todo');
    });
    expect(result.current.board.tasks['todo'].some((t) => t.id === task.id)).toBe(true);
  });
});
