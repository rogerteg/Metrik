import React, { useState, useMemo } from 'react';
import { TaskModel, BoardModel, BoardState } from '../types/kanban';
import { Team } from '../types/team';
import {
  TaskRelationType,
  TASK_RELATION_CONFIGS,
} from '../types/taskTypes';

export interface TaskLinksSectionProps {
  currentTask: TaskModel;
  currentBoardId: string;
  currentTeamId: string;
  boardTasks: TaskModel[];
  allBoards: BoardModel[];
  teams: Team[];
  isReadOnly?: boolean;
  onAddLink: (
    targetTaskId: string,
    relationType: TaskRelationType,
    targetBoardId: string,
    targetTeamId: string
  ) => void;
  onRemoveLink: (targetTaskId: string) => void;
  onNavigateToBoard?: (boardId: string) => void;
}

export const TaskLinksSection: React.FC<TaskLinksSectionProps> = ({
  currentTask,
  currentBoardId,
  currentTeamId,
  boardTasks,
  allBoards,
  teams,
  isReadOnly = false,
  onAddLink,
  onRemoveLink,
  onNavigateToBoard,
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [linkScope, setLinkScope] = useState<'local' | 'cross_squad'>('local');
  const [selectedRelation, setSelectedRelation] = useState<TaskRelationType>('relates_to');
  const [selectedTaskId, setSelectedTaskId] = useState('');
  
  // Cross-Squad state
  const [selectedTeamId, setSelectedTeamId] = useState('');
  const [selectedBoardId, setSelectedBoardId] = useState('');

  // Available local tasks for linking (excluding current task and already linked tasks)
  const availableLocalTasks = useMemo(() => {
    const linkedTaskIds = new Set((currentTask.links ?? []).map((l) => l.targetTaskId));
    return boardTasks.filter((t) => t.id !== currentTask.id && !linkedTaskIds.has(t.id));
  }, [boardTasks, currentTask]);

  // Boards belonging to selected squad in cross-squad mode
  const availableCrossBoards = useMemo(() => {
    if (!selectedTeamId) return [];
    return allBoards.filter((b) => b.teamId === selectedTeamId);
  }, [allBoards, selectedTeamId]);

  // Tasks belonging to selected board in cross-squad mode
  const availableCrossTasks = useMemo(() => {
    if (!selectedBoardId) return [];
    try {
      const raw = localStorage.getItem(`metrik-tasks-${selectedBoardId}`);
      if (!raw) return [];
      const parsed: BoardState = JSON.parse(raw);
      if (!parsed.tasks) return [];
      const tasksList: TaskModel[] = [];
      for (const colId of Object.keys(parsed.tasks)) {
        tasksList.push(...parsed.tasks[colId]);
      }
      const linkedTaskIds = new Set((currentTask.links ?? []).map((l) => l.targetTaskId));
      return tasksList.filter((t) => t.id !== currentTask.id && !linkedTaskIds.has(t.id));
    } catch {
      return [];
    }
  }, [selectedBoardId, currentTask]);

  // Helper to resolve linked task metadata (title, squad, board)
  const resolveLinkMetadata = (link: { targetTaskId: string; targetBoardId: string; targetTeamId: string }) => {
    const team = teams.find((t) => t.id === link.targetTeamId);
    const board = allBoards.find((b) => b.id === link.targetBoardId);
    
    // Check local tasks first
    let taskTitle = 'Tarefa #' + link.targetTaskId.slice(0, 8);
    const local = boardTasks.find((t) => t.id === link.targetTaskId);
    if (local) {
      taskTitle = local.title;
    } else {
      // Check cross board storage
      try {
        const raw = localStorage.getItem(`metrik-tasks-${link.targetBoardId}`);
        if (raw) {
          const parsed: BoardState = JSON.parse(raw);
          for (const colId of Object.keys(parsed.tasks || {})) {
            const found = parsed.tasks[colId].find((t) => t.id === link.targetTaskId);
            if (found) {
              taskTitle = found.title;
              break;
            }
          }
        }
      } catch {
        // Ignore read errors
      }
    }

    return {
      title: taskTitle,
      teamName: team?.name || 'Squad',
      boardName: board?.name || 'Quadro',
      isExternal: link.targetTeamId !== currentTeamId,
    };
  };

  const handleResetForm = () => {
    setIsAdding(false);
    setLinkScope('local');
    setSelectedRelation('relates_to');
    setSelectedTaskId('');
    setSelectedTeamId('');
    setSelectedBoardId('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTaskId) return;

    const targetBoard = linkScope === 'local' ? currentBoardId : selectedBoardId;
    const targetTeam = linkScope === 'local' ? currentTeamId : selectedTeamId;

    onAddLink(selectedTaskId, selectedRelation, targetBoard, targetTeam);
    handleResetForm();
  };

  const links = currentTask.links ?? [];

  return (
    <section className="td-section task-links-section" data-testid="task-links-section">
      <div className="task-links-header">
        <label className="td-label" style={{ marginBottom: 0 }}>
          Vínculos & Dependências ({links.length})
        </label>
        {!isReadOnly && !isAdding && (
          <button
            type="button"
            className="btn-add-link-trigger"
            onClick={() => setIsAdding(true)}
          >
            + Adicionar Vínculo
          </button>
        )}
      </div>

      {/* Links List */}
      <div className="task-links-list">
        {links.length === 0 ? (
          <p className="task-links-empty">Nenhum vínculo associado a esta tarefa.</p>
        ) : (
          links.map((link) => {
            const relConfig = TASK_RELATION_CONFIGS[link.relationType];
            const meta = resolveLinkMetadata(link);

            return (
              <div key={link.id} className="task-link-item" data-testid={`task-link-${link.targetTaskId}`}>
                <div className="task-link-item__left">
                  <span
                    className={`task-link-relation-badge task-link-relation-badge--${link.relationType}`}
                    title={relConfig?.label}
                  >
                    <span aria-hidden="true">{relConfig?.icon}</span>
                    <span>{relConfig?.label}</span>
                  </span>

                  <span className="task-link-target-title" title={meta.title}>
                    {meta.title}
                  </span>

                  {meta.isExternal && (
                    <span className="task-link-squad-chip" title={`Squad: ${meta.teamName} • Quadro: ${meta.boardName}`}>
                      🏢 {meta.teamName}
                    </span>
                  )}
                </div>

                <div className="task-link-item__right">
                  {onNavigateToBoard && link.targetBoardId !== currentBoardId && (
                    <button
                      type="button"
                      className="btn-link-navigate"
                      onClick={() => onNavigateToBoard(link.targetBoardId)}
                      title={`Ir para o quadro ${meta.boardName}`}
                    >
                      ↗
                    </button>
                  )}
                  {!isReadOnly && (
                    <button
                      type="button"
                      className="btn-link-remove"
                      onClick={() => onRemoveLink(link.targetTaskId)}
                      title="Remover vínculo"
                      aria-label="Remover vínculo"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add Link Form */}
      {isAdding && (
        <form className="task-add-link-form" onSubmit={handleSubmit}>
          <div className="task-link-scope-tabs">
            <button
              type="button"
              className={`link-scope-tab ${linkScope === 'local' ? 'link-scope-tab--active' : ''}`}
              onClick={() => {
                setLinkScope('local');
                setSelectedTaskId('');
              }}
            >
              Neste Quadro
            </button>
            <button
              type="button"
              className={`link-scope-tab ${linkScope === 'cross_squad' ? 'link-scope-tab--active' : ''}`}
              onClick={() => {
                setLinkScope('cross_squad');
                setSelectedTaskId('');
              }}
            >
              Outro Time / Squad 🏢
            </button>
          </div>

          <div className="task-link-fields-grid">
            {/* Relation Type Selector */}
            <div className="task-link-field">
              <label htmlFor="select-relation" className="task-link-field__label">
                Tipo de Relação
              </label>
              <select
                id="select-relation"
                className="task-link-select"
                value={selectedRelation}
                onChange={(e) => setSelectedRelation(e.target.value as TaskRelationType)}
              >
                {(Object.keys(TASK_RELATION_CONFIGS) as TaskRelationType[]).map((relKey) => (
                  <option key={relKey} value={relKey}>
                    {TASK_RELATION_CONFIGS[relKey].icon} {TASK_RELATION_CONFIGS[relKey].label}
                  </option>
                ))}
              </select>
            </div>

            {/* Scope: Local */}
            {linkScope === 'local' && (
              <div className="task-link-field">
                <label htmlFor="select-local-task" className="task-link-field__label">
                  Selecionar Tarefa
                </label>
                <select
                  id="select-local-task"
                  className="task-link-select"
                  value={selectedTaskId}
                  onChange={(e) => setSelectedTaskId(e.target.value)}
                  required
                >
                  <option value="">-- Escolha uma tarefa deste quadro --</option>
                  {availableLocalTasks.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.title}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Scope: Cross-Squad Cascading Selectors */}
            {linkScope === 'cross_squad' && (
              <>
                <div className="task-link-field">
                  <label htmlFor="select-squad" className="task-link-field__label">
                    Squad Alvo
                  </label>
                  <select
                    id="select-squad"
                    className="task-link-select"
                    value={selectedTeamId}
                    onChange={(e) => {
                      setSelectedTeamId(e.target.value);
                      setSelectedBoardId('');
                      setSelectedTaskId('');
                    }}
                    required
                  >
                    <option value="">-- Escolha a squad --</option>
                    {teams.map((team) => (
                      <option key={team.id} value={team.id}>
                        {team.name}
                      </option>
                    ))}
                  </select>
                </div>

                {selectedTeamId && (
                  <div className="task-link-field">
                    <label htmlFor="select-board" className="task-link-field__label">
                      Quadro Alvo
                    </label>
                    <select
                      id="select-board"
                      className="task-link-select"
                      value={selectedBoardId}
                      onChange={(e) => {
                        setSelectedBoardId(e.target.value);
                        setSelectedTaskId('');
                      }}
                      required
                    >
                      <option value="">-- Escolha o quadro --</option>
                      {availableCrossBoards.map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {selectedBoardId && (
                  <div className="task-link-field">
                    <label htmlFor="select-cross-task" className="task-link-field__label">
                      Tarefa Alvo
                    </label>
                    <select
                      id="select-cross-task"
                      className="task-link-select"
                      value={selectedTaskId}
                      onChange={(e) => setSelectedTaskId(e.target.value)}
                      required
                    >
                      <option value="">-- Escolha a tarefa remota --</option>
                      {availableCrossTasks.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.title}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </>
            )}
          </div>

          <div className="task-add-link-actions">
            <button
              type="button"
              className="btn-mini-cancel"
              onClick={handleResetForm}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn-mini-submit"
              disabled={!selectedTaskId}
            >
              Confirmar Vínculo
            </button>
          </div>
        </form>
      )}
    </section>
  );
};
