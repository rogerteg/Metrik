import { describe, it, expect } from 'vitest';
import { filterTasksByDatasetConfig } from '../../src/utils/datasetFilter';
import { TaskModel } from '../../src/types/kanban';

describe('datasetFilter utility (Feature 030)', () => {
  const refTime = new Date('2026-09-17T12:00:00Z').getTime();
  const dayMs = 24 * 60 * 60 * 1000;

  const tasks: TaskModel[] = [
    {
      id: 't-recent',
      title: 'Completed 5 days ago',
      column: 'done',
      type: 'card',
      createdAt: new Date(refTime - 10 * dayMs).toISOString(),
      completedAt: new Date(refTime - 5 * dayMs).toISOString(),
    },
    {
      id: 't-mid',
      title: 'Completed 20 days ago',
      column: 'done',
      type: 'subtask',
      createdAt: new Date(refTime - 25 * dayMs).toISOString(),
      completedAt: new Date(refTime - 20 * dayMs).toISOString(),
    },
    {
      id: 't-old',
      title: 'Completed 45 days ago',
      column: 'done',
      type: 'card',
      createdAt: new Date(refTime - 50 * dayMs).toISOString(),
      completedAt: new Date(refTime - 45 * dayMs).toISOString(),
    },
    {
      id: 't-active',
      title: 'In progress created 8 days ago',
      column: 'in_progress',
      type: 'initiative',
      createdAt: new Date(refTime - 8 * dayMs).toISOString(),
    },
  ];

  it('returns all tasks when timeWindow is "all" without type filters', () => {
    const result = filterTasksByDatasetConfig(tasks, { timeWindow: 'all' }, refTime);
    expect(result.length).toBe(4);
  });

  it('filters tasks within 14 days window', () => {
    const result = filterTasksByDatasetConfig(tasks, { timeWindow: 14 }, refTime);
    // t-recent (5d ago) and t-active (8d ago) should be included
    expect(result.map((t) => t.id)).toEqual(['t-recent', 't-active']);
  });

  it('filters tasks within 30 days window', () => {
    const result = filterTasksByDatasetConfig(tasks, { timeWindow: 30 }, refTime);
    // t-recent (5d), t-mid (20d), t-active (8d) should be included
    expect(result.map((t) => t.id)).toEqual(['t-recent', 't-mid', 't-active']);
  });

  it('filters tasks by selected item types', () => {
    const result = filterTasksByDatasetConfig(
      tasks,
      { timeWindow: 'all', selectedTypes: ['card'] },
      refTime
    );
    expect(result.map((t) => t.id)).toEqual(['t-recent', 't-old']);
  });

  it('filters tasks with custom date range', () => {
    const customStart = new Date(refTime - 25 * dayMs).toISOString();
    const customEnd = new Date(refTime - 15 * dayMs).toISOString();

    const result = filterTasksByDatasetConfig(
      tasks,
      {
        timeWindow: 'custom',
        customStartDate: customStart,
        customEndDate: customEnd,
      },
      refTime
    );

    // Only t-mid (completed 20d ago) falls between 25d and 15d ago
    expect(result.map((t) => t.id)).toEqual(['t-mid']);
  });
});
