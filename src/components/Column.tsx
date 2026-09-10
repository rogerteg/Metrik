import React, { useState, useRef } from 'react';
import { ColumnModel } from '../types/kanban';
import { WipLimitBadge } from './WipLimitBadge';
import { ReorderOptions } from '../types/dnd';

export interface ColumnProps {
  column: ColumnModel;
  count: number;
  columnIndex?: number;
  totalColumns?: number;
  width?: number;
  onResizeWidth?: (columnId: string, width: number) => void;
  onResetWidth?: (columnId: string) => void;
  onAddTask?: () => void;
  onUpdateColumn?: (id: string, updates: Partial<ColumnModel>) => void;
  onDeleteColumn?: (id: string) => void;
  onDropTask?: (options: ReorderOptions) => void;
  onMoveColumn?: (sourceIndex: number, destinationIndex: number) => void;
  children?: React.ReactNode;
}

const getBadgeClass = (colorScheme: string): string => {
  switch (colorScheme) {
    case 'todo': return 'badge-todo';
    case 'progress': return 'badge-progress';
    case 'blocked': return 'badge-blocked';
    case 'completed': return 'badge-completed';
    default: return 'badge-todo';
  }
};

const getColumnModifierClass = (colorScheme: string): string => {
  switch (colorScheme) {
    case 'todo': return 'kanban-column-todo';
    case 'progress': return 'kanban-column-progress';
    case 'blocked': return 'kanban-column-blocked';
    case 'completed': return 'kanban-column-completed';
    default: return '';
  }
};

export const Column: React.FC<ColumnProps> = ({
  column,
  count,
  columnIndex,
  totalColumns = 0,
  width,
  onResizeWidth,
  onResetWidth,
  onAddTask,
  onUpdateColumn,
  onDeleteColumn,
  onDropTask,
  onMoveColumn,
  children,
}) => {
  const badgeClass = getBadgeClass(column.colorScheme);
  const modifierClass = getColumnModifierClass(column.colorScheme);
  const isOverloaded = column.wipLimit !== null && count > column.wipLimit;

  // Regra fundamental: Apenas a primeira coluna (índice 0, ex: To Do) é fixa
  const isFixed = columnIndex === 0;

  const canMoveLeft = !isFixed && typeof columnIndex === 'number' && columnIndex > 1;
  const canMoveRight = !isFixed && typeof columnIndex === 'number' && totalColumns > 0 && columnIndex < totalColumns - 1;

  const [isDropTarget, setIsDropTarget] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [isColumnDragging, setIsColumnDragging] = useState(false);
  const [columnDropIndicator, setColumnDropIndicator] = useState<'before' | 'after' | null>(null);

  const dragDepthRef = useRef(0);
  const startXRef = useRef(0);
  const startWidthRef = useRef(0);

  const handleResizeMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);
    startXRef.current = e.clientX;
    startWidthRef.current = width || 280;

    const onMouseMove = (moveEvent: MouseEvent) => {
      const delta = moveEvent.clientX - startXRef.current;
      const newWidth = Math.max(200, Math.min(650, startWidthRef.current + delta));
      onResizeWidth?.(column.id, newWidth);
    };

    const onMouseUp = () => {
      setIsResizing(false);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  const handleDragEnter = (e: React.DragEvent<HTMLElement>) => {
    e.preventDefault();
    dragDepthRef.current += 1;
    if (dragDepthRef.current === 1) {
      // Se for arraste de tarefa, destaca como drop target
      setIsDropTarget(true);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLElement>) => {
    e.preventDefault();
    const isColumnDrag = e.dataTransfer && Array.from(e.dataTransfer.types).includes('application/x-metrik-column');

    if (isColumnDrag) {
      if (e.dataTransfer) {
        // Se este alvo for a primeira ou última coluna, não permite drop de coluna
        if (isFixed) {
          e.dataTransfer.dropEffect = 'none';
          setColumnDropIndicator(null);
          return;
        }
        e.dataTransfer.dropEffect = 'move';
      }
      const rect = e.currentTarget.getBoundingClientRect();
      const midX = rect.left + rect.width / 2;
      const clientX = typeof e.clientX === 'number' ? e.clientX : midX - 1;
      setColumnDropIndicator(clientX < midX ? 'before' : 'after');
    } else {
      setColumnDropIndicator(null);
      if (e.dataTransfer) {
        e.dataTransfer.dropEffect = 'move';
      }
    }
  };

  const handleDragLeave = (e: React.DragEvent<HTMLElement>) => {
    e.preventDefault();
    dragDepthRef.current -= 1;
    if (dragDepthRef.current <= 0) {
      dragDepthRef.current = 0;
      setIsDropTarget(false);
      setColumnDropIndicator(null);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLElement>) => {
    e.preventDefault();
    dragDepthRef.current = 0;
    setIsDropTarget(false);
    const indicator = columnDropIndicator;
    setColumnDropIndicator(null);

    // 1. Drop de Coluna
    const sourceColIndexStr = e.dataTransfer ? e.dataTransfer.getData('application/x-metrik-column') : '';
    if (sourceColIndexStr !== '' && onMoveColumn && typeof columnIndex === 'number') {
      const sourceColIdx = parseInt(sourceColIndexStr, 10);
      if (!Number.isNaN(sourceColIdx) && !isFixed) {
        let destIdx = columnIndex;
        if (indicator === 'after' && sourceColIdx < columnIndex) {
          destIdx = columnIndex;
        } else if (indicator === 'before' && sourceColIdx > columnIndex) {
          destIdx = columnIndex;
        }
        onMoveColumn(sourceColIdx, destIdx);
        return;
      }
    }

    // 2. Drop de Tarefa
    const activeTaskId = e.dataTransfer ? e.dataTransfer.getData('text/plain') : '';
    if (activeTaskId && onDropTask) {
      onDropTask({
        activeTaskId,
        targetColumn: column.id,
      });
    }
  };

  const handleColumnDragStart = (e: React.DragEvent<HTMLElement>) => {
    if (isFixed || typeof columnIndex !== 'number') {
      e.preventDefault();
      return;
    }
    setIsColumnDragging(true);
    if (e.dataTransfer) {
      e.dataTransfer.setData('application/x-metrik-column', String(columnIndex));
      e.dataTransfer.effectAllowed = 'move';
    }
  };

  const handleColumnDragEnd = () => {
    setIsColumnDragging(false);
    setColumnDropIndicator(null);
  };

  const handleDelete = () => {
    if (count > 0) {
      alert('Não é possível excluir uma coluna que contém tarefas. Mova ou exclua as tarefas primeiro.');
      return;
    }
    if (onDeleteColumn && window.confirm(`Tem certeza que deseja excluir a coluna "${column.title}"?`)) {
      onDeleteColumn(column.id);
    }
  };

  const handleEditTitle = () => {
    if (!onUpdateColumn) return;
    const newTitle = window.prompt('Digite o novo nome da coluna:', column.title);
    if (newTitle && newTitle.trim() !== '') {
      onUpdateColumn(column.id, { title: newTitle.trim() });
    }
  };

  return (
    <section
      className={`kanban-column ${modifierClass} ${isOverloaded ? 'kanban-column-wip-exceeded' : ''} ${isDropTarget ? 'kanban-column-drop-target' : ''} ${isResizing ? 'is-resizing' : ''} ${isColumnDragging ? 'is-column-dragging' : ''} ${columnDropIndicator === 'before' ? 'column-drop-before' : ''} ${columnDropIndicator === 'after' ? 'column-drop-after' : ''} ${isFixed ? 'is-fixed-column' : ''}`}
      style={width ? { width: `${width}px`, minWidth: `${width}px`, maxWidth: `${width}px` } : undefined}
      aria-label={`Coluna ${column.title}`}
      onDragEnter={handleDragEnter}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <header className="column-header">
        <div className="column-header-left">
          {!isFixed && onMoveColumn && typeof columnIndex === 'number' && (
            <div
              className="column-drag-handle"
              draggable
              onDragStart={handleColumnDragStart}
              onDragEnd={handleColumnDragEnd}
              title="Arrastar para reordenar coluna"
              aria-label={`Reordenar coluna ${column.title}`}
            >
              ⋮⋮
            </div>
          )}

          <span className={`column-badge ${badgeClass}`} onClick={handleEditTitle} style={{ cursor: onUpdateColumn ? 'pointer' : 'default' }} title="Clique para editar">
            {column.title}
          </span>

          {isFixed && (
            <span
              className="column-fixed-badge"
              title="Primeira coluna (fixa, sentido inicial do fluxo)"
              aria-label="Coluna fixa"
            >
              🔒
            </span>
          )}

          {onUpdateColumn ? (
            <WipLimitBadge
              columnId={column.id}
              currentCount={count}
              limit={column.wipLimit}
              onUpdateLimit={(id, limit) => onUpdateColumn(id, { wipLimit: limit })}
            />
          ) : (
            <span className="column-count" aria-label={`${count} tarefas`}>
              {count}
            </span>
          )}
        </div>

        <div className="column-header-actions">
          {!isFixed && onMoveColumn && typeof columnIndex === 'number' && (
            <div className="column-move-btn-group" role="group" aria-label="Mover coluna">
              <button
                type="button"
                className="btn-move-column"
                onClick={() => canMoveLeft && onMoveColumn(columnIndex, columnIndex - 1)}
                disabled={!canMoveLeft}
                title={canMoveLeft ? 'Mover coluna para a esquerda' : 'Não pode mover para a primeira coluna'}
                aria-label={`Mover coluna ${column.title} para a esquerda`}
              >
                ←
              </button>
              <button
                type="button"
                className="btn-move-column"
                onClick={() => canMoveRight && onMoveColumn(columnIndex, columnIndex + 1)}
                disabled={!canMoveRight}
                title={canMoveRight ? 'Mover coluna para a direita' : 'Já está na última posição'}
                aria-label={`Mover coluna ${column.title} para a direita`}
              >
                →
              </button>
            </div>
          )}

          {onDeleteColumn && count === 0 && !isFixed && (
            <button
              type="button"
              className="btn-column-action btn-delete"
              onClick={handleDelete}
              title="Excluir coluna"
            >
              ×
            </button>
          )}
          {onAddTask && (
            <button
              type="button"
              className="btn-add-task"
              onClick={onAddTask}
              aria-label={`Adicionar tarefa em ${column.title}`}
              title={`Adicionar tarefa em ${column.title}`}
            >
              +
            </button>
          )}
        </div>
      </header>

      <div className="tasks-list">
        {count === 0 ? (
          <div className="empty-column-drop-zone" aria-label="Coluna vazia. Arraste um cartão aqui.">
            Arraste um cartão aqui
          </div>
        ) : (
          children
        )}
      </div>

      {onResizeWidth && (
        <div
          className="column-resize-handle"
          onMouseDown={handleResizeMouseDown}
          onDoubleClick={() => onResetWidth ? onResetWidth(column.id) : onResizeWidth(column.id, 280)}
          title="Arraste para redimensionar a largura da coluna (duplo clique para redefinir)"
          aria-label={`Ajustar largura da coluna ${column.title}`}
          role="separator"
          aria-orientation="vertical"
        />
      )}
    </section>
  );
};
