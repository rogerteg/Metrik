import { TaskModel } from '../types/kanban';

/**
 * Calcula o Lead Time (tempo decorrido entre a criação do cartão e sua conclusão).
 * Retorna o valor em milissegundos ou null se a tarefa não estiver concluída.
 */
export function calculateLeadTimeMs(task: TaskModel): number | null {
  if (!task.completedAt || !task.createdAt) return null;

  const start = new Date(task.createdAt).getTime();
  const end = new Date(task.completedAt).getTime();

  if (isNaN(start) || isNaN(end) || end < start) return null;

  return end - start;
}

/**
 * Calcula o Cycle Time (tempo decorrido entre o início do trabalho em In Progress e a conclusão).
 * Se startedAt estiver ausente, adota createdAt como fallback gracioso.
 * Retorna o valor em milissegundos ou null se a tarefa não estiver concluída.
 */
export function calculateCycleTimeMs(task: TaskModel): number | null {
  if (!task.completedAt) return null;

  const startTimeStr = task.startedAt || task.createdAt;
  if (!startTimeStr) return null;

  const start = new Date(startTimeStr).getTime();
  const end = new Date(task.completedAt).getTime();

  if (isNaN(start) || isNaN(end) || end < start) return null;

  return end - start;
}

/**
 * Formata milissegundos em representação amigável e compacta por humanos.
 * Exemplos: "< 1m", "45m", "2h 15m", "3d 4h", "-"
 */
export function formatDuration(ms: number | null): string {
  if (ms === null || isNaN(ms) || ms < 0) {
    return '-';
  }

  // Menos de 1 minuto
  if (ms < 60_000) {
    return '< 1m';
  }

  const totalMinutes = Math.floor(ms / 60_000);
  const totalHours = Math.floor(totalMinutes / 60);
  const totalDays = Math.floor(totalHours / 24);

  if (totalDays >= 1) {
    const remHours = totalHours % 24;
    return `${totalDays}d ${remHours}h`;
  }

  if (totalHours >= 1) {
    const remMinutes = totalMinutes % 60;
    return `${totalHours}h ${String(remMinutes).padStart(2, '0')}m`;
  }

  return `${totalMinutes}m`;
}

export type DueDateStatus = 'overdue' | 'warning' | 'normal' | 'completed';

/**
 * Returns the status of the due date compared to today.
 * - 'completed': task is done, no warning needed.
 * - 'overdue': dueDate is in the past.
 * - 'warning': dueDate is today or tomorrow (<= 48h roughly).
 * - 'normal': dueDate is in the future.
 */
export const getDueDateStatus = (dueDateStr: string, isTaskCompleted: boolean): DueDateStatus => {
  if (isTaskCompleted) return 'completed';

  // Extract YYYY-MM-DD from today
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayTime = today.getTime();

  // Create Date object for due date (treating it as local midnight)
  const [year, month, day] = dueDateStr.split('-');
  const due = new Date(Number(year), Number(month) - 1, Number(day));
  due.setHours(0, 0, 0, 0);
  const dueTime = due.getTime();

  const diffMs = dueTime - todayTime;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return 'overdue';
  if (diffDays <= 1) return 'warning'; // 0 = today, 1 = tomorrow
  return 'normal';
};

/**
 * Formats a YYYY-MM-DD string into a short date like "15 Out" or "15/10"
 */
export const formatDateShort = (dateStr: string): string => {
  const [year, month, day] = dateStr.split('-');
  const date = new Date(Number(year), Number(month) - 1, Number(day));
  
  return date.toLocaleDateString('pt-BR', {
    day: 'numeric',
    month: 'short'
  }).replace('.', ''); // some browsers add a dot to short months
};

/**
 * Calcula o tempo acumulado de bloqueio de uma tarefa em milissegundos.
 * Se a tarefa estiver atualmente bloqueada, adiciona o tempo decorrido desde blockedAt até nowMs.
 */
export function calculateTaskBlockedTimeMs(task: TaskModel, nowMs: number = Date.now()): number {
  const accumulated = task.totalBlockedMs || 0;
  if (!task.blocked || !task.blockedAt) {
    return accumulated;
  }

  const blockedAtMs = new Date(task.blockedAt).getTime();
  if (isNaN(blockedAtMs)) return accumulated;

  const currentSegment = Math.max(0, nowMs - blockedAtMs);
  return accumulated + currentSegment;
}

/**
 * Formata o tempo bloqueado para exibição amigável.
 */
export function formatBlockedTime(ms: number): string {
  return formatDuration(ms);
}

