import { BoardState, SprintModel, TaskModel } from '../types/kanban';
import { getSprintTasks, calculateSprintProgress, calculateSprintPoints } from './sprintMetrics';

/**
 * Metrik CSV Export (Feature 041) — serialização pura (RFC 4180) de dados existentes.
 * Sem estado, sem rede, sem dependências externas.
 */

/** Escapa um valor para CSV: aspas duplicadas e campo entre aspas quando necessário. */
export function escapeCsvValue(value: unknown): string {
  if (value === undefined || value === null) return '';
  const text = String(value);
  if (/[",\n\r]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}

/** Monta um CSV a partir de cabeçalho + linhas. */
export function toCsv(headers: string[], rows: unknown[][]): string {
  return [headers, ...rows].map((row) => row.map(escapeCsvValue).join(',')).join('\n');
}

const columnLabel = (board: BoardState, columnId: string): string =>
  board.columns.find((c) => c.id === columnId)?.title ?? columnId;

const sprintName = (board: BoardState, sprintId?: string | null): string => {
  if (!sprintId) return '';
  return (board.sprints ?? []).find((s) => s.id === sprintId)?.name ?? '';
};

/** CSV das tarefas do quadro (uma linha por tarefa). */
export function buildTasksCsv(board: BoardState): string {
  const headers = [
    'id',
    'titulo',
    'coluna',
    'categoria',
    'prioridade',
    'responsavel',
    'estimativa',
    'sprint',
    'tags',
    'bloqueado',
    'criado_em',
    'iniciado_em',
    'concluido_em',
    'ultima_movimentacao',
  ];

  const rows: unknown[][] = [];
  for (const column of board.columns) {
    for (const task of board.tasks[column.id] ?? []) {
      rows.push([
        task.id,
        task.title,
        columnLabel(board, column.id),
        column.category,
        task.priority ?? '',
        task.assignee ?? '',
        task.estimation ?? '',
        sprintName(board, task.sprintId),
        (task.tags ?? []).join('; '),
        task.blocked ? 'sim' : 'nao',
        task.createdAt,
        task.startedAt ?? '',
        task.completedAt ?? '',
        task.lastMovedAt ?? '',
      ]);
    }
  }

  return toCsv(headers, rows);
}

/** CSV resumido das sprints (tarefas/concluídas e pontos derivados). */
export function buildSprintsCsv(sprints: SprintModel[] | undefined, tasks: TaskModel[]): string {
  const headers = [
    'id',
    'nome',
    'status',
    'inicio',
    'fim',
    'tarefas',
    'concluidas',
    'pontos_comprometidos',
    'pontos_concluidos',
    'criado_em',
    'concluido_em',
  ];

  const rows = (sprints ?? []).map((sprint) => {
    const sprintTasks = getSprintTasks(sprint.id, tasks);
    const progress = calculateSprintProgress(sprintTasks);
    const points = calculateSprintPoints(sprintTasks);
    return [
      sprint.id,
      sprint.name,
      sprint.status,
      sprint.startDate ?? '',
      sprint.endDate ?? '',
      progress.total,
      progress.completed,
      points.committed,
      points.completed,
      sprint.createdAt,
      sprint.completedAt ?? '',
    ];
  });

  return toCsv(headers, rows);
}
