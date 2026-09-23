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
export interface TaskDetailsModalProps {
  taskId: string | null;
  isOpen: boolean;
  onClose: () => void;
  // Core task fields and callback bindings...
}
```
