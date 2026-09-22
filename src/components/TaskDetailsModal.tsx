import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { TaskModel, SubtaskModel, BoardModel, ColumnModel, BLOCKED_TAG_KEYWORDS } from '../types/kanban';
import { TaskType, TASK_TYPE_CONFIGS, TaskRelationType } from '../types/taskTypes';
import { Team } from '../types/team';
import { calculateTaskBlockedTimeMs, formatBlockedTime } from '../utils/timeFormatters';
import { calculateInitiativeProgress } from '../utils/taskRelations';
import { TaskLinksSection } from './TaskLinksSection';
import { TaskTimeline } from './TaskTimeline';
import { TaskComment, TaskActivityLog } from '../types/taskActivity';
import { createTaskActivityEvent, AuditDescriptions } from '../utils/taskActivityLogger';
import { Modal } from './Modal';
import { useFieldEdit } from '../hooks/useFieldEdit';
import { TaskFieldActionToolbar } from './TaskFieldActionToolbar';
import './TaskDetailsModal.css';

interface TaskDetailsModalProps {
  task: TaskModel;
  isOpen: boolean;
  onClose: () => void;
  onUpdateTask: (id: string, updates: Partial<TaskModel>) => void;
  onToggleBlocked?: (id: string, reason?: string) => void;
  onAddComment?: (taskId: string, text: string, isDecision?: boolean) => void;
  onDeleteComment?: (taskId: string, commentId: string) => void;
  boardTasks?: TaskModel[];
  columns?: ColumnModel[];
  currentBoardId?: string;
  currentTeamId?: string;
  allBoards?: BoardModel[];
  teams?: Team[];
  isReadOnly?: boolean;
  autoSaveComments?: boolean;
  autoSaveDebounceMs?: number;
  onAddLink?: (
    targetTaskId: string,
    relationType: TaskRelationType,
    targetBoardId: string,
    targetTeamId: string
  ) => void;
  onRemoveLink?: (targetTaskId: string) => void;
  onNavigateToBoard?: (boardId: string) => void;
}

export const TaskDetailsModal: React.FC<TaskDetailsModalProps> = ({
  task,
  isOpen,
  onClose,
  onUpdateTask,
  onToggleBlocked,
  onAddComment,
  onDeleteComment,
  boardTasks = [],
  columns = [],
  currentBoardId = '',
  currentTeamId = '',
  allBoards = [],
  teams = [],
  isReadOnly = false,
  autoSaveComments = true,
  autoSaveDebounceMs = 800,
  onAddLink,
  onRemoveLink,
  onNavigateToBoard,
}) => {
  const [localDueDate, setLocalDueDate] = useState(task.dueDate || '');
  const [localStartDate, setLocalStartDate] = useState(task.startDate || '');
  const [localEndDate, setLocalEndDate] = useState(task.endDate || '');
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [showCloseGuard, setShowCloseGuard] = useState(false);

  const handleAddComment = (text: string, isDecision?: boolean) => {
    if (onAddComment) {
      onAddComment(task.id, text, isDecision);
    } else {
      const now = new Date().toISOString();
      const newComment: TaskComment = {
        id: crypto.randomUUID ? crypto.randomUUID() : `cmt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        taskId: task.id,
        userId: 'usr_default',
        userName: 'Rogerio Teixeira',
        text,
        isDecision: Boolean(isDecision),
        createdAt: now,
      };
      const auditEvent: TaskActivityLog = createTaskActivityEvent({
        taskId: task.id,
        eventType: 'comment_added',
        description: AuditDescriptions.commentAdded('Rogerio Teixeira'),
        user: { id: 'usr_default', name: 'Rogerio Teixeira' },
      });
      onUpdateTask(task.id, {
        comments: [...(task.comments || []), newComment],
        activityLog: [...(task.activityLog || []), auditEvent],
      });
    }
  };

  const handleDeleteComment = (commentId: string) => {
    if (onDeleteComment) {
      onDeleteComment(task.id, commentId);
    } else {
      const updatedComments = (task.comments || []).filter((c) => c.id !== commentId);
      const auditEvent: TaskActivityLog = createTaskActivityEvent({
        taskId: task.id,
        eventType: 'comment_deleted',
        description: AuditDescriptions.commentDeleted('Rogerio Teixeira'),
        user: { id: 'usr_default', name: 'Rogerio Teixeira' },
      });
      onUpdateTask(task.id, {
        comments: updatedComments,
        activityLog: [...(task.activityLog || []), auditEvent],
      });
    }
  };

  // Field Edit Hooks
  const titleEdit = useFieldEdit<string>({
    initialValue: task.title,
    onSave: (val) => {
      const trimmed = val.trim();
      if (trimmed && trimmed !== task.title) {
        onUpdateTask(task.id, { title: trimmed });
      } else {
        titleEdit.setValue(task.title);
      }
    },
    autoSave: autoSaveComments,
    debounceMs: autoSaveDebounceMs,
    isReadOnly,
  });

  const descEdit = useFieldEdit<string>({
    initialValue: task.description || '',
    onSave: (val) => onUpdateTask(task.id, { description: val }),
    autoSave: autoSaveComments,
    debounceMs: autoSaveDebounceMs,
    isReadOnly,
  });

  const acEdit = useFieldEdit<string>({
    initialValue: task.acceptanceCriteria || '',
    onSave: (val) => onUpdateTask(task.id, { acceptanceCriteria: val }),
    autoSave: autoSaveComments,
    debounceMs: autoSaveDebounceMs,
    isReadOnly,
  });

  const tsEdit = useFieldEdit<string>({
    initialValue: task.testScenarios || '',
    onSave: (val) => onUpdateTask(task.id, { testScenarios: val }),
    autoSave: autoSaveComments,
    debounceMs: autoSaveDebounceMs,
    isReadOnly,
  });

  const brEdit = useFieldEdit<string>({
    initialValue: task.blockedReason || '',
    onSave: (val) => onUpdateTask(task.id, { blockedReason: val }),
    autoSave: autoSaveComments,
    debounceMs: autoSaveDebounceMs,
    isReadOnly,
  });

  // Sync date and subtask fields when a different task is opened
  useEffect(() => {
    if (isOpen) {
      setLocalDueDate(task.dueDate || '');
      setLocalStartDate(task.startDate || '');
      setLocalEndDate(task.endDate || '');
      setNewSubtaskTitle('');
      setShowCloseGuard(false);
    }
  }, [task, isOpen]);

  const isAnyDirty =
    titleEdit.isDirty ||
    descEdit.isDirty ||
    acEdit.isDirty ||
    tsEdit.isDirty ||
    brEdit.isDirty;

  // Guarda contra fechamento involuntário de janela/aba no modo manual
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (!autoSaveComments && isAnyDirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [autoSaveComments, isAnyDirty]);

  const handleRequestClose = () => {
    if (!autoSaveComments && isAnyDirty) {
      setShowCloseGuard(true);
    } else {
      onClose();
    }
  };

  const handleSaveAndClose = () => {
    if (titleEdit.isDirty) titleEdit.saveNow();
    if (descEdit.isDirty) descEdit.saveNow();
    if (acEdit.isDirty) acEdit.saveNow();
    if (tsEdit.isDirty) tsEdit.saveNow();
    if (brEdit.isDirty) brEdit.saveNow();
    setShowCloseGuard(false);
    onClose();
  };

  const handleDiscardAndClose = () => {
    if (titleEdit.isDirty) titleEdit.discard();
    if (descEdit.isDirty) descEdit.discard();
    if (acEdit.isDirty) acEdit.discard();
    if (tsEdit.isDirty) tsEdit.discard();
    if (brEdit.isDirty) brEdit.discard();
    setShowCloseGuard(false);
    onClose();
  };

  const handleContinueEditing = () => {
    setShowCloseGuard(false);
  };

  // Intercepta atalho Ctrl+S no nível do container do modal para salvar todos os campos sujos
  const handleModalKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
      e.preventDefault();
      if (titleEdit.isDirty) titleEdit.saveNow();
      if (descEdit.isDirty) descEdit.saveNow();
      if (acEdit.isDirty) acEdit.saveNow();
      if (tsEdit.isDirty) tsEdit.saveNow();
      if (brEdit.isDirty) brEdit.saveNow();
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

  const handleToggleBlocked = () => {
    if (onToggleBlocked) {
      onToggleBlocked(task.id, brEdit.value);
    } else {
      const now = new Date().toISOString();
      if (!task.blocked) {
        const currentTags = task.tags ?? [];
        const hasTag = currentTags.some((t) =>
          (BLOCKED_TAG_KEYWORDS as readonly string[]).includes(t.trim().toLowerCase())
        );
        const nextTags = hasTag ? currentTags : [...currentTags, 'bloqueado'];
        onUpdateTask(task.id, {
          blocked: true,
          blockedReason: brEdit.value,
          blockedAt: now,
          tags: nextTags,
        });
      } else {
        const startMs = task.blockedAt ? new Date(task.blockedAt).getTime() : Date.now();
        const elapsed = Math.max(0, Date.now() - startMs);
        const currentTags = task.tags ?? [];
        const nextTags = currentTags.filter(
          (t) => !(BLOCKED_TAG_KEYWORDS as readonly string[]).includes(t.trim().toLowerCase())
        );
        onUpdateTask(task.id, {
          blocked: false,
          blockedAt: undefined,
          tags: nextTags,
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

  const initiativeProgress = React.useMemo(() => {
    if (task.type !== 'initiative' || !columns || columns.length === 0) {
      return { total: 0, completed: 0, percentage: 0 };
    }
    return calculateInitiativeProgress(task, boardTasks, columns);
  }, [task, boardTasks, columns]);

  const blockedTimeMs = calculateTaskBlockedTimeMs(task);
  const formattedBlockedTime = formatBlockedTime(blockedTimeMs);

  return (
    <Modal isOpen={isOpen} onClose={handleRequestClose} title="Detalhes da Tarefa">
      <div className="task-details" onKeyDown={handleModalKeyDown}>
        
        {/* Title Section */}
        <section className="td-section">
          <div className="td-field-header">
            <label htmlFor="td-title" className="td-label">Título</label>
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

        {/* Task Type Section */}
        <section className="td-section" data-testid="task-type-section">
          <label className="td-label">Tipo de Tarefa</label>
          <div className="task-type-selector" role="radiogroup" aria-label="Selecione o tipo da tarefa">
            {(['initiative', 'card', 'subtask'] as TaskType[]).map((typeKey) => {
              const cfg = TASK_TYPE_CONFIGS[typeKey];
              const isSelected = (task.type ?? 'card') === typeKey;
              return (
                <button
                  key={typeKey}
                  type="button"
                  className={`task-type-btn ${isSelected ? 'task-type-btn--active' : ''}`}
                  onClick={() => onUpdateTask(task.id, { type: typeKey })}
                  role="radio"
                  aria-checked={isSelected}
                  title={cfg.description}
                  style={
                    isSelected
                      ? {
                          borderColor: cfg.color,
                          color: cfg.textVar,
                          backgroundColor: cfg.bgVar,
                        }
                      : undefined
                  }
                >
                  <span aria-hidden="true" style={{ marginRight: '6px' }}>{cfg.icon}</span>
                  <span>{cfg.label}</span>
                </button>
              );
            })}
          </div>
        </section>

        {/* Initiative Progress Section */}
        {task.type === 'initiative' && (
          <section className="td-section" data-testid="td-initiative-progress">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', alignItems: 'center' }}>
              <label className="td-label" style={{ marginBottom: 0 }}>Progresso da Iniciativa</label>
              <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                {initiativeProgress.completed} de {initiativeProgress.total} tarefas concluídas ({initiativeProgress.percentage}%)
              </span>
            </div>
            <div className="task-initiative-progress__bar" style={{ height: '6px' }}>
              <div
                className="task-initiative-progress__fill"
                style={{ width: `${initiativeProgress.percentage}%` }}
              />
            </div>
          </section>
        )}

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
            <div style={{ marginTop: '8px' }}>
              <div className="td-field-header" style={{ marginBottom: '4px' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Motivo do bloqueio</span>
                <TaskFieldActionToolbar
                  status={brEdit.status}
                  isDirty={brEdit.isDirty}
                  onSave={brEdit.saveNow}
                  onDiscard={brEdit.discard}
                  isReadOnly={isReadOnly}
                  ariaLabelPrefix="do motivo do bloqueio"
                  compact
                />
              </div>
              <input
                id="td-blocked-reason"
                type="text"
                className="td-input"
                placeholder="Descreva o motivo do bloqueio..."
                value={brEdit.value}
                onChange={(e) => brEdit.setValue(e.target.value)}
                onBlur={brEdit.handleBlur}
                onKeyDown={brEdit.handleKeyDown}
              />
            </div>
          )}
        </section>

        {/* Description Section */}
        <section className="td-section">
          <div className="td-field-header">
            <label htmlFor="td-description" className="td-label">Descrição</label>
            <TaskFieldActionToolbar
              status={descEdit.status}
              isDirty={descEdit.isDirty}
              onSave={descEdit.saveNow}
              onDiscard={descEdit.discard}
              isReadOnly={isReadOnly}
              ariaLabelPrefix="da descrição"
            />
          </div>
          <textarea
            id="td-description"
            className="td-textarea"
            placeholder="Adicione uma descrição detalhada sobre a tarefa..."
            value={descEdit.value}
            onChange={(e) => descEdit.setValue(e.target.value)}
            onBlur={descEdit.handleBlur}
            onKeyDown={descEdit.handleKeyDown}
            rows={4}
          />
        </section>

        {/* Acceptance Criteria Section */}
        <section className="td-section">
          <div className="td-field-header">
            <label htmlFor="td-acceptance-criteria" className="td-label">Critérios de Aceitação</label>
            <TaskFieldActionToolbar
              status={acEdit.status}
              isDirty={acEdit.isDirty}
              onSave={acEdit.saveNow}
              onDiscard={acEdit.discard}
              isReadOnly={isReadOnly}
              ariaLabelPrefix="dos critérios de aceitação"
            />
          </div>
          <textarea
            id="td-acceptance-criteria"
            className="td-textarea"
            placeholder="Defina os critérios de aceitação para considerar a tarefa pronta..."
            value={acEdit.value}
            onChange={(e) => acEdit.setValue(e.target.value)}
            onBlur={acEdit.handleBlur}
            onKeyDown={acEdit.handleKeyDown}
            rows={3}
          />
        </section>

        {/* Test Scenarios Section */}
        <section className="td-section">
          <div className="td-field-header">
            <label htmlFor="td-test-scenarios" className="td-label">Cenários de Testes</label>
            <TaskFieldActionToolbar
              status={tsEdit.status}
              isDirty={tsEdit.isDirty}
              onSave={tsEdit.saveNow}
              onDiscard={tsEdit.discard}
              isReadOnly={isReadOnly}
              ariaLabelPrefix="dos cenários de testes"
            />
          </div>
          <textarea
            id="td-test-scenarios"
            className="td-textarea"
            placeholder="Descreva os cenários de testes e validações (ex: BDD Dado/Quando/Então)..."
            value={tsEdit.value}
            onChange={(e) => tsEdit.setValue(e.target.value)}
            onBlur={tsEdit.handleBlur}
            onKeyDown={tsEdit.handleKeyDown}
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

        {/* Task Links & Dependencies Section (Feature 024) */}
        {onAddLink && onRemoveLink && (
          <TaskLinksSection
            currentTask={task}
            currentBoardId={currentBoardId}
            currentTeamId={currentTeamId}
            boardTasks={boardTasks}
            allBoards={allBoards}
            teams={teams}
            isReadOnly={isReadOnly}
            onAddLink={onAddLink}
            onRemoveLink={onRemoveLink}
            onNavigateToBoard={onNavigateToBoard}
          />
        )}

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

        {/* Timeline, Comments & Audit Trail Section (Feature 033) */}
        <section className="td-timeline-section mt-4">
          <TaskTimeline
            taskId={task.id}
            comments={task.comments}
            activityLog={task.activityLog}
            onAddComment={handleAddComment}
            onDeleteComment={handleDeleteComment}
            isGuest={isReadOnly}
          />
        </section>

      </div>

      {/* Close Guard Dialog */}
      {showCloseGuard && (
        <div className="td-close-guard-overlay" role="alertdialog" aria-modal="true" aria-labelledby="guard-title" aria-describedby="guard-desc">
          <div className="td-close-guard-dialog">
            <div className="td-close-guard-header">
              <span className="td-close-guard-icon" aria-hidden="true">⚠️</span>
              <h3 id="guard-title" className="td-close-guard-title">Existem alterações não salvas</h3>
            </div>
            <p id="guard-desc" className="td-close-guard-desc">
              Você tem modificações pendentes nesta tarefa. O que deseja fazer antes de fechar?
            </p>
            <div className="td-close-guard-actions">
              <button
                type="button"
                className="btn btn-primary td-guard-btn-save"
                onClick={handleSaveAndClose}
              >
                Salvar e Fechar
              </button>
              <button
                type="button"
                className="btn btn-danger td-guard-btn-discard"
                onClick={handleDiscardAndClose}
              >
                Descartar Alterações
              </button>
              <button
                type="button"
                className="btn btn-secondary td-guard-btn-continue"
                onClick={handleContinueEditing}
              >
                Continuar Editando
              </button>
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
};
