import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { TaskModel, SubtaskModel } from '../types/kanban';
import { calculateTaskBlockedTimeMs, formatBlockedTime } from '../utils/timeFormatters';
import { Modal } from './Modal';
import './TaskDetailsModal.css';

interface TaskDetailsModalProps {
  task: TaskModel;
  isOpen: boolean;
  onClose: () => void;
  onUpdateTask: (id: string, updates: Partial<TaskModel>) => void;
  onToggleBlocked?: (id: string, reason?: string) => void;
}

export const TaskDetailsModal: React.FC<TaskDetailsModalProps> = ({
  task,
  isOpen,
  onClose,
  onUpdateTask,
  onToggleBlocked,
}) => {
  const [localTitle, setLocalTitle] = useState(task.title);
  const [localDescription, setLocalDescription] = useState(task.description || '');
  const [localDueDate, setLocalDueDate] = useState(task.dueDate || '');
  const [localStartDate, setLocalStartDate] = useState(task.startDate || '');
  const [localEndDate, setLocalEndDate] = useState(task.endDate || '');
  const [localAcceptanceCriteria, setLocalAcceptanceCriteria] = useState(task.acceptanceCriteria || '');
  const [localTestScenarios, setLocalTestScenarios] = useState(task.testScenarios || '');
  const [localBlockedReason, setLocalBlockedReason] = useState(task.blockedReason || '');
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');

  // Sync state when a different task is opened
  useEffect(() => {
    if (isOpen) {
      setLocalTitle(task.title);
      setLocalDescription(task.description || '');
      setLocalDueDate(task.dueDate || '');
      setLocalStartDate(task.startDate || '');
      setLocalEndDate(task.endDate || '');
      setLocalAcceptanceCriteria(task.acceptanceCriteria || '');
      setLocalTestScenarios(task.testScenarios || '');
      setLocalBlockedReason(task.blockedReason || '');
      setNewSubtaskTitle('');
    }
  }, [task, isOpen]);

  const handleTitleBlur = () => {
    if (localTitle.trim() !== task.title && localTitle.trim() !== '') {
      onUpdateTask(task.id, { title: localTitle.trim() });
    } else {
      setLocalTitle(task.title); // reset if empty
    }
  };

  const handleDescriptionBlur = () => {
    if (localDescription !== (task.description || '')) {
      onUpdateTask(task.id, { description: localDescription });
    }
  };

  const handleDueDateBlur = () => {
    if (localDueDate !== (task.dueDate || '')) {
      onUpdateTask(task.id, { dueDate: localDueDate || undefined });
    }
  };

  const handleStartDateBlur = () => {
    if (localStartDate !== (task.startDate || '')) {
      onUpdateTask(task.id, { startDate: localStartDate || undefined });
    }
  };

  const handleEndDateBlur = () => {
    if (localEndDate !== (task.endDate || '')) {
      onUpdateTask(task.id, { endDate: localEndDate || undefined });
    }
  };

  const handleAcceptanceCriteriaBlur = () => {
    if (localAcceptanceCriteria !== (task.acceptanceCriteria || '')) {
      onUpdateTask(task.id, { acceptanceCriteria: localAcceptanceCriteria });
    }
  };

  const handleTestScenariosBlur = () => {
    if (localTestScenarios !== (task.testScenarios || '')) {
      onUpdateTask(task.id, { testScenarios: localTestScenarios });
    }
  };

  const handleBlockedReasonBlur = () => {
    if (localBlockedReason !== (task.blockedReason || '')) {
      onUpdateTask(task.id, { blockedReason: localBlockedReason });
    }
  };

  const handleToggleBlocked = () => {
    if (onToggleBlocked) {
      onToggleBlocked(task.id, localBlockedReason);
    } else {
      const now = new Date().toISOString();
      if (!task.blocked) {
        onUpdateTask(task.id, {
          blocked: true,
          blockedReason: localBlockedReason,
          blockedAt: now,
        });
      } else {
        const startMs = task.blockedAt ? new Date(task.blockedAt).getTime() : Date.now();
        const elapsed = Math.max(0, Date.now() - startMs);
        onUpdateTask(task.id, {
          blocked: false,
          blockedAt: undefined,
          totalBlockedMs: (task.totalBlockedMs || 0) + elapsed,
        });
      }
    }
  };

  const handleAddSubtask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubtaskTitle.trim()) return;

    const newSubtask: SubtaskModel = {
      id: uuidv4(),
      title: newSubtaskTitle.trim(),
      completed: false,
    };

    const nextSubtasks = [...(task.subtasks || []), newSubtask];
    onUpdateTask(task.id, { subtasks: nextSubtasks });
    setNewSubtaskTitle('');
  };

  const handleToggleSubtask = (subtaskId: string) => {
    const currentSubtasks = task.subtasks || [];
    const nextSubtasks = currentSubtasks.map(st => 
      st.id === subtaskId ? { ...st, completed: !st.completed } : st
    );
    onUpdateTask(task.id, { subtasks: nextSubtasks });
  };

  const handleDeleteSubtask = (subtaskId: string) => {
    const currentSubtasks = task.subtasks || [];
    const nextSubtasks = currentSubtasks.filter(st => st.id !== subtaskId);
    onUpdateTask(task.id, { subtasks: nextSubtasks });
  };

  const subtasks = task.subtasks || [];
  const completedCount = subtasks.filter(st => st.completed).length;
  const progress = subtasks.length > 0 ? Math.round((completedCount / subtasks.length) * 100) : 0;

  const blockedTimeMs = calculateTaskBlockedTimeMs(task);
  const formattedBlockedTime = formatBlockedTime(blockedTimeMs);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Detalhes da Tarefa">
      <div className="task-details">
        
        {/* Title Section */}
        <section className="td-section">
          <label htmlFor="td-title" className="td-label">Título</label>
          <input
            id="td-title"
            type="text"
            className="td-input td-title-input"
            value={localTitle}
            onChange={(e) => setLocalTitle(e.target.value)}
            onBlur={handleTitleBlur}
            onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
          />
        </section>

        {/* Dates Section (Início, Fim, Entrega) */}
        <section className="td-section">
          <div className="td-dates-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px' }}>
            <div>
              <label htmlFor="td-startDate" className="td-label">Início da Tarefa</label>
              <input
                id="td-startDate"
                type="date"
                className="td-input td-date-input"
                value={localStartDate}
                onChange={(e) => setLocalStartDate(e.target.value)}
                onBlur={handleStartDateBlur}
                aria-label="Início da Tarefa"
              />
            </div>
            <div>
              <label htmlFor="td-endDate" className="td-label">Fim da Tarefa</label>
              <input
                id="td-endDate"
                type="date"
                className="td-input td-date-input"
                value={localEndDate}
                onChange={(e) => setLocalEndDate(e.target.value)}
                onBlur={handleEndDateBlur}
                aria-label="Fim da Tarefa"
              />
            </div>
            <div>
              <label htmlFor="td-dueDate" className="td-label">Data de Entrega</label>
              <input
                id="td-dueDate"
                type="date"
                className="td-input td-date-input"
                value={localDueDate}
                onChange={(e) => setLocalDueDate(e.target.value)}
                onBlur={handleDueDateBlur}
                aria-label="Data de Entrega"
              />
            </div>
          </div>
        </section>

        {/* Impediment / Blocked Section */}
        <section className={`td-section td-blocked-section ${task.blocked ? 'is-blocked' : ''}`} data-testid="td-blocked-section">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <label htmlFor="td-blocked-reason" className="td-label" style={{ margin: 0 }}>
              Impedimento / Bloqueio
            </label>
            {blockedTimeMs > 0 && (
              <span className="td-blocked-time" style={{ fontSize: '0.8rem', color: task.blocked ? '#ef4444' : 'var(--text-secondary)' }}>
                Tempo bloqueado: <strong>{formattedBlockedTime}</strong>
              </span>
            )}
          </div>

          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: task.blocked ? '8px' : '0' }}>
            <button
              type="button"
              className={`btn ${task.blocked ? 'btn-danger' : 'btn-secondary'}`}
              onClick={handleToggleBlocked}
              style={{ fontSize: '0.85rem', padding: '6px 12px' }}
            >
              {task.blocked ? '⛔ Desbloquear Tarefa' : '🚫 Marcar como Bloqueada'}
            </button>
            {task.blocked && (
              <span style={{ fontSize: '0.8rem', color: '#ef4444', fontWeight: 600 }}>
                Tarefa atualmente impedida
              </span>
            )}
          </div>

          {task.blocked && (
            <input
              id="td-blocked-reason"
              type="text"
              className="td-input"
              placeholder="Descreva o motivo do bloqueio..."
              value={localBlockedReason}
              onChange={(e) => setLocalBlockedReason(e.target.value)}
              onBlur={handleBlockedReasonBlur}
              style={{ marginTop: '8px' }}
            />
          )}
        </section>

        {/* Description Section */}
        <section className="td-section">
          <label htmlFor="td-description" className="td-label">Descrição</label>
          <textarea
            id="td-description"
            className="td-textarea"
            placeholder="Adicione detalhes sobre a tarefa..."
            value={localDescription}
            onChange={(e) => setLocalDescription(e.target.value)}
            onBlur={handleDescriptionBlur}
            rows={4}
          />
        </section>

        {/* Acceptance Criteria Section */}
        <section className="td-section">
          <label htmlFor="td-acceptance-criteria" className="td-label">Critérios de Aceitação</label>
          <textarea
            id="td-acceptance-criteria"
            className="td-textarea"
            placeholder="Defina os critérios de aceitação para considerar a tarefa pronta..."
            value={localAcceptanceCriteria}
            onChange={(e) => setLocalAcceptanceCriteria(e.target.value)}
            onBlur={handleAcceptanceCriteriaBlur}
            rows={3}
          />
        </section>

        {/* Test Scenarios Section */}
        <section className="td-section">
          <label htmlFor="td-test-scenarios" className="td-label">Cenários de Testes</label>
          <textarea
            id="td-test-scenarios"
            className="td-textarea"
            placeholder="Descreva os cenários de testes e validações (ex: BDD Dado/Quando/Então)..."
            value={localTestScenarios}
            onChange={(e) => setLocalTestScenarios(e.target.value)}
            onBlur={handleTestScenariosBlur}
            rows={3}
          />
        </section>

        {/* Subtasks Section */}
        <section className="td-section">
          <div className="td-subtasks-header">
            <label className="td-label">Checklist</label>
            {subtasks.length > 0 && (
              <span className="td-progress-text">{progress}% ({completedCount}/{subtasks.length})</span>
            )}
          </div>
          
          {subtasks.length > 0 && (
            <div className="td-progress-bar-bg">
              <div 
                className="td-progress-bar-fill" 
                style={{ width: `${progress}%`, backgroundColor: progress === 100 ? 'var(--success-color)' : 'var(--primary-color)' }}
              />
            </div>
          )}

          <ul className="td-subtasks-list">
            {subtasks.map((st) => (
              <li key={st.id} className={`td-subtask-item ${st.completed ? 'completed' : ''}`}>
                <label className="td-subtask-label">
                  <input
                    type="checkbox"
                    checked={st.completed}
                    onChange={() => handleToggleSubtask(st.id)}
                    className="td-checkbox"
                  />
                  <span className="td-subtask-title">{st.title}</span>
                </label>
                <button
                  type="button"
                  className="td-subtask-delete"
                  onClick={() => handleDeleteSubtask(st.id)}
                  aria-label="Excluir subtarefa"
                  title="Excluir subtarefa"
                >
                  ×
                </button>
              </li>
            ))}
          </ul>

          <form onSubmit={handleAddSubtask} className="td-add-subtask-form">
            <input
              type="text"
              className="td-input td-add-subtask-input"
              placeholder="Adicionar um item..."
              value={newSubtaskTitle}
              onChange={(e) => setNewSubtaskTitle(e.target.value)}
            />
            <button type="submit" className="btn btn-secondary td-add-subtask-btn" disabled={!newSubtaskTitle.trim()}>
              Adicionar
            </button>
          </form>
        </section>

        {/* Metadata Section */}
        <section className="td-metadata">
          <div className="td-meta-item">
            <span className="td-meta-label">Criado em:</span>
            <span className="td-meta-value">{new Date(task.createdAt).toLocaleString('pt-BR')}</span>
          </div>
          {task.startedAt && (
            <div className="td-meta-item">
              <span className="td-meta-label">Iniciado em:</span>
              <span className="td-meta-value">{new Date(task.startedAt).toLocaleString('pt-BR')}</span>
            </div>
          )}
          {task.completedAt && (
            <div className="td-meta-item">
              <span className="td-meta-label">Concluído em:</span>
              <span className="td-meta-value">{new Date(task.completedAt).toLocaleString('pt-BR')}</span>
            </div>
          )}
        </section>

      </div>
    </Modal>
  );
};
