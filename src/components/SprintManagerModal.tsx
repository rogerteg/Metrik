import React from 'react';
import { Modal } from './Modal';
import { SprintBurndownChart } from './SprintBurndownChart';
import { SprintModel, TaskModel } from '../types/kanban';
import {
  orderSprints,
  getSprintTasks,
  calculateSprintProgress,
  calculateSprintPoints,
} from '../utils/sprintMetrics';
import { buildSprintBurndown, buildSprintBurnup } from '../utils/sprintBurndown';

export interface SprintManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  sprints?: SprintModel[];
  activeSprintId?: string | null;
  tasks: TaskModel[];
  isReadOnly?: boolean;
  onAdd: (input: { name: string; goal?: string; startDate?: string; endDate?: string }) => void;
  onUpdate: (
    id: string,
    updates: Partial<Pick<SprintModel, 'name' | 'goal' | 'startDate' | 'endDate'>>,
  ) => void;
  onDelete: (id: string) => void;
  onStart: (id: string) => void;
  onComplete: (id: string) => void;
}

interface DraftState {
  name: string;
  goal: string;
  startDate: string;
  endDate: string;
}

const emptyDraft: DraftState = { name: '', goal: '', startDate: '', endDate: '' };

const statusLabel: Record<SprintModel['status'], string> = {
  planned: 'Planejada',
  active: 'Ativa',
  completed: 'Concluída',
};

const formatDay = (iso?: string): string => {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit' });
};

/**
 * Gerenciador de sprints (Feature 038): CRUD, ativação e conclusão.
 * Em somente leitura, exibe a lista sem ações de escrita.
 */
export const SprintManagerModal: React.FC<SprintManagerModalProps> = ({
  isOpen,
  onClose,
  sprints,
  activeSprintId,
  tasks,
  isReadOnly = false,
  onAdd,
  onUpdate,
  onDelete,
  onStart,
  onComplete,
}) => {
  const [draft, setDraft] = React.useState<DraftState>(emptyDraft);
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [editDraft, setEditDraft] = React.useState<DraftState>(emptyDraft);
  const [chartMode, setChartMode] = React.useState<'burndown' | 'burnup'>('burndown');

  const ordered = React.useMemo(() => orderSprints(sprints), [sprints]);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (isReadOnly || !draft.name.trim()) return;
    onAdd({
      name: draft.name,
      goal: draft.goal || undefined,
      startDate: draft.startDate || undefined,
      endDate: draft.endDate || undefined,
    });
    setDraft(emptyDraft);
  };

  const startEdit = (sprint: SprintModel) => {
    setEditingId(sprint.id);
    setEditDraft({
      name: sprint.name,
      goal: sprint.goal ?? '',
      startDate: sprint.startDate ?? '',
      endDate: sprint.endDate ?? '',
    });
  };

  const saveEdit = () => {
    if (!editingId || !editDraft.name.trim()) return;
    onUpdate(editingId, {
      name: editDraft.name,
      goal: editDraft.goal,
      startDate: editDraft.startDate,
      endDate: editDraft.endDate,
    });
    setEditingId(null);
  };

  const requestDelete = (sprint: SprintModel) => {
    const confirmed =
      typeof window === 'undefined' || typeof window.confirm !== 'function'
        ? true
        : window.confirm(`Excluir a sprint "${sprint.name}"? As tarefas não serão apagadas.`);
    if (confirmed) onDelete(sprint.id);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Sprints">
      <div className="sprint-manager" data-testid="sprint-manager">
        {ordered.some((s) => s.status === 'active' || s.status === 'completed') && (
          <div
            className="sprint-manager__chart-toggle"
            role="group"
            aria-label="Visualização do gráfico da sprint"
          >
            <button
              type="button"
              className={chartMode === 'burndown' ? 'is-active' : ''}
              onClick={() => setChartMode('burndown')}
              aria-pressed={chartMode === 'burndown'}
              data-testid="chart-mode-burndown"
            >
              Burndown
            </button>
            <button
              type="button"
              className={chartMode === 'burnup' ? 'is-active' : ''}
              onClick={() => setChartMode('burnup')}
              aria-pressed={chartMode === 'burnup'}
              data-testid="chart-mode-burnup"
            >
              Burnup
            </button>
          </div>
        )}
        {ordered.length === 0 ? (
          <p className="sprint-manager__empty">Nenhuma sprint criada ainda.</p>
        ) : (
          <ul className="sprint-manager__list">
            {ordered.map((sprint) => {
              const sprintTasks = getSprintTasks(sprint.id, tasks);
              const progress = calculateSprintProgress(sprintTasks);
              const points = calculateSprintPoints(sprintTasks);
              const isEditing = editingId === sprint.id;
              return (
                <li key={sprint.id} className="sprint-manager__item" data-testid="sprint-item">
                  {isEditing ? (
                    <div className="sprint-manager__edit">
                      <input
                        className="sprint-manager__input"
                        aria-label="Nome da sprint"
                        value={editDraft.name}
                        onChange={(e) => setEditDraft({ ...editDraft, name: e.target.value })}
                        data-testid="sprint-edit-name"
                      />
                      <input
                        className="sprint-manager__input"
                        aria-label="Meta da sprint"
                        placeholder="Meta (opcional)"
                        value={editDraft.goal}
                        onChange={(e) => setEditDraft({ ...editDraft, goal: e.target.value })}
                      />
                      <div className="sprint-manager__dates">
                        <input
                          type="date"
                          className="sprint-manager__input"
                          aria-label="Início da sprint"
                          value={editDraft.startDate}
                          onChange={(e) =>
                            setEditDraft({ ...editDraft, startDate: e.target.value })
                          }
                        />
                        <input
                          type="date"
                          className="sprint-manager__input"
                          aria-label="Fim da sprint"
                          value={editDraft.endDate}
                          onChange={(e) => setEditDraft({ ...editDraft, endDate: e.target.value })}
                        />
                      </div>
                      <div className="sprint-manager__actions">
                        <button type="button" onClick={saveEdit} data-testid="sprint-edit-save">
                          Salvar
                        </button>
                        <button type="button" onClick={() => setEditingId(null)}>
                          Cancelar
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="sprint-manager__head">
                        <span className="sprint-manager__name">{sprint.name}</span>
                        <span
                          className={`sprint-manager__status sprint-manager__status--${sprint.status}`}
                          data-testid={`sprint-status-${sprint.id}`}
                        >
                          {statusLabel[sprint.status]}
                        </span>
                      </div>
                      {sprint.goal && <p className="sprint-manager__goal">{sprint.goal}</p>}
                      <div className="sprint-manager__meta">
                        <span>
                          {formatDay(sprint.startDate)} – {formatDay(sprint.endDate)}
                        </span>
                        <span data-testid={`sprint-progress-${sprint.id}`}>
                          {progress.completed}/{progress.total} · {progress.percentage}%
                          {points.committed > 0
                            ? ` · ${points.completed}/${points.committed} pts`
                            : ''}
                        </span>
                      </div>
                      {(sprint.status === 'active' || sprint.status === 'completed') && (
                        <SprintBurndownChart
                          mode={chartMode}
                          burndown={buildSprintBurndown(sprint, tasks)}
                          burnup={buildSprintBurnup(sprint, tasks)}
                          height={120}
                        />
                      )}
                      {!isReadOnly && (
                        <div className="sprint-manager__actions">
                          {sprint.status !== 'active' && sprint.status !== 'completed' && (
                            <button
                              type="button"
                              onClick={() => onStart(sprint.id)}
                              data-testid={`sprint-activate-${sprint.id}`}
                            >
                              Ativar
                            </button>
                          )}
                          {sprint.status === 'active' && (
                            <button
                              type="button"
                              onClick={() => onComplete(sprint.id)}
                              data-testid={`sprint-complete-${sprint.id}`}
                            >
                              Concluir
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => startEdit(sprint)}
                            data-testid={`sprint-edit-${sprint.id}`}
                          >
                            Editar
                          </button>
                          <button
                            type="button"
                            className="sprint-manager__delete"
                            onClick={() => requestDelete(sprint)}
                            data-testid={`sprint-delete-${sprint.id}`}
                          >
                            Excluir
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </li>
              );
            })}
          </ul>
        )}

        {!isReadOnly && (
          <form className="sprint-manager__create" onSubmit={handleCreate}>
            <h4 className="sprint-manager__create-title">Nova sprint</h4>
            <input
              className="sprint-manager__input"
              placeholder="Nome da sprint"
              aria-label="Nome da nova sprint"
              value={draft.name}
              onChange={(e) => setDraft({ ...draft, name: e.target.value })}
              data-testid="sprint-create-name"
            />
            <input
              className="sprint-manager__input"
              placeholder="Meta (opcional)"
              aria-label="Meta da nova sprint"
              value={draft.goal}
              onChange={(e) => setDraft({ ...draft, goal: e.target.value })}
            />
            <div className="sprint-manager__dates">
              <input
                type="date"
                className="sprint-manager__input"
                aria-label="Início da nova sprint"
                value={draft.startDate}
                onChange={(e) => setDraft({ ...draft, startDate: e.target.value })}
              />
              <input
                type="date"
                className="sprint-manager__input"
                aria-label="Fim da nova sprint"
                value={draft.endDate}
                onChange={(e) => setDraft({ ...draft, endDate: e.target.value })}
              />
            </div>
            <button
              type="submit"
              className="sprint-manager__submit"
              disabled={!draft.name.trim()}
              data-testid="sprint-create-submit"
            >
              Criar sprint
            </button>
          </form>
        )}

        {activeSprintId ? (
          <p className="sprint-manager__active-note">Sprint ativa definida.</p>
        ) : null}
      </div>
    </Modal>
  );
};
