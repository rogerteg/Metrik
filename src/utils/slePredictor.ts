/**
 * Feature 054 — Previsibilidade Dinâmica & Alertas de SLE (Service Level Expectation)
 * Motor puro de cálculo estatístico de percentis e diagnóstico preditivo em tempo real.
 */

import { TaskModel } from '../types/kanban';
import { CardSlePrediction, SleConfig, SleRiskLevel, SleThresholds } from '../types/sle';
import { calculatePercentile } from './statistics';

const MINIMUM_SAMPLE_SIZE = 5;
const MS_PER_DAY = 24 * 60 * 60 * 1000;

/**
 * Calcula os limiares percentis de SLE (P50, P85, P95) com base no histórico de tarefas concluídas.
 */
export function calculateThresholds(completedTasks: TaskModel[]): SleThresholds {
  const cycleTimesDays: number[] = [];

  for (const task of completedTasks) {
    if (!task.completedAt) continue;

    const startTs = new Date(task.startedAt || task.createdAt).getTime();
    const endTs = new Date(task.completedAt).getTime();

    if (isNaN(startTs) || isNaN(endTs)) {
      console.warn(`[Metrik][SLE] Tarefa ${task.id} ignorada por timestamp inválido.`);
      continue;
    }

    const elapsedMs = Math.max(0, endTs - startTs);
    cycleTimesDays.push(elapsedMs / MS_PER_DAY);
  }

  const sampleSize = cycleTimesDays.length;
  const isStatisticallySignificant = sampleSize >= MINIMUM_SAMPLE_SIZE;

  if (!isStatisticallySignificant) {
    return {
      p50Days: 0,
      p85Days: 0,
      p95Days: 0,
      sampleSize,
      isStatisticallySignificant: false,
    };
  }

  return {
    p50Days: calculatePercentile(cycleTimesDays, 50),
    p85Days: calculatePercentile(cycleTimesDays, 85),
    p95Days: calculatePercentile(cycleTimesDays, 95),
    sampleSize,
    isStatisticallySignificant: true,
  };
}

/**
 * Avalia o nível de risco e a projeção de SLE de um cartão individual em andamento.
 */
export function predictCardSle(
  task: TaskModel,
  thresholds: SleThresholds,
  config?: Partial<SleConfig>,
  referenceDate: Date = new Date(),
): CardSlePrediction {
  const nowTs = referenceDate.getTime();
  const startTs = new Date(task.startedAt || task.createdAt).getTime();

  let agingDays = 0;
  if (!isNaN(startTs)) {
    if (startTs > nowTs) {
      console.warn(
        `[Metrik][SLE] Timestamp futuro detectado para tarefa ${task.id}. Normalizando aging para 0 dias.`,
      );
    }
    const elapsedMs = Math.max(0, nowTs - startTs);
    agingDays = Number((elapsedMs / MS_PER_DAY).toFixed(1));
  } else {
    console.warn(`[Metrik][SLE] Timestamp inválido na tarefa ${task.id}.`);
  }

  // Base amostral insuficiente
  if (!thresholds.isStatisticallySignificant) {
    return {
      taskId: task.id,
      agingDays,
      thresholds,
      effectiveTargetDays: 0,
      riskLevel: 'insufficient_data',
      daysToBreach: 0,
      percentageOfTarget: 0,
      label: 'Amostra insuficiente (< 5 itens)',
    };
  }

  const customTarget = config?.customTargetDays;
  const effectiveTargetDays =
    typeof customTarget === 'number' && customTarget > 0 ? customTarget : thresholds.p85Days;

  // Escala P50 proporcionalmente caso haja meta customizada
  const effectiveP50 =
    typeof customTarget === 'number' && customTarget > 0 && thresholds.p85Days > 0
      ? Number(((thresholds.p50Days / thresholds.p85Days) * effectiveTargetDays).toFixed(1))
      : thresholds.p50Days;

  const daysToBreach = Number((effectiveTargetDays - agingDays).toFixed(1));
  const percentageOfTarget =
    effectiveTargetDays > 0 ? Number(((agingDays / effectiveTargetDays) * 100).toFixed(0)) : 100;

  const enableP50 = config?.enableP50Alert !== false;

  let riskLevel: SleRiskLevel = 'normal';
  let label = 'No ritmo histórico';

  if (thresholds.p95Days > 0 && agingDays >= thresholds.p95Days) {
    riskLevel = 'critical_p95';
    label = 'Crítico (P95)';
  } else if (agingDays >= effectiveTargetDays) {
    riskLevel = 'risk_p85';
    label = 'Risco SLE (P85)';
  } else if (enableP50 && agingDays >= effectiveP50) {
    riskLevel = 'warning_p50';
    label = 'Atenção (P50)';
  }

  return {
    taskId: task.id,
    agingDays,
    thresholds,
    effectiveTargetDays,
    riskLevel,
    daysToBreach,
    percentageOfTarget,
    label,
  };
}
