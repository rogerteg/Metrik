import React from 'react';
import { TaskModel, ColumnModel } from '../types/kanban';
import { TaskType, TASK_TYPE_CONFIGS } from '../types/taskTypes';
import { User } from '../types/team';
import { calculateTaskBlockedTimeMs, formatBlockedTime } from '../utils/timeFormatters';

interface TaskMetadataSidebarProps {
  task: TaskModel;
  columns?: ColumnModel[];
  isReadOnly?: boolean;
  onUpdateTask: (id: string, updates: Partial<TaskModel>) => void;
  onToggleBlocked?: (id: string, reason?: string) => void;
  localStartDate: string;
  setLocalStartDate: (val: string) => void;
  handleStartDateBlur: () => void;
  localEndDate: string;
  setLocalEndDate: (val: string) => void;
  handleEndDateBlur: () => void;
  localDueDate: string;
  setLocalDueDate: (val: string) => void;
  handleDueDateBlur: () => void;
  /** Lista de usuários para seleção de responsável (opcional) */
  users?: User[];
}

const PRIORITY_LABELS: Record<string, string> = {
  urgent: 'Urgente',
  high: 'Alta',
  medium: 'Média',
  low: 'Baixa',
};

export const TaskMetadataSidebar: React.FC<TaskMetadataSidebarProps> = ({
  task,
  isReadOnly = false,
  onUpdateTask,
  onToggleBlocked,
  localStartDate,
  setLocalStartDate,
  handleStartDateBlur,
  localEndDate,
  setLocalEndDate,
  handleEndDateBlur,
  localDueDate,
  setLocalDueDate,
  handleDueDateBlur,
  users = [],
}) => {
  const priority = task.priority || 'medium';
  const priorityLabel = PRIORITY_LABELS[priority] || PRIORITY_LABELS.medium;

  const blockedTimeMs = calculateTaskBlockedTimeMs(task);
  const formattedBlockedTime = formatBlockedTime(blockedTimeMs);

  return (
    <aside className="td-sidebar-card">
      <h3 className="td-sidebar-heading">
        Metadados da Tarefa
      </h3>

      {/* Priority Selector */}
      <div className="td-sidebar-field">
        <label className="td-sidebar-field-label">
          <svg width={16} height={16} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          Prioridade
        </label>
        {isReadOnly ? (
          <span className="td-input" style={{ display: 'inline-block' }}>
            {priorityLabel}
          </span>
        ) : (
          <select
            className="td-select"
            value={priority}
            onChange={(e) => onUpdateTask(task.id, { priority: e.target.value as any })}
          >
            <option value="urgent">🔴 Urgente</option>
            <option value="high">🟠 Alta</option>
            <option value="medium">🟡 Média</option>
            <option value="low">🟢 Baixa</option>
          </select>
        )}
      </div>

      {/* Assignee / Responsável */}
      <div className="td-sidebar-field">
        <label className="td-sidebar-field-label" htmlFor="td-assignee">
          <svg width={16} height={16} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 7a4 4 0 1 0 0 .01M19 8v6M22 11h-6" />
          </svg>
          Responsável
        </label>
        {isReadOnly ? (
          <span className="td-input" style={{ display: 'inline-block' }}>
            {task.assignee || 'Não atribuído'}
          </span>
        ) : users.length > 0 ? (
          <select
            id="td-assignee"
            className="td-select"
            value={task.assignee || ''}
            onChange={(e) => onUpdateTask(task.id, { assignee: e.target.value || undefined })}
          >
            <option value="">Não atribuído</option>
            {users.map((u) => (
              <option key={u.id} value={u.name}>
                {u.name}
              </option>
            ))}
          </select>
        ) : (
          <input
            id="td-assignee"
            type="text"
            className="td-input"
            placeholder="Definir responsável..."
            value={task.assignee || ''}
            onChange={(e) => onUpdateTask(task.id, { assignee: e.target.value || undefined })}
          />
        )}
      </div>

      {/* Task Type Selector */}
      <div className="td-sidebar-field">
        <label className="td-sidebar-field-label">
          <svg width={16} height={16} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          Tipo de Tarefa
        </label>
        <div className="td-type-buttons" role="radiogroup" aria-label="Tipo de tarefa">
          {(['initiative', 'card', 'subtask'] as TaskType[]).map((typeKey) => {
            const cfg = TASK_TYPE_CONFIGS[typeKey];
            const isSelected = (task.type ?? 'card') === typeKey;
            return (
              <button
                key={typeKey}
                type="button"
                className={`td-type-btn ${isSelected ? 'active' : ''}`}
                onClick={() => !isReadOnly && onUpdateTask(task.id, { type: typeKey })}
                disabled={isReadOnly}
              >
                <span>{cfg.icon}</span>
                <span>{cfg.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Impediment / Blocked State */}
      <div className="td-sidebar-field" style={{ paddingTop: 8, borderTop: '1px solid var(--border-subtle)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
          <label className="td-sidebar-field-label" style={{ flex: 1 }}>
            <svg width={16} height={16} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            Impedimento
          </label>
          {blockedTimeMs > 0 && (
            <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
              {formattedBlockedTime}
            </span>
          )}
        </div>
        <button
          type="button"
          className={`td-block-btn ${task.blocked ? 'is-blocked' : ''}`}
          onClick={() => onToggleBlocked && onToggleBlocked(task.id, task.blockedReason || '')}
          disabled={isReadOnly}
        >
          {task.blocked ? 'Desbloquear Tarefa' : 'Marcar como Bloqueada'}
        </button>

        {task.blocked && (
          <div className="td-sidebar-field" style={{ paddingTop: 4 }}>
            <span style={{ fontSize: '0.75rem', color: '#f43f5e', fontWeight: 600 }}>
              Tarefa atualmente impedida
            </span>
            <input
              id="td-blocked-reason"
              type="text"
              className="td-input"
              placeholder="Descreva o motivo do bloqueio..."
              value={task.blockedReason || ''}
              onChange={(e) => onUpdateTask(task.id, { blockedReason: e.target.value })}
              onBlur={(e) => onUpdateTask(task.id, { blockedReason: e.target.value })}
              disabled={isReadOnly}
            />
          </div>
        )}
      </div>

      {/* Dates Section */}
      <div className="td-sidebar-field" style={{ paddingTop: 8, borderTop: '1px solid var(--border-subtle)' }}>
        <label className="td-sidebar-field-label">
          <svg width={16} height={16} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          Datas
        </label>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div>
            <label htmlFor="td-startDate" style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', marginBottom: 2 }}>Início da Tarefa</label>
            <input
              id="td-startDate"
              type="date"
              className="td-input td-date-input"
              value={localStartDate}
              onChange={(e) => setLocalStartDate(e.target.value)}
              onBlur={handleStartDateBlur}
              disabled={isReadOnly}
            />
          </div>
          <div>
            <label htmlFor="td-endDate" style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', marginBottom: 2 }}>Fim da Tarefa</label>
            <input
              id="td-endDate"
              type="date"
              className="td-input td-date-input"
              value={localEndDate}
              onChange={(e) => setLocalEndDate(e.target.value)}
              onBlur={handleEndDateBlur}
              disabled={isReadOnly}
            />
          </div>
          <div>
            <label htmlFor="td-dueDate" style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', marginBottom: 2 }}>Data de Entrega</label>
            <input
              id="td-dueDate"
              type="date"
              className="td-input td-date-input"
              value={localDueDate}
              onChange={(e) => setLocalDueDate(e.target.value)}
              onBlur={handleDueDateBlur}
              disabled={isReadOnly}
            />
          </div>
        </div>
      </div>

      {/* Creation Audit Timestamps */}
      <div style={{ paddingTop: 10, borderTop: '1px solid var(--border-subtle)', display: 'flex', flexDirection: 'column', gap: 4, fontSize: '0.72rem', color: 'var(--text-muted)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>Criado:</span>
          <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>{new Date(task.createdAt).toLocaleDateString('pt-BR')}</span>
        </div>
        {task.startedAt && (
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Iniciado:</span>
            <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>{new Date(task.startedAt).toLocaleDateString('pt-BR')}</span>
          </div>
        )}
        {task.completedAt && (
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Concluído:</span>
            <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>{new Date(task.completedAt).toLocaleDateString('pt-BR')}</span>
          </div>
        )}
      </div>
    </aside>
  );
};
