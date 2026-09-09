import { BoardState, ColumnType, TaskModel } from '../types/kanban';
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

  // Localiza a tarefa ativa e sua coluna de origem
  let sourceColumn: ColumnType | undefined;
  let activeTask: TaskModel | undefined;

  for (const col of Object.values(ColumnType)) {
    const found = board[col].find((t) => t.id === activeTaskId);
    if (found) {
      sourceColumn = col;
      activeTask = found;
      break;
    }
  }

  if (!activeTask || !sourceColumn) {
    return board;
  }

  // Soltura sobre si mesmo na mesma coluna é no-op
  if (sourceColumn === targetColumn && targetTaskId === activeTaskId) {
    return board;
  }

  // Clona o board sem a tarefa ativa
  const nextBoard: BoardState = {
    [ColumnType.TO_DO]: board[ColumnType.TO_DO].filter((t) => t.id !== activeTaskId),
    [ColumnType.IN_PROGRESS]: board[ColumnType.IN_PROGRESS].filter((t) => t.id !== activeTaskId),
    [ColumnType.BLOCKED]: board[ColumnType.BLOCKED].filter((t) => t.id !== activeTaskId),
    [ColumnType.COMPLETED]: board[ColumnType.COMPLETED].filter((t) => t.id !== activeTaskId),
  };

  // Atualização dos timestamps de ciclo de vida
  let startedAt = activeTask.startedAt;
  let completedAt = activeTask.completedAt;

  if (targetColumn === ColumnType.COMPLETED) {
    completedAt = nowIso;
    if (!startedAt) {
      startedAt = activeTask.createdAt || nowIso;
    }
  } else {
    // Se saiu de completed, limpa completedAt
    if (sourceColumn === ColumnType.COMPLETED) {
      completedAt = undefined;
    }
    // Se entrou em in_progress ou blocked pela primeira vez
    if ((targetColumn === ColumnType.IN_PROGRESS || targetColumn === ColumnType.BLOCKED) && !startedAt) {
      startedAt = nowIso;
    }
  }

  const updatedTask: TaskModel = {
    ...activeTask,
    column: targetColumn,
    updatedAt: nowIso,
    startedAt,
    completedAt,
  };

  const targetList = [...nextBoard[targetColumn]];

  // Se houver um targetTaskId especificado na coluna destino
  if (targetTaskId && targetTaskId !== activeTaskId) {
    const targetIdx = targetList.findIndex((t) => t.id === targetTaskId);
    if (targetIdx !== -1) {
      const insertIdx = position === 'before' ? targetIdx : targetIdx + 1;
      targetList.splice(insertIdx, 0, updatedTask);
      nextBoard[targetColumn] = targetList;
      return nextBoard;
    }
  }

  // Sem targetTaskId ou alvo não encontrado: insere no final da coluna destino
  targetList.push(updatedTask);
  nextBoard[targetColumn] = targetList;
  return nextBoard;
}
