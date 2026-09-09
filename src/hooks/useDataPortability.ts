import { useCallback } from 'react';
import { BoardState } from '../types/kanban';
import { isValidBoardState } from '../utils/seedData';

export function useDataPortability() {
  const exportData = useCallback((board: BoardState, boardId?: string | null) => {
    try {
      const dataStr = JSON.stringify(board, null, 2);
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      const fileNameSuffix = boardId ? `-${boardId}` : '';
      a.download = `metrik-board${fileNameSuffix}-export-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      
      // Cleanup
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to export data:', err);
    }
  }, []);

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
            onError('Formato de arquivo inválido. O JSON não corresponde ao esquema esperado (Metrik V2).');
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
    []
  );

  return {
    exportData,
    importData,
  };
}
