/**
 * Flow Report Exporter (Feature 051)
 *
 * Implements immutable snapshot building, RFC 4180 pt-BR Excel CSV serialization,
 * and client-side download utilities conforming to Constitution Principles V, VII, VIII, and IX.
 */

import { ColumnModel, TaskModel } from '../types/kanban';
import { MikaInsight } from '../types/mika';
import {
  FlowReportSnapshot,
  TaskExportRow,
  ExportOptions,
  FlowReportMetrics,
  CycleTimePercentiles,
  MikaInsightSnippet,
  BlockerReportSummary,
  BlockerReportReason,
} from '../types/reports';
import { calculateFlowPercentiles } from './statistics';

export interface ReportBoardLike {
  id: string;
  name?: string;
  title?: string;
  teamId?: string;
  columns?: ColumnModel[];
}

export interface TaskBlockerEntry {
  id?: string;
  reason?: string;
  blockedAt: string;
  unblockedAt?: string;
}

export type ReportTaskLike = Partial<TaskModel> & {
  id: string;
  title: string;
  createdAt: string;
  column?: string;
  columnId?: string;
  category?: string;
  storyPoints?: number;
  sprint?: string;
  blockers?: TaskBlockerEntry[];
};

/**
 * Escapes a field according to RFC 4180 rules using semicolon (;) support for Excel pt-BR.
 * If the field contains quotation marks, semicolons, or line breaks, it is enclosed
 * in double quotes and inner quotation marks are doubled.
 */
export function escapeCsvField(value: unknown): string {
  if (value === undefined || value === null) {
    return '';
  }
  const text = String(value);
  if (/[";\n\r]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}

/**
 * Formats a numeric value using comma (,) as decimal separator for pt-BR Excel.
 */
export function formatDecimalPtBr(num: number | undefined | null, decimals = 1): string {
  if (num === undefined || num === null || isNaN(num)) {
    return '-';
  }
  return Number(num).toFixed(decimals).replace('.', ',');
}

/**
 * Formats an ISO date string to Brazilian date/time format: DD/MM/YYYY HH:mm
 */
export function formatDatePtBr(isoString?: string | null): string {
  if (!isoString) return '-';
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return '-';
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${day}/${month}/${year} ${hours}:${minutes}`;
  } catch {
    return '-';
  }
}

/**
 * Maps English priority codes to localized pt-BR terms.
 */
export function formatPriorityPtBr(priority?: string): string {
  switch (priority) {
    case 'urgent':
      return 'Urgente';
    case 'high':
      return 'Alta';
    case 'medium':
      return 'Média';
    case 'low':
      return 'Baixa';
    default:
      return 'Média';
  }
}

/**
 * Computes the duration in hours of all blockers for a task.
 */
export function calculateTaskBlockedHours(task: ReportTaskLike): number {
  if (task.totalBlockedMs && task.totalBlockedMs > 0) {
    return task.totalBlockedMs / (1000 * 60 * 60);
  }
  if (!task.blockers || task.blockers.length === 0) {
    return 0;
  }
  let totalMs = 0;
  for (const b of task.blockers) {
    const start = new Date(b.blockedAt).getTime();
    const end = b.unblockedAt ? new Date(b.unblockedAt).getTime() : Date.now();
    if (!isNaN(start) && !isNaN(end) && end >= start) {
      totalMs += end - start;
    }
  }
  return totalMs / (1000 * 60 * 60);
}

/**
 * Builds an immutable, point-in-time consolidated snapshot of board flow metrics.
 */
export function buildFlowReportSnapshot(
  board: ReportBoardLike,
  tasks: ReportTaskLike[],
  options: ExportOptions,
  mikaInsights?: MikaInsight[],
  filterSummary = 'Todos os dados do quadro',
): FlowReportSnapshot {
  const totalTasks = tasks.length;

  // Identificar tarefas concluídas
  const completedTasks = tasks.filter((t) => Boolean(t.completedAt));
  const throughput = completedTasks.length;

  // Calcular tempos de Lead Time (createdAt -> completedAt)
  const leadTimesDays: number[] = [];
  // Calcular tempos de Cycle Time (startedAt -> completedAt)
  const cycleTimesDays: number[] = [];

  for (const t of completedTasks) {
    const created = new Date(t.createdAt).getTime();
    const completed = new Date(t.completedAt!).getTime();
    if (!isNaN(created) && !isNaN(completed) && completed >= created) {
      const days = (completed - created) / (1000 * 60 * 60 * 24);
      leadTimesDays.push(days);
    }

    if (t.startedAt) {
      const started = new Date(t.startedAt).getTime();
      if (!isNaN(started) && !isNaN(completed) && completed >= started) {
        const days = (completed - started) / (1000 * 60 * 60 * 24);
        cycleTimesDays.push(days);
      }
    }
  }

  const avgLeadTimeDays =
    leadTimesDays.length > 0
      ? leadTimesDays.reduce((a, b) => a + b, 0) / leadTimesDays.length
      : 0;

  const avgCycleTimeDays =
    cycleTimesDays.length > 0
      ? cycleTimesDays.reduce((a, b) => a + b, 0) / cycleTimesDays.length
      : 0;

  // Percentis de Cycle Time (P50, P85, P95)
  const percentilesData = calculateFlowPercentiles(cycleTimesDays);
  const percentiles: CycleTimePercentiles = {
    p50: percentilesData.p50,
    p85: percentilesData.p85,
    p95: percentilesData.p95,
  };

  const sleP85Days = percentiles.p85;
  const compliantItems = cycleTimesDays.filter((ct) => ct <= sleP85Days).length;
  const sleComplianceRate =
    cycleTimesDays.length > 0
      ? Math.round((compliantItems / cycleTimesDays.length) * 100)
      : 0;

  // Contagem de WIP (tarefas com startedAt mas sem completedAt)
  const wipTasks = tasks.filter((t) => t.startedAt && !t.completedAt);
  const wipCount = wipTasks.length;

  // Métricas de impedimentos
  let totalBlockedHours = 0;
  let tasksWithBlockersCount = 0;
  const reasonsMap = new Map<string, { count: number; impactHours: number }>();

  for (const t of tasks) {
    const taskHours = calculateTaskBlockedHours(t);
    const hasBlockers = Boolean(
      taskHours > 0 ||
        t.blocked ||
        (t.blockers && t.blockers.length > 0),
    );
    if (hasBlockers) {
      tasksWithBlockersCount++;
      totalBlockedHours += taskHours;

      if (t.blockers && t.blockers.length > 0) {
        for (const b of t.blockers) {
          const duration = b.unblockedAt
            ? (new Date(b.unblockedAt).getTime() - new Date(b.blockedAt).getTime()) / (1000 * 60 * 60)
            : (Date.now() - new Date(b.blockedAt).getTime()) / (1000 * 60 * 60);
          const reasonKey = b.reason?.trim() || 'Outro / Não especificado';
          const existing = reasonsMap.get(reasonKey) ?? { count: 0, impactHours: 0 };
          reasonsMap.set(reasonKey, {
            count: existing.count + 1,
            impactHours: existing.impactHours + Math.max(0, duration),
          });
        }
      } else if (t.blockedReason) {
        const reasonKey = t.blockedReason.trim();
        const existing = reasonsMap.get(reasonKey) ?? { count: 0, impactHours: 0 };
        reasonsMap.set(reasonKey, {
          count: existing.count + 1,
          impactHours: existing.impactHours + taskHours,
        });
      }
    }
  }

  const blockerRatePercent =
    totalTasks > 0 ? (tasksWithBlockersCount / totalTasks) * 100 : 0;

  const topReasons: BlockerReportReason[] = Array.from(reasonsMap.entries())
    .map(([reason, data]) => ({
      reason,
      count: data.count,
      impactHours: Number(data.impactHours.toFixed(1)),
    }))
    .sort((a, b) => b.impactHours - a.impactHours);

  const blockerSummary: BlockerReportSummary = {
    totalBlockers: tasksWithBlockersCount,
    totalImpactHours: Number(totalBlockedHours.toFixed(1)),
    topReasons,
  };

  const metrics: FlowReportMetrics = {
    throughput,
    avgLeadTimeDays: Number(avgLeadTimeDays.toFixed(1)),
    avgCycleTimeDays: Number(avgCycleTimeDays.toFixed(1)),
    sleP85Days,
    sleComplianceRate,
    blockerRatePercent: Number(blockerRatePercent.toFixed(1)),
    totalBlockedHours: Number(totalBlockedHours.toFixed(1)),
  };

  // Mika AI Insights opcionais
  let mikaSnippets: MikaInsightSnippet[] | undefined = undefined;
  if (options.includeMikaInsights && mikaInsights && mikaInsights.length > 0) {
    mikaSnippets = mikaInsights.map((insight) => ({
      id: insight.id,
      title: insight.title,
      message: `${insight.summary}${insight.recommendation ? ` Recomendao: ${insight.recommendation}` : ''}`,
      severity: insight.severity,
      category: insight.category,
    }));
  }

  const resolvedTitle = board.title || board.name || 'Quadro';

  return {
    boardId: board.id,
    boardTitle: resolvedTitle,
    squadName: board.teamId,
    generatedAt: new Date().toISOString(),
    dateWindow: {
      label: filterSummary,
    },
    filterSummary,
    totalTasks,
    completedTasks: throughput,
    wipCount,
    metrics,
    percentiles,
    mikaInsights: mikaSnippets,
    blockerSummary: options.includeBlockerBreakdown ? blockerSummary : undefined,
  };
}

/**
 * Projects Kanban tasks into normalized tabular rows for spreadsheet export (18 columns).
 */
export function projectTasksToExportRows(
  tasks: ReportTaskLike[],
  columns: ColumnModel[] = [],
  includeSubtasks = false,
): TaskExportRow[] {
  const columnMap = new Map<string, string>();
  for (const c of columns) {
    columnMap.set(c.id, c.title);
  }

  const rows: TaskExportRow[] = [];

  for (const task of tasks) {
    const colId = task.columnId || task.column || '';
    const columnName = columnMap.get(colId) || colId || '-';

    // Lead Time
    let leadTimeDays = '-';
    if (task.completedAt) {
      const created = new Date(task.createdAt).getTime();
      const completed = new Date(task.completedAt).getTime();
      if (!isNaN(created) && !isNaN(completed) && completed >= created) {
        leadTimeDays = formatDecimalPtBr((completed - created) / (1000 * 60 * 60 * 24));
      }
    }

    // Cycle Time
    let cycleTimeDays = '-';
    if (task.startedAt && task.completedAt) {
      const started = new Date(task.startedAt).getTime();
      const completed = new Date(task.completedAt).getTime();
      if (!isNaN(started) && !isNaN(completed) && completed >= started) {
        cycleTimeDays = formatDecimalPtBr((completed - started) / (1000 * 60 * 60 * 24));
      }
    }

    // Blocker status
    const isCurrentlyBlocked = Boolean(
      task.blocked ||
        (task.blockers && task.blockers.some((b: TaskBlockerEntry) => !b.unblockedAt)),
    );
    const blockedHours = formatDecimalPtBr(calculateTaskBlockedHours(task));

    // Story Points
    const rawEstimation = task.storyPoints ?? task.estimation;
    const storyPoints =
      rawEstimation !== undefined && rawEstimation !== null
        ? String(rawEstimation).replace('.', ',')
        : '-';

    // Tags
    const tags =
      task.tags && task.tags.length > 0 ? task.tags.join('; ') : '-';

    const subtaskCount = task.subtasks ? task.subtasks.length : 0;

    const mainRow: TaskExportRow = {
      id: task.id,
      title: task.title,
      type: task.type === 'subtask' ? 'Subtarefa' : task.type === 'initiative' ? 'Iniciativa' : 'Cartão',
      column: columnName,
      category: task.category || 'Geral',
      priority: formatPriorityPtBr(task.priority),
      assignee: task.assignee || '-',
      sprint: task.sprint || task.sprintId || '-',
      storyPoints,
      createdAt: formatDatePtBr(task.createdAt),
      startedAt: formatDatePtBr(task.startedAt),
      completedAt: formatDatePtBr(task.completedAt),
      leadTimeDays,
      cycleTimeDays,
      isBlocked: isCurrentlyBlocked ? 'Sim' : 'Não',
      blockedHours,
      tags,
      subtaskCount,
    };

    rows.push(mainRow);

    // Subtarefas como linhas individuais se solicitado
    if (includeSubtasks && task.subtasks && task.subtasks.length > 0) {
      task.subtasks.forEach((sub: { id: string; title: string; completed?: boolean }, idx: number) => {
        rows.push({
          id: `${task.id}.${idx + 1}`,
          title: sub.title,
          type: 'Subtarefa',
          column: sub.completed ? 'Concluído' : columnName,
          category: task.category || 'Geral',
          priority: formatPriorityPtBr(task.priority),
          assignee: task.assignee || '-',
          sprint: task.sprint || task.sprintId || '-',
          storyPoints: '-',
          createdAt: formatDatePtBr(task.createdAt),
          startedAt: '-',
          completedAt: sub.completed ? formatDatePtBr(task.completedAt) : '-',
          leadTimeDays: '-',
          cycleTimeDays: '-',
          isBlocked: 'Não',
          blockedHours: '0,0',
          tags: '-',
          subtaskCount: 0,
        });
      });
    }
  }

  return rows;
}

/**
 * Serializes task export rows to an RFC 4180 pt-BR Excel CSV string with UTF-8 BOM.
 */
export function serializeTasksToSpreadsheetCsv(
  rows: TaskExportRow[],
  metadata?: {
    boardTitle: string;
    dateWindowLabel: string;
    generatedAt: string;
  },
): string {
  const lines: string[] = [];

  // 1. Cabeçalho institucional do Metrik
  lines.push('# Relatório de Fluxo e Inventário — Metrik');
  if (metadata) {
    lines.push(`Quadro:;${escapeCsvField(metadata.boardTitle)}`);
    lines.push(`Período de Amostragem:;${escapeCsvField(metadata.dateWindowLabel)}`);
    lines.push(`Gerado em:;${formatDatePtBr(metadata.generatedAt)}`);
  }
  lines.push(''); // Linha em branco separadora

  // 2. Cabeçalho tabular normativo (18 colunas)
  const headers = [
    'ID',
    'Título',
    'Tipo',
    'Coluna',
    'Categoria',
    'Prioridade',
    'Responsável',
    'Sprint',
    'Story Points',
    'Criado Em',
    'Iniciado Em',
    'Concluído Em',
    'Lead Time (dias)',
    'Cycle Time (dias)',
    'Bloqueado',
    'Tempo Bloqueado (horas)',
    'Tags',
    'Total Subtarefas',
  ];
  lines.push(headers.join(';'));

  // 3. Linhas de dados
  for (const row of rows) {
    const fields = [
      escapeCsvField(row.id),
      escapeCsvField(row.title),
      escapeCsvField(row.type),
      escapeCsvField(row.column),
      escapeCsvField(row.category),
      escapeCsvField(row.priority),
      escapeCsvField(row.assignee),
      escapeCsvField(row.sprint),
      escapeCsvField(row.storyPoints),
      escapeCsvField(row.createdAt),
      escapeCsvField(row.startedAt),
      escapeCsvField(row.completedAt),
      escapeCsvField(row.leadTimeDays),
      escapeCsvField(row.cycleTimeDays),
      escapeCsvField(row.isBlocked),
      escapeCsvField(row.blockedHours),
      escapeCsvField(row.tags),
      String(row.subtaskCount),
    ];
    lines.push(fields.join(';'));
  }

  // Prefixar com UTF-8 Byte Order Mark (\uFEFF) para garantir abertura colunada imediata no Excel pt-BR
  return '\uFEFF' + lines.join('\r\n');
}

/**
 * Client-side file downloader using Blob and synthetic anchor click.
 */
export function downloadTextFile(
  content: string,
  filename: string,
  mimeType = 'text/csv;charset=utf-8;',
): void {
  try {
    const blob = new Blob([content], { type: mimeType });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    console.info(`[Metrik Report] Arquivo ${filename} baixado com sucesso via Blob URL.`);
  } catch (error) {
    console.error(`[Metrik Report] Falha ao disparar download do arquivo ${filename}:`, error);
  }
}

/**
 * Orchestrates tabular CSV export and download for the given board and task set.
 */
export function exportTasksToSpreadsheet(
  tasks: (TaskModel | ReportTaskLike)[],
  board: ReportBoardLike,
  includeSubtasks = false,
  dateWindowLabel = 'Todos os dados do quadro',
): void {
  const boardTitle = board.title || board.name || 'Quadro';
  const columns = board.columns || [];
  const rows = projectTasksToExportRows(tasks, columns, includeSubtasks);
  const csv = serializeTasksToSpreadsheetCsv(rows, {
    boardTitle,
    dateWindowLabel,
    generatedAt: new Date().toISOString(),
  });
  const dateStr = new Date().toISOString().split('T')[0];
  const sanitizedTitle = boardTitle
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9_-]/g, '-');
  const filename = `metrik-fluxo-${sanitizedTitle}-${dateStr}.csv`;
  downloadTextFile(csv, filename, 'text/csv;charset=utf-8;');
  console.info(`[Metrik Report] Planilha exportada com sucesso: ${filename} (${rows.length} linhas).`);
}
