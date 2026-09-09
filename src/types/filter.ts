import { BoardState, PriorityLevel } from './kanban';

export interface FilterState {
  searchQuery: string;
  priorityFilter: PriorityLevel | 'all';
  selectedTags: string[];
  onlyBlocked: boolean;
}

export interface UseBoardFiltersReturn {
  filters: FilterState;
  setSearchQuery: (query: string) => void;
  setPriorityFilter: (priority: PriorityLevel | 'all') => void;
  toggleTagFilter: (tag: string) => void;
  toggleOnlyBlocked: () => void;
  clearFilters: () => void;
  hasActiveFilters: boolean;
  filteredBoard: BoardState;
  availableTags: string[];
  visibleCount: number;
  totalCount: number;
  blockedCount: number;
}
