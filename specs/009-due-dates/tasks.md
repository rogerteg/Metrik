# Implementation Tasks: Feature 009 (Due Dates)

## Phase 1: Data Model & Utilities
- [ ] T001 Update `src/types/kanban.ts` to add `dueDate?: string;` to `TaskModel`.
- [ ] T002 Update `src/utils/timeFormatters.ts` with `getDueDateStatus` and `formatDateShort`.
- [ ] T003 Write unit tests for date calculation logic in `timeFormatters.test.ts`.

## Phase 2: Task Details Modal Integration
- [ ] T004 Update `src/components/TaskDetailsModal.tsx` to include an `<input type="date">`.
- [ ] T005 Update `TaskDetailsModal.test.tsx` to verify setting and clearing the due date.

## Phase 3: Task Card Visualization
- [ ] T006 Update `src/components/Task.tsx` to render the due date badge with appropriate color classes.
- [ ] T007 Update `src/components/Task.test.tsx` to verify the due date badge rendering and CSS classes.

## Phase 4: Styling & Finalization
- [ ] T008 Add CSS for the date input in `TaskDetailsModal.css` and the badge colors in `App.css`.
- [ ] T009 Run `npm run build` and `npm test` to ensure a 100% pass rate.
