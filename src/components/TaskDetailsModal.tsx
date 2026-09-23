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
      <div
        className="task-details-redesigned flex flex-col lg:flex-row gap-6 p-4 text-slate-200 bg-slate-900/90 backdrop-blur-md rounded-2xl border border-slate-800"
        onKeyDown={handleModalKeyDown}
      >
        {/* Main Column (Left: ~65%) */}
        <div className="w-full lg:w-[65%] space-y-6">
          
          {/* Title Section */}
          <section className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label htmlFor="td-title" className="text-xs font-bold uppercase tracking-wider text-slate-400">
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
              className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3.5 py-2.5 text-base font-semibold text-slate-100 focus:outline-none focus:border-cyan-500 transition-colors"
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
            <section className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80 space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-slate-300">Progresso da Iniciativa</span>
                <span className="font-mono text-cyan-300">
                  {initiativeProgress.completed}/{initiativeProgress.total} ({initiativeProgress.percentage}%)
                </span>
              </div>
              <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-cyan-500 h-full transition-all duration-300"
                  style={{ width: `${initiativeProgress.percentage}%` }}
                />
              </div>
            </section>
          )}

          {/* Description Section */}
          <section className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label htmlFor="td-description" className="text-xs font-bold uppercase tracking-wider text-slate-400">
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
              className="w-full bg-slate-950/80 border border-slate-800 rounded-xl p-3 text-sm text-slate-300 leading-relaxed focus:outline-none focus:border-cyan-500 transition-colors"
              placeholder="Adicione uma descrição detalhada..."
              value={descEdit.value}
              onChange={(e) => descEdit.setValue(e.target.value)}
              onBlur={descEdit.handleBlur}
              onKeyDown={descEdit.handleKeyDown}
              rows={4}
            />
          </section>

          {/* Acceptance Criteria */}
          <section className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label htmlFor="td-acceptance-criteria" className="text-xs font-bold uppercase tracking-wider text-slate-400">
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
              className="w-full bg-slate-950/80 border border-slate-800 rounded-xl p-3 text-sm text-slate-300 leading-relaxed focus:outline-none focus:border-cyan-500 transition-colors"
              placeholder="Defina os critérios para aceitação..."
              value={acEdit.value}
              onChange={(e) => acEdit.setValue(e.target.value)}
              onBlur={acEdit.handleBlur}
              onKeyDown={acEdit.handleKeyDown}
              rows={3}
            />
          </section>

          {/* Test Scenarios */}
          <section className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label htmlFor="td-test-scenarios" className="text-xs font-bold uppercase tracking-wider text-slate-400">
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
              className="w-full bg-slate-950/80 border border-slate-800 rounded-xl p-3 text-sm text-slate-300 leading-relaxed focus:outline-none focus:border-cyan-500 transition-colors"
              placeholder="Descreva os cenários de testes..."
              value={tsEdit.value}
              onChange={(e) => tsEdit.setValue(e.target.value)}
              onBlur={tsEdit.handleBlur}
              onKeyDown={tsEdit.handleKeyDown}
              rows={3}
            />
          </section>

          {/* Subtasks / Checklist */}
          <section className="space-y-3 bg-slate-950/40 p-4 rounded-xl border border-slate-800/80">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Checklist ({completedCount}/{subtasks.length})
              </label>
              {subtasks.length > 0 && (
                <span className="text-xs font-mono text-slate-300">{progress}%</span>
              )}
            </div>

            {subtasks.length > 0 && (
              <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-500 h-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            )}

            <ul className="space-y-2">
              {subtasks.map((st) => (
                <li
                  key={st.id}
                  className={`flex items-center justify-between p-2 rounded-lg bg-slate-900/60 border border-slate-800/60 ${
                    st.completed ? 'opacity-60 line-through' : ''
                  }`}
                >
                  <label className="flex items-center gap-2.5 cursor-pointer text-xs text-slate-200">
                    <input
                      type="checkbox"
                      checked={st.completed}
                      onChange={() => handleToggleSubtask(st.id)}
                      className="rounded border-slate-700 text-cyan-500 focus:ring-cyan-500 bg-slate-950"
                    />
                    <span>{st.title}</span>
                  </label>
                  <button
                    type="button"
                    className="text-slate-500 hover:text-rose-400 text-xs px-1.5 py-0.5"
                    onClick={() => handleDeleteSubtask(st.id)}
                    aria-label="Excluir subtarefa"
                  >
                    ✕
                  </button>
                </li>
              ))}
            </ul>

            <form onSubmit={handleAddSubtask} className="flex gap-2">
              <input
                type="text"
                className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                placeholder="Adicionar um item..."
                value={newSubtaskTitle}
                onChange={(e) => setNewSubtaskTitle(e.target.value)}
              />
              <button
                type="submit"
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold disabled:opacity-50"
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
          <section className="pt-4 border-t border-slate-800/80">
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
        <div className="w-full lg:w-[35%] flex flex-col gap-4">
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
          <div className="td-close-guard-dialog bg-slate-900 border border-amber-500/60 p-6 rounded-2xl shadow-2xl max-w-md w-full space-y-4">
            <div className="flex items-center gap-3">
              <span className="text-amber-400 text-2xl">⚠️</span>
              <h3 id="guard-title" className="text-base font-bold text-slate-100">
                Existem alterações não salvas
              </h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Você possui modificações pendentes nesta tarefa. Deseja salvar antes de fechar?
            </p>
            <div className="flex flex-col sm:flex-row gap-2 pt-2">
              <button
                type="button"
                className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-semibold"
                onClick={handleSaveAndClose}
              >
                Salvar e Fechar
              </button>
              <button
                type="button"
                className="px-4 py-2 bg-rose-950/80 hover:bg-rose-900/80 text-rose-200 border border-rose-800 rounded-lg text-xs font-semibold"
                onClick={handleDiscardAndClose}
              >
                Descartar
              </button>
              <button
                type="button"
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold"
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
