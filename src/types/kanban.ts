/**
 * Metrik Domain Types & State Models
 * Specification: specs/001-core-kanban-board/spec.md
 */

export enum ColumnType {
  TO_DO = 'Todo',
  IN_PROGRESS = 'In Progress',
  BLOCKED = 'Blocked',
  COMPLETED = 'Completed',
}

export interface TaskModel {
  /** Identificador único universal (UUID v4) */
  id: string;

  /** Conteúdo textual da tarefa */
  title: string;

  /** Coluna / estado atual da tarefa */
  column: ColumnType;

  /** Cor ou tag temática opcional */
  color?: string;

  /** Timestamp ISO 8601 da criação */
  createdAt: string;

  /** Timestamp ISO 8601 da última atualização */
  updatedAt?: string;
}

export interface ColumnConfig {
  type: ColumnType;
  title: string;
  badgeLabel: string;
  colorScheme: 'todo' | 'progress' | 'blocked' | 'completed';
}

export type BoardState = Record<ColumnType, TaskModel[]>;
