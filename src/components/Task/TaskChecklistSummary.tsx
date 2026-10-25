import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useFieldEdit } from '../../hooks/useFieldEdit';
import { TaskFieldActionToolbar } from '../TaskFieldActionToolbar';
import { TaskChecklist } from '../TaskChecklist';
import { CommentThread } from '../CommentThread';
import { TaskChecklistSummaryProps } from './types';
import {
  DetailIcon,
  ChecklistIcon,
  DescriptionIcon,
  CriteriaIcon,
  TestIcon,
} from './TaskInlineIcons';

export const TaskChecklistSummary: React.FC<TaskChecklistSummaryProps> = ({
  task,
  readOnly,
  isBlocked,
  sprintName,
  autoSaveComments = true,
  autoSaveDebounceMs = 800,
  onUpdateTask,
  onAddComment,
  onEditComment,
  onDeleteComment,
  onAddSubtaskComment,
  onEditSubtaskComment,
  onDeleteSubtaskComment,
  currentUser,
  isAdmin,
  onClick,
  onEditingChange,
}) => {
  const [isQaExpanded, setIsQaExpanded] = useState(false);
  const [isEditingDesc, setIsEditingDesc] = useState(false);
  const [isEditingAC, setIsEditingAC] = useState(false);
  const [isEditingTS, setIsEditingTS] = useState(false);

  useEffect(() => {
    onEditingChange(isEditingDesc || isEditingAC || isEditingTS);
  }, [isEditingDesc, isEditingAC, isEditingTS, onEditingChange]);

  const acEdit = useFieldEdit({
    initialValue: task.acceptanceCriteria || '',
    onSave: (val) => onUpdateTask?.(task.id, { acceptanceCriteria: val }),
    autoSave: autoSaveComments,
    debounceMs: autoSaveDebounceMs,
    isReadOnly: !onUpdateTask || readOnly,
  });

  const tsEdit = useFieldEdit({
    initialValue: task.testScenarios || '',
    onSave: (val) => onUpdateTask?.(task.id, { testScenarios: val }),
    autoSave: autoSaveComments,
    debounceMs: autoSaveDebounceMs,
    isReadOnly: !onUpdateTask || readOnly,
  });

  const descEdit = useFieldEdit({
    initialValue: task.description || '',
    onSave: (val) => onUpdateTask?.(task.id, { description: val }),
    autoSave: autoSaveComments,
    debounceMs: autoSaveDebounceMs,
    isReadOnly: !onUpdateTask || readOnly,
  });

  const subtasks = task.subtasks || [];
  const completedSubtasks = subtasks.filter((st) => st.completed).length;
  const hasSubtasks = subtasks.length > 0;
  const comments = task.comments || [];
  const hasComments = comments.length > 0;

  const hasAcceptanceCriteria = !!(acEdit.value && acEdit.value.trim().length > 0);
  const hasTestScenarios = !!(tsEdit.value && tsEdit.value.trim().length > 0);
  const hasInlineDescription = !!(descEdit.value && descEdit.value.trim().length > 0);
  const hasAnyInlineContent =
    hasInlineDescription ||
    hasSubtasks ||
    hasAcceptanceCriteria ||
    hasTestScenarios ||
    hasComments ||
    !!sprintName ||
    !!task.estimation;

  const canEditSubtasks = !readOnly && !!onUpdateTask;
  const canCommentOnCard = !readOnly && !!onAddComment;

  const handleToggleSubtask = (subtaskId: string) => {
    if (!onUpdateTask) return;
    const nextSubtasks = subtasks.map((st) =>
      st.id === subtaskId ? { ...st, completed: !st.completed } : st,
    );
    onUpdateTask(task.id, { subtasks: nextSubtasks });
  };

  const handleRemoveSubtask = (subtaskId: string) => {
    if (!onUpdateTask) return;
    onUpdateTask(task.id, { subtasks: subtasks.filter((st) => st.id !== subtaskId) });
  };

  const handleCreateSubtask = (title: string) => {
    if (!onUpdateTask) return;
    onUpdateTask(task.id, {
      subtasks: [...subtasks, { id: uuidv4(), title, completed: false }],
    });
  };

  return (
    <div className="task-detail" data-testid="task-qa-section">
      <button
        type="button"
        className="task-qa-toggle-bar"
        onClick={() => setIsQaExpanded((prev) => !prev)}
        title="Alternar critérios de aceitação e cenários de testes"
        aria-expanded={isQaExpanded}
        aria-controls={`task-detail-fields-${task.id}`}
      >
        <span className="task-detail-toggle-label">
          <DetailIcon />
          Detalhes
        </span>
        <span
          className={`task-qa-toggle-icon ${isQaExpanded ? 'expanded' : ''}`}
          aria-hidden="true"
        >
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </span>
      </button>

      {hasAnyInlineContent && !isQaExpanded && (
        <div className="task-detail-glance">
          {hasSubtasks && (
            <span
              className="task-detail-chip"
              title={`Checklist: ${completedSubtasks} de ${subtasks.length} concluídos`}
            >
              <ChecklistIcon />
              {completedSubtasks}/{subtasks.length}
            </span>
          )}
          {hasInlineDescription && (
            <span className="task-detail-chip" title="Esta tarefa possui descrição">
              <DescriptionIcon />
              Descrição
            </span>
          )}
          {hasAcceptanceCriteria && (
            <span className="task-detail-chip" title="Esta tarefa possui critérios de aceitação">
              <CriteriaIcon />
              Critérios
            </span>
          )}
          {hasTestScenarios && (
            <span className="task-detail-chip" title="Esta tarefa possui cenários de testes">
              <TestIcon />
              Testes
            </span>
          )}
          {hasComments && (
            <span
              className="task-detail-chip"
              title={`${comments.length} comentário(s) no cartão`}
              data-testid="task-comments-chip"
            >
              💬 {comments.length}
            </span>
          )}
          {sprintName && (
            <span
              className="task-detail-chip"
              title={`Sprint: ${sprintName}`}
              data-testid="task-sprint-chip"
            >
              🏃 {sprintName}
            </span>
          )}
          {task.estimation ? (
            <span
              className="task-detail-chip"
              title={`Estimativa: ${task.estimation} pts`}
              data-testid="task-estimation-chip"
            >
              {task.estimation} pts
            </span>
          ) : null}
        </div>
      )}

      {isQaExpanded && (
        <div
          id={`task-detail-fields-${task.id}`}
          className="task-qa-fields task-detail-drawer"
          data-testid="task-qa-fields"
          onClick={(e) => e.stopPropagation()}
          onPointerDown={(e) => e.stopPropagation()}
        >
          {/* Descrição */}
          <div className="task-field-box">
            <div className="task-field-header">
              <span className="task-field-label">
                <DescriptionIcon />
                Descrição
              </span>
            </div>
            <textarea
              className="task-field-textarea"
              value={descEdit.value}
              placeholder="Adicione uma descrição..."
              aria-label="Descrição da tarefa"
              rows={2}
              onFocus={() => setIsEditingDesc(true)}
              onBlur={() => {
                setIsEditingDesc(false);
                descEdit.handleBlur();
              }}
              onChange={(e) => descEdit.setValue(e.target.value)}
              onKeyDown={descEdit.handleKeyDown}
            />
            <TaskFieldActionToolbar
              status={descEdit.status}
              isDirty={descEdit.isDirty}
              onSave={descEdit.saveNow}
              onDiscard={descEdit.discard}
              ariaLabelPrefix="da descrição"
              compact={true}
              isReadOnly={!onUpdateTask || isBlocked}
            />
          </div>

          {/* Critérios de Aceitação */}
          <div className="task-field-box">
            <div className="task-field-header">
              <span className="task-field-label">
                <CriteriaIcon />
                Critérios de Aceitação
              </span>
            </div>
            <textarea
              className="task-field-textarea"
              value={acEdit.value}
              placeholder="Critérios de aceitação..."
              aria-label="Critérios de aceitação"
              rows={2}
              onFocus={() => setIsEditingAC(true)}
              onBlur={() => {
                setIsEditingAC(false);
                acEdit.handleBlur();
              }}
              onChange={(e) => acEdit.setValue(e.target.value)}
              onKeyDown={acEdit.handleKeyDown}
            />
            <TaskFieldActionToolbar
              status={acEdit.status}
              isDirty={acEdit.isDirty}
              onSave={acEdit.saveNow}
              onDiscard={acEdit.discard}
              ariaLabelPrefix="dos critérios de aceitação"
              compact={true}
              isReadOnly={!onUpdateTask || isBlocked}
            />
          </div>

          {/* Cenários de Testes */}
          <div className="task-field-box">
            <div className="task-field-header">
              <span className="task-field-label">
                <TestIcon />
                Cenários de Testes
              </span>
            </div>
            <textarea
              className="task-field-textarea"
              value={tsEdit.value}
              placeholder="Cenários de testes..."
              aria-label="Cenários de testes"
              rows={2}
              onFocus={() => setIsEditingTS(true)}
              onBlur={() => {
                setIsEditingTS(false);
                tsEdit.handleBlur();
              }}
              onChange={(e) => tsEdit.setValue(e.target.value)}
              onKeyDown={tsEdit.handleKeyDown}
            />
            <TaskFieldActionToolbar
              status={tsEdit.status}
              isDirty={tsEdit.isDirty}
              onSave={tsEdit.saveNow}
              onDiscard={tsEdit.discard}
              ariaLabelPrefix="dos cenários de testes"
              compact={true}
              isReadOnly={!onUpdateTask || isBlocked}
            />
          </div>

          <TaskChecklist
            taskId={task.id}
            subtasks={subtasks}
            canEdit={canEditSubtasks}
            currentUser={currentUser}
            isAdmin={isAdmin}
            onToggle={handleToggleSubtask}
            onDelete={handleRemoveSubtask}
            onAdd={handleCreateSubtask}
            onAddComment={onAddSubtaskComment}
            onEditComment={onEditSubtaskComment}
            onDeleteComment={onDeleteSubtaskComment}
          />

          {(hasComments || canCommentOnCard) && (
            <div
              className="task-field-box task-detail-comments"
              data-testid="card-comments-section"
            >
              <CommentThread
                comments={task.comments}
                currentUser={currentUser}
                isReadOnly={!onAddComment}
                isAdmin={isAdmin}
                label="Comentários"
                emptyLabel="Nenhum comentário ainda."
                testIdPrefix="card-comment"
                onAdd={(text) => onAddComment?.(task.id, text)}
                onEdit={(commentId, text) => onEditComment?.(task.id, commentId, text)}
                onDelete={(commentId) => onDeleteComment?.(task.id, commentId)}
              />
            </div>
          )}

          {onClick && (
            <button
              type="button"
              className="task-detail-open-full"
              onClick={(e) => {
                e.stopPropagation();
                onClick();
              }}
            >
              Abrir detalhes completos
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="7" y1="17" x2="17" y2="7" />
                <polyline points="7 7 17 7 17 7" />
              </svg>
            </button>
          )}
        </div>
      )}
    </div>
  );
};
