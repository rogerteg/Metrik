import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useBacklogForecast } from '../../src/hooks/useBacklogForecast';
import { TaskModel } from '../../src/types/kanban';

const mockTasks: TaskModel[] = [
  {
    id: 'init-1',
    title: 'Iniciativa Alpha',
    column: 'in_progress',
    type: 'initiative',
    dueDate: '2026-12-01',
    createdAt: '2026-10-01T10:00:00Z',
  },
  {
    id: 'card-1',
    title: 'Tarefa 1',
    column: 'in_progress',
    type: 'card',
    createdAt: '2026-10-02T10:00:00Z',
    links: [
      {
        id: 'l1',
        targetTaskId: 'init-1',
        relationType: 'relates_to',
        targetBoardId: 'b1',
        targetTeamId: 't1',
        createdAt: '2026-10-02T10:00:00Z',
      },
    ],
    tags: ['mvp'],
    sprintId: 'sprint-1',
  },
  {
    id: 'card-2',
    title: 'Tarefa 2 (concluída)',
    column: 'done',
    type: 'card',
    createdAt: '2026-10-02T10:00:00Z',
    completedAt: '2026-10-15T12:00:00Z',
    links: [
      {
        id: 'l2',
        targetTaskId: 'init-1',
        relationType: 'relates_to',
        targetBoardId: 'b1',
        targetTeamId: 't1',
        createdAt: '2026-10-02T10:00:00Z',
      },
    ],
    tags: ['mvp'],
    sprintId: 'sprint-1',
  },
  {
    id: 'card-3',
    title: 'Tarefa 3',
    column: 'todo',
    type: 'card',
    createdAt: '2026-10-05T10:00:00Z',
    tags: ['mvp', 'frontend'],
    sprintId: 'sprint-2',
  },
];

// Mock tasks that completed on 12 distinct days to provide sufficient throughput
const historicalTasks: TaskModel[] = Array.from({ length: 12 }, (_, i) => ({
  id: `hist-${i}`,
  title: `Histórica ${i}`,
  column: 'done',
  createdAt: '2026-09-01T10:00:00Z',
  completedAt: `2026-10-${String(i + 1).padStart(2, '0')}T12:00:00Z`,
}));

const allBoardTasks = [...mockTasks, ...historicalTasks];
const fixedRefDate = new Date('2026-11-01T10:00:00Z');

describe('useBacklogForecast hook (Feature 056)', () => {
  it('initializes with default all scope and extracts pending tasks', () => {
    const { result } = renderHook(() =>
      useBacklogForecast({
        tasks: allBoardTasks,
        referenceDate: fixedRefDate,
      }),
    );

    expect(result.current.scopeType).toBe('all');
    expect(result.current.scope.pendingTasks.length).toBeGreaterThan(0);
    expect(result.current.isSampleSufficient).toBe(true);
  });

  it('filters by initiative and infers targetDate from initiative.dueDate', () => {
    const { result } = renderHook(() =>
      useBacklogForecast({
        tasks: allBoardTasks,
        initialScopeType: 'initiative',
        initialScopeId: 'init-1',
        referenceDate: fixedRefDate,
      }),
    );

    expect(result.current.scopeType).toBe('initiative');
    expect(result.current.scopeId).toBe('init-1');
    expect(result.current.targetDate).toBe('2026-12-01');
    // card-1 is pending and linked to init-1
    expect(result.current.scope.pendingTasks.map((t) => t.id)).toContain('card-1');
    expect(result.current.forecastResult).not.toBeNull();
    expect(result.current.forecastResult?.p85.days).toBeGreaterThan(0);
    expect(result.current.forecastResult?.targetDateAnalysis).toBeDefined();
    expect(result.current.forecastResult?.targetDateAnalysis?.probability).toBeGreaterThan(0);
  });

  it('allows toggling task selection and updates forecast item count', () => {
    const { result } = renderHook(() =>
      useBacklogForecast({
        tasks: allBoardTasks,
        initialScopeType: 'initiative',
        initialScopeId: 'init-1',
        referenceDate: fixedRefDate,
      }),
    );

    const initialPendingCount = result.current.scope.selectedTaskIds.length;
    expect(initialPendingCount).toBeGreaterThan(0);

    // Deselect card-1
    act(() => {
      result.current.toggleTaskSelection('card-1');
    });

    expect(result.current.scope.selectedTaskIds).not.toContain('card-1');
    expect(result.current.scope.selectedTaskIds.length).toBe(initialPendingCount - 1);
  });

  it('supports selectAll and clearSelection helpers', () => {
    const { result } = renderHook(() =>
      useBacklogForecast({
        tasks: allBoardTasks,
        initialScopeType: 'all',
        referenceDate: fixedRefDate,
      }),
    );

    // Clear all
    act(() => {
      result.current.clearSelection();
    });
    expect(result.current.scope.selectedTaskIds.length).toBe(0);

    // Select all
    act(() => {
      result.current.selectAll();
    });
    expect(result.current.scope.selectedTaskIds.length).toBe(
      result.current.scope.pendingTasks.length,
    );
  });

  it('switches scope to sprint and tag dynamically', () => {
    const { result } = renderHook(() =>
      useBacklogForecast({
        tasks: allBoardTasks,
        referenceDate: fixedRefDate,
      }),
    );

    // Switch to sprint
    act(() => {
      result.current.setScopeType('sprint');
      result.current.setScopeId('sprint-1');
    });
    expect(result.current.scopeType).toBe('sprint');
    expect(result.current.scopeId).toBe('sprint-1');
    expect(result.current.scope.scopeTitle).toContain('sprint-1');

    // Switch to tag
    act(() => {
      result.current.setScopeType('tag');
      result.current.setScopeId('frontend');
    });
    expect(result.current.scopeType).toBe('tag');
    expect(result.current.scopeId).toBe('frontend');
    expect(result.current.scope.scopeTitle).toContain('frontend');
  });

  it('allows overriding targetDate and recalculates targetDateAnalysis', () => {
    const { result } = renderHook(() =>
      useBacklogForecast({
        tasks: allBoardTasks,
        initialScopeType: 'initiative',
        initialScopeId: 'init-1',
        referenceDate: fixedRefDate,
      }),
    );

    // Set impossible date in the past
    act(() => {
      result.current.setTargetDate('2026-10-10');
    });

    expect(result.current.targetDate).toBe('2026-10-10');
    expect(result.current.forecastResult?.targetDateAnalysis?.probability).toBe(0);
    expect(result.current.forecastResult?.targetDateAnalysis?.riskLevel).toBe('critical');
  });
});
