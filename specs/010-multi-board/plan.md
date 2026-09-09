# Technical Implementation Plan: Feature 010 (Multi-Board Support)

## 1. Overview
Introduce `BoardModel` and refactor the storage hooks to support multiple boards. The data layer will handle migration from the single `metrik-tasks` key to a multi-key system (`metrik-boards-index` + `metrik-tasks-<id>`). The UI will include a dropdown in the Header to switch boards and a modal to manage them.

## 2. Architecture & Data Flow

### 2.1. Storage Keys
- `metrik-boards-index`: Array of `BoardModel`.
- `metrik-active-board`: ID of the currently selected board.
- `metrik-tasks-<boardId>`: Array of `TaskModel` for a specific board.

### 2.2. Components
- **`src/types/kanban.ts`**: Define `BoardModel`.
- **`src/hooks/useBoards.ts`**: New hook to manage boards (create, delete, rename, switch) and handle the initial migration.
- **`src/hooks/useTaskCollection.ts`**: Refactor to accept `boardId` as a parameter and use dynamic `localStorage` keys.
- **`src/components/Header.tsx`** (or `BoardSwitcher.tsx`): UI to display the active board and switch/create boards.
- **`src/components/BoardManagementModal.tsx`**: Modal for creating/editing/deleting boards.
- **`src/App.tsx`**: Integrate `useBoards` and pass the active `boardId` down to the Kanban `Board` component.

## 3. Step-by-Step Implementation

### Phase 1: Data Model & Storage Refactoring
1. Update `types/kanban.ts` with `BoardModel`.
2. Create `useBoards.ts` hook.
   - Implement migration logic: If `metrik-tasks` exists but `metrik-boards-index` doesn't, create a default board, move the tasks to `metrik-tasks-<default_id>`, and set it as active.
   - Expose `boards`, `activeBoardId`, `createBoard`, `deleteBoard`, `setActiveBoard`.
3. Update `useTaskCollection.ts` to accept `activeBoardId` and read/write to `metrik-tasks-${activeBoardId}`.

### Phase 2: Board Management UI
4. Build `BoardSwitcher` component (dropdown/select) to place in the app header.
5. Build `BoardManagementModal` to allow renaming and deleting the active board, or creating new ones.

### Phase 3: Integration
6. Update `App.tsx` to mount `BoardSwitcher` and `BoardManagementModal`.
7. Pass `activeBoardId` to the board hooks and components.
8. Ensure cross-cutting features (like Analytics and Data Portability) are aware of the active board.

### Phase 4: Testing & Polish
9. Write unit tests for `useBoards.ts` (especially the migration logic).
10. Update `useDataPortability` to export/import the entire suite of boards or just the active one (we'll start with exporting the active board for simplicity).
11. Run all tests and verify the UI.

## 4. Open Questions / Trade-offs
- **Data Portability:** Should `/export` download all boards or just the active board? 
  - *Decision:* To keep it simple and backwards compatible, we will export/import just the active board for now, or export a bundled JSON if requested. We will stick to exporting the active board.
