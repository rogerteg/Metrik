# Technical Plan: Feature 005 - Column Management

## 1. Data Model Refactoring
The current architecture relies on a fixed `ColumnType` enum. We will migrate to a dynamic column structure.

### `src/types/kanban.ts`
- **[DELETE]** `ColumnType` enum.
- **[NEW]** `ColumnCategory = 'todo' | 'in_progress' | 'done'`
- **[NEW]** `ColumnModel`:
  ```ts
  export interface ColumnModel {
    id: string;
    title: string;
    category: ColumnCategory;
    wipLimit: number | null;
  }
  ```
- **[MODIFY]** `BoardState`: Instead of a simple `Record`, it should be an object representing the entire kanban state:
  ```ts
  export interface BoardState {
    columns: ColumnModel[];
    tasks: Record<string, TaskModel[]>; // key is column.id
  }
  ```
- **[MODIFY]** `TaskModel`: `column` changes from `ColumnType` to `string` (column ID).

## 2. State Management (`src/hooks/useTaskCollection.ts`)
- Refactor the initial state generation and seeding (`src/utils/seedData.ts`) to provide the new `BoardState` shape.
- Expose new methods:
  - `addColumn(title: string, category: ColumnCategory)`
  - `updateColumn(id: string, updates: Partial<ColumnModel>)`
  - `deleteColumn(id: string)`
  - `reorderColumn(sourceIndex: number, destinationIndex: number)`
- Refactor existing methods (`addTask`, `updateTask`, `deleteTask`, `moveTask`) to work dynamically by finding the column in `board.tasks[columnId]`.
- Fix the logic for setting `startedAt` and `completedAt`:
  - `startedAt` is set when a task enters a column where `category === 'in_progress'` or `category === 'done'`.
  - `completedAt` is set when a task enters a column where `category === 'done'`.

## 3. UI Component Updates
- **`src/components/Board.tsx`**:
  - Iterate over `board.columns` instead of `Object.values(ColumnType)`.
  - Pass the column model to `Column.tsx`.
- **`src/components/Column.tsx`**:
  - Update to accept `ColumnModel`.
  - Add UI for "Edit Column", "Delete Column" (if empty).
  - Drag handle for reordering columns (requires wrapping `Column` in a Draggable, and a horizontal Droppable in `Board.tsx`).
- **`src/components/MetricsBar.tsx`**:
  - Dynamically calculate throughput by finding tasks in all columns where `category === 'done'`.
- **`src/components/WipLimitBadge.tsx` & `useWipLimits.ts`**:
  - Use `column.wipLimit` directly from `ColumnModel` instead of `WipLimitsState` (we can deprecate `WipLimitsState` since limits are now intrinsically part of the column model).

## 4. Drag and Drop Refactoring
- **`src/utils/taskReorder.ts`**:
  - Needs to handle dynamic keys. The logic is mostly generic and just operates on `Record<string, TaskModel[]>`, so we just pass `board.tasks` to it.
  - Add logic to reorder columns array for column drag and drop.

## 5. Security & Invariants
- **Invariant**: Cannot delete a column if `board.tasks[columnId].length > 0`.
- **Invariant**: The board must have at least one column (preferably one of each category).
- **Migration**: For existing local storage data, if we encounter the old `Record<ColumnType, TaskModel[]>` format during `getInitialState`, we must perform a migration on-the-fly to build the new `columns` and `tasks` structure.
