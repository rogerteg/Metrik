import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useTaskCollection } from '../../src/hooks/useTaskCollection';
import { TaskModel } from '../../src/types/kanban';

/**
 * Feature 038 — invariantes de persistência das sprints.
 */
describe('useSprints (Feature 038)', () => {
  const BOARD = 'board-sprints';

  beforeEach(() => {
    localStorage.clear();
  });

  const setup = () => {
    const { result } = renderHook(() => useTaskCollection(BOARD));
    act(() => result.current.clearTasks());
    return result;
  };

  const addTask = (result: ReturnType<typeof setup>, title: string): TaskModel => {
    let task!: TaskModel;
    act(() => {
      task = result.current.addTask('todo', title);
    });
    return task;
  };

  const firstSprintId = (result: ReturnType<typeof setup>): string =>
    result.current.board.sprints![0].id;

  it('creates a planned sprint and rejects empty names (FR-001, FR-012)', () => {
    const result = setup();
    act(() => result.current.addSprint({ name: '  Sprint 1  ' }));
    act(() => result.current.addSprint({ name: '   ' }));

    expect(result.current.board.sprints).toHaveLength(1);
    expect(result.current.board.sprints![0]).toMatchObject({ name: 'Sprint 1', status: 'planned' });
  });

  it('rejects an inverted date window (FR-012)', () => {
    const result = setup();
    act(() =>
      result.current.addSprint({
        name: 'Sprint X',
        startDate: '2026-09-14',
        endDate: '2026-09-01',
      }),
    );
    expect(result.current.board.sprints ?? []).toHaveLength(0);
  });

  it('keeps at most one active sprint (FR-003)', () => {
    const result = setup();
    act(() => result.current.addSprint({ name: 'Sprint 1' }));
    act(() => result.current.addSprint({ name: 'Sprint 2' }));
    const [s1, s2] = result.current.board.sprints!;

    act(() => result.current.startSprint(s1.id));
    act(() => result.current.startSprint(s2.id));

    const sprints = result.current.board.sprints!;
    expect(sprints.filter((s) => s.status === 'active')).toHaveLength(1);
    expect(sprints.find((s) => s.id === s2.id)?.status).toBe('active');
    expect(sprints.find((s) => s.id === s1.id)?.status).toBe('planned');
    expect(result.current.board.activeSprintId).toBe(s2.id);
  });

  it('completes a sprint without auto-completing tasks (FR-004)', () => {
    const result = setup();
    const task = addTask(result, 'Tarefa pendente');
    act(() => result.current.addSprint({ name: 'Sprint 1' }));
    const id = firstSprintId(result);
    act(() => result.current.startSprint(id));
    act(() => result.current.setTaskSprint(task.id, id));

    act(() => result.current.completeSprint(id));

    const sprint = result.current.board.sprints!.find((s) => s.id === id)!;
    expect(sprint.status).toBe('completed');
    expect(sprint.completedAt).toBeTruthy();
    expect(result.current.board.activeSprintId).toBeNull();

    const stored = result.current.board.tasks['todo'].find((t) => t.id === task.id)!;
    expect(stored.column).toBe('todo');
    expect(stored.completedAt).toBeUndefined();
    expect(stored.sprintId).toBe(id);
  });

  it('deleting a sprint unassigns tasks without deleting them (FR-005, invariante 4)', () => {
    const result = setup();
    const task = addTask(result, 'Tarefa atribuída');
    act(() => result.current.addSprint({ name: 'Sprint 1' }));
    const id = firstSprintId(result);
    act(() => result.current.startSprint(id));
    act(() => result.current.setTaskSprint(task.id, id));

    act(() => result.current.deleteSprint(id));

    expect(result.current.board.sprints ?? []).toHaveLength(0);
    expect(result.current.board.activeSprintId).toBeNull();
    const stored = result.current.board.tasks['todo'].find((t) => t.id === task.id);
    expect(stored).toBeDefined();
    expect(stored?.sprintId).toBeUndefined();
  });

  it('assigns and removes a task from a sprint without touching flow state (FR-006, FR-011)', () => {
    const result = setup();
    const task = addTask(result, 'Tarefa');
    act(() => result.current.addSprint({ name: 'Sprint 1' }));
    const id = firstSprintId(result);

    act(() => result.current.setTaskSprint(task.id, id));
    let stored = result.current.board.tasks['todo'].find((t) => t.id === task.id)!;
    expect(stored.sprintId).toBe(id);
    expect(stored.column).toBe('todo');
    expect(stored.startedAt).toBeUndefined();

    act(() => result.current.setTaskSprint(task.id, null));
    stored = result.current.board.tasks['todo'].find((t) => t.id === task.id)!;
    expect(stored.sprintId).toBeUndefined();
  });

  it('updates a sprint and validates the merged window (FR-002)', () => {
    const result = setup();
    act(() => result.current.addSprint({ name: 'Sprint 1', startDate: '2026-09-01' }));
    const id = firstSprintId(result);

    act(() => result.current.updateSprint(id, { name: 'Sprint Renomeada', endDate: '2026-09-10' }));
    expect(result.current.board.sprints![0]).toMatchObject({
      name: 'Sprint Renomeada',
      endDate: '2026-09-10',
    });

    // Fim antes do início: rejeitado, mantém estado anterior.
    act(() => result.current.updateSprint(id, { endDate: '2026-08-01' }));
    expect(result.current.board.sprints![0].endDate).toBe('2026-09-10');
  });

  it('persists sprints and assignments across board reload (FR-009)', () => {
    const result = setup();
    const task = addTask(result, 'Tarefa persistida');
    act(() => result.current.addSprint({ name: 'Sprint Persistente' }));
    const id = firstSprintId(result);
    act(() => result.current.setTaskSprint(task.id, id));

    const reloaded = renderHook(() => useTaskCollection(BOARD));
    expect(reloaded.result.current.board.sprints?.[0].name).toBe('Sprint Persistente');
    expect(
      reloaded.result.current.board.tasks['todo'].find((t) => t.id === task.id)?.sprintId,
    ).toBe(id);
  });
});
