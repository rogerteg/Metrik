/**
 * Metrik — Motor Puro de Regras de Fluxo (Flow Rules Engine)
 * Funções puras, determinísticas e sem efeitos colaterais.
 * Specification: specs/053-flow-automation-policies/spec.md
 */

import {
  FlowRule,
  FlowTrigger,
  FlowCondition,
  FlowAction,
  FlowEventContext,
  FlowExecutionResult,
} from '../types/flowRules';
import { TaskModel, ColumnModel } from '../types/kanban';

/**
 * Avalia se o gatilho da regra corresponde ao contexto do evento e estado da tarefa.
 */
export function matchTrigger(
  trigger: FlowTrigger,
  context: FlowEventContext,
  task: TaskModel,
): boolean {
  if (trigger.type !== context.event) {
    return false;
  }

  const { config } = trigger;

  switch (trigger.type) {
    case 'card_moved': {
      if (config.targetColumnId && config.targetColumnId !== '*') {
        if (context.toColumnId !== config.targetColumnId) {
          return false;
        }
      }
      if (config.targetColumnCategory) {
        if (context.toCategory !== config.targetColumnCategory) {
          return false;
        }
      }
      return true;
    }

    case 'block_status_changed': {
      if (!config.blockStatus || config.blockStatus === 'any') {
        return true;
      }
      if (config.blockStatus === 'blocked') {
        return task.blocked === true;
      }
      if (config.blockStatus === 'unblocked') {
        return task.blocked === false;
      }
      return true;
    }

    case 'card_created': {
      return true;
    }

    case 'aging_threshold_exceeded': {
      if (config.targetColumnCategory && context.toCategory) {
        if (context.toCategory !== config.targetColumnCategory) {
          return false;
        }
      }

      const thresholdDays = config.agingThresholdDays ?? 0;
      if (thresholdDays <= 0) return true;

      const referenceDateStr = task.lastMovedAt || task.startedAt || task.createdAt;
      if (!referenceDateStr) return false;

      const referenceTime = new Date(referenceDateStr).getTime();
      const elapsedDays = (Date.now() - referenceTime) / (1000 * 60 * 60 * 24);

      return elapsedDays >= thresholdDays;
    }

    case 'due_date_approaching': {
      if (!task.dueDate) return false;

      const thresholdHours = config.dueHoursThreshold ?? 24;
      const dueTime = new Date(task.dueDate).getTime();
      const remainingHours = (dueTime - Date.now()) / (1000 * 60 * 60);

      // Dispara se o vencimento for dentro do limiar e ainda não tiver passado de 7 dias de atraso
      return remainingHours <= thresholdHours && remainingHours >= -168;
    }

    default:
      return false;
  }
}

/**
 * Avalia se todas as condições declaradas na regra são satisfeitas pela tarefa.
 */
export function matchConditions(
  conditions: FlowCondition[],
  task: TaskModel,
  columns: ColumnModel[],
): boolean {
  if (!conditions || conditions.length === 0) {
    return true;
  }

  return conditions.every((cond) => {
    let rawValue: unknown;

    switch (cond.field) {
      case 'priority':
        rawValue = task.priority;
        break;
      case 'tags':
        rawValue = task.tags || [];
        break;
      case 'type':
        rawValue = task.type;
        break;
      case 'assignee':
        rawValue = task.assignee || '';
        break;
      case 'columnCategory': {
        const col = columns.find((c) => c.id === task.column);
        rawValue = col?.category;
        break;
      }
      default:
        rawValue = undefined;
    }

    switch (cond.operator) {
      case 'equals':
        return String(rawValue).toLowerCase() === String(cond.value).toLowerCase();

      case 'not_equals':
        return String(rawValue).toLowerCase() !== String(cond.value).toLowerCase();

      case 'contains': {
        if (Array.isArray(rawValue)) {
          return rawValue.some(
            (item) => String(item).toLowerCase() === String(cond.value).toLowerCase(),
          );
        }
        return String(rawValue).toLowerCase().includes(String(cond.value).toLowerCase());
      }

      case 'not_contains': {
        if (Array.isArray(rawValue)) {
          return !rawValue.some(
            (item) => String(item).toLowerCase() === String(cond.value).toLowerCase(),
          );
        }
        return !String(rawValue).toLowerCase().includes(String(cond.value).toLowerCase());
      }

      case 'is_empty': {
        if (Array.isArray(rawValue)) return rawValue.length === 0;
        return !rawValue || String(rawValue).trim() === '';
      }

      case 'is_not_empty': {
        if (Array.isArray(rawValue)) return rawValue.length > 0;
        return Boolean(rawValue && String(rawValue).trim() !== '');
      }

      default:
        return true;
    }
  });
}

/**
 * Computa as mutações a serem aplicadas no cartão com base nas ações da regra.
 */
export function resolveActions(
  actions: FlowAction[],
  task: TaskModel,
  _ruleName: string,
): {
  updates: Partial<TaskModel>;
  toasts: string[];
  hasChanges: boolean;
} {
  const updates: Partial<TaskModel> = {};
  const toasts: string[] = [];
  let hasChanges = false;

  const currentTags = updates.tags ? [...updates.tags] : [...(task.tags || [])];

  for (const action of actions) {
    switch (action.type) {
      case 'add_tag': {
        const tagToAdd = action.payload.tag?.trim();
        if (tagToAdd && !currentTags.includes(tagToAdd)) {
          currentTags.push(tagToAdd);
          updates.tags = currentTags;
          hasChanges = true;
        }
        break;
      }

      case 'remove_tag': {
        const tagToRemove = action.payload.tag?.trim();
        if (tagToRemove && currentTags.includes(tagToRemove)) {
          const filtered = currentTags.filter((t) => t !== tagToRemove);
          currentTags.length = 0;
          currentTags.push(...filtered);
          updates.tags = currentTags;
          hasChanges = true;
        }
        break;
      }

      case 'set_priority': {
        if (action.payload.priority && task.priority !== action.payload.priority) {
          updates.priority = action.payload.priority;
          hasChanges = true;
        }
        break;
      }

      case 'set_blocked': {
        if (!task.blocked || task.blockedReason !== action.payload.blockReason) {
          updates.blocked = true;
          updates.blockedReason = action.payload.blockReason || 'Bloqueado por automação de fluxo';
          hasChanges = true;
        }
        break;
      }

      case 'set_unblocked': {
        if (task.blocked) {
          updates.blocked = false;
          updates.blockedReason = undefined;
          hasChanges = true;
        }
        break;
      }

      case 'notify_toast': {
        if (action.payload.toastMessage) {
          toasts.push(action.payload.toastMessage);
          hasChanges = true;
        }
        break;
      }

      case 'highlight_card': {
        // Sinalizador para renderização visual
        hasChanges = true;
        break;
      }
    }
  }

  return { updates, toasts, hasChanges };
}

/**
 * Avalia todas as regras de um quadro para um evento disparado.
 * Implementa Trava de Profundidade Única (Depth = 1) para prevenir loops.
 */
export function evaluateRulesForEvent(
  rules: FlowRule[],
  context: FlowEventContext,
  task: TaskModel,
  columns: ColumnModel[],
): FlowExecutionResult[] {
  // Trava anti-recursão depth=1: se o evento veio de uma automação anterior, não propaga
  if (context.isAutomated) {
    return [];
  }

  const results: FlowExecutionResult[] = [];
  const activeRules = rules.filter((r) => r.enabled);

  for (const rule of activeRules) {
    if (matchTrigger(rule.trigger, context, task)) {
      if (matchConditions(rule.conditions, task, columns)) {
        const { updates, toasts, hasChanges } = resolveActions(rule.actions, task, rule.name);

        if (hasChanges) {
          results.push({
            ruleId: rule.id,
            ruleName: rule.name,
            taskUpdates: updates,
            toastMessages: toasts,
            appliedAt: new Date().toISOString(),
          });
        }
      }
    }
  }

  return results;
}
