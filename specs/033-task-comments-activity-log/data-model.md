# Phase 1 Data Model: Comentários e Trilha de Auditoria de Ações da Tarefa

**Feature Branch**: `033-task-comments-activity-log`  
**Spec**: [`spec.md`](spec.md)  
**Date**: 2026-09-21  

---

## Entity Definitions & TypeScript Contracts

### 1. `TaskComment` Entity

Represents a human textual comment recorded on a task card.

```typescript
export interface TaskComment {
  /** Unique UUID v4 identifier for the comment */
  id: string;

  /** ID of the parent task */
  taskId: string;

  /** User ID of the comment author */
  userId: string;

  /** Display name of the comment author (e.g. "Rogerio Teixeira" or "Usuário do Sistema") */
  userName: string;

  /** Plain text content of the comment with line breaks preserved */
  text: string;

  /** Creation timestamp in ISO 8601 format */
  createdAt: string;
}
```

---

### 2. `TaskActivityLog` Entity

Represents an immutable, system-generated audit trail entry recording an action or state change on a task card.

```typescript
export type TaskActivityEventType =
  | 'created'
  | 'moved'
  | 'blocked'
  | 'unblocked'
  | 'priority_changed'
  | 'dates_changed'
  | 'tags_changed'
  | 'comment_added'
  | 'comment_deleted'
  | 'edited';

export interface TaskActivityLog {
  /** Unique UUID v4 identifier for the activity log entry */
  id: string;

  /** ID of the target task */
  taskId: string;

  /** User ID of the actor performing the action */
  userId: string;

  /** Display name of the actor */
  userName: string;

  /** Canonical event classification type */
  eventType: TaskActivityEventType;

  /** Human-readable Portuguese description of the event */
  description: string;

  /** Optional previous value before mutation (e.g. origin column name, previous priority) */
  fromValue?: string;

  /** Optional new value after mutation (e.g. destination column name, new priority) */
  toValue?: string;

  /** ISO 8601 timestamp when the event occurred */
  timestamp: string;
}
```

---

### 3. Extended `TaskModel` Interface

Existing `TaskModel` in `src/types/kanban.ts` is updated to include optional arrays for comments and activity logs:

```typescript
export interface TaskModel {
  id: string;
  title: string;
  description?: string;
  priority?: TaskPriority;
  tags?: string[];
  startDate?: string;
  dueDate?: string;
  completedAt?: string;
  isBlocked?: boolean;
  blockedReason?: string;
  // ... existing TaskModel fields ...

  /** List of human comments recorded on the task */
  comments?: TaskComment[];

  /** Immutable audit log trail of actions performed on the task */
  activityLog?: TaskActivityLog[];
}
```

---

## Validation & Business Rules

1. **Comment Text Submission**:
   - `text.trim().length > 0` required. Submitting empty or whitespace-only text MUST be blocked (submit button disabled).
   - Max length: 2,000 characters per comment.
2. **Comment Immutability & Deletion**:
   - Comments cannot be edited once created.
   - Deletion of a comment by author or admin removes the item from `task.comments` and automatically appends a `comment_deleted` event to `task.activityLog`.
3. **Audit Log Auto-Generation**:
   - Audit entries are generated atomically inside `useTaskCollection` during task operations.
   - Direct user editing or deletion of entries in `task.activityLog` is structurally prevented.
4. **Guest Profile Constraints (Principle VIII)**:
   - Users with role `guest` can view comments and activity logs.
   - Comment input form and delete actions are rendered disabled for `guest` users.
