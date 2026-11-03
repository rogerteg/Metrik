/**
 * Metrik — Tipos de Automação de Fluxo (Flow Rules)
 * Specification: specs/053-flow-automation-policies/spec.md
 */

import { ColumnCategory, PriorityLevel, TaskModel } from './kanban';

export type FlowTriggerType =
  | 'card_moved'
  | 'block_status_changed'
  | 'card_created'
  | 'aging_threshold_exceeded'
  | 'due_date_approaching';

export interface FlowTriggerConfig {
  /** Coluna destino específica ou '*' para qualquer */
  targetColumnId?: string;
  /** Categoria da coluna destino ('todo' | 'in_progress' | 'done') */
  targetColumnCategory?: ColumnCategory;
  /** Limiar de tempo em dias para envelhecimento (aging) */
  agingThresholdDays?: number;
  /** Limiar de tempo em horas para proximidade de prazo */
  dueHoursThreshold?: number;
  /** Filtrar por estado de bloqueio ('blocked' | 'unblocked' | 'any') */
  blockStatus?: 'blocked' | 'unblocked' | 'any';
}

export interface FlowTrigger {
  type: FlowTriggerType;
  config: FlowTriggerConfig;
}

export type FlowConditionField = 'priority' | 'tags' | 'type' | 'assignee' | 'columnCategory';
export type FlowConditionOperator =
  'equals' | 'not_equals' | 'contains' | 'not_contains' | 'is_empty' | 'is_not_empty';

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
