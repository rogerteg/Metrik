/**
 * Utilitário puro de telemetria e métricas para quadros Kanban (Feature 031)
 * Especificações:
 * - specs/031-premium-board-management/spec.md
 * - specs/031-premium-board-management/data-model.md
 * - specs/031-premium-board-management/contracts/board-management.contract.md
 */

import { BoardModel, BoardState, ColumnCategory, ColumnModel, TaskModel } from '../types/kanban';
import { BoardSummaryMetrics } from '../types/boardManagement';

/**
 * Computa de forma pura as métricas de fluxo e telemetria de um quadro.
 * @param board Objeto base do quadro (podendo conter columns e tasks embutidos)
 * @param activeBoardId ID do quadro ativo na sessão atual
 * @param injectedState Estado de colunas e tarefas opcional (para injeção direta ou testes)
 * @returns Objeto imutável contendo métricas calculadas
 */
export function computeBoardSummaryMetrics(
  board: BoardModel & Partial<BoardState>,
  activeBoardId: string | null,
  injectedState?: BoardState | null
): BoardSummaryMetrics {
  const isActive = Boolean(activeBoardId && board.id === activeBoardId);

  let columns: ColumnModel[] = [];
  let tasks: Record<string, TaskModel[]> = {};

  if (injectedState && Array.isArray(injectedState.columns)) {
    columns = injectedState.columns;
    tasks = injectedState.tasks || {};
  } else if (Array.isArray(board.columns)) {
    columns = board.columns;
    tasks = board.tasks || {};
  } else if (typeof window !== 'undefined' && window.localStorage) {
    try {
      const raw = window.localStorage.getItem(`metrik-tasks-${board.id}`);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && Array.isArray(parsed.columns)) {
          columns = parsed.columns;
          tasks = parsed.tasks && typeof parsed.tasks === 'object' ? parsed.tasks : {};
        }
      }
    } catch {
      // Falha silenciosa de leitura de localStorage - mantém defaults defensivos
    }
  }

  const columnsCount = columns.length;
  const categoryMap = new Map<string, ColumnCategory>();
  for (const col of columns) {
    if (col && col.id) {
      categoryMap.set(col.id, col.category);
    }
  }

  let totalTasksCount = 0;
  let wipTasksCount = 0;
  let doneTasksCount = 0;

  if (tasks && typeof tasks === 'object') {
    for (const [colId, taskList] of Object.entries(tasks)) {
      if (Array.isArray(taskList)) {
        const count = taskList.length;
        totalTasksCount += count;
        const category = categoryMap.get(colId);

        if (category === 'in_progress') {
          wipTasksCount += count;
        } else if (category === 'done') {
          doneTasksCount += count;
        }
      }
    }
  }

  return {
    boardId: board.id,
    columnsCount,
    totalTasksCount,
    wipTasksCount,
    doneTasksCount,
    isActive,
  };
}
