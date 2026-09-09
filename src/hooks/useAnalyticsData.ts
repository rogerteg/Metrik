import { useMemo } from 'react';
import { TaskModel } from '../types/kanban';
import { calculateLeadTimeMs } from '../utils/timeFormatters';

export interface ThroughputDataPoint {
  date: string; // ISO Date 'YYYY-MM-DD'
  count: number;
}

export interface ScatterDataPoint {
  id: string;
  title: string;
  completedAt: string; // ISO Date 'YYYY-MM-DD'
  leadTimeDays: number;
}

export interface AnalyticsData {
  throughput: ThroughputDataPoint[];
  scatter: ScatterDataPoint[];
  maxThroughput: number;
  maxLeadTime: number;
}

/**
 * Retorna os últimos 14 dias em formato YYYY-MM-DD
 */
const getLast14Days = (): string[] => {
  const days: string[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Começa de 13 dias atrás até hoje (14 dias no total)
  for (let i = 13; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    days.push(d.toISOString().split('T')[0]);
  }
  return days;
};

export const useAnalyticsData = (completedTasks: TaskModel[]): AnalyticsData => {
  return useMemo(() => {
    const last14Days = getLast14Days();
    
    // Inicializa o throughput com zero para os últimos 14 dias
    const throughputMap = new Map<string, number>();
    last14Days.forEach(day => throughputMap.set(day, 0));

    const scatter: ScatterDataPoint[] = [];

    // Filter tasks that actually have completedAt and are within the 14 day window
    const validTasks = completedTasks.filter(t => t.completedAt);
    
    // Para simplificar a lógica de comparação, pegamos a data de início da janela
    const windowStart = new Date(last14Days[0]).getTime();

    validTasks.forEach(task => {
      const completedAtDate = new Date(task.completedAt!);
      // Fix timezone offsets by getting the local date string portion (rough approx) or just ISO date
      // If we use ISO date, a task completed at 23:00 UTC might be next day local.
      // We will use the ISO split for simplicity matching the window generation.
      const dayStr = task.completedAt!.split('T')[0];

      // Atualiza throughput
      if (throughputMap.has(dayStr)) {
        throughputMap.set(dayStr, throughputMap.get(dayStr)! + 1);
      }

      // Atualiza scatter plot (só incluímos na janela de 14 dias)
      if (completedAtDate.getTime() >= windowStart) {
        const leadTimeMs = calculateLeadTimeMs(task);
        if (leadTimeMs !== null) {
          const leadTimeDays = Number((leadTimeMs / (1000 * 60 * 60 * 24)).toFixed(2));
          scatter.push({
            id: task.id,
            title: task.title,
            completedAt: dayStr,
            leadTimeDays,
          });
        }
      }
    });

    const throughput: ThroughputDataPoint[] = Array.from(throughputMap.entries()).map(
      ([date, count]) => ({ date, count })
    );

    // Encontrar máximos para os eixos do gráfico
    const maxThroughput = Math.max(1, ...throughput.map(t => t.count));
    const maxLeadTime = Math.max(1, ...scatter.map(s => s.leadTimeDays));

    return {
      throughput,
      scatter,
      maxThroughput,
      maxLeadTime,
    };
  }, [completedTasks]);
};
