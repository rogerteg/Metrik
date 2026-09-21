# UI & Interface Contract: Task Comments and Activity Timeline

**Feature Branch**: `033-task-comments-activity-log`  
**Spec**: [`spec.md`](../spec.md)  
**Date**: 2026-09-21  

---

## Component Interface Contracts

### 1. `useTaskCollection` Hook Methods Extension

`useTaskCollection(boardId: string)` interface updated to expose comment and audit trail capabilities:

```typescript
export interface UseTaskCollectionReturn {
  // ... existing methods (addTask, updateTask, moveTask, etc.) ...

  /** Add a new comment to a task and log 'comment_added' activity event */
  addTaskComment: (taskId: string, text: string, user?: { id: string; name: string }) => void;

  /** Delete a comment from a task and log 'comment_deleted' activity event */
  deleteTaskComment: (taskId: string, commentId: string, user?: { id: string; name: string }) => void;

  /** Retrieve combined, filtered timeline items for a given task */
  getTaskTimeline: (
    taskId: string,
    filter: 'all' | 'comments' | 'activity'
  ) => Array<TimelineItem>;
}
```

---

### 2. Unified `TimelineItem` Union Contract

```typescript
export type TimelineItem =
  | {
      type: 'comment';
      id: string;
      taskId: string;
      userId: string;
      userName: string;
      text: string;
      timestamp: string; // ISO 8601
    }
  | {
      type: 'activity';
      id: string;
      taskId: string;
      userId: string;
      userName: string;
      eventType: TaskActivityEventType;
      description: string;
      fromValue?: string;
      toValue?: string;
      timestamp: string; // ISO 8601
    };
```

---

### 3. `TaskTimeline` Component Props Contract

```typescript
export interface TaskTimelineProps {
  taskId: string;
  comments?: TaskComment[];
  activityLog?: TaskActivityLog[];
  onAddComment: (text: string) => void;
  onDeleteComment?: (commentId: string) => void;
  currentUser?: { id: string; name: string; role?: 'admin' | 'member' | 'guest' };
}
```

---

### 4. DOM Identifiers & Accessibility Standards

- Timeline filter buttons:
  - `data-testid="timeline-filter-all"`
  - `data-testid="timeline-filter-comments"`
  - `data-testid="timeline-filter-activity"`
- Comment submission form:
  - `data-testid="comment-input-textarea"`
  - `data-testid="comment-submit-button"`
- Comment item container:
  - `data-testid="comment-item-{commentId}"`
  - `data-testid="comment-delete-button-{commentId}"`
- Activity log item container:
  - `data-testid="activity-log-item-{activityId}"`
