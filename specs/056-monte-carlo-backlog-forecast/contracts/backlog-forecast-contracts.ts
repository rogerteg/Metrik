/**
 * TypeScript Contracts for Feature 056: Monte Carlo Backlog & Epic Predictive Forecast
 */

import { TaskModel } from '../../../src/types/kanban';
import { MonteCarloWhenPercentile } from '../../../src/utils/monteCarlo';

export type BacklogScopeType = 'all' | 'initiative' | 'sprint' | 'tag';

export type TargetDateRiskLevel = 'low' | 'moderate' | 'high' | 'critical';

export interface BacklogForecastScope {
  type: BacklogScopeType;
  scopeId?: string;
  scopeTitle: string;
  allTasks: TaskModel[];
  completedTasks: TaskModel[];
  pendingTasks: TaskModel[];
  selectedTaskIds: string[];
  inferredTargetDate?: string;
}

export interface TargetDateProbabilityResult {
  targetDate: string;
  availableDays: number;
  probability: number;
  successfulTrials: number;
  totalTrials: number;
  riskLevel: TargetDateRiskLevel;
  statusMessage: string;
}

export interface BacklogMonteCarloForecastResult {
  scope: BacklogForecastScope;
  itemCount: number;
  p50: MonteCarloWhenPercentile;
  p85: MonteCarloWhenPercentile;
  p95: MonteCarloWhenPercentile;
  targetDateAnalysis?: TargetDateProbabilityResult;
  sampleDays: number;
  totalDelivered: number;
  isSampleSufficient: boolean;
  warningReason?: string;
}

export interface ScopeSelectionOption {
  type: BacklogScopeType;
  id?: string;
  label: string;
  count: number;
  targetDate?: string;
}

