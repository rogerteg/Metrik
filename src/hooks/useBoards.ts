import { useState, useEffect, useCallback } from 'react';
import { BoardModel } from '../types/kanban';

export const BOARDS_INDEX_KEY = 'metrik-boards-index';
export const ACTIVE_BOARD_KEY = 'metrik-active-board';
export const LEGACY_TASKS_KEY = 'metrik-tasks';

export function useBoards() {
  const [boards, setBoards] = useState<BoardModel[]>([]);
  const [activeBoardId, setActiveBoardId] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize and run migration if needed
  useEffect(() => {
    const rawBoards = localStorage.getItem(BOARDS_INDEX_KEY);
    const rawActive = localStorage.getItem(ACTIVE_BOARD_KEY);
    const legacyTasks = localStorage.getItem(LEGACY_TASKS_KEY);

    let currentBoards: BoardModel[] = [];
    let currentActiveId: string | null = null;

    if (rawBoards) {
      currentBoards = JSON.parse(rawBoards);
      currentActiveId = rawActive || (currentBoards.length > 0 ? currentBoards[0].id : null);
    } else {
      // Need migration or first run
      const defaultBoard: BoardModel = {
        id: crypto.randomUUID(),
        name: 'Quadro Principal',
        createdAt: new Date().toISOString(),
        lastAccessed: new Date().toISOString()
      };
      
      currentBoards = [defaultBoard];
      currentActiveId = defaultBoard.id;

      localStorage.setItem(BOARDS_INDEX_KEY, JSON.stringify(currentBoards));
      localStorage.setItem(ACTIVE_BOARD_KEY, currentActiveId);

      // Migrate legacy tasks if they exist
      if (legacyTasks) {
        localStorage.setItem(`metrik-tasks-${defaultBoard.id}`, legacyTasks);
        localStorage.removeItem(LEGACY_TASKS_KEY);
      }
    }

    setBoards(currentBoards);
    setActiveBoardId(currentActiveId);
    setIsInitialized(true);
  }, []);

  const createBoard = useCallback((name: string) => {
    const newBoard: BoardModel = {
      id: crypto.randomUUID(),
      name,
      createdAt: new Date().toISOString(),
      lastAccessed: new Date().toISOString()
    };
    
    setBoards(prev => {
      const updated = [...prev, newBoard];
      localStorage.setItem(BOARDS_INDEX_KEY, JSON.stringify(updated));
      return updated;
    });
    
    // Automatically switch to the new board
    setActiveBoardId(newBoard.id);
    localStorage.setItem(ACTIVE_BOARD_KEY, newBoard.id);
    
    return newBoard.id;
  }, []);

  const switchBoard = useCallback((id: string) => {
    setBoards(prev => {
      const updated = prev.map(b => 
        b.id === id ? { ...b, lastAccessed: new Date().toISOString() } : b
      );
      localStorage.setItem(BOARDS_INDEX_KEY, JSON.stringify(updated));
      return updated;
    });
    
    setActiveBoardId(id);
    localStorage.setItem(ACTIVE_BOARD_KEY, id);
  }, []);

  const renameBoard = useCallback((id: string, newName: string) => {
    setBoards(prev => {
      const updated = prev.map(b => 
        b.id === id ? { ...b, name: newName } : b
      );
      localStorage.setItem(BOARDS_INDEX_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const deleteBoard = useCallback((id: string) => {
    setBoards(prev => {
      if (prev.length <= 1) return prev; // Don't delete the last board
      
      const updated = prev.filter(b => b.id !== id);
      localStorage.setItem(BOARDS_INDEX_KEY, JSON.stringify(updated));
      
      // Clean up local storage for the deleted board
      localStorage.removeItem(`metrik-tasks-${id}`);
      
      // If we deleted the active board, switch to the first available
      if (activeBoardId === id) {
        const nextId = updated[0].id;
        setActiveBoardId(nextId);
        localStorage.setItem(ACTIVE_BOARD_KEY, nextId);
      }
      
      return updated;
    });
  }, [activeBoardId]);

  return {
    boards,
    activeBoardId,
    activeBoard: boards.find(b => b.id === activeBoardId) || null,
    isInitialized,
    createBoard,
    switchBoard,
    renameBoard,
    deleteBoard
  };
}
