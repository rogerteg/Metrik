/**
 * Metrik — Hook de Avaliação Periódica de Regras Temporais (Aging & Prazos)
 * Specification: specs/053-flow-automation-policies/spec.md
 */

import { useEffect, useRef } from 'react';
import { FlowRule, FlowEventContext } from '../types/flowRules';
import { TaskModel, ColumnModel } from '../types/kanban';
import { evaluateRulesForEvent } from '../utils/flowRulesEngine';

export interface UseFlowRulesTimerProps {
  enabled?: boolean;
  boardId: string;
  rules: FlowRule[];
  tasks: TaskModel[];
  columns: ColumnModel[];
  onApplyUpdates: (taskId: string, updates: Partial<TaskModel>) => void;
  onRecordExecution: (ruleId: string) => void;
  onToast?: (message: string) => void;
  intervalMs?: number;
}

export function useFlowRulesTimer({
  enabled = true,
  boardId,
  rules,
  tasks,
  columns,
  onApplyUpdates,
  onRecordExecution,
  onToast,
  intervalMs = 60000,
}: UseFlowRulesTimerProps): void {
  const latestRef = useRef({
    enabled,
    boardId,
    rules,
    tasks,
    columns,
    onApplyUpdates,
    onRecordExecution,
    onToast,
  });

  useEffect(() => {
    latestRef.current = {
      enabled,
      boardId,
      rules,
      tasks,
      columns,
      onApplyUpdates,
      onRecordExecution,
      onToast,
    };
  });

  useEffect(() => {
    if (!enabled) return;

    const checkTimeRules = () => {
      const {
        enabled: isNowEnabled,
        boardId: currentBoardId,
        rules: currentRules,
        tasks: currentTasks,
        columns: currentColumns,
        onApplyUpdates: applyFn,
        onRecordExecution: recordFn,
        onToast: toastFn,
      } = latestRef.current;

      if (!isNowEnabled || currentRules.length === 0 || currentTasks.length === 0) {
        return;
      }

      const timeBasedRules = currentRules.filter(
        (r) =>
          r.enabled &&
          (r.trigger.type === 'aging_threshold_exceeded' ||
            r.trigger.type === 'due_date_approaching'),
      );

      if (timeBasedRules.length === 0) return;

      const columnMap = new Map(currentColumns.map((c) => [c.id, c]));

      for (const task of currentTasks) {
        const col = columnMap.get(task.column);
        // Regras de tempo só se aplicam a itens em andamento ou a fazer (não concluídos)
        if (col?.category === 'done') continue;

        for (const rule of timeBasedRules) {
          const context: FlowEventContext = {
            boardId: currentBoardId,
            event: rule.trigger.type,
            toColumnId: task.column,
            toCategory: col?.category,
          };

          const results = evaluateRulesForEvent([rule], context, task, currentColumns);
          for (const res of results) {
            applyFn(task.id, res.taskUpdates);
            recordFn(res.ruleId);
            for (const msg of res.toastMessages) {
              toastFn?.(msg);
            }
          }
        }
      }
    };

    // Avaliação inicial
    checkTimeRules();

    // Polling a cada intervalMs (padrão: 60s)
    const timerId = setInterval(checkTimeRules, intervalMs);

    // Reavaliação ao voltar o foco da janela
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        checkTimeRules();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(timerId);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [enabled, intervalMs]);
}
