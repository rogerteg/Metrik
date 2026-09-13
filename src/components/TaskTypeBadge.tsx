import React from 'react';
import { TaskType, TASK_TYPE_CONFIGS } from '../types/taskTypes';

export interface TaskTypeBadgeProps {
  type?: TaskType;
  compact?: boolean;
  className?: string;
}

export const TaskTypeBadge: React.FC<TaskTypeBadgeProps> = ({
  type = 'card',
  compact = false,
  className = '',
}) => {
  const safeType: TaskType = type && TASK_TYPE_CONFIGS[type] ? type : 'card';
  const config = TASK_TYPE_CONFIGS[safeType];

  return (
    <span
      className={`task-type-badge task-type-badge--${safeType} ${compact ? 'task-type-badge--compact' : ''} ${className}`.trim()}
      aria-label={`Tipo de Tarefa: ${config.label}`}
      title={`${config.label}: ${config.description}`}
      style={{
        backgroundColor: config.bgVar,
        color: config.textVar,
        borderColor: config.borderVar,
      }}
    >
      <span className="task-type-badge__icon" aria-hidden="true">
        {config.icon}
      </span>
      {!compact && (
        <span className="task-type-badge__label">
          {config.shortLabel}
        </span>
      )}
    </span>
  );
};
