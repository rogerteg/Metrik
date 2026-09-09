import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useBoardFilters } from '../../src/hooks/useBoardFilters';
import { BoardState } from '../../src/types/kanban';

describe('useBoardFilters Hook (Foundational)', () => {
  const sampleBoard: BoardState = {
    columns: [
      { id: 'todo', title: 'Todo', category: 'todo', wipLimit: null, colorScheme: 'todo' },
      { id: 'in-progress', title: 'In Progress', category: 'in_progress', wipLimit: null, colorScheme: 'progress' },
      { id: 'blocked', title: 'Blocked', category: 'in_progress', wipLimit: null, colorScheme: 'blocked' },
      { id: 'completed', title: 'Completed', category: 'done', wipLimit: null, colorScheme: 'completed' },
    ],
    tasks: {
      'todo': [
        {
          id: 't-1',
          title: 'Criar API REST',
          column: 'todo',
          createdAt: '2026-09-01T10:00:00Z',
          priority: 'high',
          tags: ['Backend', 'API'],
        },
        {
          id: 't-2',
          title: 'Desenhar tela de login',
          column: 'todo',
          createdAt: '2026-09-01T10:05:00Z',
          priority: 'medium',
          tags: ['Frontend', 'UI'],
        },
      ],
      'in-progress': [
        {
          id: 't-3',
          title: 'Corrigir bug crítico de auth',
          column: 'in-progress',
          createdAt: '2026-09-01T09:00:00Z',
          priority: 'urgent',
          tags: ['Bug', 'Backend'],
        },
      ],
      'blocked': [],
      'completed': [
        {
          id: 't-4',
          title: 'Configurar CI/CD',
          column: 'completed',
          createdAt: '2026-09-01T08:00:00Z',
          priority: 'low',
          tags: ['DevOps'],
        },
      ],
    }
  };

  it('returns complete board and zero active filters initially', () => {
    const { result } = renderHook(() => useBoardFilters(sampleBoard));

    expect(result.current.hasActiveFilters).toBe(false);
    expect(result.current.totalCount).toBe(4);
    expect(result.current.visibleCount).toBe(4);
    expect(result.current.filteredBoard.tasks['todo'].length).toBe(2);
    expect(result.current.availableTags).toEqual(
      expect.arrayContaining(['API', 'Backend', 'Bug', 'DevOps', 'Frontend', 'UI'])
    );
  });

  it('filters by search query case-insensitively', () => {
    const { result } = renderHook(() => useBoardFilters(sampleBoard));

    act(() => {
      result.current.setSearchQuery('api');
    });

    expect(result.current.hasActiveFilters).toBe(true);
    expect(result.current.visibleCount).toBe(1);
    expect(result.current.filteredBoard.tasks['todo'].map((t) => t.id)).toEqual(['t-1']);
    expect(result.current.filteredBoard.tasks['in-progress'].length).toBe(0);
  });

  it('filters by priority level', () => {
    const { result } = renderHook(() => useBoardFilters(sampleBoard));

    act(() => {
      result.current.setPriorityFilter('urgent');
    });

    expect(result.current.hasActiveFilters).toBe(true);
    expect(result.current.visibleCount).toBe(1);
    expect(result.current.filteredBoard.tasks['in-progress'].map((t) => t.id)).toEqual(['t-3']);
  });

  it('filters by selected tag', () => {
    const { result } = renderHook(() => useBoardFilters(sampleBoard));

    act(() => {
      result.current.toggleTagFilter('Backend');
    });

    expect(result.current.hasActiveFilters).toBe(true);
    expect(result.current.visibleCount).toBe(2);
    expect(result.current.filteredBoard.tasks['todo'].map((t) => t.id)).toEqual(['t-1']);
    expect(result.current.filteredBoard.tasks['in-progress'].map((t) => t.id)).toEqual(['t-3']);
  });

  it('combines search query, priority filter and tag filter with logical AND', () => {
    const { result } = renderHook(() => useBoardFilters(sampleBoard));

    act(() => {
      result.current.setSearchQuery('bug');
      result.current.setPriorityFilter('urgent');
      result.current.toggleTagFilter('Backend');
    });

    expect(result.current.visibleCount).toBe(1);
    expect(result.current.filteredBoard.tasks['in-progress'].map((t) => t.id)).toEqual(['t-3']);
  });

  it('resets all filters on clearFilters()', () => {
    const { result } = renderHook(() => useBoardFilters(sampleBoard));

    act(() => {
      result.current.setSearchQuery('api');
      result.current.setPriorityFilter('high');
      result.current.toggleTagFilter('Backend');
    });
    expect(result.current.hasActiveFilters).toBe(true);

    act(() => {
      result.current.clearFilters();
    });

    expect(result.current.hasActiveFilters).toBe(false);
    expect(result.current.filters.searchQuery).toBe('');
    expect(result.current.filters.priorityFilter).toBe('all');
    expect(result.current.filters.selectedTags).toEqual([]);
    expect(result.current.visibleCount).toBe(4);
  });

  it('filters by onlyBlocked and computes blockedCount (Feature 013)', () => {
    const boardWithBlocked: BoardState = {
      ...sampleBoard,
      tasks: {
        ...sampleBoard.tasks,
        'todo': [
          ...sampleBoard.tasks['todo'],
          {
            id: 't-blocked',
            title: 'Tarefa Bloqueada',
            column: 'todo',
            createdAt: '2026-09-01T10:00:00Z',
            blocked: true,
            blockedReason: 'Falta spec',
          }
        ]
      }
    };

    const { result } = renderHook(() => useBoardFilters(boardWithBlocked));

    expect(result.current.blockedCount).toBe(1);
    expect(result.current.filters.onlyBlocked).toBe(false);
    expect(result.current.visibleCount).toBe(5);

    act(() => {
      result.current.toggleOnlyBlocked();
    });

    expect(result.current.hasActiveFilters).toBe(true);
    expect(result.current.filters.onlyBlocked).toBe(true);
    expect(result.current.visibleCount).toBe(1);
    expect(result.current.filteredBoard.tasks['todo'].map(t => t.id)).toEqual(['t-blocked']);

    // Toggle back
    act(() => {
      result.current.toggleOnlyBlocked();
    });
    expect(result.current.filters.onlyBlocked).toBe(false);
    expect(result.current.visibleCount).toBe(5);
  });
});
