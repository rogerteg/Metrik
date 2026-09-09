# Feature 007: Task Details Modal

## 1. Context & Rationale
Currently, tasks in Metrik only support a title, priority, and tags directly visible on the board's card. This limits the application's usefulness for complex workflows where tasks require extended descriptions, acceptance criteria, or subtasks. A "Task Details Modal" allows users to click a task card and open a dedicated view to manage rich metadata without cluttering the main Kanban view.

## 2. Business Value
- **Deeper Workflow Management:** Users can add detailed context (description) and break down work into checklists (subtasks).
- **Cleaner UI:** The Kanban board remains visually clean, only displaying essential summary data, while deep details are tucked away in the modal.

## 3. Scope & Requirements

### 3.1. In Scope
- **Data Model Update:** Extend `TaskModel` to include `description` (string) and `subtasks` (array of `{ id, title, completed }`).
- **Modal Component:** Create a reusable accessible `<Modal />` component.
- **Task Details View:** Inside the modal, allow users to:
  - Edit the task title.
  - Edit a multi-line `description` (standard textarea).
  - Add, edit, remove, and toggle `subtasks`.
  - View task metadata (creation date, started date, completed date).
  - Manage tags and priority (moving these controls from the card into the modal to simplify the card UI, or keeping them on the card while also allowing edits in the modal).
- **Card UI Update:** Show an icon/indicator on the task card if it has a description (e.g., a "hamburger" or lines icon) and a subtask progress indicator (e.g., "2/5").

### 3.2. Out of Scope
- Markdown rendering for descriptions (keeping it plain text or simple textarea for now to maintain 0-dependency, or minimal formatting). We will stick to a plain text `<textarea>` for MVP.
- File attachments.
- Assignees.

## 4. User Stories
- **US1 (Open Modal):** As a user, I want to click on a task card (or a specific "Details" button on the card) to open a modal with the task's full details.
- **US2 (Description):** As a user, I want to write and save a long-form description for my task.
- **US3 (Subtasks):** As a user, I want to create a checklist of subtasks and toggle their completion status.
- **US4 (Visual Cues):** As a user, I want to see a summary on the task card (e.g. "3/4 subtasks completed") so I know at a glance if there is more work inside.

## 5. Technical Constraints
- The modal must be accessible (trapping focus, closing on `ESC`, clicking outside to close).
- 0-dependency: Use native HTML `<dialog>` element or a custom React overlay component.
- The state updates for subtasks/description must flow through the existing `useTaskCollection` hook (via `updateTask`).

## 6. Analytical Reasoning (Pre-Task Creation)

### 6.1. First-Principles Thinking
- **Invariant:** A modal represents a focused view of a single piece of state. It must read from the single source of truth (the board state) and dispatch updates back to it.

### 6.2. Premortem Analysis (Failure Modes)
- *Risk:* Clicking a task to open a modal conflicts with the Drag-and-Drop functionality.
  - *Mitigation:* Ensure the `onClick` handler for opening the modal is attached to a specific interactive element (like a button or the text itself) or that the drag sensor correctly distinguishes between a click and a drag.
- *Risk:* Performance issues if typing in the description textarea re-renders the entire board.
  - *Mitigation:* Use local state within the `TaskDetailsModal` for controlled inputs, only flushing the updates to `updateTask` on blur or explicit save.

### 6.3. MECE Task Validation
- Data Model -> Hook Methods -> Components (Modal, Details Form, Card Updates) -> Tests.

### 6.4. Falsifiability & TDD
- Test that the modal opens and closes.
- Test that updating a description fires `updateTask`.
- Test that subtasks can be toggled and accurately persist.
