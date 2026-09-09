import { BoardState, TaskModel } from '../types/kanban';
import { ReorderOptions } from '../types/dnd';

/**
 * Reorganiza o estado do quadro Kanban (BoardState) movendo e/ou reordenando uma tarefa.
 * Atualiza determinística e idempotentemente os timestamps de fluxo.
 */
export function reorderBoard(
  board: BoardState,
  options: ReorderOptions,
  nowIso: string = new Date().toISOString()
): BoardState {
  const { activeTaskId, targetColumn, targetTaskId, position = 'before' } = options;

  let sourceColumn: string | undefined;
  let activeTask: TaskModel | undefined;

  for (const colId of Object.keys(board.tasks)) {
    const found = board.tasks[colId].find((t) => t.id === activeTaskId);
    if (found) {
      sourceColumn = colId;
      activeTask = found;
      break;
    }
  }

  if (!activeTask || !sourceColumn) {
    return board;
  }

  // No-op if dropped on itself in the same column
  if (sourceColumn === targetColumn && targetTaskId === activeTaskId) {
    return board;
  }

  const nextTasks: Record<string, TaskModel[]> = {};
  for (const colId of Object.keys(board.tasks)) {
    nextTasks[colId] = board.tasks[colId].filter((t) => t.id !== activeTaskId);
  }

  const targetColModel = board.columns.find(c => c.id === targetColumn);
  let startedAt = activeTask.startedAt;
  let completedAt = activeTask.completedAt;

  if (targetColModel) {
    const isTargetDone = targetColModel.category === 'done';
    const isTargetInProgress = targetColModel.category === 'in_progress';

    if (isTargetDone) {
      completedAt = nowIso;
      if (!startedAt) {
        startedAt = activeTask.createdAt || nowIso;
      }
    } else {
      // If moving out of done, clear completedAt
      const sourceColModel = board.columns.find(c => c.id === sourceColumn);
      if (sourceColModel && sourceColModel.category === 'done') {
        completedAt = undefined;
      }

      if (isTargetInProgress && !startedAt) {
        startedAt = nowIso;
      }
    }
  }

  const updatedTask: TaskModel = {
    ...activeTask,
    column: targetColumn,
    updatedAt: nowIso,
    startedAt,
    completedAt,
  };

  const targetList = [...(nextTasks[targetColumn] || [])];

  if (targetTaskId && targetTaskId !== activeTaskId) {
    const targetIdx = targetList.findIndex((t) => t.id === targetTaskId);
    if (targetIdx !== -1) {
      const insertIdx = position === 'before' ? targetIdx : targetIdx + 1;
      targetList.splice(insertIdx, 0, updatedTask);
      nextTasks[targetColumn] = targetList;
      return { ...board, tasks: nextTasks };
    }
  }

  targetList.push(updatedTask);
  nextTasks[targetColumn] = targetList;
  return { ...board, tasks: nextTasks };
}
