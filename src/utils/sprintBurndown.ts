import { SprintModel, TaskModel } from '../types/kanban';
import { getSprintTasks } from './sprintMetrics';

/**
 * Metrik Sprint Burndown (Feature 039) — derivação pura, sem snapshots.
 * O burndown é calculado a partir de `createdAt`/`completedAt` das tarefas da sprint
 * sobre a janela (`startDate`..`endDate`). Nenhum dado novo é persistido.
 */

const MS_DAY = 24 * 60 * 60 * 1000;

export interface BurndownPoint {
  /** Dia (ISO `YYYY-MM-DD`, fuso local). */
  day: string;
  /** Linha ideal: total comprometido → 0 (linear). */
  ideal: number;
  /** Linha real: criadas até o dia − concluídas até o dia (nunca negativo). */
  remaining: number;
}

export interface SprintBurndown {
  /** `false` quando a sprint não tem janela de datas válida. */
  available: boolean;
  /** Escopo atual da sprint (tarefas atribuídas). */
  committed: number;
  points: BurndownPoint[];
}

const startOfDay = (ms: number): number => {
  const d = new Date(ms);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
};

/** Interpreta `YYYY-MM-DD` como data **local** (evita deslocamento por UTC). */
const parseDateMs = (value: string): number => {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (match) {
    return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3])).getTime();
  }
  return new Date(value).getTime();
};

const endOfDay = (ms: number): number => {
  const d = new Date(ms);
  d.setHours(23, 59, 59, 999);
  return d.getTime();
};

const toDayIso = (ms: number): string => {
  const d = new Date(ms);
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${month}-${day}`;
};

const round2 = (value: number): number => Math.round(value * 100) / 100;

/**
 * Constrói o burndown da sprint. `nowMs` permite testes determinísticos.
 * Retorna `available: false` quando faltam datas válidas.
 */
export function buildSprintBurndown(
  sprint: SprintModel,
  tasks: TaskModel[],
  nowMs: number = Date.now(),
): SprintBurndown {
  const sprintTasks = getSprintTasks(sprint.id, tasks);
  const committed = sprintTasks.length;

  if (!sprint.startDate || !sprint.endDate) {
    return { available: false, committed, points: [] };
  }

  const start = startOfDay(parseDateMs(sprint.startDate));
  const end = endOfDay(parseDateMs(sprint.endDate));
  if (Number.isNaN(start) || Number.isNaN(end) || end < start) {
    return { available: false, committed, points: [] };
  }

  // A linha real não avança além de hoje; a ideal usa a janela completa.
  const startDay = startOfDay(start);
  const endDay = startOfDay(end);
  const visibleEndDay = Math.min(endDay, startOfDay(nowMs));
  const points: BurndownPoint[] = [];
  const span = endDay - startDay;

  for (let day = startDay; day <= visibleEndDay; day += MS_DAY) {
    const dayEnd = endOfDay(day);
    const created = sprintTasks.filter((t) => new Date(t.createdAt).getTime() <= dayEnd).length;
    const completed = sprintTasks.filter(
      (t) => t.completedAt && new Date(t.completedAt).getTime() <= dayEnd,
    ).length;
    const remaining = Math.max(0, created - completed);
    const ideal = span === 0 ? 0 : round2(committed * (1 - (day - startDay) / span));
    points.push({ day: toDayIso(day), ideal, remaining });
  }

  return { available: true, committed, points };
}

export interface BurnupPoint {
  /** Dia (ISO `YYYY-MM-DD`, fuso local). */
  day: string;
  /** Escopo acumulado: tarefas criadas até o dia. */
  scope: number;
  /** Concluído acumulado: tarefas concluídas até o dia. */
  completed: number;
}

export interface SprintBurnup {
  available: boolean;
  committed: number;
  points: BurnupPoint[];
}

/**
 * Burnup da sprint (Feature 042): escopo acumulado × trabalho concluído por dia.
 * Mesma derivação do burndown (sem snapshots), em leitura crescente.
 */
export function buildSprintBurnup(
  sprint: SprintModel,
  tasks: TaskModel[],
  nowMs: number = Date.now(),
): SprintBurnup {
  const sprintTasks = getSprintTasks(sprint.id, tasks);
  const committed = sprintTasks.length;

  if (!sprint.startDate || !sprint.endDate) {
    return { available: false, committed, points: [] };
  }

  const start = startOfDay(parseDateMs(sprint.startDate));
  const end = endOfDay(parseDateMs(sprint.endDate));
  if (Number.isNaN(start) || Number.isNaN(end) || end < start) {
    return { available: false, committed, points: [] };
  }

  const startDay = startOfDay(start);
  const endDay = startOfDay(end);
  const visibleEndDay = Math.min(endDay, startOfDay(nowMs));
  const points: BurnupPoint[] = [];

  for (let day = startDay; day <= visibleEndDay; day += MS_DAY) {
    const dayEnd = endOfDay(day);
    const scope = sprintTasks.filter((t) => new Date(t.createdAt).getTime() <= dayEnd).length;
    const completed = sprintTasks.filter(
      (t) => t.completedAt && new Date(t.completedAt).getTime() <= dayEnd,
    ).length;
    points.push({ day: toDayIso(day), scope, completed });
  }

  return { available: true, committed, points };
}
