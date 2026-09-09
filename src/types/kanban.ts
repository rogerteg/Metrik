/**
 * Metrik Domain Types & State Models
 * Specifications:
 * - specs/001-core-kanban-board/spec.md
 * - specs/002-wip-limits-and-flow-metrics/spec.md
 * - specs/005-column-management/spec.md
 */

export type ColumnCategory = 'todo' | 'in_progress' | 'done';

export interface ColumnModel {
  /** Identificador único da coluna */
  id: string;
  /** Nome visível da coluna */
  title: string;
  /** Categoria semântica para cálculo de métricas de fluxo */
  category: ColumnCategory;
  /** Limite de WIP (null = sem limite) */
  wipLimit: number | null;
  /** Esquema de cor opcional da coluna */
  colorScheme: 'todo' | 'progress' | 'blocked' | 'completed';
}

export type PriorityLevel = 'urgent' | 'high' | 'medium' | 'low';

export interface SubtaskModel {
  id: string;
  title: string;
  completed: boolean;
}

export interface TaskModel {
  /** Identificador único universal (UUID v4) */
  id: string;

  /** Conteúdo textual da tarefa */
  title: string;

  /** ID da Coluna atual da tarefa */
  column: string;

  /** Cor ou tag temática opcional */
  color?: string;

  /** Timestamp ISO 8601 da criação (criação do cartão) */
  createdAt: string;

  /** Timestamp ISO 8601 da última atualização */
  updatedAt?: string;

  /** Timestamp ISO 8601 do primeiro ingresso em in_progress ou done */
  startedAt?: string;

  /** Timestamp ISO 8601 da conclusão (ingresso em done) */
  completedAt?: string;

  /** Nível de criticidade / prioridade (Feature 004) */
  priority?: PriorityLevel;

  /** Lista de etiquetas/tags personalizadas (Feature 004) */
  tags?: string[];

  /** Descrição detalhada da tarefa (Feature 007) */
  description?: string;

  /** Subtarefas / checklist (Feature 007) */
  subtasks?: SubtaskModel[];
  dueDate?: string; // ISO 8601 string, e.g., '2026-10-15'
}

export interface BoardModel {
  id: string;
  name: string;
  createdAt: string;
  lastAccessed: string;
}

export interface BoardState {
  columns: ColumnModel[];
  tasks: Record<string, TaskModel[]>; // key is column.id
}

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
