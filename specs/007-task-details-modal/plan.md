# Technical Implementation Plan: Feature 007 (Task Details Modal)

## 1. Architectural Approach
We will introduce a `Modal` component and a `TaskDetails` component. The `TaskDetails` component will receive the `task` and callback functions to dispatch updates (`onUpdateTask`).
To prevent re-rendering the entire board on every keystroke when typing a long description, `TaskDetails` will maintain internal state for text inputs and flush changes to `updateTask` on `blur` or when the modal closes.

## 2. Component Modifications

### 2.1 `src/types/kanban.ts` (MODIFY)
- Extend `TaskModel`:
  ```typescript
  export interface SubtaskModel {
    id: string;
    title: string;
    completed: boolean;
  }
  ```
  - Add `description?: string;`
  - Add `subtasks?: SubtaskModel[];`

### 2.2 `src/hooks/useTaskCollection.ts` (MODIFY)
- Extend the `updates` parameter of `updateTask` to accept `description` and `subtasks`.
  ```typescript
  updateTask: (id: string, updates: Partial<Pick<TaskModel, 'title' | 'color' | 'column' | 'priority' | 'tags' | 'description' | 'subtasks'>>) => void;
  ```

### 2.3 `src/components/Modal.tsx` (NEW)
- A reusable component using a standard overlay `<div>` and a central modal box.
- Features: Close on click outside, close on `Escape` key, focus trapping (basic).
- Receives `isOpen`, `onClose`, `title`, and `children`.

### 2.4 `src/components/TaskDetailsModal.tsx` (NEW)
- Wrapper around `Modal` that renders the specific fields for a task.
- Internal state:
  - `localDescription`: state synchronized with `task.description` on mount, flushed on `blur`.
- Subtasks manager:
  - Input to add a new subtask.
  - List of subtasks with a checkbox (toggles completion) and a delete button.
  - Changes to subtasks directly call `updateTask`.

### 2.5 `src/components/Task.tsx` (MODIFY)
- Add UI indicators:
  - If `task.description` is non-empty, show an icon (e.g., `≡`).
  - If `task.subtasks` exists and has length > 0, show `(completed/total)` count.
- Update `onClick` behavior. Clicking the body of the task card opens the `TaskDetailsModal`.
- Need to ensure this doesn't conflict with Drag-and-Drop. Since native HTML5 DnD uses the `draggable` attribute, clicking usually still fires click events.

### 2.6 `src/App.tsx` or `src/components/Board.tsx` (MODIFY)
- The modal state (`selectedTaskId` / `isModalOpen`) should ideally be lifted to `Board.tsx` or `App.tsx` to ensure it overlays the entire application properly. We'll add this state to `App.tsx` and pass a `onTaskClick` handler down through `Board` to `Task`.

## 3. Testing Strategy (`tests/unit/TaskDetailsModal.test.tsx` and `Task.test.tsx`)
- Verify the modal renders task data.
- Verify that editing the description and blurring triggers `updateTask`.
- Verify subtask addition, toggle, and removal triggers `updateTask`.
- Verify `Task.tsx` displays the correct icons/badges for description and subtasks.

## 4. Risks & Migrations
- Old tasks won't have `subtasks` or `description`, which is fine since they will be typed as optional and the UI will handle undefined safely (rendering nothing).
