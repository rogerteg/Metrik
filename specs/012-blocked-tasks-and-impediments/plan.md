# Technical Implementation Plan: Feature 012 (Blocked Tasks & Impediments)

## 1. Overview
This plan outlines the design and implementation of Blocked Task management and impediment duration tracking in Metrik. Users will be able to mark any task as blocked, enter an explanation, visualize the blockage directly on the Kanban board, and track the cumulative duration spent in a blocked state.

## 2. Architecture & Data Flow

### 2.1. State Model (`TaskModel`)
In `src/types/kanban.ts`:
```typescript
export interface TaskModel {
  // ... existing fields ...
  blocked?: boolean;
  blockedReason?: string;
  blockedAt?: string; // ISO 8601 string
  totalBlockedMs?: number;
}
```

### 2.2. Blocked Duration Calculation
In `src/utils/timeFormatters.ts`:
- `calculateTaskBlockedTimeMs(task: TaskModel, referenceTimeMs?: number): number`:
  - Returns total accrued blocked time.
  - If currently blocked: adds `(referenceTimeMs || Date.now()) - new Date(task.blockedAt).getTime()` to `task.totalBlockedMs || 0`.
  - If unblocked: returns `task.totalBlockedMs || 0`.
- `formatBlockedTime(ms: number): string`: Formats duration into human-readable strings (e.g., `< 1m`, `45m`, `2h 15m`, `3d 4h`).

### 2.3. State Transition Methods in `useTaskCollection.ts`
- `toggleTaskBlocked(taskId: string, reason?: string)`:
  - If currently unblocked:
    - Sets `blocked = true`, `blockedReason = reason || ''`, `blockedAt = new Date().toISOString()`.
  - If currently blocked:
    - Calculates elapsed time: `Math.max(0, Date.now() - new Date(task.blockedAt).getTime())`.
    - Updates: `blocked = false`, `totalBlockedMs = (task.totalBlockedMs || 0) + elapsed`, `blockedAt = undefined`.
- `updateBlockedReason(taskId: string, reason: string)`:
  - Updates `blockedReason` without altering timer state.

### 2.4. Presentation Layer
- **`src/components/Task.tsx`**:
  - Adds `.task-card-blocked` border highlight.
  - Renders red warning badge `⛔ Bloqueado` with impediment tooltip.
- **`src/components/TaskDetailsModal.tsx`**:
  - Dedicated block for Impediments with toggle button, reason textarea/input, and display of accumulated blocked time.
- **`src/App.css`**:
  - Distinctive visual styling with red accents and glassmorphism attention highlights.

## 3. Step-by-Step Implementation

### Phase 1: Data Model & Calculation Utilities
1. Extend `TaskModel` in `src/types/kanban.ts`.
2. Implement `calculateTaskBlockedTimeMs` and `formatBlockedTime` in `src/utils/timeFormatters.ts`.
3. Add unit tests in `tests/unit/timeFormatters.test.ts`.

### Phase 2: State Transitions & Hook Methods
4. Add `toggleTaskBlocked` and `updateBlockedReason` to `src/hooks/useTaskCollection.ts`.
5. Write unit tests in `tests/unit/useTaskCollection.test.ts` verifying start, stop, reason updates, and cumulative duration.

### Phase 3: UI Implementation & Styling
6. Update `src/components/Task.tsx` with blocked badge and border styles.
7. Update `src/components/TaskDetailsModal.tsx` with the Blocked management interface.
8. Wire callbacks in `src/App.tsx`.
9. Add CSS rules in `src/App.css`.
10. Write component tests in `Task.test.tsx` and `TaskDetailsModal.test.tsx`.

### Phase 4: Verification & Integration
11. Run `npm test` and `npm run build` to verify 100% pass rate.
