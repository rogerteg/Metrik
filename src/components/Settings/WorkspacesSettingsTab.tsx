import React from 'react';
import { Workspace } from '../../types/workspace';
import { BoardModel } from '../../types/kanban';
import { Team, User } from '../../types/team';
import { DEFAULT_WORKSPACE_ID } from '../../hooks/useWorkspaces';

interface WorkspacesSettingsTabProps {
  workspaces: Workspace[];
  /** Quadros disponíveis para vincular (Feature 029/P3). */
  boards?: BoardModel[];
  onUpdateWorkspace: (id: string, patch: Partial<Workspace>) => void;
  onCreateWorkspace?: () => void;
  onAddBoardToWorkspace?: (workspaceId: string, boardId: string) => void;
  onRemoveBoardFromWorkspace?: (workspaceId: string, boardId: string) => void;
  onDeleteWorkspace?: (workspaceId: string) => void;
  teams: Team[];
  users: User[];
}

const PRESET_COLORS = [
  '#ef4444', // Red
  '#f97316', // Orange
  '#eab308', // Yellow
  '#10b981', // Emerald
  '#06b6d4', // Cyan
  '#38bdf8', // Light Blue
  '#6366f1', // Indigo
  '#8b5cf6', // Violet
  '#ec4899', // Pink
];

export const WorkspacesSettingsTab: React.FC<WorkspacesSettingsTabProps> = ({
  workspaces,
  boards = [],
  onUpdateWorkspace,
  onCreateWorkspace,
  onAddBoardToWorkspace,
  onRemoveBoardFromWorkspace,
  onDeleteWorkspace,
  teams,
  users,
}) => {
  const [editingWsId, setEditingWsId] = React.useState<string | null>(null);
  const [editName, setEditName] = React.useState('');
  const [editDesc, setEditDesc] = React.useState('');

  const handleStartEdit = (ws: Workspace) => {
    setEditingWsId(ws.id);
    setEditName(ws.name);
    setEditDesc(ws.description || '');
  };

  const handleSaveEdit = (wsId: string) => {
    if (editName.trim()) {
      onUpdateWorkspace(wsId, {
        name: editName.trim(),
        description: editDesc.trim(),
        updatedAt: new Date().toISOString(),
      });
    }
    setEditingWsId(null);
  };

  return (
    <div className="settings-tab-panel" role="tabpanel" aria-label="Espaços & Squads">
      <div className="settings-panel-header">
        <div className="header-flex">
          <div>
            <h3 className="settings-panel-title">Espaços de Trabalho & Squads</h3>
            <p className="settings-panel-desc">
              Organize seus fluxos em departamentos, squads ou objetivos estratégicos.
            </p>
          </div>
          {onCreateWorkspace && (
            <button type="button" className="btn btn-primary" onClick={onCreateWorkspace}>
              + Novo Espaço
            </button>
          )}
        </div>
      </div>

      {/* Lista de Espaços Cadastrados */}
      <section className="settings-section">
        <h4 className="settings-section-title">Espaços Cadastrados</h4>
        <div className="workspaces-management-list">
          {workspaces.map((ws) => {
            const isEditing = editingWsId === ws.id;

            return (
              <div key={ws.id} className="workspace-manage-card">
                <div className="workspace-manage-header">
                  <div className="workspace-color-indicator-group">
                    <span
                      className="workspace-color-bullet large"
                      style={{ backgroundColor: ws.color }}
                      aria-hidden="true"
                    />
                    {isEditing ? (
                      <input
                        type="text"
                        className="settings-input edit-ws-name"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        placeholder="Nome do espaço"
                        autoFocus
                      />
                    ) : (
                      <h5 className="workspace-manage-name">{ws.name}</h5>
                    )}
                  </div>

                  <div className="workspace-manage-actions">
                    {isEditing ? (
                      <>
                        <button
                          type="button"
                          className="btn btn-primary btn-compact"
                          onClick={() => handleSaveEdit(ws.id)}
                        >
                          Salvar
                        </button>
                        <button
                          type="button"
                          className="btn btn-secondary btn-compact"
                          onClick={() => setEditingWsId(null)}
                        >
                          Cancelar
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          type="button"
                          className="btn btn-secondary btn-compact"
                          onClick={() => handleStartEdit(ws)}
                        >
                          Editar
                        </button>
                        {onDeleteWorkspace && ws.id !== DEFAULT_WORKSPACE_ID && (
                          <button
                            type="button"
                            className="btn btn-secondary btn-compact workspace-delete-btn"
                            onClick={() => {
                              const confirmed =
                                typeof window === 'undefined' ||
                                typeof window.confirm !== 'function'
                                  ? true
                                  : window.confirm(
                                      `Excluir o espaço "${ws.name}"? Os quadros vinculados voltam para "Geral".`,
                                    );
                              if (confirmed) onDeleteWorkspace(ws.id);
                            }}
                            aria-label={`Excluir espaço ${ws.name}`}
                            data-testid={`delete-workspace-${ws.id}`}
                          >
                            Excluir
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>

                {isEditing ? (
                  <div className="workspace-edit-body">
                    <label className="settings-field-label">Descrição / Propósito:</label>
                    <input
                      type="text"
                      className="settings-input"
                      value={editDesc}
                      onChange={(e) => setEditDesc(e.target.value)}
                      placeholder="Ex.: Squad responsável pelos produtos core"
                    />

                    <label className="settings-field-label">Cor do Marcador:</label>
                    <div className="color-presets-row">
                      {PRESET_COLORS.map((c) => (
                        <button
                          key={c}
                          type="button"
                          className={`color-swatch ${ws.color === c ? 'selected' : ''}`}
                          style={{ backgroundColor: c }}
                          onClick={() => onUpdateWorkspace(ws.id, { color: c })}
                          aria-label={`Cor ${c}`}
                        />
                      ))}
                    </div>

                    <label className="settings-field-label">Quadros vinculados:</label>
                    {onAddBoardToWorkspace && onRemoveBoardFromWorkspace ? (
                      boards.length > 0 ? (
                        <div className="workspace-board-toggles">
                          {boards.map((board) => {
                            const linked = ws.boardIds.includes(board.id);
                            return (
                              <label
                                key={board.id}
                                className={`workspace-board-toggle ${linked ? 'is-linked' : ''}`}
                              >
                                <input
                                  type="checkbox"
                                  checked={linked}
                                  onChange={() =>
                                    linked
                                      ? onRemoveBoardFromWorkspace(ws.id, board.id)
                                      : onAddBoardToWorkspace(ws.id, board.id)
                                  }
                                  aria-label={`Vincular quadro ${board.name}`}
                                />
                                <span>{board.name}</span>
                              </label>
                            );
                          })}
                        </div>
                      ) : (
                        <p className="workspace-manage-desc">Nenhum quadro disponível.</p>
                      )
                    ) : (
                      <p className="workspace-manage-desc">
                        Vínculo de quadros indisponível nesta visão.
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="workspace-manage-details">
                    <p className="workspace-manage-desc">
                      {ws.description || 'Sem descrição definida.'}
                    </p>
                    <span className="workspace-boards-badge">
                      {ws.boardIds.length}{' '}
                      {ws.boardIds.length === 1 ? 'quadro vinculado' : 'quadros vinculados'}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Resumo de Squads e Usuários Ativos */}
      <section className="settings-section">
        <h4 className="settings-section-title">Squads & Membros Ativos</h4>
        <div className="squads-summary-grid">
          {teams.map((team) => (
            <div key={team.id} className="squad-summary-card">
              <h5 className="squad-name">{team.name}</h5>
              <p className="squad-desc">{team.description || 'Sem descrição'}</p>
              <div className="squad-meta">
                <span>{users.length} membros no sistema</span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
