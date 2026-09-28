import { useCallback } from 'react';
import { BoardState } from '../types/kanban';
import { isValidBoardState } from '../utils/seedData';

export function useDataPortability() {
  const download = useCallback((blob: Blob, fileName: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, []);

  const exportData = useCallback(
    (board: BoardState, boardId?: string | null) => {
      try {
        const dataStr = JSON.stringify(board, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const fileNameSuffix = boardId ? `-${boardId}` : '';
        download(
          blob,
          `metrik-board${fileNameSuffix}-export-${new Date().toISOString().slice(0, 10)}.json`,
        );
      } catch (err) {
        console.error('[Metrik] Failed to export data:', err);
      }
    },
    [download],
  );

  /** Exporta conteúdo CSV (Feature 041). */
  const exportCsv = useCallback(
    (fileName: string, content: string) => {
      try {
        const blob = new Blob([content], { type: 'text/csv;charset=utf-8' });
        download(blob, fileName);
      } catch (err) {
        console.error('[Metrik] Failed to export CSV:', err);
      }
    },
    [download],
  );

  const importData = useCallback(
    (file: File, onSuccess: (board: BoardState) => void, onError: (err: string) => void) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        try {
          const content = e.target?.result;
          if (typeof content !== 'string') {
            throw new Error('File content is not readable as text.');
          }

          const parsed = JSON.parse(content);

          if (isValidBoardState(parsed)) {
            onSuccess(parsed);
          } else {
            onError(
              'Formato de arquivo inválido. O JSON não corresponde ao esquema esperado (Metrik V2).',
            );
          }
        } catch (err) {
          console.error('JSON Parse Error:', err);
          onError('Erro ao ler o arquivo. Certifique-se de que é um JSON válido.');
        }
      };

      reader.onerror = () => {
        onError('Erro ao processar o arquivo.');
      };

      reader.readAsText(file);
    },
    [],
  );

  return {
    exportData,
    importData,
    exportCsv,
  };
}
