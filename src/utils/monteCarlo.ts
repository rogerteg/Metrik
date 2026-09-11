/**
 * Motor de Simulações Probabilísticas de Monte Carlo para Fluxo de Projetos
 * Baseado na literatura de fluxo (Daniel Vacanti / Troy Magennis / Frank Vega)
 */

import { TaskModel } from '../types/kanban';

export interface DailyThroughputSample {
  date: string; // 'YYYY-MM-DD'
  count: number;
}

export interface MonteCarloHistogramBin {
  value: number;
  frequency: number;
  relativeFrequency: number;
  cumulativeProbability: number;
}

export interface MonteCarloHowManyResult {
  p50: number; // 50% de probabilidade de entregar pelo menos este número de itens
  p85: number; // 85% de probabilidade de entregar pelo menos este número de itens
  p95: number; // 95% de probabilidade de entregar pelo menos este número de itens
  min: number;
  max: number;
  mean: number;
  trials: number;
  targetDays: number;
  histogram: MonteCarloHistogramBin[];
}

export interface MonteCarloWhenPercentile {
  days: number;
  projectedDate: string; // 'YYYY-MM-DD'
}

export interface MonteCarloWhenResult {
  p50: MonteCarloWhenPercentile;
  p85: MonteCarloWhenPercentile;
  p95: MonteCarloWhenPercentile;
  minDays: number;
  maxDays: number;
  meanDays: number;
  trials: number;
  itemCount: number;
  histogram: MonteCarloHistogramBin[];
}

/**
 * Extrai a série de Throughput diário (quantidade de itens concluídos por dia).
 * O preenchimento com valor 0 em dias sem entregas é obrigatório para evitar viés de superestimação.
 * 
 * @param tasks Lista de tarefas do board
 * @param daysWindow Quantidade de dias da janela histórica (ex: 30, 60, 90 ou 0 para todo o histórico)
 * @param referenceDate Data de término da janela (padrão: hoje)
 */
export function extractDailyThroughput(
  tasks: TaskModel[],
  daysWindow: number = 30,
  referenceDate: Date = new Date()
): DailyThroughputSample[] {
  const completedTasks = tasks.filter((t) => Boolean(t.completedAt));
  
  if (completedTasks.length === 0 && daysWindow <= 0) {
    return [];
  }

  // Determinar data inicial e final da janela
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

  // Agrupar conclusões por dia 'YYYY-MM-DD'
  const countByDate = new Map<string, number>();
  completedTasks.forEach((t) => {
    const d = new Date(t.completedAt!);
    if (d >= start && d <= end) {
      const dateStr = d.toISOString().split('T')[0];
      countByDate.set(dateStr, (countByDate.get(dateStr) || 0) + 1);
    }
  });

  // Percorrer estritamente dia a dia preenchendo com 0 os dias sem entrega
  const samples: DailyThroughputSample[] = [];
  const current = new Date(start);

  while (current <= end) {
    const dateStr = current.toISOString().split('T')[0];
    samples.push({
      date: dateStr,
      count: countByDate.get(dateStr) || 0,
    });
    current.setDate(current.getDate() + 1);
  }

  return samples;
}

/**
 * Cria os baldes de frequência (histograma) e calcula as probabilidades acumuladas (CDF).
 */
export function buildHistogramBins(
  values: number[],
  totalTrials: number,
  isAscendingProbability: boolean = true
): MonteCarloHistogramBin[] {
  if (values.length === 0 || totalTrials <= 0) {
    return [];
  }

  const freqMap = new Map<number, number>();
  values.forEach((v) => {
    freqMap.set(v, (freqMap.get(v) || 0) + 1);
  });

  const uniqueValues = Array.from(freqMap.keys()).sort((a, b) => a - b);
  let accumulatedCount = 0;

  const bins: MonteCarloHistogramBin[] = uniqueValues.map((val) => {
    const freq = freqMap.get(val) || 0;
    accumulatedCount += freq;
    const relativeFrequency = Number((freq / totalTrials).toFixed(4));
    
    // CDF normal (crescente: P(X <= x)) para prazos
    // CDF invertida (decrescente: P(X >= x)) para quantidade de itens
    const cumulativeProbability = isAscendingProbability
      ? Number((accumulatedCount / totalTrials).toFixed(4))
      : Number(((totalTrials - (accumulatedCount - freq)) / totalTrials).toFixed(4));

    return {
      value: val,
      frequency: freq,
      relativeFrequency,
      cumulativeProbability,
    };
  });

  return bins;
}

/**
 * Formata uma data adicionando dias corridos no formato 'YYYY-MM-DD'.
 */
export function addDaysToDate(baseDate: Date | string, days: number): string {
  const d = new Date(baseDate);
  d.setDate(d.getDate() + Math.round(days));
  return d.toISOString().split('T')[0];
}

/**
 * Simulação Monte Carlo - "How Many" (Quantos itens conseguiremos entregar em targetDays dias?)
 * 
 * Sorteia com reposição targetDays amostras do histórico de Throughput em cada ensaio.
 * Ordena os totais obtidos para derivar os percentis onde a entrega atingiu ou superou o quantitativo.
 */
export function runMonteCarloHowMany(
  throughputHistory: number[],
  targetDays: number,
  trials: number = 10000,
  rng: () => number = Math.random
): MonteCarloHowManyResult {
  if (!throughputHistory || throughputHistory.length === 0 || targetDays <= 0 || trials <= 0) {
    return {
      p50: 0,
      p85: 0,
      p95: 0,
      min: 0,
      max: 0,
      mean: 0,
      trials: 0,
      targetDays,
      histogram: [],
    };
  }

  const historyLength = throughputHistory.length;
  const trialResults: number[] = new Array(trials);
  let sumAllTrials = 0;

  for (let t = 0; t < trials; t++) {
    let deliveredInTrial = 0;
    for (let day = 0; day < targetDays; day++) {
      const randomIndex = Math.floor(rng() * historyLength);
      deliveredInTrial += throughputHistory[randomIndex];
    }
    trialResults[t] = deliveredInTrial;
    sumAllTrials += deliveredInTrial;
  }

  // Ordenar de forma decrescente para determinar facilidade de atingimento (P(X >= x)):
  // 50% dos ensaios entregam pelo menos trialResults[floor(0.50 * trials)]
  // 85% dos ensaios entregam pelo menos trialResults[floor(0.85 * trials)]
  // 95% dos ensaios entregam pelo menos trialResults[floor(0.95 * trials)]
  const sortedDesc = [...trialResults].sort((a, b) => b - a);

  const idxP50 = Math.min(Math.floor(0.50 * trials), trials - 1);
  const idxP85 = Math.min(Math.floor(0.85 * trials), trials - 1);
  const idxP95 = Math.min(Math.floor(0.95 * trials), trials - 1);

  const p50 = sortedDesc[idxP50];
  const p85 = sortedDesc[idxP85];
  const p95 = sortedDesc[idxP95];

  const min = sortedDesc[trials - 1];
  const max = sortedDesc[0];
  const mean = Number((sumAllTrials / trials).toFixed(1));

  const histogram = buildHistogramBins(trialResults, trials, false);

  return {
    p50,
    p85,
    p95,
    min,
    max,
    mean,
    trials,
    targetDays,
    histogram,
  };
}

/**
 * Simulação Monte Carlo - "When" (Quando entregaremos itemCount itens?)
 * 
 * Para cada ensaio, sorteia amostras diárias de throughput até acumular itemCount.
 * Ordena os dias decorridos em ordem ascendente (menos dias = mais otimista).
 */
export function runMonteCarloWhen(
  throughputHistory: number[],
  itemCount: number,
  startDate: Date = new Date(),
  trials: number = 10000,
  rng: () => number = Math.random
): MonteCarloWhenResult {
  const emptyResult: MonteCarloWhenResult = {
    p50: { days: 0, projectedDate: addDaysToDate(startDate, 0) },
    p85: { days: 0, projectedDate: addDaysToDate(startDate, 0) },
    p95: { days: 0, projectedDate: addDaysToDate(startDate, 0) },
    minDays: 0,
    maxDays: 0,
    meanDays: 0,
    trials: 0,
    itemCount,
    histogram: [],
  };

  if (!throughputHistory || throughputHistory.length === 0 || itemCount <= 0 || trials <= 0) {
    return emptyResult;
  }

  // Guarda contra histórico composto puramente de 0 entregas (evita loop infinito)
  const totalThroughput = throughputHistory.reduce((acc, val) => acc + val, 0);
  if (totalThroughput === 0) {
    return emptyResult;
  }

  const historyLength = throughputHistory.length;
  const trialDays: number[] = new Array(trials);
  let sumAllDays = 0;
  const MAX_DAYS_SAFETY = 1000;

  for (let t = 0; t < trials; t++) {
    let accumulatedItems = 0;
    let daysPassed = 0;

    while (accumulatedItems < itemCount && daysPassed < MAX_DAYS_SAFETY) {
      daysPassed++;
      const randomIndex = Math.floor(rng() * historyLength);
      accumulatedItems += throughputHistory[randomIndex];
    }

    trialDays[t] = daysPassed;
    sumAllDays += daysPassed;
  }

  // Ordenar em ordem crescente de dias (P(X <= x))
  const sortedAsc = [...trialDays].sort((a, b) => a - b);

  const idxP50 = Math.min(Math.floor(0.50 * trials), trials - 1);
  const idxP85 = Math.min(Math.floor(0.85 * trials), trials - 1);
  const idxP95 = Math.min(Math.floor(0.95 * trials), trials - 1);

  const p50Days = sortedAsc[idxP50];
  const p85Days = sortedAsc[idxP85];
  const p95Days = sortedAsc[idxP95];

  const minDays = sortedAsc[0];
  const maxDays = sortedAsc[trials - 1];
  const meanDays = Number((sumAllDays / trials).toFixed(1));

  const histogram = buildHistogramBins(trialDays, trials, true);

  return {
    p50: { days: p50Days, projectedDate: addDaysToDate(startDate, p50Days) },
    p85: { days: p85Days, projectedDate: addDaysToDate(startDate, p85Days) },
    p95: { days: p95Days, projectedDate: addDaysToDate(startDate, p95Days) },
    minDays,
    maxDays,
    meanDays,
    trials,
    itemCount,
    histogram,
  };
}
