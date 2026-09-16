import React from 'react';
import { Board } from '../../types/kanban';
import { Workspace } from '../../types/workspace';

interface FavoriteBoardsSectionProps {
  boards: Board[];
  favoriteBoardIds: string[];
  workspaces: Workspace[];
  onToggleFavorite: (boardId: string) => void;
  onSelectBoard: (boardId: string) => void;
}

export const FavoriteBoardsSection: React.FC<FavoriteBoardsSectionProps> = ({
  boards,
  favoriteBoardIds,
  workspaces,
  onToggleFavorite,
  onSelectBoard,
}) => {
  const favoriteBoards = boards.filter((b) => favoriteBoardIds.includes(b.id));

  return (
    <section className="favorite-boards-section" aria-label="Quadros Favoritos">
      <div className="favorite-boards-header">
        <div className="favorite-title-group">
          <span className="favorite-section-icon" aria-hidden="true">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="#ef4444" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
            </svg>
          </span>
          <h2 className="favorite-section-title">Quadros favoritos</h2>
          <span className="favorite-count-badge">{favoriteBoards.length}</span>
        </div>
      </div>

      {favoriteBoards.length === 0 ? (
        <div className="favorite-empty-state">
          <p className="favorite-empty-text">
            Nenhum quadro favorito ainda. Clique no ícone de coração em qualquer quadro para fixá-lo aqui como atalho rápido!
          </p>
        </div>
      ) : (
        <div className="favorite-cards-track" role="list">
          {favoriteBoards.map((board) => {
            const workspace = workspaces.find((ws) => ws.boardIds.includes(board.id));
            const tasksCount = Object.values(board.tasks || {}).flat().length;

            return (
              <div
                key={board.id}
                className="favorite-card elevated-card"
                role="listitem"
                onClick={() => onSelectBoard(board.id)}
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onSelectBoard(board.id);
                  }
                }}
                aria-label={`Abrir quadro favorito ${board.name}`}
              >
                <div className="favorite-card-top">
                  {workspace && (
                    <span
                      className="favorite-card-badge"
                      style={{
                        borderColor: workspace.color,
                        color: workspace.color,
                      }}
                    >
                      <span
                        className="workspace-color-dot"
                        style={{ backgroundColor: workspace.color }}
                        aria-hidden="true"
                      />
                      {workspace.name}
                    </span>
                  )}
                  <div className="favorite-card-actions" onClick={(e) => e.stopPropagation()}>
                    <button
                      type="button"
                      className="favorite-heart-btn active"
                      onClick={() => onToggleFavorite(board.id)}
                      aria-label="Desfavoritar quadro"
                      title="Remover dos favoritos"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="#ef4444" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                      </svg>
                    </button>
                    <button
                      type="button"
                      className="favorite-more-btn"
                      aria-label="Mais opções do quadro"
                      title="Mais opções"
                    >
                      •••
                    </button>
                  </div>
                </div>

                <div className="favorite-card-body">
                  <h3 className="favorite-card-title">{board.name}</h3>
                </div>

                <div className="favorite-card-footer">
                  <div className="favorite-card-deadline" title="Fluxo e tarefas ativas">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10"></circle>
                      <polyline points="12 6 12 12 16 14"></polyline>
                    </svg>
                    <span>{tasksCount} {tasksCount === 1 ? 'tarefa' : 'tarefas'}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
};
