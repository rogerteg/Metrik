/**
 * Feature 054 — Previsibilidade Dinâmica & Alertas de SLE (Service Level Expectation)
 * Modelos de domínio canônicos e contratos para previsão de risco de fluxo em tempo real.
 */

import { TaskModel } from './kanban';

export type SleRiskLevel =
  'normal' | 'warning_p50' | 'risk_p85' | 'critical_p95' | 'insufficient_data';

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
  calculateThresholds(completedTasks: TaskModel[]): SleThresholds;
  predictCardSle(
    task: TaskModel,
    thresholds: SleThresholds,
    config?: Partial<SleConfig>,
    referenceDate?: Date,
  ): CardSlePrediction;
}

export const DEFAULT_SLE_CONFIG: Omit<SleConfig, 'boardId'> = {
  customTargetDays: null,
  enableP50Alert: true,
  enableP95Alert: true,
  updatedAt: new Date(0).toISOString(),
};
