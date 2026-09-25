# UI Component Contracts: Task Details Activity & Objective Fields Redesign

## 1. TaskActivityHeader Component Contract

`src/components/TaskActivityHeader.tsx`

```typescript
export interface TaskActivityHeaderProps {
  unreadCount: number;
  isSearchOpen: boolean;
  searchQuery: string;
  selectedCategory: ActivityCategoryFilter;
  onToggleSearch: () => void;
  onSearchQueryChange: (query: string) => void;
  onToggleUnreadFilter: () => void;
  onSelectCategoryFilter: (category: ActivityCategoryFilter) => void;
}
```

---

## 2. TaskActivityLogList Component Contract

`src/components/TaskActivityLogList.tsx`

```typescript
export interface TaskActivityLogListProps {
  entries: ActivityLogEntry[];
  isExpanded: boolean;
  collapseThreshold?: number; // Default: 5
  onToggleExpand: () => void;
  emptyStateMessage?: string; // Default: "Nenhuma atividade registrada ainda"
}
```

---

## 3. TaskActivityLogItem Component Contract

`src/components/TaskActivityLogItem.tsx`

```typescript
export interface TaskActivityLogItemProps {
  entry: ActivityLogEntry;
}
```

---

## 4. TaskActivityCommentForm Component Contract

`src/components/TaskActivityCommentForm.tsx`

```typescript
export interface TaskActivityCommentFormProps {
  taskId: string;
  onSubmitComment: (commentText: string) => void;
  onDirtyStateChange?: (isDirty: boolean) => void;
}
```

---

## 5. TaskDetailsModal Redesign Layout Contract

`src/components/TaskDetailsModal.tsx`

```typescript
export type TaskDetailTab = 'overview' | 'activity' | 'metrics';

export interface TaskDetailsModalProps {
  task: TaskModel;
  isOpen: boolean;
  onClose: () => void;
  onUpdateTask: (id: string, updates: Partial<TaskModel>) => void;
  onToggleBlocked?: (id: string, reason?: string) => void;
  onAddComment?: (taskId: string, text: string, isDecision?: boolean) => void;
  onDeleteComment?: (taskId: string, commentId: string) => void;
  boardTasks?: TaskModel[];
  columns?: ColumnModel[];
  currentBoardId?: string;
  currentTeamId?: string;
  allBoards?: BoardModel[];
  teams?: Team[];
  users?: User[];          // Fonte para o seletor de Responsável
  isReadOnly?: boolean;
  autoSaveComments?: boolean;
  autoSaveDebounceMs?: number;
  onAddLink?: (targetTaskId: string, relationType: TaskRelationType, targetBoardId: string, targetTeamId: string) => void;
  onRemoveLink?: (targetTaskId: string) => void;
  onNavigateToBoard?: (boardId: string) => void;
}
```

**Layout contract:** context header (breadcrumb + status/assignee pills), title, tab list (`Visão Geral`, `Atividade`, `Métricas`), tab panels, and a metadata sidebar (`TaskMetadataSidebar`) exposing Priority, Assignee, Type, Dates and Impediment.

---

## 6. TaskFlowMetricsPanel Contract

`src/components/TaskFlowMetricsPanel.tsx`

```typescript
export interface TaskFlowMetricsPanelProps {
  task: TaskModel;
  currentColumnTitle?: string;
  pendingBlockersCount?: number;
  initiativeProgress?: { total: number; completed: number; percentage: number };
}
```

---

## 7. Removed Components (historical — 2026-09-25, T032)

The contracts in sections 1–4 (`TaskActivityHeader`, `TaskActivityLogList`, `TaskActivityLogItem`, `TaskActivityCommentForm`) are **historical**. Those components, `TaskActivityPanel`, the `useTaskActivity` hook and the `activityFormatter` utility were unused after the tabbed redesign and have been **deleted**, together with their unit tests and the orphan `TaskActivityPanel.css`.

Activity rendering and timestamps now have a single source of truth:
- Feed: `TaskTimeline` → `CommentItem` / `ActivityLogItem`.
- Timestamp formatting: `CommentItem.formatDate` (`dd/mm/aaaa às hh:mm`).
- Filtering/sorting: `filterTimelineItems` in `taskActivityLogger.ts`.
