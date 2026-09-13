import { TaskModel, ColumnModel } from '../types/kanban';
import {
  TaskRelationType,
  TaskLinkModel,
  getReciprocalRelation,
  CrossSquadTaskSummary,
} from '../types/taskTypes';

export { getReciprocalRelation };

export interface AddBidirectionalLinkParams {
  sourceTask: TaskModel;
  targetTask: TaskModel;
  relationType: TaskRelationType;
  sourceBoardId: string;
  targetBoardId: string;
  sourceTeamId: string;
  targetTeamId: string;
}

/**
 * Cria ou atualiza um relacionamento bidirecional consistente entre duas tarefas.
 */
export function addBidirectionalLink({
  sourceTask,
  targetTask,
  relationType,
  sourceBoardId,
  targetBoardId,
  sourceTeamId,
  targetTeamId,
}: AddBidirectionalLinkParams): { updatedSource: TaskModel; updatedTarget: TaskModel } {
  // Prevenção de auto-vínculo
  if (sourceTask.id === targetTask.id) {
    return {
      updatedSource: { ...sourceTask, links: sourceTask.links ? [...sourceTask.links] : [] },
      updatedTarget: { ...targetTask, links: targetTask.links ? [...targetTask.links] : [] },
    };
  }

  const reciprocalRelation = getReciprocalRelation(relationType);
  const now = new Date().toISOString();

  // Filtra links prévios com a mesma tarefa alvo para evitar duplicações
  const existingSourceLinks = (sourceTask.links ?? []).filter(l => l.targetTaskId !== targetTask.id);
  const existingTargetLinks = (targetTask.links ?? []).filter(l => l.targetTaskId !== sourceTask.id);

  const newSourceLink: TaskLinkModel = {
    id: crypto.randomUUID(),
    targetTaskId: targetTask.id,
    relationType,
    targetBoardId,
    targetTeamId,
    createdAt: now,
  };

  const newTargetLink: TaskLinkModel = {
    id: crypto.randomUUID(),
    targetTaskId: sourceTask.id,
    relationType: reciprocalRelation,
    targetBoardId: sourceBoardId,
    targetTeamId: sourceTeamId,
    createdAt: now,
  };

  return {
    updatedSource: {
      ...sourceTask,
      links: [...existingSourceLinks, newSourceLink],
    },
    updatedTarget: {
      ...targetTask,
      links: [...existingTargetLinks, newTargetLink],
    },
  };
}

/**
 * Remove o relacionamento bidirecional entre duas tarefas.
 */
export function removeBidirectionalLink(
  sourceTask: TaskModel,
  targetTask: TaskModel
): { updatedSource: TaskModel; updatedTarget: TaskModel } {
  const updatedSourceLinks = (sourceTask.links ?? []).filter(l => l.targetTaskId !== targetTask.id);
  const updatedTargetLinks = (targetTask.links ?? []).filter(l => l.targetTaskId !== sourceTask.id);

  return {
    updatedSource: {
      ...sourceTask,
      links: updatedSourceLinks,
    },
    updatedTarget: {
      ...targetTask,
      links: updatedTargetLinks,
    },
  };
}

/**
 * Purga links órfãos apontando para uma tarefa recém-excluída.
 */
export function cleanupOrphanedLinks(tasks: TaskModel[], deletedTaskId: string): TaskModel[] {
  return tasks.map(task => {
    if (!task.links || task.links.length === 0) return task;
    const filtered = task.links.filter(l => l.targetTaskId !== deletedTaskId);
    if (filtered.length === task.links.length) return task;
    return {
      ...task,
      links: filtered,
    };
  });
}

/**
 * Calcula o progresso percentual de uma tarefa do tipo Iniciativa.
 * Progresso = (filhos em colunas done / total de filhos vinculados) * 100
 */
export function calculateInitiativeProgress(
  initiativeTask: TaskModel,
  allTasks: TaskModel[],
  columns: ColumnModel[]
): { total: number; completed: number; percentage: number } {
  const childLinks = (initiativeTask.links ?? []).filter(l => l.relationType === 'child');
  if (childLinks.length === 0) {
    return { total: 0, completed: 0, percentage: 0 };
  }

  const doneColumnIds = new Set(
    columns.filter(c => c.category === 'done').map(c => c.id)
  );

  let completedCount = 0;
  let validChildrenCount = 0;

  for (const link of childLinks) {
    const childTask = allTasks.find(t => t.id === link.targetTaskId);
    if (childTask) {
      validChildrenCount++;
      if (doneColumnIds.has(childTask.column)) {
        completedCount++;
      }
    }
  }

  const total = validChildrenCount || childLinks.length;
  const percentage = total > 0 ? Math.round((completedCount / total) * 100) : 0;

  return {
    total,
    completed: completedCount,
    percentage,
  };
}

/**
 * Identifica dependências bloqueadoras pendentes da tarefa (relationType === 'is_blocked_by' que não estão em 'done').
 */
export function getPendingBlockers(
  task: TaskModel,
  allTasks: TaskModel[],
  columns: ColumnModel[]
): CrossSquadTaskSummary[] {
  const blockingLinks = (task.links ?? []).filter(l => l.relationType === 'is_blocked_by');
  if (blockingLinks.length === 0) return [];

  const doneColumnIds = new Set(
    columns.filter(c => c.category === 'done').map(c => c.id)
  );

  const pending: CrossSquadTaskSummary[] = [];

  for (const link of blockingLinks) {
    const targetTask = allTasks.find(t => t.id === link.targetTaskId);
    if (targetTask) {
      const col = columns.find(c => c.id === targetTask.column);
      const isDone = doneColumnIds.has(targetTask.column);
      if (!isDone) {
        pending.push({
          taskId: targetTask.id,
          taskTitle: targetTask.title,
          taskType: targetTask.type ?? 'card',
          columnId: targetTask.column,
          columnTitle: col?.title ?? 'Desconhecida',
          columnCategory: col?.category ?? 'todo',
          boardId: link.targetBoardId,
          boardName: '',
          teamId: link.targetTeamId,
          teamName: '',
          isExternalSquad: false,
          isDone: false,
        });
      }
    } else if (link.targetBoardId) {
      try {
        const storageKey = `metrik-tasks-${link.targetBoardId}`;
        const raw = localStorage.getItem(storageKey);
        if (raw) {
          const parsed = JSON.parse(raw);
          const boardCols: ColumnModel[] = parsed.columns || [];
          const doneIds = new Set(boardCols.filter(c => c.category === 'done').map(c => c.id));
          for (const colId of Object.keys(parsed.tasks || {})) {
            const found = (parsed.tasks[colId] as TaskModel[]).find(t => t.id === link.targetTaskId);
            if (found) {
              const isDone = doneIds.has(found.column);
              if (!isDone) {
                const col = boardCols.find(c => c.id === found.column);
                pending.push({
                  taskId: found.id,
                  taskTitle: found.title || 'Tarefa externa',
                  taskType: found.type ?? 'card',
                  columnId: found.column,
                  columnTitle: col?.title ?? 'Em Aberto',
                  columnCategory: col?.category ?? 'todo',
                  boardId: link.targetBoardId,
                  boardName: parsed.name ?? '',
                  teamId: link.targetTeamId,
                  teamName: '',
                  isExternalSquad: true,
                  isDone: false,
                });
              }
              break;
            }
          }
        }
      } catch {
        // Defensive: ignore localStorage read errors
      }
    }
  }

  return pending;
}
