# UI Component Contracts: Task Details Modal & Activity System

**Feature Branch**: `036-task-details-modal-redesign`  
**Date**: 2026-09-22  
**Spec**: [spec.md](../spec.md)  

---

## 1. Component Interfaces

### 1.1 TaskDetailsModal
Main 2-column container component.

```typescript
export interface TaskDetailsModalProps {
  /** Target task object or null when closed */
  task: Task | null;

  /** Callback fired when the modal requests close */
  onClose: () => void;

  /** Callback fired when task fields are updated (title, description, status, priority, squad, etc.) */
  onUpdateTask: (updatedTask: Partial<Task>) => void;

  /** User role for permission checking ('admin' | 'member' | 'guest') */
  userRole?: 'admin' | 'member' | 'guest';
}
```

---

### 1.2 TimelineFilterBar
Filter and statistical control bar integrated into top of timeline.

```typescript
export interface TimelineFilterBarProps {
  /** Active filter selection */
  activeFilter: TimelineFilter;

  /** Callback when filter changes */
  onFilterChange: (filter: TimelineFilter) => void;

  /** Density mode ('detailed' | 'compact') */
  densityMode: DensityMode;

  /** Callback when density mode toggles */
  onDensityToggle: () => void;

  /** Real-time search query */
  searchQuery: string;

  /** Callback when search query changes */
  onSearchChange: (query: string) => void;

  /** Item count statistics */
  stats: {
    totalComments: number;
    totalDecisions: number;
    totalActivities: number;
  };
}
```

---

### 1.3 ActivityFeed
Feed component rendering comments and activity log cards.

```typescript
export interface ActivityFeedProps {
  /** Array of formatted timeline items (comments and activity logs) */
  items: TimelineItem[];

  /** Current density mode */
  densityMode: DensityMode;

  /** Callback to delete a comment */
  onDeleteComment?: (commentId: string) => void;

  /** Callback to toggle decision pin status */
  onTogglePinDecision?: (commentId: string) => void;

  /** Guest mode flag (hides delete/pin actions) */
  isReadOnly?: boolean;
}
```

---

### 1.4 MarkdownRenderer
Sub-component responsible for safe, styled Markdown parsing.

```typescript
export interface MarkdownRendererProps {
  /** Raw Markdown text */
  content: string;

  /** Optional CSS class additions */
  className?: string;
}
```
