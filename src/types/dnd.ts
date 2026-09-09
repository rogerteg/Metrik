export interface DragItemData {
  taskId: string;
  sourceColumn: string;
}

export interface DragColumnData {
  columnId: string;
}

export type DropPosition = 'before' | 'after';

export interface DropTargetLocation {
  column: string;
  targetTaskId?: string;
  position?: DropPosition;
}

export interface ReorderOptions {
  activeTaskId: string;
  targetColumn: string;
  targetTaskId?: string;
  position?: DropPosition;
}
