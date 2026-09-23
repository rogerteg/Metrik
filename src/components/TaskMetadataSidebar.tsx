import React from 'react';
import { TaskModel, ColumnModel } from '../types/kanban';
import { TaskType, TASK_TYPE_CONFIGS } from '../types/taskTypes';
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
}

const PRIORITY_CONFIGS: Record<string, { label: string; bg: string; text: string; border: string }> = {
  urgent: { label: 'Urgente', bg: 'bg-rose-950/40', text: 'text-rose-300', border: 'border-rose-700/60' },
  high: { label: 'Alta', bg: 'bg-amber-950/40', text: 'text-amber-300', border: 'border-amber-700/60' },
  medium: { label: 'Média', bg: 'bg-sky-950/40', text: 'text-sky-300', border: 'border-sky-700/60' },
  low: { label: 'Baixa', bg: 'bg-slate-900', text: 'text-slate-300', border: 'border-slate-700/60' },
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
}) => {
  const priority = task.priority || 'medium';
  const priorityCfg = PRIORITY_CONFIGS[priority] || PRIORITY_CONFIGS.medium;

  const blockedTimeMs = calculateTaskBlockedTimeMs(task);
  const formattedBlockedTime = formatBlockedTime(blockedTimeMs);

  return (
    <aside className="w-full space-y-5 rounded-xl border border-slate-800/80 bg-slate-950/40 p-4 shadow-inner">
      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800/60 pb-2">
        Metadados da Tarefa
      </h3>

      {/* Priority Selector */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
          <svg className="w-4 h-4 flex-shrink-0 text-amber-400 max-w-[18px] max-h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          Prioridade
        </label>
        {isReadOnly ? (
          <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium border ${priorityCfg.bg} ${priorityCfg.text} ${priorityCfg.border}`}>
            {priorityCfg.label}
          </span>
        ) : (
          <select
            className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
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

      {/* Task Type Selector */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
          <svg className="w-4 h-4 flex-shrink-0 text-cyan-400 max-w-[18px] max-h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          Tipo de Tarefa
        </label>
        <div className="grid grid-cols-3 gap-1" role="radiogroup" aria-label="Tipo de tarefa">
          {(['initiative', 'card', 'subtask'] as TaskType[]).map((typeKey) => {
            const cfg = TASK_TYPE_CONFIGS[typeKey];
            const isSelected = (task.type ?? 'card') === typeKey;
            return (
              <button
                key={typeKey}
                type="button"
                className={`flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                  isSelected
                    ? 'border-cyan-500/80 bg-cyan-950/40 text-cyan-300 shadow-sm'
                    : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:text-slate-200'
                }`}
                onClick={() => !isReadOnly && onUpdateTask(task.id, { type: typeKey })}
                disabled={isReadOnly}
              >
                <span>{cfg.icon}</span>
                <span className="truncate">{cfg.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Impediment / Blocked State */}
      <div className="space-y-2 pt-2 border-t border-slate-800/60">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
            <svg className="w-4 h-4 flex-shrink-0 text-rose-400 max-w-[18px] max-h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            Impedimento
          </label>
          {blockedTimeMs > 0 && (
            <span className="text-[11px] font-mono text-slate-400">
              {formattedBlockedTime}
            </span>
          )}
        </div>
        <button
          type="button"
          className={`w-full py-1.5 px-3 rounded-lg text-xs font-semibold border transition-colors flex items-center justify-center gap-1.5 ${
            task.blocked
              ? 'bg-rose-950/60 text-rose-200 border-rose-700/60 hover:bg-rose-900/60'
              : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800'
          }`}
          onClick={() => onToggleBlocked && onToggleBlocked(task.id, task.blockedReason || '')}
          disabled={isReadOnly}
        >
          {task.blocked ? 'Desbloquear Tarefa' : 'Marcar como Bloqueada'}
        </button>

        {task.blocked && (
          <div className="space-y-1.5 pt-1">
            <span className="text-xs text-rose-400 font-semibold block">
              Tarefa atualmente impedida
            </span>
            <input
              id="td-blocked-reason"
              type="text"
              className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-rose-500"
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
      <div className="space-y-2 pt-2 border-t border-slate-800/60">
        <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
          <svg className="w-4 h-4 flex-shrink-0 text-slate-400 max-w-[18px] max-h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          Datas
        </label>
        <div className="space-y-2">
          <div>
            <label htmlFor="td-startDate" className="text-[11px] text-slate-400 block mb-0.5">Início da Tarefa</label>
            <input
              id="td-startDate"
              type="date"
              className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-xs text-slate-200"
              value={localStartDate}
              onChange={(e) => setLocalStartDate(e.target.value)}
              onBlur={handleStartDateBlur}
              disabled={isReadOnly}
            />
          </div>
          <div>
            <label htmlFor="td-endDate" className="text-[11px] text-slate-400 block mb-0.5">Fim da Tarefa</label>
            <input
              id="td-endDate"
              type="date"
              className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-xs text-slate-200"
              value={localEndDate}
              onChange={(e) => setLocalEndDate(e.target.value)}
              onBlur={handleEndDateBlur}
              disabled={isReadOnly}
            />
          </div>
          <div>
            <label htmlFor="td-dueDate" className="text-[11px] text-slate-400 block mb-0.5">Data de Entrega</label>
            <input
              id="td-dueDate"
              type="date"
              className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-xs text-slate-200"
              value={localDueDate}
              onChange={(e) => setLocalDueDate(e.target.value)}
              onBlur={handleDueDateBlur}
              disabled={isReadOnly}
            />
          </div>
        </div>
      </div>

      {/* Creation Audit Timestamps */}
      <div className="pt-3 border-t border-slate-800/60 space-y-1 text-[11px] text-slate-400">
        <div className="flex justify-between">
          <span>Criado:</span>
          <span className="font-mono text-slate-300">{new Date(task.createdAt).toLocaleDateString('pt-BR')}</span>
        </div>
        {task.startedAt && (
          <div className="flex justify-between">
            <span>Iniciado:</span>
            <span className="font-mono text-slate-300">{new Date(task.startedAt).toLocaleDateString('pt-BR')}</span>
          </div>
        )}
        {task.completedAt && (
          <div className="flex justify-between">
            <span>Concluído:</span>
            <span className="font-mono text-slate-300">{new Date(task.completedAt).toLocaleDateString('pt-BR')}</span>
          </div>
        )}
      </div>
    </aside>
  );
};
