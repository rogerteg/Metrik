/**
 * Contratos formais TypeScript da Feature 058:
 * Simulador Prescritivo de Alavancas de Fluxo & Custo do Atraso
 */

import { TaskModel, ColumnModel } from '../../../src/types/kanban';
import { CardSlePrediction } from '../../../src/types/sle';
import { BacklogScopeType } from '../../056-monte-carlo-backlog-forecast/contracts/backlog-forecast-contracts';

export type FlowLeverageCategory = 'cascade_unblock' | 'aging_swarming' | 'wip_reduction';

export interface FlowLeverageItem {
  id: string;
  taskId: string;
  taskTitle: string;
  category: FlowLeverageCategory;
  impactDaysP85: number;
  dependentTaskCount: number;
  dependentTaskIds: string[];
  currentAgingDays: number;
  rationale: string;
  columnId?: string;
  columnTitle?: string;
}

export interface CascadeImpactResult {
  rootTaskId: string;
  dependentTaskIds: string[];
  maxDepth: number;
  hasCycle: boolean;
  cycleTaskIds?: string[];
  estimatedDelayDaysP85: number;
}

export interface SimulatedPolicyScenario {
  boardId: string;
  scopeType: BacklogScopeType;
  scopeId?: string;
  currentWipByColumn: Record<string, number>;
  configuredLimits: Record<string, number | null>;
  simulatedLimits: Record<string, number | null>;
  swarmingEnabled: boolean;
  currentCycleTimeP50: number;
  currentCycleTimeP85: number;
  simulatedCycleTimeP50: number;
  simulatedCycleTimeP85: number;
  deltaDaysP85: number;
  averageDailyThroughput: number;
  isSampleSufficient: boolean;
}

export interface TopLeveragesSummary {
  boardId: string;
  calculatedAt: string;
  items: FlowLeverageItem[];
  isSampleSufficient: boolean;
  deliveryDaysCount: number;
}

export interface FlowLeverageSimulatorPanelProps {
  tasks: TaskModel[];
  columns: ColumnModel[];
  scopeType: BacklogScopeType;
  scopeId?: string;
  slePredictions?: Record<string, CardSlePrediction>;
  isReadOnly?: boolean;
  onApplyWipLimit?: (columnId: string, newLimit: number) => void;
  onSelectTask?: (taskId: string) => void;
}

export interface TopLeveragesCardProps {
  summary: TopLeveragesSummary;
  onSelectTask?: (taskId: string) => void;
  onNavigateToSimulator?: () => void;
}

