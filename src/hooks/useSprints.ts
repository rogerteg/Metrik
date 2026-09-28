import { useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { BoardState, SprintModel } from '../types/kanban';
import { normalizeSprintName, isValidSprintName, isValidSprintRange } from '../utils/sprintMetrics';

type SetBoard = React.Dispatch<React.SetStateAction<BoardState>>;

export interface SprintInput {
  name: string;
  goal?: string;
  startDate?: string;
  endDate?: string;
}

export interface UseSprintsReturn {
  addSprint: (input: SprintInput) => void;
  updateSprint: (
    id: string,
    updates: Partial<Pick<SprintModel, 'name' | 'goal' | 'startDate' | 'endDate'>>,
  ) => void;
  deleteSprint: (id: string) => void;
  startSprint: (id: string) => void;
  completeSprint: (id: string) => void;
  setTaskSprint: (taskId: string, sprintId: string | null) => void;
}

/**
 * Mutações de sprint (Feature 038) isoladas de `useTaskCollection` (SRP).
 * Recebe o `setBoard` do dono do estado. Invariantes:
 *  - no máximo uma sprint ativa (ativar rebaixa as demais);
 *  - excluir sprint desassocia tarefas (nunca as apaga);
 *  - concluir sprint não conclui nem move tarefas;
 *  - nenhuma operação altera estado de fluxo do cartão.
 */
export function useSprints(setBoard: SetBoard): UseSprintsReturn {
  const addSprint = useCallback(
    (input: SprintInput) => {
      const name = normalizeSprintName(input.name);
      if (!isValidSprintName(name) || !isValidSprintRange(input.startDate, input.endDate)) return;

      const sprint: SprintModel = {
        id: uuidv4(),
        name,
        goal: input.goal?.trim() || undefined,
        status: 'planned',
        startDate: input.startDate || undefined,
        endDate: input.endDate || undefined,
        createdAt: new Date().toISOString(),
      };

      setBoard((prev) => ({ ...prev, sprints: [...(prev.sprints ?? []), sprint] }));
    },
    [setBoard],
  );

  const updateSprint = useCallback(
    (
      id: string,
      updates: Partial<Pick<SprintModel, 'name' | 'goal' | 'startDate' | 'endDate'>>,
    ) => {
      setBoard((prev) => {
        const current = (prev.sprints ?? []).find((s) => s.id === id);
        if (!current) return prev;

        const name = updates.name !== undefined ? normalizeSprintName(updates.name) : current.name;
        if (!isValidSprintName(name)) return prev;

        const startDate = updates.startDate !== undefined ? updates.startDate : current.startDate;
        const endDate = updates.endDate !== undefined ? updates.endDate : current.endDate;
        if (!isValidSprintRange(startDate, endDate)) return prev;

        return {
          ...prev,
          sprints: (prev.sprints ?? []).map((s) =>
            s.id === id
              ? {
                  ...s,
                  name,
                  goal: updates.goal !== undefined ? updates.goal.trim() || undefined : s.goal,
                  startDate: startDate || undefined,
                  endDate: endDate || undefined,
                }
              : s,
          ),
        };
      });
    },
    [setBoard],
  );

  const deleteSprint = useCallback(
    (id: string) => {
      setBoard((prev) => {
        const nextTasks: typeof prev.tasks = {};
        for (const colId of Object.keys(prev.tasks)) {
          nextTasks[colId] = prev.tasks[colId].map((task) =>
            task.sprintId === id ? { ...task, sprintId: undefined } : task,
          );
        }
        return {
          ...prev,
          tasks: nextTasks,
          sprints: (prev.sprints ?? []).filter((s) => s.id !== id),
          activeSprintId: prev.activeSprintId === id ? null : prev.activeSprintId,
        };
      });
    },
    [setBoard],
  );

  const startSprint = useCallback(
    (id: string) => {
      setBoard((prev) => {
        const exists = (prev.sprints ?? []).some((s) => s.id === id);
        if (!exists) return prev;
        return {
          ...prev,
          activeSprintId: id,
          sprints: (prev.sprints ?? []).map((s) =>
            s.id === id
              ? { ...s, status: 'active', completedAt: undefined }
              : s.status === 'active'
                ? { ...s, status: 'planned' }
                : s,
          ),
        };
      });
    },
    [setBoard],
  );

  const completeSprint = useCallback(
    (id: string) => {
      setBoard((prev) => {
        const exists = (prev.sprints ?? []).some((s) => s.id === id);
        if (!exists) return prev;
        const now = new Date().toISOString();
        return {
          ...prev,
          activeSprintId: prev.activeSprintId === id ? null : prev.activeSprintId,
          // Conclui somente a sprint; nenhuma tarefa é concluída ou movida automaticamente.
          sprints: (prev.sprints ?? []).map((s) =>
            s.id === id ? { ...s, status: 'completed', completedAt: now } : s,
          ),
        };
      });
    },
    [setBoard],
  );

  const setTaskSprint = useCallback(
    (taskId: string, sprintId: string | null) => {
      setBoard((prev) => {
        const nextTasks: typeof prev.tasks = {};
        for (const colId of Object.keys(prev.tasks)) {
          nextTasks[colId] = prev.tasks[colId].map((task) =>
            task.id === taskId ? { ...task, sprintId: sprintId ?? undefined } : task,
          );
        }
        return { ...prev, tasks: nextTasks };
      });
    },
    [setBoard],
  );

  return { addSprint, updateSprint, deleteSprint, startSprint, completeSprint, setTaskSprint };
}
