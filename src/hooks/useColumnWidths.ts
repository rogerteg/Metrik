import { useState, useEffect, useCallback, useRef } from 'react';
import { clampColumnWidth, resolvePersistedWidthMap } from '../utils/columnGeometry';

export interface UseColumnWidthsReturn {
  columnWidths: Record<string, number>;
  setColumnWidth: (columnId: string, width: number) => void;
  resetColumnWidth: (columnId: string) => void;
}

const getStorageKey = (boardId: string | null): string => {
  return `metrik-col-widths-${boardId || 'default'}`;
};

/**
 * Lê as preferências persistidas descartando entradas inválidas ou fora da faixa (FR-009).
 * Nunca lança: um armazenamento corrompido resulta em larguras padrão, não em layout quebrado.
 */
const readPersistedWidths = (boardId: string | null): Record<string, number> => {
  if (typeof window === 'undefined' || !window.localStorage) return {};
  try {
    const raw = localStorage.getItem(getStorageKey(boardId));
    return raw ? resolvePersistedWidthMap(JSON.parse(raw)) : {};
  } catch {
    // Falha defensiva de leitura: o quadro segue íntegro com as larguras padrão.
    console.warn('[Metrik Guard] Column width preferences could not be read; falling back to defaults.');
    return {};
  }
};

export function useColumnWidths(activeBoardId: string | null): UseColumnWidthsReturn {
  const [columnWidths, setColumnWidths] = useState<Record<string, number>>(() =>
    readPersistedWidths(activeBoardId)
  );

  // Recarrega apenas quando o quadro ativo muda: o mount já foi resolvido no initializer,
  // e reler aqui duplicaria o diagnóstico de divergência.
  const loadedBoardRef = useRef<string | null>(activeBoardId);

  useEffect(() => {
    if (loadedBoardRef.current === activeBoardId) return;
    loadedBoardRef.current = activeBoardId;
    setColumnWidths(readPersistedWidths(activeBoardId));
  }, [activeBoardId]);

  const persist = useCallback(
    (next: Record<string, number>) => {
      if (typeof window === 'undefined' || !window.localStorage) return;
      try {
        localStorage.setItem(getStorageKey(activeBoardId), JSON.stringify(next));
      } catch {
        // Persistência é melhor esforço: a geometria da sessão já está correta em memória.
      }
    },
    [activeBoardId]
  );

  const setColumnWidth = useCallback(
    (columnId: string, width: number) => {
      setColumnWidths((prev) => {
        const next = { ...prev, [columnId]: clampColumnWidth(width) };
        persist(next);
        return next;
      });
    },
    [persist]
  );

  const resetColumnWidth = useCallback(
    (columnId: string) => {
      setColumnWidths((prev) => {
        const next = { ...prev };
        // Restaurar remove a preferência (volta ao padrão) em vez de gravar um valor fixo.
        delete next[columnId];
        persist(next);
        return next;
      });
    },
    [persist]
  );

  return {
    columnWidths,
    setColumnWidth,
    resetColumnWidth,
  };
}
