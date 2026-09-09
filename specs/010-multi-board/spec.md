# Feature 010: Multi-Board Support (Workspaces)

## 1. Context & Rationale
Currently, Metrik supports a single Kanban board whose state is persisted in `localStorage` under the key `metrik-tasks`. As users scale their agile workflows, they often need to manage multiple independent projects or teams (e.g., "Engineering", "Marketing", "Personal"). This feature will introduce the concept of "Boards" (or Workspaces), allowing users to create, switch between, and delete multiple independent Kanban boards.

## 2. Business Value
- **Scalability:** Users can manage multiple projects within the same application without mixing contexts.
- **Organization:** Teams can maintain isolated metrics, WIP limits, and column states for different workstreams.

## 3. Scope & Requirements

### 3.1. In Scope
- **Data Model Updates:**
  - Introduce a `BoardModel`: `{ id: string, name: string, createdAt: string, lastAccessed: string }`.
  - Update storage strategy to support multiple board states. Board task state should ideally be stored under a key like `metrik-tasks-<boardId>`.
  - Maintain a global index of boards: `metrik-boards-index`.
- **UI Enhancements:**
  - **Sidebar / Header Dropdown:** A board switcher allowing users to select their active board.
  - **Board Management UI:** A modal or panel to create new boards, rename them, and delete them.
- **State Management:**
  - Refactor data hooks (e.g., `useTaskCollection`) to accept a `boardId` and load the respective tasks and limits.
- **Migration Strategy:**
  - Backwards compatibility: Upon first load, gracefully migrate the existing `metrik-tasks` data into a default "Quadro Principal" (Main Board).

### 3.2. Out of Scope
- Backend synchronization (still 100% local `localStorage`).
- Cross-board task dragging (tasks cannot be moved between boards).
- Custom column configurations per board (all boards will share the standard flow).

## 4. User Stories
- **US1:** As a user, I want my existing tasks to automatically migrate to a "Quadro Principal" so I don't lose my current work.
- **US2:** As a user, I want to create a new, empty board so I can manage a separate project.
- **US3:** As a user, I want to switch between my existing boards without losing their individual states.
- **US4:** As a user, I want to delete a board I no longer need (along with all its tasks).

## 5. Technical Constraints
- Must remain 0-dependency.
- Must handle the migration of legacy data silently and robustly.

## 6. Analytical Reasoning (Pre-Task Creation)

### 6.1. First-Principles Thinking
- A "Board" is fundamentally a collection of Tasks, plus metadata (name, id, WIP limits).
- Changing boards means swapping the current list of tasks and updating the active board ID in state.
- LocalStorage needs a registry (`metrik-boards`) to know what boards exist, and a pointer (`metrik-active-board`) to remember the last used board.

### 6.2. Inversion & Premortem Analysis (Failure Modes)
- **Failure:** A user loads the app, the migration runs twice, or fails, resulting in data loss.
  - *Mitigation:* Ensure migration is idempotent. Only migrate if `metrik-tasks` exists AND `metrik-boards` does NOT exist. Once migrated, remove or safely archive `metrik-tasks`.
- **Failure:** User deletes a board, but its task data remains in localStorage (memory leak).
  - *Mitigation:* The delete board function MUST explicitly call `localStorage.removeItem` for that specific board's task key.
- **Failure:** User deletes the *last* board and is left with a broken UI.
  - *Mitigation:* Prevent deletion of the last board, or auto-create a new "Quadro Principal" if the boards array becomes empty.

### 6.3. MECE Task Validation
- **Data Layer:** Storage hooks, Board interface, Migration logic.
- **State Layer:** `useActiveBoard`, refactoring `useTaskCollection` to scope by Board ID.
- **Presentation Layer:** Board Switcher UI, Create/Delete Modals.
- **Verification Layer:** Unit tests for migration and board switching logic.

### 6.4. Tree of Thoughts & Trade-off Pruning
- **Storage Strategy:**
  - *Option A:* Store all tasks for all boards in a single JSON array under `metrik-tasks`, with a `boardId` on each task.
  - *Option B:* Store each board's tasks in a separate key (e.g., `metrik-tasks-boardId`).
  - *Decision:* Option B is superior for local storage limits and performance. Loading a board doesn't require parsing tasks from other boards.

### 6.5. Falsifiability & TDD
- Migration logic can be unit-tested by seeding `localStorage` with old data and asserting that the new keys are created.
- Board switcher can be tested by verifying that `useTaskCollection` loads different lists when `boardId` changes.
