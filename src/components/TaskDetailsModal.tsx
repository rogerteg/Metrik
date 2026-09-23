import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { TaskModel, SubtaskModel, BoardModel, ColumnModel } from '../types/kanban';
import { TaskRelationType } from '../types/taskTypes';
import { Team } from '../types/team';
import { calculateInitiativeProgress } from '../utils/taskRelations';
import { TaskLinksSection } from './TaskLinksSection';
import { TaskTimeline } from './TaskTimeline';
import { TaskComment, TaskActivityLog } from '../types/taskActivity';
import { createTaskActivityEvent, AuditDescriptions } from '../utils/taskActivityLogger';
import { Modal } from './Modal';
import { useFieldEdit } from '../hooks/useFieldEdit';
import { TaskFieldActionToolbar } from './TaskFieldActionToolbar';
import { TaskMetadataSidebar } from './TaskMetadataSidebar';
import { TaskActivityPanel } from './TaskActivityPanel';
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
    const nextSubtasks = currentSubtasks.map((st) =>
      st.id === subtaskId ? { ...st, completed: !st.completed } : st
    );
    onUpdateTask(task.id, { subtasks: nextSubtasks });
  };

  const handleDeleteSubtask = (subtaskId: string) => {
    const currentSubtasks = task.subtasks || [];
    const nextSubtasks = currentSubtasks.filter((st) => st.id !== subtaskId);
    onUpdateTask(task.id, { subtasks: nextSubtasks });
  };

  const subtasks = task.subtasks || [];
  const completedCount = subtasks.filter((st) => st.completed).length;
  const progress = subtasks.length > 0 ? Math.round((completedCount / subtasks.length) * 100) : 0;

  const initiativeProgress = React.useMemo(() => {
    if (task.type !== 'initiative' || !columns || columns.length === 0) {
      return { total: 0, completed: 0, percentage: 0 };
    }
    return calculateInitiativeProgress(task, boardTasks, columns);
  }, [task, boardTasks, columns]);

  const formattedActivityEntries = React.useMemo(() => {
    const entries: any[] = [];

    (task.activityLog || []).forEach((act) => {
      entries.push({
        id: act.id,
        taskId: act.taskId || task.id,
        actorName: act.userName || 'Usuário',
        type: act.eventType || 'edited',
        actionText: act.description,
        previousValue: act.fromValue,
        newValue: act.toValue,
        timestamp: act.timestamp,
      });
    });

    (task.comments || []).forEach((cmt) => {
      entries.push({
        id: cmt.id,
        taskId: cmt.taskId || task.id,
        actorName: cmt.userName || 'Usuário',
        type: 'comment',
        actionText: `${cmt.userName} comentou: ${cmt.text}`,
        newValue: cmt.text,
        timestamp: cmt.createdAt,
      });
    });

    return entries.sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }, [task.activityLog, task.comments, task.id]);

  return (
    <Modal isOpen={isOpen} onClose={handleRequestClose} title="Detalhes da Tarefa">
      <div className="task-details-redesigned" onKeyDown={handleModalKeyDown}>
        {/* Main Column (Left: ~65%) */}
        <div className="td-main-column">
          {/* Title Section */}
          <section className="td-section">
            <div className="td-section-header">
              <label htmlFor="td-title" className="td-label">
                Título
              </label>
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

          {/* Initiative Progress Section */}
          {task.type === 'initiative' && (
            <section className="td-initiative-card">
              <div className="td-initiative-header">
                <span>Progresso da Iniciativa</span>
                <span className="td-initiative-progress-val">
                  {initiativeProgress.completed}/{initiativeProgress.total} ({initiativeProgress.percentage}%)
                </span>
              </div>
              <div className="td-progress-bar-track">
                <div
                  className="td-progress-bar-fill"
                  style={{ width: `${initiativeProgress.percentage}%` }}
                />
              </div>
            </section>
          )}

          {/* Description Section */}
          <section className="td-section">
            <div className="td-section-header">
              <label htmlFor="td-description" className="td-label">
                Descrição
              </label>
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
              placeholder="Adicione uma descrição detalhada..."
              value={descEdit.value}
              onChange={(e) => descEdit.setValue(e.target.value)}
              onBlur={descEdit.handleBlur}
              onKeyDown={descEdit.handleKeyDown}
              rows={4}
            />
          </section>

          {/* Acceptance Criteria */}
          <section className="td-section">
            <div className="td-section-header">
              <label htmlFor="td-acceptance-criteria" className="td-label">
                Critérios de Aceitação
              </label>
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
              placeholder="Defina os critérios para aceitação..."
              value={acEdit.value}
              onChange={(e) => acEdit.setValue(e.target.value)}
              onBlur={acEdit.handleBlur}
              onKeyDown={acEdit.handleKeyDown}
              rows={3}
            />
          </section>

          {/* Test Scenarios */}
          <section className="td-section">
            <div className="td-section-header">
              <label htmlFor="td-test-scenarios" className="td-label">
                Cenários de Testes
              </label>
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
              placeholder="Descreva os cenários de testes..."
              value={tsEdit.value}
              onChange={(e) => tsEdit.setValue(e.target.value)}
              onBlur={tsEdit.handleBlur}
              onKeyDown={tsEdit.handleKeyDown}
              rows={3}
            />
          </section>

          {/* Subtasks / Checklist */}
          <section className="td-checklist-card">
            <div className="td-checklist-header">
              <label className="td-label">
                Checklist ({completedCount}/{subtasks.length})
              </label>
              {subtasks.length > 0 && (
                <span className="td-initiative-progress-val">{progress}%</span>
              )}
            </div>

            {subtasks.length > 0 && (
              <div className="td-progress-bar-track">
                <div
                  className="td-progress-bar-fill"
                  style={{ width: `${progress}%` }}
                />
              </div>
            )}

            <ul className="td-checklist-items">
              {subtasks.map((st) => (
                <li
                  key={st.id}
                  className={`td-checklist-item ${st.completed ? 'completed' : ''}`}
                >
                  <label className="td-checklist-label">
                    <input
                      type="checkbox"
                      checked={st.completed}
                      onChange={() => handleToggleSubtask(st.id)}
                      className="td-checkbox"
                    />
                    <span className="td-checklist-text">{st.title}</span>
                  </label>
                  <button
                    type="button"
                    className="td-checklist-delete-btn"
                    onClick={() => handleDeleteSubtask(st.id)}
                    aria-label="Excluir subtarefa"
                  >
                    ✕
                  </button>
                </li>
              ))}
            </ul>

            <form onSubmit={handleAddSubtask} className="td-checklist-form">
              <input
                type="text"
                className="td-input"
                placeholder="Adicionar um item..."
                value={newSubtaskTitle}
                onChange={(e) => setNewSubtaskTitle(e.target.value)}
              />
              <button
                type="submit"
                className="td-btn-add-subtask"
                disabled={!newSubtaskTitle.trim()}
              >
                Adicionar
              </button>
            </form>
          </section>

          {/* Task Links & Dependencies */}
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

          {/* Timeline Section */}
          <section style={{ paddingTop: 16, borderTop: '1px solid var(--border-subtle)' }}>
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

        {/* Sidebar Column (Right: ~35%) */}
        <div className="td-sidebar-column">
          <TaskMetadataSidebar
            task={task}
            columns={columns}
            isReadOnly={isReadOnly}
            onUpdateTask={onUpdateTask}
            onToggleBlocked={onToggleBlocked}
            localStartDate={localStartDate}
            setLocalStartDate={setLocalStartDate}
            handleStartDateBlur={handleStartDateBlur}
            localEndDate={localEndDate}
            setLocalEndDate={setLocalEndDate}
            handleEndDateBlur={handleEndDateBlur}
            localDueDate={localDueDate}
            setLocalDueDate={setLocalDueDate}
            handleDueDateBlur={handleDueDateBlur}
          />

          <TaskActivityPanel
            taskId={task.id}
            initialEntries={formattedActivityEntries}
            onSubmitComment={handleAddComment}
          />
        </div>
      </div>

      {/* Close Guard Dialog */}
      {showCloseGuard && (
        <div className="td-close-guard-overlay" role="alertdialog" aria-modal="true" aria-labelledby="guard-title">
          <div className="td-close-guard-dialog">
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: '1.5rem' }}>⚠️</span>
              <h3 id="guard-title" style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                Existem alterações não salvas
              </h3>
            </div>
            <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              Você possui modificações pendentes nesta tarefa. Deseja salvar antes de fechar?
            </p>
            <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleSaveAndClose}
              >
                Salvar e Fechar
              </button>
              <button
                type="button"
                className="btn btn-danger"
                onClick={handleDiscardAndClose}
              >
                Descartar
              </button>
              <button
                type="button"
                className="btn btn-secondary"
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
