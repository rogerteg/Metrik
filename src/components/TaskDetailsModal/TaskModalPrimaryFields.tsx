import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { SubtaskModel } from '../../types/kanban';
import { TaskLinksSection } from '../TaskLinksSection';
import { MikaTaskAssistant } from '../Mika/MikaTaskAssistant';
import { TaskModalPrimaryFieldsProps } from './types';

export const TaskModalPrimaryFields: React.FC<TaskModalPrimaryFieldsProps> = ({
  task,
  columns: _columns,
  boardTasks,
  allBoards,
  teams,
  currentBoardId,
  currentTeamId,
  isReadOnly,
  initiativeProgress,
  onUpdateTask,
  acEdit,
  onAddLink,
  onRemoveLink,
  onNavigateToBoard,
}) => {
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [showMikaAssistant, setShowMikaAssistant] = useState(false);

  const subtasks = task.subtasks || [];
  const completedCount = subtasks.filter((st) => st.completed).length;
  const progress = subtasks.length > 0 ? Math.round((completedCount / subtasks.length) * 100) : 0;

  const handleAddSubtask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubtaskTitle.trim()) return;

    const newSubtask: SubtaskModel = {
      id: uuidv4(),
      title: newSubtaskTitle.trim(),
      completed: false,
    };

    const nextSubtasks = [...subtasks, newSubtask];
    onUpdateTask(task.id, { subtasks: nextSubtasks });
    setNewSubtaskTitle('');
  };

  const handleToggleSubtask = (subtaskId: string) => {
    const nextSubtasks = subtasks.map((st) =>
      st.id === subtaskId ? { ...st, completed: !st.completed } : st,
    );
    onUpdateTask(task.id, { subtasks: nextSubtasks });
  };

  const handleDeleteSubtask = (subtaskId: string) => {
    const nextSubtasks = subtasks.filter((st) => st.id !== subtaskId);
    onUpdateTask(task.id, { subtasks: nextSubtasks });
  };

  return (
    <>
      {/* Initiative Progress Section */}
      {task.type === 'initiative' && (
        <section className="td-initiative-card">
          <div className="td-initiative-header">
            <span>Progresso da Iniciativa</span>
            <span className="td-initiative-progress-val">
              {initiativeProgress.completed}/{initiativeProgress.total} (
              {initiativeProgress.percentage}%)
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

      {/* Subtasks / Checklist */}
      <section className="td-checklist-card">
        <div className="td-checklist-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <label className="td-label">
              Checklist ({completedCount}/{subtasks.length})
            </label>
            <button
              type="button"
              className="mika-trigger-btn"
              style={{ fontSize: '0.75rem', padding: '0.2rem 0.6rem' }}
              onClick={() => setShowMikaAssistant((prev) => !prev)}
              title="Sugerir Subtarefas com Mika AI"
            >
              ✨ Mika AI
            </button>
          </div>
          {subtasks.length > 0 && <span className="td-initiative-progress-val">{progress}%</span>}
        </div>

        {showMikaAssistant && (
          <MikaTaskAssistant
            task={task}
            onAcceptSubtasks={(newItems) => {
              const next = [...subtasks, ...newItems];
              onUpdateTask(task.id, { subtasks: next });
            }}
            onAcceptCriteria={(criteriaText) => {
              acEdit.setValue(criteriaText);
              onUpdateTask(task.id, { acceptanceCriteria: criteriaText });
            }}
            onClose={() => setShowMikaAssistant(false)}
          />
        )}

        {subtasks.length > 0 && (
          <div className="td-progress-bar-track">
            <div className="td-progress-bar-fill" style={{ width: `${progress}%` }} />
          </div>
        )}

        <ul className="td-checklist-items">
          {subtasks.map((st) => (
            <li key={st.id} className={`td-checklist-item ${st.completed ? 'completed' : ''}`}>
              <label className="td-checklist-label">
                <input
                  type="checkbox"
                  checked={st.completed}
                  onChange={() => handleToggleSubtask(st.id)}
                  className="td-checkbox"
                  disabled={isReadOnly}
                />
                <span className="td-checklist-text">{st.title}</span>
              </label>
              {!isReadOnly && (
                <button
                  type="button"
                  className="td-checklist-delete-btn"
                  onClick={() => handleDeleteSubtask(st.id)}
                  aria-label="Excluir subtarefa"
                >
                  ✕
                </button>
              )}
            </li>
          ))}
        </ul>

        {!isReadOnly && (
          <form onSubmit={handleAddSubtask} className="td-checklist-form">
            <input
              type="text"
              className="td-input"
              placeholder="Adicionar um item..."
              value={newSubtaskTitle}
              onChange={(e) => setNewSubtaskTitle(e.target.value)}
            />
            <button type="submit" className="td-btn-add-subtask" disabled={!newSubtaskTitle.trim()}>
              Adicionar
            </button>
          </form>
        )}
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
    </>
  );
};
