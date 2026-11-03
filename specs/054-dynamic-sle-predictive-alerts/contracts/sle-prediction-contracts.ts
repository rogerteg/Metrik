/**
 * Feature 054 — Contratos de Previsibilidade Dinâmica e Alertas de SLE
 * Specification: specs/054-dynamic-sle-predictive-alerts/spec.md
 */

import { TaskModel } from '../../../src/types/kanban';

export type SleRiskLevel =
  | 'normal'
  | 'warning_p50'
  | 'risk_p85'
  | 'critical_p95'
  | 'insufficient_data';

export interface SleThresholds {
  p50Days: number;
  p85Days: number;
  p95Days: number;
  sampleSize: number;
  isStatisticallySignificant: boolean;
}

export interface CardSlePrediction {
  taskId: string;
  agingDays: number;
  thresholds: SleThresholds;
  effectiveTargetDays: number;
  riskLevel: SleRiskLevel;
  daysToBreach: number;
  percentageOfTarget: number;
  label: string;
}

export interface SleConfig {
  boardId: string;
  customTargetDays: number | null;
  enableP50Alert: boolean;
  enableP95Alert: boolean;
  updatedAt: string;
}

export interface SlePredictorService {
  /**
   * Calcula os limiares de SLE a partir do conjunto de tarefas concluídas.
   */
  calculateThresholds(completedTasks: TaskModel[]): SleThresholds;

  /**
   * Avalia a previsão de SLE para um cartão ativo em andamento.
   */
  predictCardSle(
    task: TaskModel,
    thresholds: SleThresholds,
    config?: Partial<SleConfig>,
    referenceDate?: Date,
  ): CardSlePrediction;
}

