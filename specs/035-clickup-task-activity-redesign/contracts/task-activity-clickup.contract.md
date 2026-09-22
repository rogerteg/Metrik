# Component Contracts: ClickUp-Inspired Task Activity & Comments Redesign

**Feature**: 035-clickup-task-activity-redesign
**Date**: 2026-09-21

## Component Contracts

### 1. `TaskTimeline` (Container Component)

```tsx
export interface TaskTimelineProps {
  taskId: string;
  comments?: TaskComment[];
  activityLog?: TaskActivityLog[];
  onAddComment?: (text: string, isDecision?: boolean) => void;
  onDeleteComment?: (commentId: string) => void;
  isGuest?: boolean;
  totalBlockedMs?: number;
}
```

### 2. `TimelineStatsHeader` (Header Component)

```tsx
export interface TimelineStatsHeaderProps {
  totalComments: number;
  totalDecisions: number;
  totalMoves: number;
  totalBlockedMs?: number;
}
```

### 3. `TimelineFilterBar` (Filter & Search Component)

```tsx
export interface TimelineFilterBarProps {
  activeFilter: TimelineFilter;
  onFilterChange: (filter: TimelineFilter) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  densityMode: DensityMode;
  onDensityToggle: () => void;
}
```

### 4. `CommentInputForm` (Rich Toolbar & Submit Component)

```tsx
export interface CommentInputFormProps {
  onSubmitComment: (text: string, isDecision?: boolean) => void;
  disabled?: boolean;
}
```

### 5. `CommentItem` (Comment Card Component)

```tsx
export interface CommentItemProps {
  comment: TaskComment;
  onDelete?: (id: string) => void;
  isGuest?: boolean;
  densityMode?: DensityMode;
}
```

### 6. `ActivityLogItem` (Diff Pill Activity Card)

```tsx
export interface ActivityLogItemProps {
  activity: TaskActivityLog;
  densityMode?: DensityMode;
}
```

---

## Strict Icon Sizing Rule Contract

All SVG icons across all 6 components MUST observe:
- HTML attributes: `width={16}` and `height={16}` (or `width={14}`/`height={14}` for sub-elements).
- Inline style: `style={{ width: 16, height: 16, flexShrink: 0 }}`.
- CSS class: `.timeline-icon { width: 16px; height: 16px; flex-shrink: 0; }`.
