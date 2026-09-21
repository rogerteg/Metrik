# Phase 0 Research: Comentários e Trilha de Auditoria de Ações da Tarefa

**Feature Branch**: `033-task-comments-activity-log`  
**Spec**: [`spec.md`](spec.md)  
**Date**: 2026-09-21  

---

## Technical Research & Key Decisions

### Decision 1: Activity Log Automatic Generation Strategy

- **Decision**: Encapsulate activity log creation directly inside `useTaskCollection` mutation handlers (`addTask`, `updateTask`, `moveTask`, `reorderOrMoveTask`, `toggleTaskBlocked`, `setTaskPriority`, `addTaskTag`, `removeTaskTag`).
- **Rationale**: 
  - Guarantees 100% audit log capture regardless of whether a task is moved via drag-and-drop, action toolbar, modal select, or API.
  - Centralizes event description generation (`eventType`, `fromValue`, `toValue`, `userName`, `timestamp ISO`).
  - Ensures audit log entries are immutable once recorded.
- **Alternatives Considered**: 
  - *Manual event creation in UI components*: Rejected because missing a call site in drag-and-drop or toolbar would create silent gaps in the audit trail.
  - *Database trigger only*: Rejected because Metrik operates under Local-First sovereignty (Principle VIII) and must function 100% offline without cloud DB triggers.

---

### Decision 2: Data Model & Storage Schema Integration

- **Decision**: Extend `TaskModel` interface with optional `comments?: TaskComment[]` and `activityLog?: TaskActivityLog[]` arrays.
- **Rationale**:
  - Keeps task payload self-contained and atomic in `localStorage` (`metrik_tasks_<boardId>`).
  - Seamlessly integrates with existing JSON serialization, board duplication, task deletion, and Supabase cloud sync (`pushToSupabase`/`pullFromSupabase`).
  - Backward compatible: tasks without `comments` or `activityLog` fall back to `[]` defensively.
- **Alternatives Considered**:
  - *Separate localStorage keys for comments (`metrik_comments_<taskId>`)*: Rejected due to key fragmentation, complex garbage collection on task deletion, and multi-key transaction overhead.

---

### Decision 3: Comment Formatting & Immutability Model

- **Decision**: Comments accept plain text with `white-space: pre-wrap` styling. Comments are append-only (immutable text after submission), with deletion supported for author or squad admin.
- **Rationale**:
  - Aligns with Session 2026-09-18 clarification.
  - Eliminates external Markdown parser dependencies, reducing bundle size and preventing XSS vulnerabilities.
  - Simplifies UI: no inline editing state, no draft conflict management for past comments.
- **Alternatives Considered**:
  - *Markdown / Rich Text Editor*: Rejected to preserve performance and simplicity (Principle V).

---

### Decision 4: Timeline Component Architecture & Filtering

- **Decision**: Create a unified `TaskTimeline` component embedded in `TaskDetailsModal` (or dedicated tab/section) with filter state (`'all' | 'comments' | 'activity'`).
- **Rationale**:
  - Provides a single chronological stream merging `TaskComment` and `TaskActivityLog` items.
  - Offers clear visual distinction: blue speech bubble icons for comments, directional arrows for movements, shield icons for block/unblock, tag icons for metadata edits.
  - Supports role-based access: Guest users see the timeline and filter bar, but the new comment input textarea is disabled with a clear indicator (Principle VIII).
- **Alternatives Considered**:
  - *Split tabs for Comments vs Audit*: Rejected because seeing comments interleaved with task movements in chronological order gives better context.

---

### Decision 5: Autosave & Intentional Persistence Compliance

- **Decision**: Integrate new comment submissions with `autoSaveComments` setting from Feature 032 / `GeneralSettingsContext`.
- **Rationale**:
  - In auto mode (`autoSaveComments = true`), submitting a comment persists immediately to local storage.
  - Draft comments in progress in the textarea trigger dirty state protection if the modal is dismissed before clicking "Comentar" (Principle IX).
- **Alternatives Considered**:
  - *Bypassing draft protection for comments*: Rejected to uphold Principle IX (User Data Integrity & Draft Protection).
