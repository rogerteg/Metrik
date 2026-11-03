import { BoardState, PriorityLevel } from './kanban';

export interface FilterState {
  searchQuery: string;
  priorityFilter: PriorityLevel | 'all';
  selectedTags: string[];
  onlyBlocked: boolean;
  /**
   * Filtro rápido para exibir apenas cartões com risco de SLE (P50, P85, P95) (Feature 054)
   */
  onlySleRisk?: boolean;
  /**
   * Filtro por sprint (Feature 038):
   * `'all'` (todas) | `'active'` (sprint ativa) | `'none'` (sem sprint) | `<sprintId>`.
   */
  sprintFilter: string;
}

export interface UseBoardFiltersReturn {
  filters: FilterState;
  setSearchQuery: (query: string) => void;
  setPriorityFilter: (priority: PriorityLevel | 'all') => void;
  toggleTagFilter: (tag: string) => void;
  toggleOnlyBlocked: () => void;
  toggleOnlySleRisk?: () => void;
  setSprintFilter: (sprintFilter: string) => void;
  clearFilters: () => void;
  hasActiveFilters: boolean;
  filteredBoard: BoardState;
  availableTags: string[];
  visibleCount: number;
  totalCount: number;
  blockedCount: number;
  sleRiskCount?: number;
}
