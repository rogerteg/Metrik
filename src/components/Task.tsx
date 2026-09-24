import React from 'react';
import { PriorityLevel, TaskModel, isTaskStagnant, STAGNANT_BROWN_COLOR } from '../types/kanban';
import { isTaskBlocked } from '../utils/taskReorder';
import { AutoResizeTextarea } from './AutoResizeTextarea';
import { PriorityBadge } from './PriorityBadge';
import { TaskTypeBadge } from './TaskTypeBadge';
import { TagList } from './TagList';
import { ReorderOptions } from '../types/dnd';
import {
  calculateLeadTimeMs,
  calculateCycleTimeMs,
  formatDuration,
  getDueDateStatus,
  formatDateShort
} from '../utils/timeFormatters';
import { useFieldEdit } from '../hooks/useFieldEdit';
import { TaskFieldActionToolbar } from './TaskFieldActionToolbar';

export interface TaskProps {
  task: TaskModel;
  columnColor?: string;
  onUpdateTitle: (id: string, newTitle: string) => void;
  onDelete: (id: string) => void;
  onDiscardIfEmpty: (id: string) => void;
  onUpdatePriority?: (id: string, priority?: PriorityLevel) => void;
  onAddTag?: (id: string, tag: string) => void;
  onRemoveTag?: (id: string, tag: string) => void;
  onToggleBlocked?: (id: string) => void;
  onMoveLeft?: (id: string) => void;
  onMoveRight?: (id: string) => void;
  canMoveLeft?: boolean;
  canMoveRight?: boolean;
  onDropTask?: (options: ReorderOptions) => void;
  isCompleted?: boolean;
  onClick?: () => void;
  onUpdateTask?: (id: string, updates: Partial<TaskModel>) => void;
  initiativeProgress?: { total: number; completed: number; percentage: number };
  pendingBlockersCount?: number;
  /** Modo de persistência de comentários e campos textuais (padrão: true) */
  autoSaveComments?: boolean;
  /** Intervalo de debounce em ms (padrão: 800ms) */
  autoSaveDebounceMs?: number;
}

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
}) => {
  const [isDragging, setIsDragging] = React.useState(false);
  const [isEditing, setIsEditing] = React.useState(false);
  const [dropIndicator, setDropIndicator] = React.useState<'before' | 'after' | null>(null);

  const isBlocked = isTaskBlocked(task);

  const handleBlur = () => {
    setIsEditing(false);
    if (!task.title || task.title.trim() === '') {
      onDiscardIfEmpty(task.id);
    }
  };

  const handleDragStart = (e: React.DragEvent<HTMLElement>) => {
    if (isBlocked) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    setIsDragging(true);
    if (e.dataTransfer) {
      e.dataTransfer.setData('text/plain', task.id);
      e.dataTransfer.effectAllowed = 'move';
    }
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    setDropIndicator(null);
  };

  const handleDragOver = (e: React.DragEvent<HTMLElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer) {
      e.dataTransfer.dropEffect = 'move';
    }
    const rect = e.currentTarget.getBoundingClientRect();
    const midY = rect.top + rect.height / 2;
    const clientY = typeof e.clientY === 'number' ? e.clientY : midY - 1;
    const pos = clientY < midY ? 'before' : 'after';
    setDropIndicator(pos);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setDropIndicator(null);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLElement>) => {
    e.preventDefault();
    e.stopPropagation();
    const position = dropIndicator || 'before';
    setDropIndicator(null);

    const activeTaskId = e.dataTransfer ? e.dataTransfer.getData('text/plain') : '';
    if (activeTaskId && onDropTask) {
      onDropTask({
        activeTaskId,
        targetColumn: task.column,
        targetTaskId: task.id,
        position,
      });
    }
  };

  const hasCompletedAt = isCompleted && !!task.completedAt;
  const leadTimeMs = hasCompletedAt ? calculateLeadTimeMs(task) : null;
  const cycleTimeMs = hasCompletedAt ? calculateCycleTimeMs(task) : null;
  const leadTimeStr = formatDuration(leadTimeMs);
  const cycleTimeStr = formatDuration(cycleTimeMs);

  const dropClass = dropIndicator === 'before'
    ? 'task-card-drop-before'
    : dropIndicator === 'after'
    ? 'task-card-drop-after'
    : '';

  const hasDescription = !!(task.description && task.description.trim().length > 0);
  const subtasks = task.subtasks || [];
  const completedSubtasks = subtasks.filter(st => st.completed).length;
  const hasSubtasks = subtasks.length > 0;
  const hasDueDate = !!task.dueDate;
  const dueDateStatus = hasDueDate ? getDueDateStatus(task.dueDate!, isCompleted) : null;

  const isStagnant = isTaskStagnant(task, isCompleted);
  const effectiveCardColor = isStagnant ? STAGNANT_BROWN_COLOR : columnColor;

  const acEdit = useFieldEdit({
    initialValue: task.acceptanceCriteria || '',
    onSave: (val) => onUpdateTask?.(task.id, { acceptanceCriteria: val }),
    autoSave: autoSaveComments,
    debounceMs: autoSaveDebounceMs,
    isReadOnly: !onUpdateTask || isBlocked,
  });

  const tsEdit = useFieldEdit({
    initialValue: task.testScenarios || '',
    onSave: (val) => onUpdateTask?.(task.id, { testScenarios: val }),
    autoSave: autoSaveComments,
    debounceMs: autoSaveDebounceMs,
    isReadOnly: !onUpdateTask || isBlocked,
  });

  const hasAcceptanceCriteria = !!(acEdit.value && acEdit.value.trim().length > 0);
  const hasTestScenarios = !!(tsEdit.value && tsEdit.value.trim().length > 0);

  const [isQaExpanded, setIsQaExpanded] = React.useState(false);
  const [isEditingAC, setIsEditingAC] = React.useState(false);
  const [isEditingTS, setIsEditingTS] = React.useState(false);

  return (
    <article
      className={`task-card ${isDragging ? 'task-card-dragging' : ''} ${isBlocked ? 'task-card-blocked task-card-blocked-locked' : ''} ${isStagnant ? 'task-card-stagnant' : ''} ${dropClass}`}
      id={`task-${task.id}`}
      aria-label={`Cartão de tarefa: ${task.title || 'Sem título'}`}
      aria-disabled={isBlocked ? 'true' : undefined}
      style={
        effectiveCardColor && !isBlocked
          ? {
              borderLeft: `4px solid ${effectiveCardColor}`,
            }
          : undefined
      }
      draggable={!isEditing && !isEditingAC && !isEditingTS && !isBlocked}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={(e) => {
        if (
          isEditing ||
          isEditingAC ||
          isEditingTS ||
          (e.target as HTMLElement).closest('.btn-nav-step') ||
          (e.target as HTMLElement).closest('.btn-delete-task') ||
          (e.target as HTMLElement).closest('.priority-badge-container') ||
          (e.target as HTMLElement).closest('.tag-item-remove') ||
          (e.target as HTMLElement).closest('.task-qa-toggle-bar') ||
          (e.target as HTMLElement).closest('.task-field-box') ||
          (e.target as HTMLElement).closest('.task-blocked-badge')
        ) {
          return;
        }
        if (onClick) {
          onClick();
        }
      }}
    >
      <div
        className="task-card-header"
        onPointerDown={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
          <TaskTypeBadge type={task.type} />
          <PriorityBadge
            priority={task.priority}
            onChange={(newPriority) => onUpdatePriority?.(task.id, newPriority)}
          />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          {isStagnant && !isBlocked && (
            <span
              className="task-stagnant-badge"
              title="Cartão sem movimentação há mais de 3 dias no board"
              data-testid="task-stagnant-badge"
            >
              ⏳ Parado
            </span>
          )}
          {isBlocked && (
            <span
              className="task-blocked-badge task-card-blocked-badge-clickable"
              title={task.blockedReason ? `Bloqueado: ${task.blockedReason}` : 'Cartão bloqueado: clique para retirar a etiqueta de bloqueio'}
              data-testid="task-blocked-badge"
              role="button"
              tabIndex={0}
              onClick={(e) => {
                e.stopPropagation();
                if (onToggleBlocked) {
                  onToggleBlocked(task.id);
                } else if (onUpdateTask) {
                  onUpdateTask(task.id, { blocked: false, blockedAt: undefined });
                }
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.stopPropagation();
                  e.preventDefault();
                  if (onToggleBlocked) {
                    onToggleBlocked(task.id);
                  } else if (onUpdateTask) {
                    onUpdateTask(task.id, { blocked: false, blockedAt: undefined });
                  }
                }
              }}
            >
              ⛔ Bloqueado
            </span>
          )}
        </div>
      </div>

      <div
        className="task-card-content"
        onPointerDown={(e) => {
          // Isola seleção de texto do drag
          if (isEditing || isEditingAC || isEditingTS) {
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
        />

        <TagList
          tags={task.tags}
          onAddTag={(tag) => onAddTag?.(task.id, tag)}
          onRemoveTag={(tag) => onRemoveTag?.(task.id, tag)}
        />

        {/* Seção de Engenharia & Qualidade: Critérios de Aceitação e Cenários de Testes (Resumo Compacto por Padrão) */}
        <div className="task-qa-section" data-testid="task-qa-section">
          <div
            className="task-qa-toggle-bar"
            onClick={() => setIsQaExpanded((prev) => !prev)}
            title="Alternar critérios de aceitação e cenários de testes"
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                setIsQaExpanded((prev) => !prev);
              }
            }}
          >
            <div className="task-qa-summary">
              <span className={`task-qa-summary-item ${hasAcceptanceCriteria ? 'has-content' : ''}`}>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 11 12 14 22 4"></polyline>
                  <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
                </svg>
                Critérios
              </span>
              <span className={`task-qa-summary-item ${hasTestScenarios ? 'has-content' : ''}`}>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                </svg>
                Testes
              </span>
            </div>
            <span className={`task-qa-toggle-icon ${isQaExpanded ? 'expanded' : ''}`} aria-hidden="true">
              ▼
            </span>
          </div>

          {isQaExpanded && (
            <div className="task-qa-fields" data-testid="task-qa-fields">
              <div className="task-field-box">
                <div className="task-field-header">
                  <span className="task-field-label">
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="9 11 12 14 22 4"></polyline>
                      <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
                    </svg>
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

              <div className="task-field-box">
                <div className="task-field-header">
                  <span className="task-field-label">
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                      <polyline points="14 2 14 8 20 8"></polyline>
                      <line x1="16" y1="13" x2="8" y2="13"></line>
                      <line x1="16" y1="17" x2="8" y2="17"></line>
                      <polyline points="10 9 9 9 8 9"></polyline>
                    </svg>
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
            </div>
          )}
        </div>

        {(hasDescription || hasSubtasks || hasDueDate || task.startDate || task.endDate) && (
          <div className="task-indicators" aria-label="Indicadores da tarefa">
            {task.startDate && (
              <span
                className="task-indicator-badge date-start-badge"
                title={`Início da tarefa: ${formatDateShort(task.startDate)}`}
              >
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '3px' }}>
                  <circle cx="12" cy="12" r="10"></circle>
                  <polyline points="12 6 12 12 16 14"></polyline>
                </svg>
                Início: {formatDateShort(task.startDate)}
              </span>
            )}
            {task.endDate && (
              <span
                className="task-indicator-badge date-end-badge"
                title={`Fim da tarefa: ${formatDateShort(task.endDate)}`}
              >
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '3px' }}>
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="16" y1="2" x2="16" y2="6"></line>
                  <line x1="8" y1="2" x2="8" y2="6"></line>
                  <line x1="3" y1="10" x2="21" y2="10"></line>
                </svg>
                Fim: {formatDateShort(task.endDate)}
              </span>
            )}
            {hasDueDate && (
              <span 
                className={`task-indicator-badge due-date-${dueDateStatus}`} 
                title={`Data de entrega: ${formatDateShort(task.dueDate!)}`}
              >
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '3px' }}>
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="16" y1="2" x2="16" y2="6"></line>
                  <line x1="8" y1="2" x2="8" y2="6"></line>
                  <line x1="3" y1="10" x2="21" y2="10"></line>
                </svg>
                {formatDateShort(task.dueDate!)}
              </span>
            )}
            {hasDescription && (
              <span className="task-indicator-badge" title="Esta tarefa possui uma descrição">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="21" y1="10" x2="3" y2="10"></line>
                  <line x1="21" y1="6" x2="3" y2="6"></line>
                  <line x1="21" y1="14" x2="3" y2="14"></line>
                  <line x1="21" y1="18" x2="3" y2="18"></line>
                </svg>
              </span>
            )}
            {hasSubtasks && (
              <span className="task-indicator-badge" title={`${completedSubtasks} de ${subtasks.length} subtarefas concluídas`}>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '3px' }}>
                  <polyline points="9 11 12 14 22 4"></polyline>
                  <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
                </svg>
                {completedSubtasks}/{subtasks.length}
              </span>
            )}
          </div>
        )}

        {task.type === 'initiative' && initiativeProgress && initiativeProgress.total > 0 && (
          <div className="task-initiative-progress" data-testid="task-initiative-progress">
            <div className="task-initiative-progress__label">
              <span>Progresso</span>
              <span>{initiativeProgress.completed}/{initiativeProgress.total} ({initiativeProgress.percentage}%)</span>
            </div>
            <div className="task-initiative-progress__bar">
              <div
                className="task-initiative-progress__fill"
                style={{ width: `${initiativeProgress.percentage}%` }}
              />
            </div>
          </div>
        )}

        {task.links && task.links.length > 0 && (
          <div className="task-links-summary-row" data-testid="task-links-summary">
            <span
              className="task-links-counter-badge"
              title={`${task.links.length} ${task.links.length === 1 ? 'vínculo associado' : 'vínculos associados'}`}
            >
              🔗 {task.links.length} {task.links.length === 1 ? 'vínculo' : 'vínculos'}
            </span>
            {task.links.some(l => l.targetTeamId && l.targetTeamId !== '') && (
              <span className="task-cross-squad-chip" title="Possui dependência com outra squad/time">
                🏢 Cross-Squad
              </span>
            )}
            {pendingBlockersCount !== undefined && pendingBlockersCount > 0 && (
              <span
                className="task-blocked-dependency-chip"
                title={`${pendingBlockersCount} ${pendingBlockersCount === 1 ? 'dependência pendente' : 'dependências pendentes'}`}
                data-testid="task-pending-blocker-chip"
              >
                🔒 {pendingBlockersCount} {pendingBlockersCount === 1 ? 'bloqueador pendente' : 'bloqueadores pendentes'}
              </span>
            )}
          </div>
        )}

        {hasCompletedAt && (
          <div className="task-metrics-badges" aria-label="Métricas de fluxo do cartão">
            <span
              className="badge-metric-time badge-lead-time"
              title="Lead Time: Tempo total decorrido da criação até a conclusão"
            >
              Lead: {leadTimeStr}
            </span>
            <span
              className="badge-metric-time badge-cycle-time"
              title="Cycle Time: Tempo de processamento efetivo do início até a conclusão"
            >
              Cycle: {cycleTimeStr}
            </span>
          </div>
        )}
      </div>

      <footer
        className="task-card-footer"
        onPointerDown={(e) => e.stopPropagation()}
      >
        <div className="task-nav-buttons">
          {!isBlocked && canMoveLeft && onMoveLeft && (
            <button
              type="button"
              className="btn-nav-step"
              onClick={() => onMoveLeft(task.id)}
              aria-label="Mover para coluna anterior"
              title="Mover para coluna anterior"
            >
              ←
            </button>
          )}
          {!isBlocked && canMoveRight && onMoveRight && (
            <button
              type="button"
              className="btn-nav-step"
              onClick={() => onMoveRight(task.id)}
              aria-label="Mover para próxima coluna"
              title="Mover para próxima coluna"
            >
              →
            </button>
          )}
        </div>

        <button
          type="button"
          className="btn-delete-task"
          onClick={() => onDelete(task.id)}
          aria-label="Excluir tarefa"
          title="Excluir tarefa"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            <line x1="10" y1="11" x2="10" y2="17" />
            <line x1="14" y1="11" x2="14" y2="17" />
          </svg>
        </button>
      </footer>
    </article>
  );
};
