import { SprintModel, TaskModel } from '../types/kanban';

/**
 * Metrik Sprint Domain — funções puras do Planejamento de Sprints (Feature 038).
 * Sem React, sem DOM, sem armazenamento. Progresso e velocity são derivados.
 */

/** Apara as extremidades do nome; `undefined`/`null` viram string vazia. */
export function normalizeSprintName(name: string | undefined | null): string {
  return (name ?? '').trim().slice(0, 60);
}

/** Nome válido: após normalização, não vazio (FR-012). */
export function isValidSprintName(name: string | undefined | null): boolean {
  return normalizeSprintName(name).length > 0;
}

/**
 * Janela válida: quando ambas as datas existem, fim ≥ início e são datas válidas.
 * Datas ausentes são aceitas (janela opcional).
 */
export function isValidSprintRange(startDate?: string, endDate?: string): boolean {
  if (!startDate || !endDate) return true;
  const start = new Date(startDate).getTime();
  const end = new Date(endDate).getTime();
  if (Number.isNaN(start) || Number.isNaN(end)) return false;
  return end >= start;
}

/** Tarefas atribuídas a uma sprint. */
export function getSprintTasks(sprintId: string, tasks: TaskModel[]): TaskModel[] {
  return tasks.filter((task) => task.sprintId === sprintId);
}

export interface SprintProgress {
  total: number;
  completed: number;
  /** 0..100 (inteiro); 0 quando não há tarefas (sem divisão por zero). */
  percentage: number;
  /** Velocity: tarefas concluídas na sprint. */
  velocity: number;
}

/** Progresso derivado de um conjunto de tarefas (concluída = `completedAt` definido). */
export function calculateSprintProgress(tasks: TaskModel[]): SprintProgress {
  const total = tasks.length;
  const completed = tasks.filter((task) => Boolean(task.completedAt)).length;
  const percentage = total === 0 ? 0 : Math.round((completed / total) * 100);
  return { total, completed, percentage, velocity: completed };
}

/** Sprint ativa resolvida por `activeSprintId`; `undefined` se ausente/órfã. */
export function getActiveSprint(
  sprints: SprintModel[] | undefined,
  activeSprintId?: string | null,
): SprintModel | undefined {
  if (!sprints || !activeSprintId) return undefined;
  return sprints.find((sprint) => sprint.id === activeSprintId);
}

/** Indica se a sprint (não concluída) já passou da data de fim. */
export function isSprintOverdue(
  sprint: SprintModel | undefined,
  nowMs: number = Date.now(),
): boolean {
  if (!sprint || sprint.status === 'completed' || !sprint.endDate) return false;
  const end = new Date(sprint.endDate).getTime();
  if (Number.isNaN(end)) return false;
  return nowMs > end;
}

/** Ordena para exibição: ativa primeiro, depois planejadas, depois concluídas; recente por fim. */
export function orderSprints(sprints: SprintModel[] | undefined): SprintModel[] {
  const rank: Record<string, number> = { active: 0, planned: 1, completed: 2 };
  return [...(sprints ?? [])].sort((a, b) => {
    const byStatus = (rank[a.status] ?? 9) - (rank[b.status] ?? 9);
    if (byStatus !== 0) return byStatus;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
}
