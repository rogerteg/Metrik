# Technical Implementation Plan: Feature 009 (Due Dates)

## 1. Architectural Approach
We will add `dueDate` as an optional string on the `TaskModel`. We will create a small utility function for date comparison that calculates the offset in days between "today" and the `dueDate`. 
This function will determine the status of the due date: `overdue`, `warning`, `normal`, or `completed`.

## 2. Component Modifications

### 2.1 `src/types/kanban.ts` (MODIFY)
- Add `dueDate?: string;` to `TaskModel`.

### 2.2 `src/utils/timeFormatters.ts` (MODIFY)
- Extract date status logic here:
  - `export type DueDateStatus = 'overdue' | 'warning' | 'normal' | 'completed';`
  - `export const getDueDateStatus = (dueDateStr: string, isTaskCompleted: boolean): DueDateStatus => { ... }`
  - Needs to safely parse `YYYY-MM-DD` and calculate days difference.

### 2.3 `src/components/TaskDetailsModal.tsx` (MODIFY)
- Add an input row for the deadline: `<input type="date" />`.
- Connect it to local state and trigger `onUpdateTask` when changed.

### 2.4 `src/components/Task.tsx` (MODIFY)
- Use `getDueDateStatus` to determine if a badge should render.
- Render a small icon and date text.
- Apply CSS classes based on status (`due-date-overdue`, `due-date-warning`, `due-date-normal`).

### 2.5 `src/components/TaskDetailsModal.css` & `App.css` (MODIFY)
- Style the native date picker to fit the dark glassmorphism theme.
- Add CSS variables or classes for the due date badges on the card (`var(--accent-red)` for overdue, `var(--accent-amber)` for warning).

## 3. Testing Strategy (`tests/unit/timeFormatters.test.ts` & Component Tests)
- Unit test `getDueDateStatus` extensively with mocked system times to ensure timezone offsets don't cause failures.
- Render test `Task.tsx` to assert the badge appears with the correct class based on mocked props.
