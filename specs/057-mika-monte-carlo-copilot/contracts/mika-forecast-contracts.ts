/**
 * Contratos de Telemetria e Intenções de Monte Carlo para a Mika AI Copilot
 * Feature: 057-mika-monte-carlo-copilot
 */

import { TargetDateRiskLevel } from '../../056-monte-carlo-backlog-forecast/contracts/backlog-forecast-contracts';
import { ThroughputSampleValidation } from '../../../src/utils/monteCarloForecast';

/**
 * Resumo estatístico de uma iniciativa ativa
 */
export interface MikaInitiativeForecastSummary {
  id: string;
  title: string;
  pendingCount: number;
  completedCount: number;
  targetDate?: string;
  p50Days: number;
  p50Date: string;
  p85Days: number;
  p85Date: string;
  p95Days: number;
  p95Date: string;
  targetProbability?: number;
  riskLevel?: TargetDateRiskLevel;
}

/**
 * Resumo estatístico da sprint ativa
 */
export interface MikaSprintForecastSummary {
  id: string;
  title: string;
  pendingCount: number;
  completedCount: number;
  targetDate?: string;
  p85Days: number;
  p85Date: string;
  targetProbability?: number;
  riskLevel?: TargetDateRiskLevel;
}

/**
 * Resumo de capacidade estocástica (How-Many)
 */
export interface MikaCapacityForecastSummary {
  windowDays: number;
  p50Items: number;
  p85Items: number;
  p95Items: number;
}

/**
 * Snapshot completo de telemetria estocástica injetado no contexto da Mika
 */
export interface MikaMonteCarloTelemetry {
  sampleValidation: ThroughputSampleValidation;
  initiatives: MikaInitiativeForecastSummary[];
  activeSprint?: MikaSprintForecastSummary;
  defaultCapacity14Days?: MikaCapacityForecastSummary;
  generalBacklogPendingCount: number;
  generalBacklogP85Days: number;
  generalBacklogP85Date: string;
}

/**
 * Ação consultiva interativa para navegação direta ao painel de Monte Carlo
 */
export interface MikaForecastActionPayload {
  type: 'NAVIGATE_TO_FORECAST';
  label: string;
  scopeType: 'initiative' | 'sprint' | 'all' | 'tag';
  scopeId?: string;
}

/**
 * Intenções semânticas de Monte Carlo reconhecidas pelo motor heurístico
 */
export type MikaMonteCarloIntentType =
  | 'forecast_initiative'
  | 'forecast_initiatives_summary'
  | 'forecast_sprint'
  | 'forecast_capacity'
  | 'forecast_general';

