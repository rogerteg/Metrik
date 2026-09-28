import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useTaskCollection } from '../../src/hooks/useTaskCollection';
import { TaskModel } from '../../src/types/kanban';

/**
 * Feature 027 (delta Modo 2) — edição de comentário do cartão e comentários de subtarefa.
 * Cobre persistência, permissões e isolamento pai × filho no hook.
 */
describe('Card child comments (Feature 027 delta)', () => {
  const BOARD = 'board-child-comments';

  beforeEach(() => {
    localStorage.clear();
  });

  const setupTask = (result: { current: ReturnType<typeof useTaskCollection> }) => {
    let task!: TaskModel;
    act(() => {
      result.current.clearTasks();
      task = result.current.addTask('todo', 'Cartão com filhos');
    });
    act(() => {
      result.current.updateTask(task.id, {
        subtasks: [
          { id: 's1', title: 'Passo 1', completed: false },
          { id: 's2', title: 'Passo 2', completed: false },
        ],
      });
    });
    return task;
  };

  const findTask = (result: { current: ReturnType<typeof useTaskCollection> }, id: string) =>
    result.current.board.tasks['todo'].find((t) => t.id === id);

  it('edits a parent comment preserving createdAt and setting updatedAt (FR-006a)', () => {
    const { result } = renderHook(() => useTaskCollection(BOARD));
    const task = setupTask(result);

    act(() => {
      result.current.addTaskComment(task.id, 'texto original');
    });

    const created = findTask(result, task.id)!.comments![0];
    expect(created.text).toBe('texto original');
    expect(created.updatedAt).toBeUndefined();

    act(() => {
      result.current.editTaskComment(task.id, created.id, '  texto revisado  ');
    });

    const edited = findTask(result, task.id)!.comments![0];
    expect(edited.text).toBe('texto revisado');
    expect(edited.createdAt).toBe(created.createdAt);
    expect(edited.updatedAt).toBeTruthy();
  });

  it('refuses a parent comment edit from a non-author', () => {
    const { result } = renderHook(() => useTaskCollection(BOARD));
    const task = setupTask(result);

    act(() => {
      result.current.addTaskComment(task.id, 'meu comentário');
    });
    const created = findTask(result, task.id)!.comments![0];

    act(() => {
      result.current.editTaskComment(task.id, created.id, 'invasão', { id: 'other', name: 'Outro' });
    });

    expect(findTask(result, task.id)!.comments![0].text).toBe('meu comentário');
  });

  it('adds, edits and deletes a subtask comment without leaking to the parent (FR-007a)', () => {
    const { result } = renderHook(() => useTaskCollection(BOARD));
    const task = setupTask(result);

    act(() => {
      result.current.addSubtaskComment(task.id, 's1', 'nota do passo 1');
    });

    let state = findTask(result, task.id)!;
    expect(state.comments ?? []).toHaveLength(0);
    expect(state.subtasks![0].comments).toHaveLength(1);
    expect(state.subtasks![1].comments).toBeUndefined();

    const subComment = state.subtasks![0].comments![0];
    expect(subComment.text).toBe('nota do passo 1');

    act(() => {
      result.current.editSubtaskComment(task.id, 's1', subComment.id, 'nota revisada');
    });
    state = findTask(result, task.id)!;
    expect(state.subtasks![0].comments![0].text).toBe('nota revisada');
    expect(state.subtasks![0].comments![0].updatedAt).toBeTruthy();

    act(() => {
      result.current.deleteSubtaskComment(task.id, 's1', subComment.id);
    });
    state = findTask(result, task.id)!;
    expect(state.subtasks![0].comments).toEqual([]);
  });

  it('ignores empty subtask comments and unknown subtask ids', () => {
    const { result } = renderHook(() => useTaskCollection(BOARD));
    const task = setupTask(result);

    act(() => {
      result.current.addSubtaskComment(task.id, 's1', '   ');
      result.current.addSubtaskComment(task.id, 'missing', 'nota');
    });

    const state = findTask(result, task.id)!;
    expect(state.subtasks![0].comments).toBeUndefined();
    expect(state.subtasks![1].comments).toBeUndefined();
  });

  it('cascades comment removal when the subtask is deleted (FR-013)', () => {
    const { result } = renderHook(() => useTaskCollection(BOARD));
    const task = setupTask(result);

    act(() => {
      result.current.addSubtaskComment(task.id, 's1', 'contexto');
    });
    expect(findTask(result, task.id)!.subtasks![0].comments).toHaveLength(1);

    act(() => {
      const current = findTask(result, task.id)!;
      result.current.updateTask(task.id, {
        subtasks: current.subtasks!.filter((s) => s.id !== 's1'),
      });
    });

    const state = findTask(result, task.id)!;
    expect(state.subtasks!.some((s) => s.id === 's1')).toBe(false);
    expect(state.subtasks!.every((s) => (s.comments ?? []).length === 0)).toBe(true);
  });
});
