import { describe, it, expect } from 'vitest';
import { isTaskStagnant, TaskModel } from '../../src/types/kanban';

/**
 * Feature 013/020 corrigida (P1): o selo "Parado" deve considerar a última
 * MOVIMENTAÇÃO (`lastMovedAt`), não `updatedAt` (que muda a cada edição).
 */
describe('isTaskStagnant — referência por movimentação, não por edição', () => {
  const DAY = 24 * 60 * 60 * 1000;
  const now = Date.now();
  const daysAgo = (n: number) => new Date(now - n * DAY).toISOString();

  const task = (over: Partial<TaskModel> = {}): TaskModel => ({
    id: 't1',
    title: 'Tarefa',
    column: 'todo',
    createdAt: daysAgo(10),
    ...over,
  });

  it('is stagnant when never moved and created long ago', () => {
    expect(isTaskStagnant(task({ createdAt: daysAgo(5) }), false, 3, now)).toBe(true);
  });

  it('is NOT stagnant when edited recently but never moved (edit must not reset)', () => {
    const t = task({ createdAt: daysAgo(5), updatedAt: new Date(now - 1000).toISOString() });
    expect(isTaskStagnant(t, false, 3, now)).toBe(true);
  });

  it('is NOT stagnant when moved recently even if created long ago', () => {
    const t = task({ createdAt: daysAgo(30), lastMovedAt: daysAgo(1) });
    expect(isTaskStagnant(t, false, 3, now)).toBe(false);
  });

  it('is stagnant when the last movement is older than the threshold', () => {
    const t = task({ createdAt: daysAgo(30), lastMovedAt: daysAgo(5) });
    expect(isTaskStagnant(t, false, 3, now)).toBe(true);
  });

  it('never reports stagnation in a completed column', () => {
    const t = task({ createdAt: daysAgo(30), lastMovedAt: daysAgo(30) });
    expect(isTaskStagnant(t, true, 3, now)).toBe(false);
  });

  it('is safe for malformed timestamps', () => {
    const t = task({ createdAt: 'not-a-date', lastMovedAt: 'also-bad' });
    expect(isTaskStagnant(t, false, 3, now)).toBe(false);
  });
});
