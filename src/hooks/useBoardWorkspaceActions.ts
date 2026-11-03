import { useCallback } from 'react';
import { ColumnModel, BoardModel } from '../types/kanban';
import { MIN_COLUMN_WIDTH } from '../utils/columnGeometry';
import { Workspace } from '../types/workspace';
import { DEFAULT_WORKSPACE_ID } from './useWorkspaces';

export interface UseBoardWorkspaceActionsProps {
  workspaces: Workspace[];
  activeWorkspaceId: string;
  addBoardToWorkspace: (workspaceId: string, boardId: string) => void;
  removeBoardFromWorkspace: (workspaceId: string, boardId: string) => void;
  createBoard: (name: string, teamId?: string) => BoardModel;
  columns: ColumnModel[];
  setColumnWidth: (columnId: string, width: number) => void;
  clearTasks: () => void;
}

export function useBoardWorkspaceActions({
  workspaces,
  activeWorkspaceId,
  addBoardToWorkspace,
  removeBoardFromWorkspace,
  createBoard,
  columns,
  setColumnWidth,
  clearTasks,
}: UseBoardWorkspaceActionsProps) {
  const handleClearBoard = useCallback(() => {
    if (
      window.confirm(
        'Tem certeza de que deseja limpar todas as tarefas do quadro? Esta ação não pode ser desfeita.',
      )
    ) {
      clearTasks();
    }
  }, [clearTasks]);

  const handleFitColumnsToWindow = useCallback(() => {
    const n = columns.length;
    if (n === 0) return;
    const grid =
      typeof document !== 'undefined'
        ? (document.querySelector('.kanban-board-grid') as HTMLElement | null)
        : null;
    const available =
      grid?.clientWidth ?? (typeof window !== 'undefined' ? window.innerWidth - 40 : 0);
    const usable = available - 12 - 14 * (n - 1);
    const width = Math.max(MIN_COLUMN_WIDTH, Math.floor(usable / n));
    columns.forEach((column) => setColumnWidth(column.id, width));
  }, [columns, setColumnWidth]);

  const handleMoveBoardToWorkspace = useCallback(
    (boardId: string, targetWorkspaceId: string | null) => {
      workspaces.forEach((ws) => {
        if (ws.boardIds.includes(boardId)) {
          removeBoardFromWorkspace(ws.id, boardId);
        }
      });
      if (targetWorkspaceId) {
        addBoardToWorkspace(targetWorkspaceId, boardId);
      }
    },
    [workspaces, addBoardToWorkspace, removeBoardFromWorkspace],
  );

  const handleCreateBoard = useCallback(
    (name: string, teamId?: string) => {
      const created = createBoard(name, teamId);
      const targetWorkspaceId =
        activeWorkspaceId === 'all' ? DEFAULT_WORKSPACE_ID : activeWorkspaceId;
      addBoardToWorkspace(targetWorkspaceId, created.id);
      return created;
    },
    [createBoard, activeWorkspaceId, addBoardToWorkspace],
  );

  return {
    handleClearBoard,
    handleFitColumnsToWindow,
    handleMoveBoardToWorkspace,
    handleCreateBoard,
  };
}
