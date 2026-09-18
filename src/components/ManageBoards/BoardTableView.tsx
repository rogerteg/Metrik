import React, { useState } from 'react';
import { BoardModel } from '../../types/kanban';
import { Team } from '../../types/team';
import { computeBoardSummaryMetrics } from '../../utils/boardMetrics';

export interface BoardTableViewProps {
  boards: BoardModel[];
  activeBoardId: string | null;
  teams: Team[];
  onSelectBoard: (boardId: string) => void;
  onRenameBoard: (boardId: string, newName: string) => void;
  onRequestDeleteBoard: (boardId: string, boardName: string) => void;
  onOpenAnalytics?: (boardId: string) => void;
  isGuest?: boolean;
}

type SortField = 'name' | 'squad' | 'columns' | 'tasks' | 'wip' | 'done';
type SortDirection = 'asc' | 'desc';

export const BoardTableView: React.FC<BoardTableViewProps> = ({
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
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

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

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  if (boards.length === 0) {
    return (
      <div className="manage-boards-empty">
        <p>Nenhum quadro encontrado correspondente aos filtros.</p>
      </div>
    );
  }

  // Pre-computar métricas para ordenação
  const enrichedBoards = boards.map((board) => {
    const metrics = computeBoardSummaryMetrics(board, activeBoardId);
    const team = teams.find((t) => t.id === board.teamId);
    return { board, metrics, team };
  });

  enrichedBoards.sort((a, b) => {
    let comp = 0;
    if (sortField === 'name') {
      comp = a.board.name.localeCompare(b.board.name);
    } else if (sortField === 'squad') {
      const nameA = a.team?.name || '';
      const nameB = b.team?.name || '';
      comp = nameA.localeCompare(nameB);
    } else if (sortField === 'columns') {
      comp = a.metrics.columnsCount - b.metrics.columnsCount;
    } else if (sortField === 'tasks') {
      comp = a.metrics.totalTasksCount - b.metrics.totalTasksCount;
    } else if (sortField === 'wip') {
      comp = a.metrics.wipTasksCount - b.metrics.wipTasksCount;
    } else if (sortField === 'done') {
      comp = a.metrics.doneTasksCount - b.metrics.doneTasksCount;
    }
    return sortDirection === 'asc' ? comp : -comp;
  });

  return (
    <div className="manage-boards-table-container" role="region" aria-label="Tabela de Quadros">
      <table className="manage-boards-table">
        <thead>
          <tr>
            <th scope="col" className="col-status">Status</th>
            <th
              scope="col"
              className="col-name sortable"
              onClick={() => handleSort('name')}
              aria-sort={sortField === 'name' ? (sortDirection === 'asc' ? 'ascending' : 'descending') : 'none'}
            >
              Nome do Quadro {sortField === 'name' ? (sortDirection === 'asc' ? '▲' : '▼') : ''}
            </th>
            <th
              scope="col"
              className="col-squad sortable"
              onClick={() => handleSort('squad')}
              aria-sort={sortField === 'squad' ? (sortDirection === 'asc' ? 'ascending' : 'descending') : 'none'}
            >
              Squad / Time {sortField === 'squad' ? (sortDirection === 'asc' ? '▲' : '▼') : ''}
            </th>
            <th
              scope="col"
              className="col-num sortable"
              onClick={() => handleSort('columns')}
              aria-sort={sortField === 'columns' ? (sortDirection === 'asc' ? 'ascending' : 'descending') : 'none'}
            >
              Colunas {sortField === 'columns' ? (sortDirection === 'asc' ? '▲' : '▼') : ''}
            </th>
            <th
              scope="col"
              className="col-num sortable"
              onClick={() => handleSort('tasks')}
              aria-sort={sortField === 'tasks' ? (sortDirection === 'asc' ? 'ascending' : 'descending') : 'none'}
            >
              Tarefas {sortField === 'tasks' ? (sortDirection === 'asc' ? '▲' : '▼') : ''}
            </th>
            <th
              scope="col"
              className="col-num sortable"
              onClick={() => handleSort('wip')}
              aria-sort={sortField === 'wip' ? (sortDirection === 'asc' ? 'ascending' : 'descending') : 'none'}
            >
              WIP {sortField === 'wip' ? (sortDirection === 'asc' ? '▲' : '▼') : ''}
            </th>
            <th
              scope="col"
              className="col-num sortable"
              onClick={() => handleSort('done')}
              aria-sort={sortField === 'done' ? (sortDirection === 'asc' ? 'ascending' : 'descending') : 'none'}
            >
              Concluídas {sortField === 'done' ? (sortDirection === 'asc' ? '▲' : '▼') : ''}
            </th>
            <th scope="col" className="col-actions">Ações</th>
          </tr>
        </thead>
        <tbody>
          {enrichedBoards.map(({ board, metrics, team }) => {
            const isEditing = editingId === board.id;
            return (
              <tr
                key={board.id}
                className={`manage-table-row ${metrics.isActive ? 'manage-table-row-active' : ''}`}
              >
                <td className="col-status">
                  {metrics.isActive ? (
                    <span className="table-active-dot" title="Quadro Ativo" aria-label="Quadro Ativo">
                      ●
                    </span>
                  ) : (
                    <span className="table-inactive-dot" title="Inativo" aria-label="Inativo">
                      ○
                    </span>
                  )}
                </td>
                <td className="col-name">
                  {isEditing ? (
                    <input
                      type="text"
                      className="table-inline-rename-input"
                      value={editName}
                      autoFocus
                      onChange={(e) => setEditName(e.target.value)}
                      onBlur={() => handleSaveRename(board.id)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSaveRename(board.id);
                        if (e.key === 'Escape') setEditingId(null);
                      }}
                      aria-label={`Renomear quadro ${board.name}`}
                    />
                  ) : (
                    <button
                      type="button"
                      className="table-board-link"
                      onClick={() => onSelectBoard(board.id)}
                      title={`Abrir quadro ${board.name}`}
                    >
                      {board.name}
                    </button>
                  )}
                </td>
                <td className="col-squad">
                  {team ? (
                    <span className="table-squad-tag" style={{ color: team.color }}>
                      {team.name}
                    </span>
                  ) : (
                    <span className="table-squad-none">—</span>
                  )}
                </td>
                <td className="col-num">{metrics.columnsCount}</td>
                <td className="col-num">{metrics.totalTasksCount}</td>
                <td className="col-num">{metrics.wipTasksCount}</td>
                <td className="col-num">{metrics.doneTasksCount}</td>
                <td className="col-actions">
                  <div className="table-actions-group">
                    <button
                      type="button"
                      className="table-action-btn"
                      onClick={() => onSelectBoard(board.id)}
                      title="Abrir no Kanban"
                    >
                      Abrir
                    </button>
                    {onOpenAnalytics && (
                      <button
                        type="button"
                        className="table-action-btn"
                        onClick={() => onOpenAnalytics(board.id)}
                        title="Ver Analytics"
                      >
                        Analytics
                      </button>
                    )}
                    {!isGuest && (
                      <>
                        <button
                          type="button"
                          className="table-action-btn"
                          onClick={(e) => handleStartRename(board, e)}
                          title="Renomear"
                        >
                          Renomear
                        </button>
                        <button
                          type="button"
                          className="table-action-btn table-action-btn-delete"
                          onClick={() => onRequestDeleteBoard(board.id, board.name)}
                          title="Excluir"
                        >
                          Excluir
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
