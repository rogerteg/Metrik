import React from 'react';
import { TaskBlockerChipsProps } from './types';

export const TaskBlockerChips: React.FC<TaskBlockerChipsProps> = ({
  task,
  initiativeProgress,
  pendingBlockersCount,
}) => {
  return (
    <>
      {task.type === 'initiative' && initiativeProgress && initiativeProgress.total > 0 && (
        <div className="task-initiative-progress" data-testid="task-initiative-progress">
          <div className="task-initiative-progress__label">
            <span>Progresso</span>
            <span>
              {initiativeProgress.completed}/{initiativeProgress.total} (
              {initiativeProgress.percentage}%)
            </span>
          </div>
          <div className="task-initiative-progress__bar">
            <div
              className="task-initiative-progress__fill"
              style={{ width: `${initiativeProgress.percentage}%` }}
            />
          </div>
        </div>
      )}

      {task.links && task.links.length > 0 && (
        <div className="task-links-summary-row" data-testid="task-links-summary">
          <span
            className="task-links-counter-badge"
            title={`${task.links.length} ${task.links.length === 1 ? 'vínculo associado' : 'vínculos associados'}`}
          >
            🔗 {task.links.length} {task.links.length === 1 ? 'vínculo' : 'vínculos'}
          </span>
          {task.links.some((l) => l.targetTeamId && l.targetTeamId !== '') && (
            <span className="task-cross-squad-chip" title="Possui dependência com outra squad/time">
              🏢 Cross-Squad
            </span>
          )}
          {pendingBlockersCount !== undefined && pendingBlockersCount > 0 && (
            <span
              className="task-blocked-dependency-chip"
              title={`${pendingBlockersCount} ${pendingBlockersCount === 1 ? 'dependência pendente' : 'dependências pendentes'}`}
              data-testid="task-pending-blocker-chip"
            >
              🔒 {pendingBlockersCount}{' '}
              {pendingBlockersCount === 1 ? 'bloqueador pendente' : 'bloqueadores pendentes'}
            </span>
          )}
        </div>
      )}
    </>
  );
};
