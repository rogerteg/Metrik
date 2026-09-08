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
