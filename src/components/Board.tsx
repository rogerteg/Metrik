import React from 'react';
import { BoardState, ColumnModel, TaskModel, MAX_COLUMNS } from '../types/kanban';
import { ReorderOptions } from '../types/dnd';
import { resolveColumnWidth } from '../utils/columnGeometry';
import { Column } from './Column';

export interface BoardProps {
  board: BoardState;
  rawBoard?: BoardState;
  hasActiveFilters?: boolean;
  columnWidths?: Record<string, number>;
  onResizeColumnWidth?: (columnId: string, width: number) => void;
  onResetColumnWidth?: (columnId: string) => void;
  onAddTask: (columnId: string) => void;
  onUpdateColumn?: (id: string, updates: Partial<ColumnModel>) => void;
  onDeleteColumn?: (id: string) => void;
  onDropTask?: (options: ReorderOptions) => void;
  onMoveColumn?: (sourceIndex: number, destinationIndex: number) => void;
  onOpenNewColumnModal?: () => void;
  renderTask?: (task: TaskModel, columnId: string) => React.ReactNode;
  isReadOnly?: boolean;
}

export const Board: React.FC<BoardProps> = ({
  board,
  rawBoard,
  hasActiveFilters = false,
  columnWidths,
  onResizeColumnWidth,
  onResetColumnWidth,
  onAddTask,
  onUpdateColumn,
  onDeleteColumn,
  onDropTask,
  onMoveColumn,
  onOpenNewColumnModal,
  renderTask,
  isReadOnly = false,
}) => {
  const columns = board.columns || [];
  const isAtColumnLimit = columns.length >= MAX_COLUMNS;

  return (
    <div className="board-container">
      {isReadOnly && (
        <div className="guest-read-only-banner" role="status">
          <span className="warning-banner-icon" aria-hidden="true">👁️</span>
          <div className="warning-banner-content">
            <strong>Modo Somente Leitura (Convidado)</strong>
            <span>Você tem permissão de visualização para acompanhar o fluxo desta squad. Ações de edição estão desabilitadas.</span>
          </div>
        </div>
      )}

      {isAtColumnLimit && !isReadOnly && (
        <div className="column-limit-warning-banner" role="alert">
          <span className="warning-banner-icon" aria-hidden="true">⚠️</span>
          <div className="warning-banner-content">
            <strong>Excesso de colunas, cuidado.</strong>
            <span>O quadro atingiu o limite máximo de {MAX_COLUMNS} colunas. Mantenha o fluxo simples e focado.</span>
          </div>
        </div>
      )}

      <main className="kanban-board-grid" aria-label="Quadro Kanban Metrik">
        {columns.map((col, idx) => {
          const visibleTasks = board.tasks[col.id] || [];
          const rawTasks = rawBoard ? rawBoard.tasks[col.id] || [] : visibleTasks;
          const isFilteredEmpty = hasActiveFilters && rawTasks.length > 0 && visibleTasks.length === 0;

          return (
            <Column
              key={col.id}
              column={col}
              count={rawTasks.length}
              columnIndex={idx}
              totalColumns={columns.length}
              width={resolveColumnWidth(columnWidths?.[col.id])}
              onResizeWidth={isReadOnly ? undefined : onResizeColumnWidth}
              onResetWidth={isReadOnly ? undefined : onResetColumnWidth}
              onAddTask={isReadOnly ? undefined : () => onAddTask(col.id)}
              onUpdateColumn={isReadOnly ? undefined : onUpdateColumn}
              onDeleteColumn={isReadOnly ? undefined : onDeleteColumn}
              onDropTask={isReadOnly ? undefined : onDropTask}
              onMoveColumn={isReadOnly ? undefined : onMoveColumn}
            >
              {isFilteredEmpty ? (
                <div
                  className="empty-column-filter"
                  aria-label="Nenhuma tarefa corresponde aos filtros aplicados"
                >
                  Nenhuma tarefa corresponde aos filtros aplicados
                </div>
              ) : renderTask ? (
                visibleTasks.map((task) => renderTask(task, col.id))
              ) : null}
            </Column>
          );
        })}

        {!isReadOnly && onOpenNewColumnModal && (
          <div className="add-column-card">
            <button
              type="button"
              className="btn-add-column"
              onClick={onOpenNewColumnModal}
              disabled={isAtColumnLimit}
              title={isAtColumnLimit ? `Limite máximo de ${MAX_COLUMNS} colunas atingido` : 'Adicionar nova coluna'}
              aria-label="Adicionar nova coluna"
            >
              <span className="add-column-icon" aria-hidden="true">+</span>
              <span className="add-column-text">Nova Coluna</span>
              {isAtColumnLimit && (
                <span className="add-column-badge">{columns.length}/{MAX_COLUMNS}</span>
              )}
            </button>
          </div>
        )}
      </main>
    </div>
  );
};
