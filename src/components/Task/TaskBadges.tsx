import React from 'react';
import { formatDateShort } from '../../utils/timeFormatters';
import { TaskBadgesProps } from './types';

export const TaskBadges: React.FC<TaskBadgesProps> = ({
  task,
  hasCompletedAt,
  leadTimeStr,
  cycleTimeStr,
  hasDueDate,
  dueDateStatus,
}) => {
  return (
    <>
      {(hasDueDate || task.startDate || task.endDate) && (
        <div className="task-indicators" aria-label="Indicadores da tarefa">
          {task.startDate && (
            <span
              className="task-indicator-badge date-start-badge"
              title={`Início da tarefa: ${formatDateShort(task.startDate)}`}
            >
              <svg
                width="11"
                height="11"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ marginRight: '3px' }}
              >
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
              Início: {formatDateShort(task.startDate)}
            </span>
          )}
          {task.endDate && (
            <span
              className="task-indicator-badge date-end-badge"
              title={`Fim da tarefa: ${formatDateShort(task.endDate)}`}
            >
              <svg
                width="11"
                height="11"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ marginRight: '3px' }}
              >
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
              </svg>
              Fim: {formatDateShort(task.endDate)}
            </span>
          )}
          {hasDueDate && (
            <span
              className={`task-indicator-badge due-date-${dueDateStatus}`}
              title={`Data de entrega: ${formatDateShort(task.dueDate!)}`}
            >
              <svg
                width="11"
                height="11"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ marginRight: '3px' }}
              >
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
              </svg>
              {formatDateShort(task.dueDate!)}
            </span>
          )}
        </div>
      )}

      {hasCompletedAt && (
        <div className="task-metrics-badges" aria-label="Métricas de fluxo do cartão">
          <span
            className="badge-metric-time badge-lead-time"
            title="Lead Time: Tempo total decorrido da criação até a conclusão"
          >
            Lead: {leadTimeStr}
          </span>
          <span
            className="badge-metric-time badge-cycle-time"
            title="Cycle Time: Tempo de processamento efetivo do início até a conclusão"
          >
            Cycle: {cycleTimeStr}
          </span>
        </div>
      )}
    </>
  );
};
