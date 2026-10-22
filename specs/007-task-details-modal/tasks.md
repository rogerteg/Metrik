# Implementation Tasks: Feature 007 (Task Details Modal)

> ⚠️ **Spec histórica — capacidade entregue.** `Modal.tsx` e `TaskDetailsModal.tsx` existem e evoluíram nas features 035–037. Este `tasks.md` é registro histórico; **não implementar**. _(Reconciliado em 2026-09-28.)_

## Phase 1: Data Model & State
- [x] T001 Update `TaskModel` in `src/types/kanban.ts` to include `description?: string` and `subtasks?: SubtaskModel[]`.
- [x] T002 Update `useTaskCollection.ts` to allow updating `description` and `subtasks` via `updateTask`.

## Phase 2: Modal Components
- [x] T003 Create `src/components/Modal.tsx` for the base accessible overlay and container.
- [x] T004 Create `src/components/TaskDetailsModal.tsx` mapping out the Title, Description (textarea with blur save), and Subtasks (checklist with add/toggle/delete logic).

## Phase 3: Integration
- [x] T005 Update `App.tsx` to host the `TaskDetailsModal` and manage `selectedTaskId` state.
- [x] T006 Pass down `onTaskClick` through `Board.tsx` to `Task.tsx`.
- [x] T007 Update `Task.tsx` to display visual indicators (Description icon, Subtasks count) and handle the click event to open the modal.

## Phase 4: Styling & Tests
- [x] T008 Add necessary CSS in `App.css` for the Modal overlay, inputs, and subtasks list to match the dark glassmorphism aesthetic.
- [x] T009 Write unit tests for `TaskDetailsModal.tsx` ensuring local state flushes to `updateTask` correctly.
- [x] T010 Update `Task.test.tsx` to assert that clicking triggers `onTaskClick` and visual indicators render properly.
- [x] T011 Run `npm run build` and `npm test` to ensure 100% pass rate.
