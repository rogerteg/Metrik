/**
 * Metrik Domain Types & State Models
 * Specifications:
 * - specs/001-core-kanban-board/spec.md
 * - specs/002-wip-limits-and-flow-metrics/spec.md
 */

export enum ColumnType {
  TO_DO = 'Todo',
  IN_PROGRESS = 'In Progress',
  BLOCKED = 'Blocked',
  COMPLETED = 'Completed',
}

export type PriorityLevel = 'urgent' | 'high' | 'medium' | 'low';

export interface TaskModel {
  /** Identificador único universal (UUID v4) */
  id: string;

  /** Conteúdo textual da tarefa */
  title: string;

  /** Coluna / estado atual da tarefa */
  column: ColumnType;

  /** Cor ou tag temática opcional */
  color?: string;

  /** Timestamp ISO 8601 da criação (criação do cartão) */
  createdAt: string;

  /** Timestamp ISO 8601 da última atualização */
  updatedAt?: string;

  /** Timestamp ISO 8601 do primeiro ingresso em In Progress */
  startedAt?: string;

  /** Timestamp ISO 8601 da conclusão (ingresso em Completed) */
  completedAt?: string;

  /** Nível de criticidade / prioridade (Feature 004) */
  priority?: PriorityLevel;

  /** Lista de etiquetas/tags personalizadas (Feature 004) */
  tags?: string[];
}

export interface ColumnConfig {
  type: ColumnType;
  title: string;
  badgeLabel: string;
  colorScheme: 'todo' | 'progress' | 'blocked' | 'completed';
}

export type BoardState = Record<ColumnType, TaskModel[]>;

/** Limites de WIP por coluna (número inteiro >= 1 ou null para sem limite) */
export type WipLimitsState = Record<ColumnType, number | null>;

/** Estrutura sumarizada das métricas de fluxo do quadro */
export interface FlowMetricsSummary {
  /** Quantidade total de tarefas concluídas */
  throughput: number;

  /** Média do Lead Time em milissegundos (ou null se throughput == 0) */
  avgLeadTimeMs: number | null;

  /** Média do Cycle Time em milissegundos (ou null se throughput == 0) */
  avgCycleTimeMs: number | null;

  /** Texto formatado do Lead Time Médio (ex: "1h 30m", "< 1m" ou "-") */
  formattedAvgLeadTime: string;

  /** Texto formatado do Cycle Time Médio (ex: "45m", "< 1m" ou "-") */
  formattedAvgCycleTime: string;
}
