import { useRef, useCallback } from 'react';
import { BoardState, TaskModel } from '../types/kanban';
import { useDataPortability } from './useDataPortability';
import { buildTasksCsv, buildSprintsCsv } from '../utils/csvExport';

export interface UseBoardExportImportProps {
  board: BoardState;
  activeBoardId: string | null;
  allBoardTasks: TaskModel[];
  overwriteBoard: (board: BoardState) => void;
}

export function useBoardExportImport({
  board,
  activeBoardId,
  allBoardTasks,
  overwriteBoard,
}: UseBoardExportImportProps) {
  const { exportData, importData, exportCsv } = useDataPortability();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExportTasks = useCallback(() => {
    exportCsv(`metrik-tarefas-${new Date().toISOString().slice(0, 10)}.csv`, buildTasksCsv(board));
  }, [board, exportCsv]);

  const handleExportSprints = useCallback(() => {
    exportCsv(
      `metrik-sprints-${new Date().toISOString().slice(0, 10)}.csv`,
      buildSprintsCsv(board.sprints, allBoardTasks),
    );
  }, [board.sprints, allBoardTasks, exportCsv]);

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      if (
        window.confirm(
          'A importação irá substituir completamente o seu quadro atual. Deseja continuar?',
        )
      ) {
        importData(
          file,
          (newBoard) => {
            overwriteBoard(newBoard);
            if (fileInputRef.current) fileInputRef.current.value = '';
          },
          (errorMsg) => {
            alert(errorMsg);
            if (fileInputRef.current) fileInputRef.current.value = '';
          },
        );
      } else {
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    },
    [importData, overwriteBoard],
  );

  const handleExportData = useCallback(() => {
    exportData(board, activeBoardId);
  }, [exportData, board, activeBoardId]);

  return {
    fileInputRef,
    handleExportTasks,
    handleExportSprints,
    handleFileChange,
    handleExportData,
  };
}
