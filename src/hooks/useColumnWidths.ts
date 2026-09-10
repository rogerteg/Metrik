import { useState, useEffect, useCallback } from 'react';

export const DEFAULT_COLUMN_WIDTH = 280;
export const MIN_COLUMN_WIDTH = 200;
export const MAX_COLUMN_WIDTH = 650;

export interface UseColumnWidthsReturn {
  columnWidths: Record<string, number>;
  setColumnWidth: (columnId: string, width: number) => void;
  resetColumnWidth: (columnId: string) => void;
}

const getStorageKey = (boardId: string | null): string => {
  return `metrik-col-widths-${boardId || 'default'}`;
};

export function useColumnWidths(activeBoardId: string | null): UseColumnWidthsReturn {
  const [columnWidths, setColumnWidths] = useState<Record<string, number>>(() => {
    if (typeof window === 'undefined' || !window.localStorage) return {};
    try {
      const raw = localStorage.getItem(getStorageKey(activeBoardId));
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  });

  // Reload when active board changes
  useEffect(() => {
    if (typeof window === 'undefined' || !window.localStorage) return;
    try {
      const raw = localStorage.getItem(getStorageKey(activeBoardId));
      setColumnWidths(raw ? JSON.parse(raw) : {});
    } catch {
      setColumnWidths({});
    }
  }, [activeBoardId]);

  // Persist whenever columnWidths change
  const setColumnWidth = useCallback((columnId: string, width: number) => {
    const clamped = Math.max(MIN_COLUMN_WIDTH, Math.min(MAX_COLUMN_WIDTH, Math.round(width)));
    setColumnWidths((prev) => {
      const next = { ...prev, [columnId]: clamped };
      if (typeof window !== 'undefined' && window.localStorage) {
        try {
          localStorage.setItem(getStorageKey(activeBoardId), JSON.stringify(next));
        } catch {
          // ignore
        }
      }
      return next;
    });
  }, [activeBoardId]);

  const resetColumnWidth = useCallback((columnId: string) => {
    setColumnWidths((prev) => {
      const next = { ...prev };
      delete next[columnId];
      if (typeof window !== 'undefined' && window.localStorage) {
        try {
          localStorage.setItem(getStorageKey(activeBoardId), JSON.stringify(next));
        } catch {
          // ignore
        }
      }
      return next;
    });
  }, [activeBoardId]);

  return {
    columnWidths,
    setColumnWidth,
    resetColumnWidth,
  };
}
