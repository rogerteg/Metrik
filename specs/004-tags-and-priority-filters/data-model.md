# Data Model: Etiquetas (Tags), Prioridades e Filtros

**Feature**: `004-tags-and-priority-filters`  
**Date**: 2026-09-09  
**Status**: Completed  

---

## 1. Modelo de Domínio Estendido

O modelo `TaskModel` em `src/types/kanban.ts` é enriquecido com campos opcionais para prioridade e etiquetas:

```typescript
// src/types/kanban.ts

export type PriorityLevel = 'urgent' | 'high' | 'medium' | 'low';

export interface PriorityConfig {
  level: PriorityLevel;
  label: string;
  color: string;
  bg: string;
  border: string;
}

export interface TaskModel {
  id: string;
  title: string;
  column: ColumnType;
  color?: string;
  createdAt: string;
  updatedAt?: string;
  startedAt?: string;
  completedAt?: string;
  // Campos da Feature 004:
  priority?: PriorityLevel;
  tags?: string[];
}
```

---

## 2. Configurações de Prioridade

Mapeamento visual constante em `src/utils/priorityConfig.ts`:

```typescript
export const PRIORITY_CONFIG: Record<PriorityLevel, PriorityConfig> = {
  urgent: {
    level: 'urgent',
    label: 'Urgente',
    color: '#f43f5e',
    bg: 'rgba(244, 63, 94, 0.15)',
    border: 'rgba(244, 63, 94, 0.4)',
  },
  high: {
    level: 'high',
    label: 'Alta',
    color: '#f97316',
    bg: 'rgba(249, 115, 22, 0.15)',
    border: 'rgba(249, 115, 22, 0.4)',
  },
  medium: {
    level: 'medium',
    label: 'Média',
    color: '#eab308',
    bg: 'rgba(234, 179, 8, 0.15)',
    border: 'rgba(234, 179, 8, 0.4)',
  },
  low: {
    level: 'low',
    label: 'Baixa',
    color: '#38bdf8',
    bg: 'rgba(56, 189, 248, 0.15)',
    border: 'rgba(56, 189, 248, 0.4)',
  },
};
```

---

## 3. Modelo do Estado de Filtros (`FilterState`)

```typescript
// src/types/filter.ts

import { PriorityLevel } from './kanban';

export interface FilterState {
  searchQuery: string;
  priority: PriorityLevel | 'all';
  selectedTags: string[];
}

export interface UseBoardFiltersReturn {
  filters: FilterState;
  setSearchQuery: (query: string) => void;
  setPriorityFilter: (priority: PriorityLevel | 'all') => void;
  toggleTagFilter: (tag: string) => void;
  clearFilters: () => void;
  hasActiveFilters: boolean;
  filteredBoard: Record<string, TaskModel[]>;
  availableTags: string[];
  totalVisibleTasks: number;
  totalBoardTasks: number;
}
```

---

## 4. Novas Ações no Hook `useTaskCollection`

```typescript
export interface UseTaskCollectionReturn {
  board: BoardState;
  addTask: (column: ColumnType, title?: string) => TaskModel;
  updateTask: (id: string, updates: Partial<Pick<TaskModel, 'title' | 'color' | 'column' | 'priority' | 'tags'>>) => void;
  deleteTask: (id: string) => void;
  moveTask: (id: string, targetColumn: ColumnType) => void;
  reorderOrMoveTask: (options: ReorderOptions) => void;
  // Novas ações dedicadas para conveniência e clareza de intenção:
  setTaskPriority: (taskId: string, priority?: PriorityLevel) => void;
  addTaskTag: (taskId: string, tag: string) => void;
  removeTaskTag: (taskId: string, tag: string) => void;
  discardIfEmpty: (id: string) => void;
  clearTasks: () => void;
  resetToSeed: () => void;
}
```
