import React from 'react';
import { TaskTypeBadge } from '../TaskTypeBadge';
import { PriorityBadge } from '../PriorityBadge';
import { TaskHeaderProps } from './types';

export const TaskHeader: React.FC<TaskHeaderProps> = ({
  task,
  readOnly,
  isStagnant,
  isBlocked,
  isReadOnly,
  onUpdatePriority,
  onQuickUnlock,
}) => {
  return (
    <div className="task-card-header" onPointerDown={(e) => e.stopPropagation()}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
        <TaskTypeBadge type={task.type} />
        <PriorityBadge
          priority={task.priority}
          onChange={(newPriority) => onUpdatePriority?.(task.id, newPriority)}
          readOnly={readOnly}
        />
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
        {isStagnant && !isBlocked && (
          <span
            className="task-stagnant-badge"
            title="Cartão sem movimentação há mais de 3 dias no board"
            data-testid="task-stagnant-badge"
          >
            ⏳ Parado
          </span>
        )}
        {isBlocked && (
          <span
            className={`task-blocked-badge ${isReadOnly ? '' : 'task-card-blocked-badge-clickable'}`}
            title={
              task.blockedReason
                ? `Bloqueado: ${task.blockedReason}`
                : 'Cartão bloqueado: clique para retirar a etiqueta de bloqueio'
            }
            data-testid="task-blocked-badge"
            role={isReadOnly ? undefined : 'button'}
            tabIndex={isReadOnly ? undefined : 0}
            onClick={
              isReadOnly
                ? undefined
                : (e) => {
                    e.stopPropagation();
                    onQuickUnlock();
                  }
            }
            onKeyDown={
              isReadOnly
                ? undefined
                : (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.stopPropagation();
                      e.preventDefault();
                      onQuickUnlock();
                    }
                  }
            }
          >
            ⛔ Bloqueado
          </span>
        )}
      </div>
    </div>
  );
};
