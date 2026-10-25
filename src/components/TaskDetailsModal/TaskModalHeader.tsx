import React from 'react';
import { getDefaultColumnColor } from '../../types/kanban';
import { formatDateShort } from '../../utils/timeFormatters';
import { TaskTypeBadge } from '../TaskTypeBadge';
import { TaskFieldActionToolbar } from '../TaskFieldActionToolbar';
import { TaskModalHeaderProps } from './types';

export const TaskModalHeader: React.FC<TaskModalHeaderProps> = ({
  task,
  currentBoard,
  currentColumn,
  dueDateStatus,
  pendingBlockersCount,
  titleEdit,
  isReadOnly,
}) => {
  return (
    <>
      <div className="td-hero">
        <nav className="td-breadcrumb" aria-label="Localização da tarefa">
          <span className="td-breadcrumb__item" title={currentBoard?.name || 'Quadro'}>
            {currentBoard?.name || 'Quadro'}
          </span>
          <span className="td-breadcrumb__sep" aria-hidden="true">
            /
          </span>
          <span className="td-breadcrumb__item td-breadcrumb__item--current">
            {currentColumn?.title || 'Sem coluna'}
          </span>
        </nav>

        <div className="td-hero__meta">
          <TaskTypeBadge type={task.type} />
          <span className="td-hero__id" title={`ID da tarefa: ${task.id}`}>
            #{task.id.slice(0, 8)}
          </span>
          {currentColumn && (
            <span
              className="td-hero__pill td-hero__pill--status"
              title={`Status atual: ${currentColumn.title}`}
            >
              <span
                className="td-hero__status-dot"
                style={{ background: getDefaultColumnColor(currentColumn) }}
                aria-hidden="true"
              />
              {currentColumn.title}
            </span>
          )}
          {task.assignee && (
            <span
              className="td-hero__pill td-hero__pill--assignee"
              title={`Responsável: ${task.assignee}`}
            >
              👤 {task.assignee}
            </span>
          )}
          {task.dueDate && dueDateStatus && (
            <span className={`td-hero__pill td-hero__pill--due-${dueDateStatus}`}>
              Entrega: {formatDateShort(task.dueDate)}
            </span>
          )}
          {task.blocked && (
            <span className="td-hero__pill td-hero__pill--blocked">⛔ Bloqueada</span>
          )}
          {pendingBlockersCount > 0 && (
            <span className="td-hero__pill td-hero__pill--blockers">
              🔒 {pendingBlockersCount} {pendingBlockersCount === 1 ? 'bloqueador' : 'bloqueadores'}
            </span>
          )}
        </div>
      </div>

      <section className="td-section">
        <div className="td-section-header">
          <label htmlFor="td-title" className="td-label">
            Título
          </label>
          <TaskFieldActionToolbar
            status={titleEdit.status}
            isDirty={titleEdit.isDirty}
            onSave={titleEdit.saveNow}
            onDiscard={titleEdit.discard}
            isReadOnly={isReadOnly}
            ariaLabelPrefix="do título"
            compact
          />
        </div>
        <input
          id="td-title"
          type="text"
          className="td-input td-title-input"
          value={titleEdit.value}
          onChange={(e) => titleEdit.setValue(e.target.value)}
          onBlur={titleEdit.handleBlur}
          onKeyDown={(e) => {
            titleEdit.handleKeyDown(e);
            if (e.key === 'Enter') e.currentTarget.blur();
          }}
        />
      </section>
    </>
  );
};
