# Tasks: Feature 010 (Multi-Board Support)

## Phase 1: Data Model & Storage Refactoring
- [x] T001 Update `src/types/kanban.ts` with the `BoardModel` interface.
- [x] T002 Create `src/hooks/useBoards.ts` to manage boards and handle the initial data migration.
- [x] T003 Write unit tests in `tests/unit/useBoards.test.ts` to verify legacy data migration.
- [x] T004 Update `src/hooks/useTaskCollection.ts` to accept `activeBoardId` and read/write scoped keys.
- [x] T005 Update `tests/unit/useTaskCollection.test.ts` to verify scoped board data fetching.

## Phase 2: Board Management UI
- [x] T006 Create `src/components/BoardSwitcher.tsx` to switch boards and invoke creation.
- [x] T007 Create `src/components/BoardManagementModal.tsx` for renaming/deleting boards.
- [x] T008 Integrate `BoardSwitcher` and `BoardManagementModal` into `src/App.tsx`.

## Phase 3: Global Context Updates
- [x] T009 Refactor `useAnalyticsData`, `useDataPortability`, and `useFlowMetrics` to respect `activeBoardId`.
- [x] T010 Run `npm run build` and `npm test` to verify zero broken tests.
