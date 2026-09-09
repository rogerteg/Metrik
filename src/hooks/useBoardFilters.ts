import { useState, useMemo, useCallback } from 'react';
import { BoardState, PriorityLevel, TaskModel } from '../types/kanban';
import { FilterState, UseBoardFiltersReturn } from '../types/filter';

const INITIAL_FILTER_STATE: FilterState = {
  searchQuery: '',
  priorityFilter: 'all',
  selectedTags: [],
};

export function useBoardFilters(board: BoardState): UseBoardFiltersReturn {
  const [filters, setFilters] = useState<FilterState>(INITIAL_FILTER_STATE);

  const setSearchQuery = useCallback((query: string) => {
    setFilters((prev) => ({ ...prev, searchQuery: query }));
  }, []);

  const setPriorityFilter = useCallback((priority: PriorityLevel | 'all') => {
    setFilters((prev) => ({ ...prev, priorityFilter: priority }));
  }, []);

  const toggleTagFilter = useCallback((tag: string) => {
    setFilters((prev) => {
      const exists = prev.selectedTags.includes(tag);
      return {
        ...prev,
        selectedTags: exists
          ? prev.selectedTags.filter((t) => t !== tag)
          : [...prev.selectedTags, tag],
      };
    });
  }, []);

  const clearFilters = useCallback(() => {
    setFilters(INITIAL_FILTER_STATE);
  }, []);

  const hasActiveFilters = Boolean(
    filters.searchQuery.trim() !== '' ||
    filters.priorityFilter !== 'all' ||
    filters.selectedTags.length > 0
  );

  const availableTags = useMemo(() => {
    const tagsSet = new Set<string>();
    Object.values(board.tasks).forEach((tasks) => {
      tasks.forEach((task) => {
        task.tags?.forEach((tag) => {
          const trimmed = tag.trim();
          if (trimmed) {
            tagsSet.add(trimmed);
          }
        });
      });
    });
    return Array.from(tagsSet).sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }));
  }, [board]);

  const totalCount = useMemo(() => {
    return Object.values(board.tasks).reduce((acc, tasks) => acc + tasks.length, 0);
  }, [board]);

  const filteredBoard = useMemo<BoardState>(() => {
    const trimmedQuery = filters.searchQuery.trim().toLowerCase();

    const resultTasks: Record<string, TaskModel[]> = {};

    Object.keys(board.tasks).forEach((colId) => {
      const tasks = board.tasks[colId] ?? [];
      resultTasks[colId] = tasks.filter((task) => {
        // 1. Search Query Filter (task title)
        if (trimmedQuery && !task.title.toLowerCase().includes(trimmedQuery)) {
          return false;
        }

        // 2. Priority Filter
        if (filters.priorityFilter !== 'all' && task.priority !== filters.priorityFilter) {
          return false;
        }

        // 3. Tags Filter (match any of selected tags)
        if (filters.selectedTags.length > 0) {
          const taskTags = task.tags ?? [];
          const matchesAnySelected = filters.selectedTags.some((selectedTag) =>
            taskTags.some((t) => t.toLowerCase() === selectedTag.toLowerCase())
          );
          if (!matchesAnySelected) {
            return false;
          }
        }

        return true;
      });
    });

    return {
      columns: board.columns,
      tasks: resultTasks,
    };
  }, [board, filters]);

  const visibleCount = useMemo(() => {
    return Object.values(filteredBoard.tasks).reduce((acc, tasks) => acc + tasks.length, 0);
  }, [filteredBoard]);

  return {
    filters,
    setSearchQuery,
    setPriorityFilter,
    toggleTagFilter,
    clearFilters,
    hasActiveFilters,
    filteredBoard,
    availableTags,
    visibleCount,
    totalCount,
  };
}
