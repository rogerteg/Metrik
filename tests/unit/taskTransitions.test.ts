import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useTaskCollection } from '../../src/hooks/useTaskCollection';

describe('Task Transitions & Timestamps (US4 & Feature 002)', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('moves task from Todo to In Progress and registers startedAt', () => {
    const { result } = renderHook(() => useTaskCollection('test-board'));

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
    const { result } = renderHook(() => useTaskCollection('test-board'));

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
    const { result } = renderHook(() => useTaskCollection('test-board'));

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

  it('blocks backward move when task is attempted to be reopened/moved backward', () => {
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
    const { result } = renderHook(() => useTaskCollection('test-board'));

    let task: any;
    act(() => {
      task = result.current.addTask('completed', 'Item finalizado');
    });

    expect(task.completedAt).toBeDefined();

    // Tentativa de mover para trás (completed -> in-progress) deve ser bloqueada
    act(() => {
      result.current.moveTask(task.id, 'in-progress');
    });

    expect(alertSpy).toHaveBeenCalled();
    // Tarefa deve ser mantida na coluna vigente ('completed')
    expect(result.current.board.tasks['completed'].some((t) => t.id === task.id)).toBe(true);
    expect(result.current.board.tasks['in-progress'].some((t) => t.id === task.id)).toBe(false);
  });
});
