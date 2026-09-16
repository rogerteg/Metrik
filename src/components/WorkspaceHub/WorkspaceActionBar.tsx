import React from 'react';

interface WorkspaceActionBarProps {
  activeWorkspaceName: string;
  boardsCount: number;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  onNewBoard?: () => void;
}

export const WorkspaceActionBar: React.FC<WorkspaceActionBarProps> = ({
  activeWorkspaceName,
  boardsCount,
  searchTerm,
  onSearchChange,
  onNewBoard,
}) => {
  return (
    <div className="workspace-action-bar" role="region" aria-label="Ações e Filtro de Espaços">
      {/* Lado Esquerdo: Título & Contadores (Elemento 4) */}
      <div className="workspace-action-title-group">
        <h2 className="workspace-action-title">
          {activeWorkspaceName === 'Todos os espaços de trabalho' || activeWorkspaceName === 'all'
            ? 'Meus espaços de trabalho'
            : activeWorkspaceName}
        </h2>
        <span className="workspace-action-counter" title="Total de quadros disponíveis">
          {boardsCount} {boardsCount === 1 ? 'quadro' : 'quadros'}
        </span>

        {/* Botões de Ação Circulares (FABs) */}
        <div className="workspace-fab-group">
          {onNewBoard && (
            <button
              type="button"
              className="workspace-fab-btn"
              onClick={onNewBoard}
              aria-label="Criar novo quadro"
              title="Criar novo quadro neste espaço"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Lado Direito: Barra de Filtro em Pílula (Elemento 5) */}
      <div className="workspace-pill-filter-container">
        <div className="workspace-pill-filter">
          <span className="pill-filter-icon" aria-hidden="true">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </span>
          <input
            type="text"
            className="pill-filter-input"
            placeholder="Filtrar quadros por nome..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            aria-label="Filtrar quadros por nome"
          />
          {searchTerm && (
            <button
              type="button"
              className="pill-filter-clear-btn"
              onClick={() => onSearchChange('')}
              aria-label="Limpar filtro"
              title="Limpar pesquisa"
            >
              ×
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
