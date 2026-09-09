# Specification: Feature 005 - Column Management

## 1. Overview
The Metrik Kanban Board currently uses a hardcoded set of four columns (`To Do`, `In Progress`, `Blocked`, `Completed`). To support custom team workflows, this feature introduces dynamic Column Management, allowing users to add, rename, reorder, and delete columns.

## 2. Requirements
- **FR-001 (Add Column)**: Users can add a new column to the board. They must provide a title and optionally a WIP limit.
- **FR-002 (Edit Column)**: Users can rename a column and change its WIP limit.
- **FR-003 (Delete Column)**: Users can delete a column. To prevent data loss, a column can only be deleted if it contains zero tasks.
- **FR-004 (Reorder Columns)**: Users can reorder columns left and right to redefine their workflow sequence.
- **FR-005 (Metrics Integrity)**: The flow metrics (Lead Time, Cycle Time, Throughput) must continue to function. To do this, columns should have a defined "category" (e.g., `todo`, `in_progress`, `done`) so the system knows when work starts and finishes.

## 3. Acceptance Criteria
- **US1**: As a user, I can click "Add Column" to create a new phase in my workflow.
- **US2**: As a user, I can edit the name and WIP limit of any existing column.
- **US3**: As a user, I can delete a column only if it is empty.
- **US4**: As a user, I can reorder columns to change the visual flow of my board.
- **US5**: As a user, my flow metrics are accurately calculated based on tasks entering the `in_progress` category and arriving at the `done` category.

## 4. Technical Constraints
- No external heavy dependencies.
- Use `localStorage` for state persistence.
- Maintain existing glassmorphism aesthetic.
