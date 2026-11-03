/**
 * Contratos de Tipos e Funções para Automações de Fluxo & Políticas de Coluna
 * Feature 053 — Metrik
 */

import { TaskModel, ColumnModel, ColumnCategory, PriorityLevel } from '../../../src/types/kanban';

export type FlowTriggerType =
  | 'card_moved'
  | 'block_status_changed'
  | 'card_created'
  | 'aging_threshold_exceeded'
  | 'due_date_approaching';

export interface FlowTriggerConfig {
  targetColumnId?: string;
  targetColumnCategory?: ColumnCategory;
  agingThresholdDays?: number;
  dueHoursThreshold?: number;
  blockStatus?: 'blocked' | 'unblocked' | 'any';
}

export interface FlowTrigger {
  type: FlowTriggerType;
  config: FlowTriggerConfig;
}

export type FlowConditionField = 'priority' | 'tags' | 'type' | 'assignee' | 'columnCategory';
export type FlowConditionOperator =
  | 'equals'
  | 'not_equals'
  | 'contains'
  | 'not_contains'
  | 'is_empty'
  | 'is_not_empty';

export interface FlowCondition {
  id: string;
  field: FlowConditionField;
  operator: FlowConditionOperator;
  value?: string | string[];
}

export type FlowActionType =
  | 'add_tag'
  | 'remove_tag'
  | 'set_priority'
  | 'set_blocked'
  | 'set_unblocked'
  | 'notify_toast'
  | 'highlight_card';

export interface FlowActionPayload {
  tag?: string;
  tags?: string[];
  priority?: PriorityLevel;
  blockReason?: string;
  toastMessage?: string;
  highlightColor?: string;
}

export interface FlowAction {
  id: string;
  type: FlowActionType;
  payload: FlowActionPayload;
}

export interface FlowRule {
  id: string;
  boardId: string;
  name: string;
  description?: string;
  enabled: boolean;
  trigger: FlowTrigger;
  conditions: FlowCondition[];
  actions: FlowAction[];
  createdAt: string;
  updatedAt: string;
  lastTriggeredAt?: string | null;
  executionCount: number;
}

export interface ColumnPolicy {
  columnId: string;
  entryCriteria: string; // Definition of Ready
  exitCriteria: string;  // Definition of Done
  updatedAt: string;
}

export interface FlowEventContext {
  boardId: string;
  event: FlowTriggerType;
  fromColumnId?: string;
  toColumnId?: string;
  toCategory?: ColumnCategory;
  isAutomated?: boolean;
}

export interface FlowExecutionResult {
  ruleId: string;
  ruleName: string;
  taskUpdates: Partial<TaskModel>;
  toastMessages: string[];
  appliedAt: string;
}

/**
 * Interface do Motor Puro de Execução de Regras
 */
export interface FlowRulesEngineContract {
  /** Avalia se um gatilho é correspondido pelo evento */
  matchTrigger(trigger: FlowTrigger, eventContext: FlowEventContext, task: TaskModel): boolean;

  /** Avalia se todas as condições da regra são verdadeiras */
  matchConditions(conditions: FlowCondition[], task: TaskModel, columns: ColumnModel[]): boolean;

  /** Calcula as mutações geradas por um conjunto de ações */
  resolveActions(
    actions: FlowAction[],
    task: TaskModel,
    ruleName: string,
  ): {
    updates: Partial<TaskModel>;
    toasts: string[];
    hasChanges: boolean;
  };

  /** Avalia e executa todas as regras ativas de um quadro para um evento */
  evaluateRulesForEvent(
    rules: FlowRule[],
    eventContext: FlowEventContext,
    task: TaskModel,
    columns: ColumnModel[],
  ): FlowExecutionResult[];
}
