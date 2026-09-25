import React, { useMemo } from 'react';
import { TaskModel } from '../types/kanban';
import {
  calculateLeadTimeMs,
  calculateCycleTimeMs,
  calculateTaskBlockedTimeMs,
  formatDuration,
} from '../utils/timeFormatters';

export interface InitiativeProgress {
  total: number;
  completed: number;
  percentage: number;
}

export interface TaskFlowMetricsPanelProps {
  task: TaskModel;
  currentColumnTitle?: string;
  pendingBlockersCount?: number;
  initiativeProgress?: InitiativeProgress;
}

const ClockIcon = () => (
  <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

const CycleIcon = () => (
  <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M21 12a9 9 0 1 1-9-9" />
    <polyline points="21 3 21 9 15 9" />
  </svg>
);

const ShieldIcon = () => (
  <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);

const HourglassIcon = () => (
  <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M6 2h12M6 22h12M6 2c0 5 6 6 6 10 0-4 6-5 6-10M6 22c0-5 6-6 6-10 0 4 6 5 6 10" />
  </svg>
);

const formatDateTime = (iso?: string): string => {
  if (!iso) return '—';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const TaskFlowMetricsPanel: React.FC<TaskFlowMetricsPanelProps> = ({
  task,
  currentColumnTitle,
  pendingBlockersCount = 0,
  initiativeProgress,
}) => {
  const metrics = useMemo(() => {
    const now = Date.now();
    const createdMs = new Date(task.createdAt).getTime();
    const ageMs = !isNaN(createdMs) ? Math.max(0, now - createdMs) : 0;

    const leadTimeMs = calculateLeadTimeMs(task);
    const cycleTimeMs = calculateCycleTimeMs(task);
    const blockedMs = calculateTaskBlockedTimeMs(task, now);

    const startedMs = task.startedAt ? new Date(task.startedAt).getTime() : null;
    const runningCycleMs =
      !task.completedAt && startedMs && !isNaN(startedMs) ? Math.max(0, now - startedMs) : null;

    const isCompleted = Boolean(task.completedAt);
    const isOverdue =
      !isCompleted &&
      Boolean(task.dueDate) &&
      new Date(`${task.dueDate}T23:59:59`).getTime() < now;

    return {
      ageMs,
      leadTimeMs,
      cycleTimeMs,
      blockedMs,
      runningCycleMs,
      isCompleted,
      isOverdue,
      leadDisplay: leadTimeMs !== null ? formatDuration(leadTimeMs) : formatDuration(ageMs),
      leadCaption: leadTimeMs !== null ? 'criação → conclusão' : 'em andamento desde a criação',
      cycleDisplay:
        cycleTimeMs !== null
          ? formatDuration(cycleTimeMs)
          : runningCycleMs !== null
          ? formatDuration(runningCycleMs)
          : '—',
      cycleCaption:
        cycleTimeMs !== null
          ? 'início → conclusão'
          : runningCycleMs !== null
          ? 'em execução'
          : 'ainda não iniciado',
    };
  }, [task]);

  const subtasks = task.subtasks || [];
  const completedSubtasks = subtasks.filter((st) => st.completed).length;
  const subtaskProgress = subtasks.length > 0 ? Math.round((completedSubtasks / subtasks.length) * 100) : 0;

  const commentsCount = (task.comments || []).length;
  const decisionsCount = (task.comments || []).filter((c) => c.isDecision).length;
  const activityCount = (task.activityLog || []).length;
  const linksCount = (task.links || []).length;

  return (
    <div className="td-metrics">
      {/* Flow metric cards */}
      <div className="td-metrics__grid">
        <div className="td-metric-card">
          <span className="td-metric-card__icon td-metric-card__icon--lead">{<ClockIcon />}</span>
          <div className="td-metric-card__body">
            <span className="td-metric-card__label">Lead Time</span>
            <span className="td-metric-card__value">{metrics.leadDisplay}</span>
            <span className="td-metric-card__caption">{metrics.leadCaption}</span>
          </div>
        </div>

        <div className="td-metric-card">
          <span className="td-metric-card__icon td-metric-card__icon--cycle">{<CycleIcon />}</span>
          <div className="td-metric-card__body">
            <span className="td-metric-card__label">Cycle Time</span>
            <span className="td-metric-card__value">{metrics.cycleDisplay}</span>
            <span className="td-metric-card__caption">{metrics.cycleCaption}</span>
          </div>
        </div>

        <div className={`td-metric-card ${metrics.blockedMs > 0 ? 'td-metric-card--alert' : ''}`}>
          <span className="td-metric-card__icon td-metric-card__icon--blocked">{<ShieldIcon />}</span>
          <div className="td-metric-card__body">
            <span className="td-metric-card__label">Tempo Bloqueado</span>
            <span className="td-metric-card__value">
              {metrics.blockedMs > 0 ? formatDuration(metrics.blockedMs) : '0 min'}
            </span>
            <span className="td-metric-card__caption">
              {task.blocked ? 'impedida no momento' : 'sem impedimentos ativos'}
            </span>
          </div>
        </div>

        <div className="td-metric-card">
          <span className="td-metric-card__icon td-metric-card__icon--age">{<HourglassIcon />}</span>
          <div className="td-metric-card__body">
            <span className="td-metric-card__label">Idade do Cartão</span>
            <span className="td-metric-card__value">{formatDuration(metrics.ageMs)}</span>
            <span className="td-metric-card__caption">
              {currentColumnTitle ? `na coluna "${currentColumnTitle}"` : 'desde a criação'}
            </span>
          </div>
        </div>
      </div>

      {/* Dates timeline */}
      <section className="td-metrics__section">
        <h4 className="td-metrics__heading">Linha do Tempo</h4>
        <ul className="td-metrics__dates">
          <li className="td-metrics__date">
            <span className="td-metrics__date-label">Criado</span>
            <span className="td-metrics__date-value">{formatDateTime(task.createdAt)}</span>
          </li>
          <li className="td-metrics__date">
            <span className="td-metrics__date-label">Iniciado</span>
            <span className={`td-metrics__date-value ${task.startedAt ? '' : 'is-muted'}`}>
              {formatDateTime(task.startedAt)}
            </span>
          </li>
          <li className="td-metrics__date">
            <span className="td-metrics__date-label">Concluído</span>
            <span className={`td-metrics__date-value ${task.completedAt ? '' : 'is-muted'}`}>
              {formatDateTime(task.completedAt)}
            </span>
          </li>
          <li className="td-metrics__date">
            <span className="td-metrics__date-label">Data de Entrega</span>
            <span className={`td-metrics__date-value ${metrics.isOverdue ? 'is-overdue' : task.dueDate ? '' : 'is-muted'}`}>
              {task.dueDate ? formatDateTime(`${task.dueDate}T12:00:00`) : '—'}
              {metrics.isOverdue && <span className="td-metrics__overdue-tag">atrasada</span>}
            </span>
          </li>
        </ul>
      </section>

      {/* Checklist progress */}
      {subtasks.length > 0 && (
        <section className="td-metrics__section">
          <div className="td-metrics__heading-row">
            <h4 className="td-metrics__heading">Checklist</h4>
            <span className="td-metrics__counter">
              {completedSubtasks}/{subtasks.length} · {subtaskProgress}%
            </span>
          </div>
          <div className="td-metrics__progress-track">
            <div className="td-metrics__progress-fill" style={{ width: `${subtaskProgress}%` }} />
          </div>
        </section>
      )}

      {/* Initiative progress */}
      {task.type === 'initiative' && initiativeProgress && initiativeProgress.total > 0 && (
        <section className="td-metrics__section">
          <div className="td-metrics__heading-row">
            <h4 className="td-metrics__heading">Progresso da Iniciativa</h4>
            <span className="td-metrics__counter">
              {initiativeProgress.completed}/{initiativeProgress.total} · {initiativeProgress.percentage}%
            </span>
          </div>
          <div className="td-metrics__progress-track">
            <div
              className="td-metrics__progress-fill td-metrics__progress-fill--initiative"
              style={{ width: `${initiativeProgress.percentage}%` }}
            />
          </div>
        </section>
      )}

      {/* Composition / transparency counters */}
      <section className="td-metrics__section">
        <h4 className="td-metrics__heading">Composição da Tarefa</h4>
        <div className="td-metrics__counters">
          <div className="td-metrics__counter-box">
            <span className="td-metrics__counter-value">{commentsCount}</span>
            <span className="td-metrics__counter-label">Comentários</span>
          </div>
          <div className="td-metrics__counter-box">
            <span className="td-metrics__counter-value">{decisionsCount}</span>
            <span className="td-metrics__counter-label">Decisões</span>
          </div>
          <div className="td-metrics__counter-box">
            <span className="td-metrics__counter-value">{activityCount}</span>
            <span className="td-metrics__counter-label">Eventos</span>
          </div>
          <div className="td-metrics__counter-box">
            <span className="td-metrics__counter-value">{linksCount}</span>
            <span className="td-metrics__counter-label">Vínculos</span>
          </div>
          <div className={`td-metrics__counter-box ${pendingBlockersCount > 0 ? 'is-alert' : ''}`}>
            <span className="td-metrics__counter-value">{pendingBlockersCount}</span>
            <span className="td-metrics__counter-label">Bloqueadores</span>
          </div>
        </div>
      </section>
    </div>
  );
};
