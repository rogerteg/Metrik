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
  /** Cor personalizada ou pré-configurada da coluna (formato hex) */
  color?: string;
}

export const PRESET_COLUMN_COLORS: { name: string; hex: string }[] = [
  { name: 'Indigo', hex: '#6366f1' },
  { name: 'Sky Blue', hex: '#38bdf8' },
  { name: 'Amber', hex: '#f59e0b' },
  { name: 'Purple', hex: '#a855f7' },
  { name: 'Pink', hex: '#ec4899' },
  { name: 'Rose', hex: '#f43f5e' },
  { name: 'Emerald', hex: '#10b981' },
  { name: 'Slate', hex: '#64748b' },
];

export const getDefaultColumnColor = (column?: { colorScheme?: string; category?: ColumnCategory; color?: string } | null): string => {
  if (!column) return '#38bdf8';
  if (column.color) return column.color;
  switch (column.colorScheme) {
    case 'todo': return '#6366f1';
    case 'progress': return '#38bdf8';
    case 'blocked': return '#f43f5e';
    case 'completed': return '#10b981';
    default:
      if (column.category === 'todo') return '#6366f1';
      if (column.category === 'done') return '#10b981';
      return '#38bdf8';
  }
};


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

  /** Data de Início da Tarefa (planejada ou de execução) */
  startDate?: string;

  /** Data de Fim da Tarefa (planejada ou conclusão) */
  endDate?: string;

  /** Critérios de Aceitação da tarefa (Acceptance Criteria) */
  acceptanceCriteria?: string;

  /** Cenários de Testes da tarefa (Test Scenarios / BDD) */
  testScenarios?: string;

  /** Sinalização de impedimento / bloqueio (Feature 012) */
  blocked?: boolean;
  blockedReason?: string;
  blockedAt?: string; // Timestamp ISO de quando foi bloqueada
  totalBlockedMs?: number; // Duração acumulada de bloqueio em ms
}

/** Dias sem movimentação para considerar o cartão estagnado (marrom) */
export const STAGNATION_THRESHOLD_DAYS = 3;
export const STAGNANT_BROWN_COLOR = '#8B4513'; // Saddle Brown / Marrom

/**
 * Verifica se a tarefa está há muito tempo parada no board sem movimentação.
 * Regra: tarefas que não estejam na coluna concluída ('done') cujo tempo
 * desde a última movimentação (updatedAt ou createdAt) seja superior ao limite em dias.
 */
export function isTaskStagnant(task: TaskModel, isCompletedColumn: boolean = false, thresholdDays: number = STAGNATION_THRESHOLD_DAYS, nowMs: number = Date.now()): boolean {
  if (isCompletedColumn) return false;

  const referenceDateStr = task.updatedAt || task.createdAt;
  if (!referenceDateStr) return false;

  const refMs = new Date(referenceDateStr).getTime();
  if (isNaN(refMs)) return false;

  const elapsedDays = (nowMs - refMs) / (1000 * 60 * 60 * 24);
  return elapsedDays >= thresholdDays;
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

  /** Quantidade de tarefas atualmente bloqueadas no quadro (Feature 013) */
  blockedCount: number;

  /** Eficiência de Fluxo percentual [0, 100] ou null se sem tarefas concluídas */
  flowEfficiency: number | null;

  /** Texto formatado da Eficiência de Fluxo (ex: "85%", "< 1%" ou "-") */
  formattedFlowEfficiency: string;
}

/** Limite máximo recomendado e operacional de colunas no quadro (Feature 014) */
export const MAX_COLUMNS = 12;

/** Mensagem de alerta para tentativa de movimentação em sentido retrógrado (Feature 014) */
export const FLOW_REGRESSION_WARNING_MESSAGE =
  'Cuidado! Você irá perder todas as métricas do fluxo. Card em sentido único, somente da esquerda para a direita.';

/** Mensagem de alerta para tentativa de movimentação de tarefa bloqueada */
export const BLOCKED_TASK_MOVE_WARNING_MESSAGE =
  'Esta tarefa está bloqueada e não pode ser movida de coluna. Desbloqueie a tarefa para movimentá-la.';

