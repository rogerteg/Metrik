import React from 'react';
import { Workspace } from '../../types/workspace';
import { Board } from '../../types/kanban';
import { WorkspaceSidebar } from './WorkspaceSidebar';
import { FavoriteBoardsSection } from './FavoriteBoardsSection';
import { WorkspaceActionBar } from './WorkspaceActionBar';
import { WorkspaceBoardsGrid } from './WorkspaceBoardsGrid';

export interface WorkspaceHubProps {
  workspaces: Workspace[];
  activeWorkspaceId: string | 'all';
  onSelectWorkspace: (id: string | 'all') => void;
  boards: Board[];
  favoriteBoardIds: string[];
  onToggleFavorite: (boardId: string) => void;
  onSelectBoard: (boardId: string) => void;
  onNewPanel?: () => void;
  onNewBoard?: () => void;
}

export const WorkspaceHub: React.FC<WorkspaceHubProps> = ({
  workspaces,
  activeWorkspaceId,
  onSelectWorkspace,
  boards,
  favoriteBoardIds,
  onToggleFavorite,
  onSelectBoard,
  onNewPanel,
  onNewBoard,
}) => {
  const [searchTerm, setSearchTerm] = React.useState('');

  const activeWorkspace = workspaces.find((ws) => ws.id === activeWorkspaceId);
  const activeWorkspaceName =
    activeWorkspaceId === 'all'
      ? 'Todos os espaços de trabalho'
      : activeWorkspace?.name || 'Espaço Ativo';

  // 1. Filtrar quadros pelo espaço ativo
  const workspaceFilteredBoards = React.useMemo(() => {
    if (activeWorkspaceId === 'all') {
      return boards;
    }
    if (!activeWorkspace) {
      return boards;
    }
    return boards.filter((b) => activeWorkspace.boardIds.includes(b.id));
  }, [boards, activeWorkspaceId, activeWorkspace]);

  // 2. Filtrar quadros pelo termo de busca (Pill Filter)
  const query = searchTerm.trim().toLowerCase();

  const filteredBoards = React.useMemo(() => {
    if (!query) return workspaceFilteredBoards;
    return workspaceFilteredBoards.filter((b) =>
      b.name.toLowerCase().includes(query)
    );
  }, [workspaceFilteredBoards, query]);

  // Filtrar favoritos pelo termo de busca também para consistência na interface
  const searchFilteredFavoriteBoardIds = React.useMemo(() => {
    if (!query) return favoriteBoardIds;
    return favoriteBoardIds.filter((favId) => {
      const b = boards.find((item) => item.id === favId);
      return b && b.name.toLowerCase().includes(query);
    });
  }, [favoriteBoardIds, boards, query]);

  return (
    <div className="workspace-hub-container" role="main" aria-label="Hub de Espaços e Quadros">
      {/* Barra Lateral de Espaços (Elemento 1 & 2) */}
      <WorkspaceSidebar
        workspaces={workspaces}
        activeWorkspaceId={activeWorkspaceId}
        onSelectWorkspace={onSelectWorkspace}
        onNewPanel={onNewPanel}
        boards={boards}
      />

      {/* Conteúdo Principal do Hub */}
      <div className="workspace-hub-main">
        {/* Vitrine de Quadros Favoritos (Elemento 3) */}
        <FavoriteBoardsSection
          boards={boards}
          favoriteBoardIds={searchFilteredFavoriteBoardIds}
          workspaces={workspaces}
          onToggleFavorite={onToggleFavorite}
          onSelectBoard={onSelectBoard}
        />

        {/* Barra de Ações & Filtro em Pílula (Elemento 4 & 5) */}
        <WorkspaceActionBar
          activeWorkspaceName={activeWorkspaceName}
          boardsCount={filteredBoards.length}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          onNewBoard={onNewBoard}
        />

        {/* Grade de Quadros por Espaço */}
        <WorkspaceBoardsGrid
          boards={filteredBoards}
          workspaces={workspaces}
          favoriteBoardIds={favoriteBoardIds}
          onToggleFavorite={onToggleFavorite}
          onSelectBoard={onSelectBoard}
          onNewBoard={onNewBoard}
        />
      </div>
    </div>
  );
};
