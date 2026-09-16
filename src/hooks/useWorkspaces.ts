import { useState, useEffect, useCallback } from 'react';
import { Workspace } from '../types/workspace';

export const WORKSPACES_STORAGE_KEY = 'metrik_workspaces';
export const FAVORITES_STORAGE_KEY = 'metrik_favorite_boards';
export const ACTIVE_WORKSPACE_KEY = 'metrik_active_workspace';
export const DEFAULT_WORKSPACE_ID = 'workspace-default';

const PROTOTYPE_WORKSPACES: Omit<Workspace, 'boardIds' | 'createdAt' | 'updatedAt'>[] = [
  {
    id: DEFAULT_WORKSPACE_ID,
    name: 'Geral',
    description: 'Espaço de trabalho padrão',
    color: '#38bdf8', // Ciano Metrik
  },
  {
    id: 'ws-gestao',
    name: 'Gestão',
    description: 'Alinhamento estratégico e gestão operacional',
    color: '#eab308', // Amarelo
  },
  {
    id: 'ws-producao',
    name: 'Produção',
    description: 'Fluxo contínuo de entrega e produção',
    color: '#f97316', // Laranja
  },
  {
    id: 'ws-estrategico',
    name: 'Projetos estratégicos',
    description: 'Iniciativas de alto impacto corporativo',
    color: '#8b5cf6', // Roxo
  },
  {
    id: 'ws-ped',
    name: 'P&D',
    description: 'Pesquisa, Engenharia e Desenvolvimento',
    color: '#3b82f6', // Azul
  },
  {
    id: 'ws-contabilidade',
    name: 'Contabilidade',
    description: 'Controles contábeis e financeiros',
    color: '#22c55e', // Verde
  },
  {
    id: 'ws-vendas',
    name: 'Vendas',
    description: 'Gestão comercial e funil de vendas',
    color: '#ec4899', // Magenta
  },
];

function initializeWorkspaces(): Workspace[] {
  const now = new Date().toISOString();
  let existingBoardIds: string[] = [];

  try {
    const rawBoards = localStorage.getItem('metrik_boards');
    if (rawBoards) {
      const parsed = JSON.parse(rawBoards);
      if (Array.isArray(parsed)) {
        existingBoardIds = parsed.map((b: any) => b.id).filter(Boolean);
      }
    }
  } catch (err) {
    console.warn('[Metrik] Failed to inspect existing boards during workspace init:', err);
  }

  // Se houver apenas 1 ou nenhum quadro, assegurar default se necessário
  if (existingBoardIds.length === 0) {
    existingBoardIds = ['default'];
  }

  return PROTOTYPE_WORKSPACES.map((p, idx) => ({
    ...p,
    boardIds: idx === 0 ? [...existingBoardIds] : [],
    createdAt: now,
    updatedAt: now,
  }));
}

export function useWorkspaces() {
  const [workspaces, setWorkspaces] = useState<Workspace[]>(() => {
    try {
      const stored = localStorage.getItem(WORKSPACES_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (err) {
      console.warn('[Metrik] Error loading workspaces from localStorage:', err);
    }
    const initial = initializeWorkspaces();
    try {
      localStorage.setItem(WORKSPACES_STORAGE_KEY, JSON.stringify(initial));
    } catch {
      // Storage unavailable
    }
    return initial;
  });

  const [activeWorkspaceId, setActiveWorkspaceId] = useState<string | 'all'>(() => {
    try {
      const stored = localStorage.getItem(ACTIVE_WORKSPACE_KEY);
      if (stored) return stored;
    } catch {
      // ignore
    }
    return DEFAULT_WORKSPACE_ID;
  });

  const [favoriteBoardIds, setFavoriteBoardIds] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem(FAVORITES_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (err) {
      console.warn('[Metrik] Error loading favorite boards from localStorage:', err);
    }
    return [];
  });

  const [isInitialized] = useState(true);

  // Sync workspaces to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(WORKSPACES_STORAGE_KEY, JSON.stringify(workspaces));
    } catch (err) {
      console.error('[Metrik] Failed to save workspaces:', err);
    }
  }, [workspaces]);

  // Sync active workspace to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(ACTIVE_WORKSPACE_KEY, activeWorkspaceId);
    } catch (err) {
      console.error('[Metrik] Failed to save active workspace:', err);
    }
  }, [activeWorkspaceId]);

  // Sync favorite boards to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favoriteBoardIds));
    } catch (err) {
      console.error('[Metrik] Failed to save favorite boards:', err);
    }
  }, [favoriteBoardIds]);

  const selectWorkspace = useCallback((workspaceId: string | 'all') => {
    setActiveWorkspaceId(workspaceId);
  }, []);

  const toggleFavoriteBoard = useCallback((boardId: string) => {
    setFavoriteBoardIds((prev) => {
      if (prev.includes(boardId)) {
        return prev.filter((id) => id !== boardId);
      }
      return [...prev, boardId];
    });
  }, []);

  const isBoardFavorite = useCallback(
    (boardId: string) => {
      return favoriteBoardIds.includes(boardId);
    },
    [favoriteBoardIds]
  );

  const createWorkspace = useCallback(
    (name: string, color: string, description?: string, teamId?: string): Workspace => {
      const now = new Date().toISOString();
      const newWs: Workspace = {
        id: `ws-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        name: name.trim(),
        color: color.trim() || '#38bdf8',
        description: description?.trim(),
        boardIds: [],
        teamId,
        createdAt: now,
        updatedAt: now,
      };

      setWorkspaces((prev) => [...prev, newWs]);
      return newWs;
    },
    []
  );

  const updateWorkspace = useCallback(
    (workspaceId: string, updates: Partial<Pick<Workspace, 'name' | 'color' | 'description' | 'boardIds' | 'teamId'>>) => {
      setWorkspaces((prev) =>
        prev.map((w) => {
          if (w.id !== workspaceId) return w;
          return {
            ...w,
            ...updates,
            updatedAt: new Date().toISOString(),
          };
        })
      );
    },
    []
  );

  const deleteWorkspace = useCallback((workspaceId: string) => {
    if (workspaceId === DEFAULT_WORKSPACE_ID) {
      throw new Error('O espaço de trabalho padrão não pode ser excluído.');
    }

    setWorkspaces((prev) => {
      const targetWs = prev.find((w) => w.id === workspaceId);
      const remaining = prev.filter((w) => w.id !== workspaceId);

      // Reatribuir os quadros ao espaço padrão se existirem
      if (targetWs && targetWs.boardIds.length > 0) {
        return remaining.map((w) => {
          if (w.id === DEFAULT_WORKSPACE_ID) {
            const combined = Array.from(new Set([...w.boardIds, ...targetWs.boardIds]));
            return {
              ...w,
              boardIds: combined,
              updatedAt: new Date().toISOString(),
            };
          }
          return w;
        });
      }

      return remaining;
    });

    setActiveWorkspaceId((prev) => (prev === workspaceId ? DEFAULT_WORKSPACE_ID : prev));
  }, []);

  const addBoardToWorkspace = useCallback((workspaceId: string, boardId: string) => {
    setWorkspaces((prev) =>
      prev.map((w) => {
        if (w.id !== workspaceId) return w;
        if (w.boardIds.includes(boardId)) return w;
        return {
          ...w,
          boardIds: [...w.boardIds, boardId],
          updatedAt: new Date().toISOString(),
        };
      })
    );
  }, []);

  const removeBoardFromWorkspace = useCallback((workspaceId: string, boardId: string) => {
    setWorkspaces((prev) =>
      prev.map((w) => {
        if (w.id !== workspaceId) return w;
        return {
          ...w,
          boardIds: w.boardIds.filter((id) => id !== boardId),
          updatedAt: new Date().toISOString(),
        };
      })
    );
  }, []);

  const activeWorkspace = workspaces.find((w) => w.id === activeWorkspaceId) || null;

  return {
    workspaces,
    activeWorkspaceId,
    activeWorkspace,
    favoriteBoardIds,
    isInitialized,
    selectWorkspace,
    setActiveWorkspaceId: selectWorkspace,
    toggleFavoriteBoard,
    isBoardFavorite,
    createWorkspace,
    updateWorkspace,
    deleteWorkspace,
    addBoardToWorkspace,
    removeBoardFromWorkspace,
  };
}
