import React, { useState, useRef } from 'react';
import { ColumnModel } from '../types/kanban';
import { WipLimitBadge } from './WipLimitBadge';
import { ReorderOptions } from '../types/dnd';

export interface ColumnProps {
  column: ColumnModel;
  count: number;
  width?: number;
  onResizeWidth?: (columnId: string, width: number) => void;
  onResetWidth?: (columnId: string) => void;
  onAddTask?: () => void;
  onUpdateColumn?: (id: string, updates: Partial<ColumnModel>) => void;
  onDeleteColumn?: (id: string) => void;
  onDropTask?: (options: ReorderOptions) => void;
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
  width,
  onResizeWidth,
  onResetWidth,
  onAddTask,
  onUpdateColumn,
  onDeleteColumn,
  onDropTask,
  children,
}) => {
  const badgeClass = getBadgeClass(column.colorScheme);
  const modifierClass = getColumnModifierClass(column.colorScheme);
  const isOverloaded = column.wipLimit !== null && count > column.wipLimit;

  const [isDropTarget, setIsDropTarget] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
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
      setIsDropTarget(true);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLElement>) => {
    e.preventDefault();
    if (e.dataTransfer) {
      e.dataTransfer.dropEffect = 'move';
    }
  };

  const handleDragLeave = (e: React.DragEvent<HTMLElement>) => {
    e.preventDefault();
    dragDepthRef.current -= 1;
    if (dragDepthRef.current <= 0) {
      dragDepthRef.current = 0;
      setIsDropTarget(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLElement>) => {
    e.preventDefault();
    dragDepthRef.current = 0;
    setIsDropTarget(false);

    const activeTaskId = e.dataTransfer ? e.dataTransfer.getData('text/plain') : '';
    if (activeTaskId && onDropTask) {
      onDropTask({
        activeTaskId,
        targetColumn: column.id,
      });
    }
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
      className={`kanban-column ${modifierClass} ${isOverloaded ? 'kanban-column-wip-exceeded' : ''} ${isDropTarget ? 'kanban-column-drop-target' : ''} ${isResizing ? 'is-resizing' : ''}`}
      style={width ? { width: `${width}px`, minWidth: `${width}px`, maxWidth: `${width}px` } : undefined}
      aria-label={`Coluna ${column.title}`}
      onDragEnter={handleDragEnter}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <header className="column-header">
        <div className="column-header-left">
          <span className={`column-badge ${badgeClass}`} onClick={handleEditTitle} style={{ cursor: onUpdateColumn ? 'pointer' : 'default' }} title="Clique para editar">
            {column.title}
          </span>
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
          {onDeleteColumn && count === 0 && (
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
