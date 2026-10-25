import { useCallback } from 'react';
import { TaskModel } from '../types/kanban';
import { TaskRelationType } from '../types/taskTypes';
import { addBidirectionalLink, removeBidirectionalLink } from '../utils/taskRelations';

interface UseCrossSquadLinkingParams {
  selectedTaskId: string | null;
  activeBoardId: string | null;
  allBoardTasks: TaskModel[];
  effectiveTeamId: string;
  updateTask: (id: string, updates: Partial<TaskModel>) => void;
}

export function useCrossSquadLinking({
  selectedTaskId,
  activeBoardId,
  allBoardTasks,
  effectiveTeamId,
  updateTask,
}: UseCrossSquadLinkingParams) {
  const handleAddLink = useCallback(
    (
      targetTaskId: string,
      relationType: TaskRelationType,
      targetBoardId: string,
      targetTeamId: string,
    ) => {
      if (!selectedTaskId || !activeBoardId) return;

      const sourceTask = allBoardTasks.find((t) => t.id === selectedTaskId);
      if (!sourceTask) return;

      if (targetBoardId === activeBoardId) {
        const targetTask = allBoardTasks.find((t) => t.id === targetTaskId);
        if (!targetTask) return;

        const { updatedSource, updatedTarget } = addBidirectionalLink({
          sourceTask,
          targetTask,
          relationType,
          sourceBoardId: activeBoardId,
          targetBoardId,
          sourceTeamId: effectiveTeamId,
          targetTeamId,
        });

        updateTask(sourceTask.id, { links: updatedSource.links });
        updateTask(targetTask.id, { links: updatedTarget.links });
      } else {
        try {
          const storageKey = `metrik-tasks-${targetBoardId}`;
          const raw = localStorage.getItem(storageKey);
          if (raw) {
            const parsed = JSON.parse(raw);
            let targetTask: TaskModel | undefined;
            for (const colId of Object.keys(parsed.tasks || {})) {
              const found = (parsed.tasks[colId] as TaskModel[]).find((t) => t.id === targetTaskId);
              if (found) {
                targetTask = found;
                break;
              }
            }

            if (targetTask) {
              const { updatedSource, updatedTarget } = addBidirectionalLink({
                sourceTask,
                targetTask,
                relationType,
                sourceBoardId: activeBoardId,
                targetBoardId,
                sourceTeamId: effectiveTeamId,
                targetTeamId,
              });

              updateTask(sourceTask.id, { links: updatedSource.links });

              for (const colId of Object.keys(parsed.tasks)) {
                parsed.tasks[colId] = (parsed.tasks[colId] as TaskModel[]).map((t) =>
                  t.id === targetTaskId ? updatedTarget : t,
                );
              }
              localStorage.setItem(storageKey, JSON.stringify(parsed));
            }
          }
        } catch (err) {
          console.error('[Metrik] Falha ao criar vínculo cross-squad:', err);
        }
      }
    },
    [selectedTaskId, activeBoardId, allBoardTasks, effectiveTeamId, updateTask],
  );

  const handleRemoveLink = useCallback(
    (targetTaskId: string) => {
      if (!selectedTaskId || !activeBoardId) return;

      const sourceTask = allBoardTasks.find((t) => t.id === selectedTaskId);
      if (!sourceTask) return;

      const linkToRemove = (sourceTask.links ?? []).find((l) => l.targetTaskId === targetTaskId);
      if (!linkToRemove) return;

      if (linkToRemove.targetBoardId === activeBoardId) {
        const targetTask = allBoardTasks.find((t) => t.id === targetTaskId);
        if (targetTask) {
          const { updatedSource, updatedTarget } = removeBidirectionalLink(sourceTask, targetTask);
          updateTask(sourceTask.id, { links: updatedSource.links });
          updateTask(targetTask.id, { links: updatedTarget.links });
        } else {
          updateTask(sourceTask.id, {
            links: (sourceTask.links ?? []).filter((l) => l.targetTaskId !== targetTaskId),
          });
        }
      } else {
        updateTask(sourceTask.id, {
          links: (sourceTask.links ?? []).filter((l) => l.targetTaskId !== targetTaskId),
        });

        try {
          const storageKey = `metrik-tasks-${linkToRemove.targetBoardId}`;
          const raw = localStorage.getItem(storageKey);
          if (raw) {
            const parsed = JSON.parse(raw);
            for (const colId of Object.keys(parsed.tasks || {})) {
              parsed.tasks[colId] = (parsed.tasks[colId] as TaskModel[]).map((t) => {
                if (t.id === targetTaskId && t.links) {
                  return {
                    ...t,
                    links: t.links.filter((l) => l.targetTaskId !== sourceTask.id),
                  };
                }
                return t;
              });
            }
            localStorage.setItem(storageKey, JSON.stringify(parsed));
          }
        } catch (err) {
          console.error('[Metrik] Falha ao remover vínculo cross-squad:', err);
        }
      }
    },
    [selectedTaskId, activeBoardId, allBoardTasks, updateTask],
  );

  return {
    handleAddLink,
    handleRemoveLink,
  };
}
