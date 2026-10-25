import React, { useState } from 'react';
import { isTaskStagnant } from '../types/kanban';
import { isTaskBlocked, isBlockingTag } from '../utils/taskReorder';
import {
  calculateLeadTimeMs,
  calculateCycleTimeMs,
  formatDuration,
  getDueDateStatus,
} from '../utils/timeFormatters';
import { AutoResizeTextarea } from './AutoResizeTextarea';
import { TagList } from './TagList';
import { TaskProps } from './Task/types';
import { TaskHeader } from './Task/TaskHeader';
import { TaskBadges } from './Task/TaskBadges';
import { TaskBlockerChips } from './Task/TaskBlockerChips';
import { TaskChecklistSummary } from './Task/TaskChecklistSummary';
import { TaskCardContainer } from './Task/TaskCardContainer';

export type { TaskProps };

export const Task: React.FC<TaskProps> = ({
  task,
  columnColor,
  onUpdateTitle,
  onDelete,
  onDiscardIfEmpty,
  onUpdatePriority,
  onAddTag,
  onRemoveTag,
  onToggleBlocked,
  onMoveLeft,
  onMoveRight,
  canMoveLeft = false,
  canMoveRight = false,
  onDropTask,
  isCompleted = false,
  onClick,
  onUpdateTask,
  initiativeProgress,
  pendingBlockersCount,
  autoSaveComments = true,
  autoSaveDebounceMs = 800,
  onAddComment,
  onEditComment,
  onDeleteComment,
  onAddSubtaskComment,
  onEditSubtaskComment,
  onDeleteSubtaskComment,
  currentUser = { id: 'usr_default', name: 'Rogerio Teixeira' },
  isAdmin = false,
  isReadOnly = false,
  sprintName,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isDetailEditing, setIsDetailEditing] = useState(false);

  const isBlocked = isTaskBlocked(task);
  const readOnly = isReadOnly || isBlocked;

  const handleBlur = () => {
    setIsEditing(false);
    if (!task.title || task.title.trim() === '') {
      onDiscardIfEmpty(task.id);
    }
  };

  const handleQuickUnlock = () => {
    if (onToggleBlocked) {
      onToggleBlocked(task.id);
      return;
    }
    if (!onUpdateTask) return;

    const startMs = task.blockedAt ? new Date(task.blockedAt).getTime() : Date.now();
    const elapsed = Math.max(0, Date.now() - startMs);
    const totalBlockedMs = (task.totalBlockedMs || 0) + elapsed;
    const nextTags = (task.tags ?? []).filter((tag: string) => !isBlockingTag(tag));

    onUpdateTask(task.id, {
      blocked: false,
      blockedAt: undefined,
      totalBlockedMs,
      tags: nextTags,
    });
  };

  const hasCompletedAt = isCompleted && !!task.completedAt;
  const leadTimeMs = hasCompletedAt ? calculateLeadTimeMs(task) : null;
  const cycleTimeMs = hasCompletedAt ? calculateCycleTimeMs(task) : null;
  const leadTimeStr = formatDuration(leadTimeMs);
  const cycleTimeStr = formatDuration(cycleTimeMs);

  const isStagnant = isTaskStagnant(task, isCompleted);
  const hasDueDate = !!task.dueDate;
  const dueDateStatus = hasDueDate ? getDueDateStatus(task.dueDate!, isCompleted) : null;

  return (
    <TaskCardContainer
      task={task}
      columnColor={columnColor}
      isBlocked={isBlocked}
      isStagnant={isStagnant}
      readOnly={readOnly}
      isAnyEditing={isEditing || isDetailEditing}
      canMoveLeft={canMoveLeft}
      canMoveRight={canMoveRight}
      onMoveLeft={onMoveLeft}
      onMoveRight={onMoveRight}
      onDelete={onDelete}
      onDropTask={onDropTask}
      onClick={onClick}
    >
      <TaskHeader
        task={task}
        readOnly={readOnly}
        isStagnant={isStagnant}
        isBlocked={isBlocked}
        isReadOnly={isReadOnly}
        onUpdatePriority={onUpdatePriority}
        onQuickUnlock={handleQuickUnlock}
      />

      <div
        className="task-card-content"
        onPointerDown={(e) => {
          if (isEditing || isDetailEditing) {
            e.stopPropagation();
          }
        }}
      >
        <AutoResizeTextarea
          value={task.title}
          onChange={(val) => onUpdateTitle(task.id, val)}
          onFocus={() => setIsEditing(true)}
          onBlur={handleBlur}
          placeholder="Nova tarefa..."
          aria-label="Título da tarefa"
          disabled={readOnly}
        />

        <TagList
          tags={task.tags}
          onAddTag={(tag) => onAddTag?.(task.id, tag)}
          onRemoveTag={(tag) => onRemoveTag?.(task.id, tag)}
          readOnly={readOnly}
        />

        <TaskChecklistSummary
          task={task}
          readOnly={readOnly}
          isBlocked={isBlocked}
          sprintName={sprintName}
          autoSaveComments={autoSaveComments}
          autoSaveDebounceMs={autoSaveDebounceMs}
          onUpdateTask={onUpdateTask}
          onAddComment={onAddComment}
          onEditComment={onEditComment}
          onDeleteComment={onDeleteComment}
          onAddSubtaskComment={onAddSubtaskComment}
          onEditSubtaskComment={onEditSubtaskComment}
          onDeleteSubtaskComment={onDeleteSubtaskComment}
          currentUser={currentUser}
          isAdmin={isAdmin}
          onClick={onClick}
          onEditingChange={setIsDetailEditing}
        />

        <TaskBadges
          task={task}
          hasCompletedAt={hasCompletedAt}
          leadTimeStr={leadTimeStr}
          cycleTimeStr={cycleTimeStr}
          hasDueDate={hasDueDate}
          dueDateStatus={dueDateStatus}
        />

        <TaskBlockerChips
          task={task}
          initiativeProgress={initiativeProgress}
          pendingBlockersCount={pendingBlockersCount}
        />
      </div>
    </TaskCardContainer>
  );
};
