/**
 * Metrik — Lista de Cartões do Escopo de Previsão de Backlog & Épicos
 * Feature: 056-monte-carlo-backlog-forecast
 *
 * Exibe as tarefas do escopo selecionado, contadores de progresso,
 * checkboxes de inclusão/exclusão e selos de SLE dinâmico.
 */

import React from 'react';
import { TaskModel } from '../../types/kanban';
import { CardSlePrediction } from '../../types/sle';
import { TaskSleBadge } from '../Task/TaskSleBadge';

export interface ForecastScopeCardListProps {
  tasks: TaskModel[];
  selectedTaskIds: string[];
  onToggleTask: (taskId: string) => void;
  onSelectAll: () => void;
  onClearSelection: () => void;
  slePredictions?: Record<string, CardSlePrediction>;
}

export const ForecastScopeCardList: React.FC<ForecastScopeCardListProps> = ({
  tasks,
  selectedTaskIds,
  onToggleTask,
  onSelectAll,
  onClearSelection,
  slePredictions,
}) => {
  const completedTasks = tasks.filter((t) => Boolean(t.completedAt));
  const pendingTasks = tasks.filter((t) => !t.completedAt);
  const selectedCount = selectedTaskIds.length;
  const pendingCount = pendingTasks.length;

  return (
    <div className="scope-cards-container" data-testid="scope-cards-container">
      <div className="scope-cards-header">
        <div>
          <h4 style={{ margin: 0, fontSize: '0.9375rem', fontWeight: 600 }}>
            Itens do Escopo ({completedTasks.length} concluídos, {selectedCount}/{pendingCount}{' '}
            simulados)
          </h4>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary, #94a3b8)' }}>
            Marque ou desmarque tarefas pendentes para simular cenários de contingência
          </span>
        </div>
        <div className="scope-cards-actions">
          <button
            type="button"
            className="scope-action-btn"
            onClick={onSelectAll}
            disabled={pendingCount === 0 || selectedCount === pendingCount}
            data-testid="scope-btn-select-all"
          >
            Selecionar Todas
          </button>
          <button
            type="button"
            className="scope-action-btn"
            onClick={onClearSelection}
            disabled={pendingCount === 0 || selectedCount === 0}
            data-testid="scope-btn-clear-selection"
          >
            Desmarcar Todas
          </button>
        </div>
      </div>

      <div className="scope-cards-list" data-testid="scope-cards-list">
        {tasks.length === 0 ? (
          <div
            style={{
              padding: '1rem',
              textAlign: 'center',
              color: 'var(--text-secondary, #94a3b8)',
            }}
          >
            Nenhuma tarefa encontrada para este escopo.
          </div>
        ) : (
          tasks.map((task) => {
            const isCompleted = Boolean(task.completedAt);
            const isSelected = selectedTaskIds.includes(task.id);
            const prediction = slePredictions?.[task.id];
            const hasSleAlert = Boolean(prediction && prediction.riskLevel !== 'normal');

            return (
              <div
                key={task.id}
                className={`scope-card-item ${isCompleted ? 'is-completed' : ''}`}
                data-testid={`scope-card-${task.id}`}
              >
                <input
                  type="checkbox"
                  id={`scope-task-${task.id}`}
                  checked={isCompleted ? true : isSelected}
                  disabled={isCompleted}
                  onChange={() => !isCompleted && onToggleTask(task.id)}
                  aria-label={`Incluir ${task.title} na simulação`}
                />
                <label
                  htmlFor={`scope-task-${task.id}`}
                  className="scope-card-title"
                  style={{ cursor: isCompleted ? 'default' : 'pointer' }}
                >
                  {task.title}
                </label>

                {isCompleted ? (
                  <span
                    style={{
                      fontSize: '0.6875rem',
                      background: 'rgba(52, 211, 153, 0.15)',
                      color: '#34d399',
                      padding: '0.125rem 0.4rem',
                      borderRadius: '0.25rem',
                    }}
                  >
                    Concluída
                  </span>
                ) : (
                  hasSleAlert && (
                    <TaskSleBadge prediction={prediction} className="scope-task-sle-badge" />
                  )
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
