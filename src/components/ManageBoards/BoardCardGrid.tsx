import React, { useState } from 'react';
import { BoardModel } from '../../types/kanban';
import { Team } from '../../types/team';
import { computeBoardSummaryMetrics } from '../../utils/boardMetrics';

export interface BoardCardGridProps {
  boards: BoardModel[];
  activeBoardId: string | null;
  teams: Team[];
  onSelectBoard: (boardId: string) => void;
  onRenameBoard: (boardId: string, newName: string) => void;
  onRequestDeleteBoard: (boardId: string, boardName: string) => void;
  onOpenAnalytics?: (boardId: string) => void;
  isGuest?: boolean;
}

export const BoardCardGrid: React.FC<BoardCardGridProps> = ({
  boards,
  activeBoardId,
  teams,
  onSelectBoard,
  onRenameBoard,
  onRequestDeleteBoard,
  onOpenAnalytics,
  isGuest = false,
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  const handleStartRename = (board: BoardModel, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(board.id);
    setEditName(board.name);
  };

  const handleSaveRename = (boardId: string) => {
    const trimmed = editName.trim();
    if (trimmed) {
      onRenameBoard(boardId, trimmed);
    }
    setEditingId(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent, boardId: string) => {
    if (e.key === 'Enter') {
      handleSaveRename(boardId);
    } else if (e.key === 'Escape') {
      setEditingId(null);
    }
  };

  if (boards.length === 0) {
    return (
      <div className="manage-boards-empty">
        <p>Nenhum quadro encontrado correspondente aos filtros.</p>
      </div>
    );
  }

  return (
    <div className="board-card-grid" role="region" aria-label="Grade de Quadros">
      {boards.map((board) => {
        const metrics = computeBoardSummaryMetrics(board, activeBoardId);
        const team = teams.find((t) => t.id === board.teamId);
        const isEditing = editingId === board.id;

        return (
          <div
            key={board.id}
            className={`board-card ${metrics.isActive ? 'board-card-active' : ''}`}
            onClick={() => onSelectBoard(board.id)}
            role="article"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !isEditing) {
                onSelectBoard(board.id);
              }
            }}
          >
            {/* Header do Cartão */}
            <div className="board-card-header">
              <div className="board-card-title-row">
                {isEditing ? (
                  <input
                    type="text"
                    className="board-card-rename-input"
                    value={editName}
                    autoFocus
                    onClick={(e) => e.stopPropagation()}
                    onChange={(e) => setEditName(e.target.value)}
                    onBlur={() => handleSaveRename(board.id)}
                    onKeyDown={(e) => handleKeyDown(e, board.id)}
                    aria-label={`Renomear quadro ${board.name}`}
                  />
                ) : (
                  <h3 className="board-card-title" title={board.name}>
                    {board.name}
                  </h3>
                )}

                {metrics.isActive && (
                  <span className="board-card-active-badge" aria-label="Quadro Ativo">
                    Quadro Ativo
                  </span>
                )}
              </div>

              {team && (
                <div className="board-card-squad-badge" style={{ borderColor: team.color }}>
                  <span className="squad-dot" style={{ backgroundColor: team.color }} />
                  <span className="squad-name">{team.name}</span>
                </div>
              )}
            </div>

            {/* Telemetria de Fluxo */}
            <div className="board-card-telemetry">
              <div className="telemetry-chip" title="Colunas configuradas">
                <span className="chip-label">Colunas</span>
                <span className="chip-value">{metrics.columnsCount}</span>
              </div>
              <div className="telemetry-chip" title="Total de tarefas">
                <span className="chip-label">Total</span>
                <span className="chip-value">{metrics.totalTasksCount}</span>
              </div>
              <div className="telemetry-chip telemetry-wip" title="Tarefas em andamento (WIP)">
                <span className="chip-label">Em Andamento</span>
                <span className="chip-value">{metrics.wipTasksCount}</span>
              </div>
              <div className="telemetry-chip telemetry-done" title="Tarefas concluídas">
                <span className="chip-label">Concluídas</span>
                <span className="chip-value">{metrics.doneTasksCount}</span>
              </div>
            </div>

            {/* Barra de Ações Rápidas */}
            <div className="board-card-actions" onClick={(e) => e.stopPropagation()}>
              <button
                type="button"
                className="board-action-btn board-action-open"
                onClick={() => onSelectBoard(board.id)}
                title={`Abrir quadro ${board.name} no Kanban`}
              >
                Abrir
              </button>

              {onOpenAnalytics && (
                <button
                  type="button"
                  className="board-action-btn board-action-analytics"
                  onClick={() => onOpenAnalytics(board.id)}
                  title={`Ver métricas e analytics do quadro ${board.name}`}
                >
                  Analytics
                </button>
              )}

              {!isGuest && (
                <>
                  <button
                    type="button"
                    className="board-action-btn board-action-rename"
                    onClick={(e) => handleStartRename(board, e)}
                    title="Renomear quadro"
                  >
                    Renomear
                  </button>
                  <button
                    type="button"
                    className="board-action-btn board-action-delete"
                    onClick={() => onRequestDeleteBoard(board.id, board.name)}
                    title="Excluir quadro"
                  >
                    Excluir
                  </button>
                </>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
