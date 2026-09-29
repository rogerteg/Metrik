import React from 'react';
import { Board } from '../../types/kanban';
import { Workspace } from '../../types/workspace';

interface WorkspaceBoardsGridProps {
  boards: Board[];
  workspaces: Workspace[];
  favoriteBoardIds: string[];
  onToggleFavorite: (boardId: string) => void;
  onSelectBoard: (boardId: string) => void;
  onNewBoard?: () => void;
  /** Move um quadro para outro espaço (ou `null` para "Sem espaço"). */
  onMoveBoardToWorkspace?: (boardId: string, targetWorkspaceId: string | null) => void;
}

export const WorkspaceBoardsGrid: React.FC<WorkspaceBoardsGridProps> = ({
  boards,
  workspaces,
  favoriteBoardIds,
  onToggleFavorite,
  onSelectBoard,
  onNewBoard,
  onMoveBoardToWorkspace,
}) => {
  const [openMenuBoardId, setOpenMenuBoardId] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!openMenuBoardId) return;
    const close = () => setOpenMenuBoardId(null);
    document.addEventListener('click', close);
    return () => document.removeEventListener('click', close);
  }, [openMenuBoardId]);

  if (boards.length === 0) {
    return (
      <div className="workspace-boards-empty">
        <div className="workspace-empty-icon" aria-hidden="true">
          📋
        </div>
        <h3>Nenhum quadro encontrado</h3>
        <p>Não há quadros correspondentes ao filtro ou espaço selecionado.</p>
        {onNewBoard && (
          <button type="button" className="btn btn-primary" onClick={onNewBoard}>
            + Criar Novo Quadro
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="workspace-boards-grid" role="list" aria-label="Grade de Quadros">
      {boards.map((board) => {
        const isFavorite = favoriteBoardIds.includes(board.id);
        const workspace = workspaces.find((ws) => ws.boardIds.includes(board.id));
        const tasksCount = Object.values(board.tasks || {}).flat().length;
        const columnsCount = board.columns?.length || 0;
        const isMenuOpen = openMenuBoardId === board.id;

        return (
          <div
            key={board.id}
            className="workspace-board-card"
            role="listitem"
            onClick={() => onSelectBoard(board.id)}
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onSelectBoard(board.id);
              }
            }}
            aria-label={`Abrir quadro ${board.name}`}
          >
            <div className="board-card-header">
              {workspace ? (
                <span
                  className="board-workspace-tag"
                  style={{ borderColor: workspace.color, color: workspace.color }}
                >
                  <span
                    className="workspace-color-dot"
                    style={{ backgroundColor: workspace.color }}
                    aria-hidden="true"
                  />
                  {workspace.name}
                </span>
              ) : (
                <span className="board-workspace-tag">Sem Espaço</span>
              )}

              <div className="board-card-actions" onClick={(e) => e.stopPropagation()}>
                <button
                  type="button"
                  className={`board-fav-btn ${isFavorite ? 'favorited' : ''}`}
                  onClick={() => onToggleFavorite(board.id)}
                  aria-label={isFavorite ? 'Desfavoritar quadro' : 'Favoritar quadro'}
                  title={isFavorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill={isFavorite ? '#ef4444' : 'none'}
                    stroke={isFavorite ? '#ef4444' : 'currentColor'}
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                  </svg>
                </button>
                {onMoveBoardToWorkspace && (
                  <button
                    type="button"
                    className="board-more-btn"
                    aria-label="Opções do quadro"
                    aria-haspopup="menu"
                    aria-expanded={isMenuOpen}
                    title="Mover para espaço / opções"
                    data-testid={`board-menu-btn-${board.id}`}
                    onClick={() => setOpenMenuBoardId(isMenuOpen ? null : board.id)}
                  >
                    •••
                  </button>
                )}
              </div>
            </div>

            <div className="board-card-body">
              <h3 className="board-card-name">{board.name}</h3>
            </div>

            <div className="board-card-footer">
              <div className="board-metrics-summary">
                <span className="metric-item" title="Colunas do fluxo">
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                    <line x1="9" y1="3" x2="9" y2="21"></line>
                  </svg>
                  {columnsCount} colunas
                </span>
                <span className="metric-item" title="Tarefas no quadro">
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                  </svg>
                  {tasksCount} tarefas
                </span>
              </div>
            </div>

            {isMenuOpen && onMoveBoardToWorkspace && (
              <div
                className="board-card-menu"
                role="menu"
                aria-label={`Opções do quadro ${board.name}`}
                onClick={(e) => e.stopPropagation()}
                data-testid={`board-menu-${board.id}`}
              >
                <span className="board-card-menu__label">Mover para espaço</span>
                {workspaces
                  .filter((ws) => ws.id !== workspace?.id)
                  .map((ws) => (
                    <button
                      key={ws.id}
                      type="button"
                      role="menuitem"
                      className="board-card-menu__item"
                      data-testid={`board-menu-move-${board.id}-${ws.id}`}
                      onClick={() => {
                        onMoveBoardToWorkspace(board.id, ws.id);
                        setOpenMenuBoardId(null);
                      }}
                    >
                      <span
                        className="workspace-color-dot"
                        style={{ backgroundColor: ws.color }}
                        aria-hidden="true"
                      />
                      {ws.name}
                    </button>
                  ))}
                {workspace && (
                  <button
                    type="button"
                    role="menuitem"
                    className="board-card-menu__item"
                    data-testid={`board-menu-remove-${board.id}`}
                    onClick={() => {
                      onMoveBoardToWorkspace(board.id, null);
                      setOpenMenuBoardId(null);
                    }}
                  >
                    Remover do espaço
                  </button>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
