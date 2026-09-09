import { ColumnType } from './kanban';

export interface DragItemData {
  taskId: string;
  sourceColumn: ColumnType;
}

export type DropPosition = 'before' | 'after';

export interface DropTargetLocation {
  column: ColumnType;
  targetTaskId?: string;
  position?: DropPosition;
}

export interface ReorderOptions {
  activeTaskId: string;
  targetColumn: ColumnType;
  targetTaskId?: string;
  position?: DropPosition;
}
