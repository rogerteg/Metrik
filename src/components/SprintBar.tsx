import React from 'react';
import { SprintModel, TaskModel } from '../types/kanban';
import {
  getActiveSprint,
  getSprintTasks,
  calculateSprintProgress,
  isSprintOverdue,
} from '../utils/sprintMetrics';

export interface SprintBarProps {
  sprints?: SprintModel[];
  activeSprintId?: string | null;
  /** Todas as tarefas do quadro (achatadas). */
  tasks: TaskModel[];
  /** Somente leitura: mantém as ações de gestão desabilitadas. */
  isReadOnly?: boolean;
  onOpenManager?: () => void;
}

const formatDay = (iso?: string): string => {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
};

/**
 * Indicador compacto da sprint ativa (Feature 038): nome, janela, progresso e velocity.
 * O progresso é derivado; a gestão é delegada ao `SprintManagerModal`.
 */
export const SprintBar: React.FC<SprintBarProps> = ({
  sprints,
  activeSprintId,
  tasks,
  isReadOnly = false,
  onOpenManager,
}) => {
  const active = getActiveSprint(sprints, activeSprintId);
  const progress = active
    ? calculateSprintProgress(getSprintTasks(active.id, tasks))
    : { total: 0, completed: 0, percentage: 0, velocity: 0 };
  const overdue = active ? isSprintOverdue(active) : false;

  return (
    <div className="sprint-bar" data-testid="sprint-bar" role="status" aria-live="polite">
      <div className="sprint-bar__info">
        <span className="sprint-bar__label">{active ? 'Sprint ativa' : 'Sprint'}</span>
        {active ? (
          <>
            <span className="sprint-bar__name" data-testid="sprint-active-name">
              {active.name}
            </span>
            {(active.startDate || active.endDate) && (
              <span className="sprint-bar__dates">
                {formatDay(active.startDate)}
                {active.startDate && active.endDate ? ' – ' : ''}
                {formatDay(active.endDate)}
              </span>
            )}
            {overdue && (
              <span className="sprint-bar__overdue" title="A sprint passou da data de fim">
                atrasada
              </span>
            )}
          </>
        ) : (
          <span className="sprint-bar__empty" data-testid="sprint-none">
            Nenhuma sprint ativa
          </span>
        )}
      </div>

      {active && (
        <div className="sprint-bar__progress" data-testid="sprint-progress">
          <div
            className="sprint-bar__track"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={progress.percentage}
            aria-label="Progresso da sprint"
          >
            <div className="sprint-bar__fill" style={{ width: `${progress.percentage}%` }} />
          </div>
          <span className="sprint-bar__numbers" data-testid="sprint-numbers">
            {progress.completed}/{progress.total} · {progress.percentage}%
          </span>
          <span className="sprint-bar__velocity" data-testid="sprint-velocity">
            Velocity: {progress.velocity}
          </span>
        </div>
      )}

      {onOpenManager && (
        <button
          type="button"
          className="sprint-bar__manage"
          onClick={onOpenManager}
          aria-label="Gerenciar sprints"
          data-testid="sprint-manage-button"
          title={isReadOnly ? 'Visualizar sprints' : 'Gerenciar sprints'}
        >
          {isReadOnly ? 'Sprints' : 'Gerenciar sprints'}
        </button>
      )}
    </div>
  );
};
