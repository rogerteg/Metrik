import React, { useState, useEffect, useMemo } from 'react';
import { TaskModel, BoardModel, ColumnModel, SprintModel } from '../types/kanban';
import { TaskRelationType } from '../types/taskTypes';
import { Team, User } from '../types/team';
import { calculateInitiativeProgress, getPendingBlockers } from '../utils/taskRelations';
import { getDueDateStatus } from '../utils/timeFormatters';
import { Modal } from './Modal';
import { useFieldEdit } from '../hooks/useFieldEdit';
import { TaskMetadataSidebar } from './TaskMetadataSidebar';
import { TaskDetailTab } from './TaskDetailsModal/types';
import { TaskModalHeader } from './TaskDetailsModal/TaskModalHeader';
import { TaskModalPrimaryFields } from './TaskDetailsModal/TaskModalPrimaryFields';
import { TaskModalDescription } from './TaskDetailsModal/TaskModalDescription';
import { TaskModalActivityTab } from './TaskDetailsModal/TaskModalActivityTab';
import { TaskModalCloseGuard } from './TaskDetailsModal/TaskModalCloseGuard';
import './TaskDetailsModal.css';

export interface TaskDetailsModalProps {
  task: TaskModel;
  isOpen: boolean;
  onClose: () => void;
  onUpdateTask: (id: string, updates: Partial<TaskModel>) => void;
  onToggleBlocked?: (id: string, reason?: string) => void;
  onAddComment?: (taskId: string, text: string, isDecision?: boolean) => void;
  onDeleteComment?: (taskId: string, commentId: string) => void;
  onEditComment?: (taskId: string, commentId: string, text: string) => void;
  currentUserId?: string;
  sprints?: SprintModel[];
  onSetTaskSprint?: (taskId: string, sprintId: string | null) => void;
  boardTasks?: TaskModel[];
  columns?: ColumnModel[];
  currentBoardId?: string;
  currentTeamId?: string;
  allBoards?: BoardModel[];
  teams?: Team[];
  users?: User[];
  isReadOnly?: boolean;
  autoSaveComments?: boolean;
  autoSaveDebounceMs?: number;
  onAddLink?: (
    targetTaskId: string,
    relationType: TaskRelationType,
    targetBoardId: string,
    targetTeamId: string,
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
  onEditComment,
  currentUserId,
  sprints,
  onSetTaskSprint,
  boardTasks = [],
  columns = [],
  currentBoardId = '',
  currentTeamId = '',
  allBoards = [],
  teams = [],
  users = [],
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
  const [showCloseGuard, setShowCloseGuard] = useState(false);
  const [activeTab, setActiveTab] = useState<TaskDetailTab>('overview');

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

  const editFields = useMemo(
    () => [titleEdit, descEdit, acEdit, tsEdit, brEdit],
    [titleEdit, descEdit, acEdit, tsEdit, brEdit],
  );

  useEffect(() => {
    if (isOpen) {
      setLocalDueDate(task.dueDate || '');
      setLocalStartDate(task.startDate || '');
      setLocalEndDate(task.endDate || '');
      setShowCloseGuard(false);
      setActiveTab('overview');
    }
  }, [task, isOpen]);

  const isAnyDirty = editFields.some((f) => f.isDirty);

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

  const saveAllDirty = () => editFields.forEach((f) => f.isDirty && f.saveNow());
  const discardAllDirty = () => editFields.forEach((f) => f.isDirty && f.discard());

  const handleRequestClose = () => {
    if (!autoSaveComments && isAnyDirty) {
      setShowCloseGuard(true);
    } else {
      onClose();
    }
  };

  const handleSaveAndClose = () => {
    saveAllDirty();
    setShowCloseGuard(false);
    onClose();
  };

  const handleDiscardAndClose = () => {
    discardAllDirty();
    setShowCloseGuard(false);
    onClose();
  };

  const handleModalKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
      e.preventDefault();
      saveAllDirty();
    }
  };

  const currentColumn = columns.find((c) => c.id === task.column);
  const currentBoard = allBoards.find((b) => b.id === currentBoardId);
  const isCompletedColumn = currentColumn?.category === 'done';
  const dueDateStatus = task.dueDate ? getDueDateStatus(task.dueDate, isCompletedColumn) : null;

  const initiativeProgress = useMemo(() => {
    if (task.type !== 'initiative' || !columns || columns.length === 0) {
      return { total: 0, completed: 0, percentage: 0 };
    }
    return calculateInitiativeProgress(task, boardTasks, columns);
  }, [task, boardTasks, columns]);

  const pendingBlockers = useMemo(
    () =>
      task.links && task.links.length > 0 ? getPendingBlockers(task, boardTasks, columns) : [],
    [task, boardTasks, columns],
  );

  const totalBlockedMs = task.totalBlockedMs || 0;
  const activityCount = (task.comments || []).length + (task.activityLog || []).length;

  return (
    <Modal isOpen={isOpen} onClose={handleRequestClose} title="Detalhes da Tarefa">
      <div className="task-details-redesigned" onKeyDown={handleModalKeyDown}>
        <div className="td-main-column">
          <TaskModalHeader
            task={task}
            currentBoard={currentBoard}
            currentColumn={currentColumn}
            dueDateStatus={dueDateStatus}
            pendingBlockersCount={pendingBlockers.length}
            titleEdit={titleEdit}
            isReadOnly={isReadOnly}
          />

          <TaskModalActivityTab
            task={task}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            activityCount={activityCount}
            currentUserId={currentUserId}
            isReadOnly={isReadOnly}
            currentColumnTitle={currentColumn?.title}
            pendingBlockersCount={pendingBlockers.length}
            initiativeProgress={initiativeProgress}
            totalBlockedMs={totalBlockedMs}
            onUpdateTask={onUpdateTask}
            onAddComment={onAddComment}
            onDeleteComment={onDeleteComment}
            onEditComment={onEditComment}
          />

          {activeTab === 'overview' && (
            <div className="td-tabpanel" role="tabpanel" aria-label="Visão Geral">
              <TaskModalDescription
                task={task}
                descEdit={descEdit}
                acEdit={acEdit}
                tsEdit={tsEdit}
                isReadOnly={isReadOnly}
              />

              <TaskModalPrimaryFields
                task={task}
                columns={columns}
                boardTasks={boardTasks}
                allBoards={allBoards}
                teams={teams}
                currentBoardId={currentBoardId}
                currentTeamId={currentTeamId}
                isReadOnly={isReadOnly}
                initiativeProgress={initiativeProgress}
                onUpdateTask={onUpdateTask}
                acEdit={acEdit}
                onAddLink={onAddLink}
                onRemoveLink={onRemoveLink}
                onNavigateToBoard={onNavigateToBoard}
              />
            </div>
          )}
        </div>

        <div className="td-sidebar-column">
          <TaskMetadataSidebar
            task={task}
            columns={columns}
            users={users}
            sprints={sprints}
            onSetSprint={onSetTaskSprint}
            isReadOnly={isReadOnly}
            onUpdateTask={onUpdateTask}
            onToggleBlocked={onToggleBlocked}
            localStartDate={localStartDate}
            setLocalStartDate={setLocalStartDate}
            handleStartDateBlur={() => {
              if (localStartDate !== (task.startDate || '')) {
                onUpdateTask(task.id, { startDate: localStartDate || undefined });
              }
            }}
            localEndDate={localEndDate}
            setLocalEndDate={setLocalEndDate}
            handleEndDateBlur={() => {
              if (localEndDate !== (task.endDate || '')) {
                onUpdateTask(task.id, { endDate: localEndDate || undefined });
              }
            }}
            localDueDate={localDueDate}
            setLocalDueDate={setLocalDueDate}
            handleDueDateBlur={() => {
              if (localDueDate !== (task.dueDate || '')) {
                onUpdateTask(task.id, { dueDate: localDueDate || undefined });
              }
            }}
          />
        </div>
      </div>

      {showCloseGuard && (
        <TaskModalCloseGuard
          onSaveAndClose={handleSaveAndClose}
          onDiscardAndClose={handleDiscardAndClose}
          onContinueEditing={() => setShowCloseGuard(false)}
        />
      )}
    </Modal>
  );
};
