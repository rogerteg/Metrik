import React from 'react';
import { Workspace } from '../../types/workspace';
import { Board } from '../../types/kanban';

interface WorkspaceSidebarProps {
  workspaces: Workspace[];
  activeWorkspaceId: string | 'all';
  onSelectWorkspace: (id: string | 'all') => void;
  onNewPanel?: () => void;
  boards: Board[];
}

export const WorkspaceSidebar: React.FC<WorkspaceSidebarProps> = ({
  workspaces,
  activeWorkspaceId,
  onSelectWorkspace,
  onNewPanel,
  boards,
}) => {
  const totalBoardsCount = boards.length;

  return (
    <aside className="workspace-sidebar" aria-label="Navegação de Espaços de Trabalho">
      {/* Botão Superior: Todos os espaços de trabalho (Elemento 1) */}
      <button
        type="button"
        className={`workspace-all-btn ${activeWorkspaceId === 'all' ? 'active' : ''}`}
        onClick={() => onSelectWorkspace('all')}
        aria-selected={activeWorkspaceId === 'all'}
      >
        <span className="workspace-home-icon" aria-hidden="true">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
            <polyline points="9 22 9 12 15 12 15 22"></polyline>
          </svg>
        </span>
        <span className="workspace-all-label">Todos os espaços de trabalho</span>
        <span className="workspace-counter-badge">{totalBoardsCount}</span>
      </button>

      {/* Lista de Espaços de Trabalho */}
      <div className="workspace-list-container">
        <div className="workspace-list-header">
          <span>Espaços</span>
        </div>
        <ul className="workspace-list" role="list">
          {workspaces.map((ws) => {
            const isActive = activeWorkspaceId === ws.id;
            // Contar quantos quadros pertencem a este espaço
            const wsBoardCount = ws.boardIds.length;

            return (
              <li key={ws.id} className="workspace-item">
                <button
                  type="button"
                  className={`workspace-item-btn ${isActive ? 'active' : ''}`}
                  onClick={() => onSelectWorkspace(ws.id)}
                  aria-selected={isActive}
                  title={ws.description || ws.name}
                >
                  <span
                    className="workspace-color-bullet"
                    style={{ backgroundColor: ws.color }}
                    aria-hidden="true"
                  />
                  <span className="workspace-name">{ws.name}</span>
                  {wsBoardCount > 0 && (
                    <span className="workspace-item-count">{wsBoardCount}</span>
                  )}
                  <span className="workspace-item-menu" title="Opções do espaço" aria-hidden="true">
                    •••
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Botão Inferior: + Novo painel (Elemento 2) */}
      <div className="workspace-sidebar-footer">
        <button
          type="button"
          className="workspace-new-panel-btn"
          onClick={onNewPanel}
          title="Criar novo espaço ou quadro"
        >
          + Novo painel
        </button>
      </div>
    </aside>
  );
};
