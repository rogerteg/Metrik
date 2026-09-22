# UI Contract Specification: Enterprise Task Timeline & Activity Log

**Feature Branch**: `034-enhanced-task-timeline` | **Date**: 2026-09-21 | **Spec**: [`spec.md`](../spec.md)

---

## Component Interface Contracts

### 1. `TaskTimeline` (Main Container Component)

```typescript
export interface TaskTimelineProps {
  /** Target task ID */
  taskId: string;
  
  /** Array of comments attached to the task */
  comments?: TaskComment[];
  
  /** Array of automated audit log events */
  activityLog?: TaskActivityLog[];
  
  /** Callback fired when a new comment is submitted */
  onAddComment: (text: string, isDecision?: boolean) => void;
  
  /** Optional callback to delete a comment */
  onDeleteComment?: (commentId: string) => void;
  
  /** Flag for read-only guest confinement */
  isGuest?: boolean;
}
```

---

### 2. `TimelineFilterBar` (Filter Component with "Decisões" Tab)

```typescript
export interface TimelineFilterBarProps {
  /** Active selected filter category */
  activeFilter: TimelineFilter; // 'all' | 'decisions' | 'comments' | 'activity'
  
  /** Handler when filter category changes */
  onFilterChange: (filter: TimelineFilter) => void;
  
  /** Active search query string */
  searchQuery: string;
  
  /** Handler when search query text changes */
  onSearchChange: (query: string) => void;
  
  /** Density mode choice */
  densityMode: DensityMode; // 'detailed' | 'compact'
  
  /** Handler when density mode is toggled */
  onToggleDensity: () => void;
  
  /** Item count badges */
  counts: {
    all: number;
    decisions: number;
    comments: number;
    activity: number;
  };
}
```

---

### 3. `TimelineStatsHeader` (Summary Header Component)

```typescript
export interface TimelineStatsHeaderProps {
  totalComments: number;
  totalDecisions: number;
  totalMoves: number;
  totalBlockedMs?: number;
}
```

---

### 4. `CommentInputForm` (Form Component with Decision Toggle & Markdown Toolbar)

```typescript
export interface CommentInputFormProps {
  onSubmitComment: (text: string, isDecision: boolean) => void;
  disabled?: boolean;
}
```

---

### 5. Accessibility Attributes & Test IDs

- Filter buttons MUST have `data-testid="timeline-filter-all"`, `data-testid="timeline-filter-decisions"`, `data-testid="timeline-filter-comments"`, `data-testid="timeline-filter-activity"`.
- Search input MUST have `data-testid="timeline-search-input"`.
- Decision comment items MUST have `data-testid="comment-decision-item"`.
- Activity diff cards MUST render `[fromValue]` and `[toValue]` in distinct styled spans with `data-testid="activity-diff-card"`.
