/**
 * Utilitários estatísticos e analíticos para métricas de Throughput (Vazão)
 * Baseado na literatura de fluxo lean (Daniel Vacanti, Troy Magennis, Frank Vega e Padrão NIST)
 */

import { TaskModel } from '../types/kanban';
import { calculatePercentile } from './statistics';

export interface ThroughputDailyPoint {
  date: string; // ISO 'YYYY-MM-DD'
  count: number;
}

export interface ThroughputHistogramBin {
  throughputValue: number; // Quantidade de itens entregues no dia (0, 1, 2, 3...)
  frequencyDays: number; // Número de dias com esta quantidade de entregas
  percentage: number; // Porcentagem do total de dias analisados
}

export interface ThroughputPercentiles {
  p50: number; // Mediana
  p70: number; // 70%
  p85: number; // 85% SLE (Service Level Expectation)
  p95: number; // 95% Alta Confiabilidade
}

export interface ThroughputSummary {
  totalCompleted: number;
  totalDays: number;
  averagePerDay: number;
  p50: number;
  p70: number;
  p85: number;
  p95: number;
  mode: number;
  maxDaily: number;
}

export type ThroughputTimeWindow = 14 | 30 | 60 | 90 | 0;

/**
 * Extrai a série de Throughput diário contínua com preenchimento obrigatório de dias sem conclusões (com count: 0).
 * 
 * @param tasks Lista de tarefas do board
 * @param daysWindow Quantidade de dias da janela histórica (14, 30, 60, 90 ou 0 para todo o histórico)
 * @param referenceDate Data de referência / término (padrão: hoje)
 */
export function extractThroughputSeries(
  tasks: TaskModel[],
  daysWindow: number = 30,
  referenceDate: Date = new Date()
): ThroughputDailyPoint[] {
  const completedTasks = tasks.filter((t) => Boolean(t.completedAt));

  if (completedTasks.length === 0 && daysWindow <= 0) {
    return [];
  }

  const end = new Date(referenceDate);
  end.setHours(23, 59, 59, 999);

  let start: Date;
  if (daysWindow > 0) {
    start = new Date(referenceDate);
    start.setDate(start.getDate() - (daysWindow - 1));
    start.setHours(0, 0, 0, 0);
  } else {
    // Janela completa baseada na tarefa mais antiga concluída
    let minTime = end.getTime();
    completedTasks.forEach((t) => {
      const time = new Date(t.completedAt!).getTime();
      if (time < minTime) minTime = time;
    });
    start = new Date(minTime);
    start.setHours(0, 0, 0, 0);
  }

  // Agrupar conclusões por data 'YYYY-MM-DD'
  const countByDate = new Map<string, number>();
  completedTasks.forEach((t) => {
    const d = new Date(t.completedAt!);
    if (d >= start && d <= end) {
      const dateStr = d.toISOString().split('T')[0];
      countByDate.set(dateStr, (countByDate.get(dateStr) || 0) + 1);
    }
  });

  // Percorrer estritamente dia a dia no calendário preenchendo com 0
  const series: ThroughputDailyPoint[] = [];
  const current = new Date(start);

  while (current <= end) {
    const dateStr = current.toISOString().split('T')[0];
    series.push({
      date: dateStr,
      count: countByDate.get(dateStr) || 0,
    });
    current.setDate(current.getDate() + 1);
  }

  return series;
}

/**
 * Calcula os percentis de vazão (50%, 70%, 85%, 95%) utilizando a interpolação linear padrão (NIST).
 */
export function calculateThroughputPercentiles(dailyCounts: number[]): ThroughputPercentiles {
  if (!dailyCounts || dailyCounts.length === 0) {
    return { p50: 0, p70: 0, p85: 0, p95: 0 };
  }

  const valid = dailyCounts.filter((c) => typeof c === 'number' && !isNaN(c) && c >= 0);
  if (valid.length === 0) {
    return { p50: 0, p70: 0, p85: 0, p95: 0 };
  }

  return {
    p50: calculatePercentile(valid, 50),
    p70: calculatePercentile(valid, 70),
    p85: calculatePercentile(valid, 85),
    p95: calculatePercentile(valid, 95),
  };
}

/**
 * Constrói o histograma de vazão diária agrupando por quantidade de itens entregues (0, 1, 2, 3...).
 */
export function calculateThroughputHistogram(dailyPoints: ThroughputDailyPoint[]): {
  bins: ThroughputHistogramBin[];
  maxFrequency: number;
  maxDailyThroughput: number;
} {
  if (!dailyPoints || dailyPoints.length === 0) {
    return { bins: [], maxFrequency: 0, maxDailyThroughput: 0 };
  }

  const frequencyMap = new Map<number, number>();
  let maxDailyThroughput = 0;

  dailyPoints.forEach((point) => {
    const count = point.count;
    if (count > maxDailyThroughput) {
      maxDailyThroughput = count;
    }
    frequencyMap.set(count, (frequencyMap.get(count) || 0) + 1);
  });

  const totalDays = dailyPoints.length;
  const bins: ThroughputHistogramBin[] = [];
  let maxFrequency = 0;

  // Garante que todos os inteiros de 0 até maxDailyThroughput tenham uma barra no histograma
  for (let val = 0; val <= maxDailyThroughput; val++) {
    const freq = frequencyMap.get(val) || 0;
    if (freq > maxFrequency) {
      maxFrequency = freq;
    }
    bins.push({
      throughputValue: val,
      frequencyDays: freq,
      percentage: totalDays > 0 ? Number(((freq / totalDays) * 100).toFixed(1)) : 0,
    });
  }

  return { bins, maxFrequency, maxDailyThroughput };
}

/**
 * Calcula o resumo executivo de métricas de vazão para o período analisado.
 */
export function calculateThroughputSummary(dailyPoints: ThroughputDailyPoint[]): ThroughputSummary {
  if (!dailyPoints || dailyPoints.length === 0) {
    return {
      totalCompleted: 0,
      totalDays: 0,
      averagePerDay: 0,
      p50: 0,
      p70: 0,
      p85: 0,
      p95: 0,
      mode: 0,
      maxDaily: 0,
    };
  }

  const counts = dailyPoints.map((p) => p.count);
  const totalCompleted = counts.reduce((acc, c) => acc + c, 0);
  const totalDays = counts.length;
  const averagePerDay = Number((totalCompleted / totalDays).toFixed(2));
  const percentiles = calculateThroughputPercentiles(counts);

  // Calcular a moda (o valor de vazão mais frequente)
  const frequencyMap = new Map<number, number>();
  let maxFreq = 0;
  let mode = 0;
  let maxDaily = 0;

  counts.forEach((c) => {
    if (c > maxDaily) maxDaily = c;
    const f = (frequencyMap.get(c) || 0) + 1;
    frequencyMap.set(c, f);
    if (f > maxFreq) {
      maxFreq = f;
      mode = c;
    }
  });

  return {
    totalCompleted,
    totalDays,
    averagePerDay,
    p50: percentiles.p50,
    p70: percentiles.p70,
    p85: percentiles.p85,
    p95: percentiles.p95,
    mode,
    maxDaily,
  };
}
