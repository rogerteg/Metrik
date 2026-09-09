# Implementation Tasks: Feature 007 (Task Details Modal)

## Phase 1: Data Model & State
- [ ] T001 Update `TaskModel` in `src/types/kanban.ts` to include `description?: string` and `subtasks?: SubtaskModel[]`.
- [ ] T002 Update `useTaskCollection.ts` to allow updating `description` and `subtasks` via `updateTask`.

## Phase 2: Modal Components
- [ ] T003 Create `src/components/Modal.tsx` for the base accessible overlay and container.
- [ ] T004 Create `src/components/TaskDetailsModal.tsx` mapping out the Title, Description (textarea with blur save), and Subtasks (checklist with add/toggle/delete logic).

## Phase 3: Integration
- [ ] T005 Update `App.tsx` to host the `TaskDetailsModal` and manage `selectedTaskId` state.
- [ ] T006 Pass down `onTaskClick` through `Board.tsx` to `Task.tsx`.
- [ ] T007 Update `Task.tsx` to display visual indicators (Description icon, Subtasks count) and handle the click event to open the modal.

## Phase 4: Styling & Tests
- [ ] T008 Add necessary CSS in `App.css` for the Modal overlay, inputs, and subtasks list to match the dark glassmorphism aesthetic.
- [ ] T009 Write unit tests for `TaskDetailsModal.tsx` ensuring local state flushes to `updateTask` correctly.
- [ ] T010 Update `Task.test.tsx` to assert that clicking triggers `onTaskClick` and visual indicators render properly.
- [ ] T011 Run `npm run build` and `npm test` to ensure 100% pass rate.
