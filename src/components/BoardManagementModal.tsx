import React, { useState, useEffect } from 'react';
import { BoardModel } from '../types/kanban';
import { Team } from '../types/team';
import './Modal.css';

export interface BoardManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  boards: BoardModel[];
  activeBoardId: string | null;
  onCreateBoard: (name: string, teamId?: string) => void;
  onRenameBoard: (id: string, newName: string) => void;
  onDeleteBoard: (id: string) => void;
  onSwitchBoard: (id: string) => void;
  teams?: Team[];
  activeUserId?: string;
}

export const BoardManagementModal: React.FC<BoardManagementModalProps> = ({
  isOpen,
  onClose,
  boards,
  activeBoardId,
  onCreateBoard,
  onRenameBoard,
  onDeleteBoard,
  onSwitchBoard,
  teams,
  activeUserId,
}) => {
  const [newBoardName, setNewBoardName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  // Teams where user is member
  const myTeams = teams && activeUserId
    ? teams.filter((t) => Array.isArray(t.members) && t.members.some((m: any) => m.userId === activeUserId))
    : [];

  const [selectedTeamId, setSelectedTeamId] = useState<string>(myTeams[0]?.id || '');

  useEffect(() => {
    if (myTeams.length > 0 && !selectedTeamId) {
      setSelectedTeamId(myTeams[0].id);
    }
  }, [myTeams, selectedTeamId]);

  if (!isOpen) return null;

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (newBoardName.trim()) {
      if (selectedTeamId) {
        onCreateBoard(newBoardName.trim(), selectedTeamId);
      } else {
        onCreateBoard(newBoardName.trim());
      }
      setNewBoardName('');
    }
  };

  const startEdit = (board: BoardModel) => {
    setEditingId(board.id);
    setEditName(board.name);
  };

  const saveEdit = () => {
    if (editingId && editName.trim()) {
      onRenameBoard(editingId, editName.trim());
      setEditingId(null);
    }
  };

  const handleDelete = (id: string) => {
    if (boards.length <= 1) {
      alert('Você não pode deletar o último quadro.');
      return;
    }
    const confirmed = window.confirm(
      'Tem certeza de que deseja deletar este quadro? Todas as tarefas dele serão perdidas permanentemente.'
    );
    if (confirmed) {
      onDeleteBoard(id);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '540px' }}>
        <div className="modal-header">
          <h2>Gerenciar Quadros</h2>
          <button type="button" className="btn-close" onClick={onClose} aria-label="Fechar">
            ×
          </button>
        </div>

        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="text"
                placeholder="Nome do novo quadro..."
                value={newBoardName}
                onChange={(e) => setNewBoardName(e.target.value)}
                className="form-input"
                style={{ flex: 1 }}
              />
              <button type="submit" className="btn btn-primary" disabled={!newBoardName.trim()}>
                Criar Quadro
              </button>
            </div>

            {myTeams.length > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Squad do Quadro:</label>
                <select
                  data-testid="board-team-select"
                  value={selectedTeamId}
                  onChange={(e) => setSelectedTeamId(e.target.value)}
                  className="form-select"
                  style={{ flex: 1, fontSize: '0.82rem', padding: '4px 8px' }}
                >
                  {myTeams.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </form>

          <div className="boards-list" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <h3 style={{ fontSize: '1rem', marginBottom: '8px' }}>Meus Quadros</h3>
            {boards.map((board) => {
              const boardTeam = teams?.find((t) => t.id === board.teamId);
              return (
                <div
                  key={board.id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '12px',
                    background: board.id === activeBoardId ? 'var(--column-bg)' : 'var(--bg-elevated)',
                    border: board.id === activeBoardId ? '1px solid var(--accent-color, #6366f1)' : '1px solid var(--border-color)',
                    borderRadius: '8px',
                  }}
                >
                  {editingId === board.id ? (
                    <input
                      autoFocus
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      onBlur={saveEdit}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') saveEdit();
                        if (e.key === 'Escape') setEditingId(null);
                      }}
                      className="form-input"
                      style={{ flex: 1, marginRight: '8px' }}
                    />
                  ) : (
                    <div
                      style={{
                        flex: 1,
                        cursor: 'pointer',
                        fontWeight: board.id === activeBoardId ? '600' : 'normal',
                      }}
                      onClick={() => {
                        if (board.id !== activeBoardId) onSwitchBoard(board.id);
                      }}
                    >
                      <span>{board.name}</span>
                      {boardTeam && (
                        <span
                          style={{
                            fontSize: '0.72rem',
                            padding: '2px 6px',
                            background: 'rgba(99, 102, 241, 0.15)',
                            color: 'var(--accent-primary, #818cf8)',
                            borderRadius: '4px',
                            marginLeft: '8px',
                          }}
                        >
                          {boardTeam.name}
                        </span>
                      )}
                      {board.id === activeBoardId && (
                        <span style={{ fontSize: '0.8rem', color: 'var(--accent-color, #6366f1)', marginLeft: '8px' }}>
                          (Ativo)
                        </span>
                      )}
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      style={{ padding: '4px 8px', fontSize: '0.8rem' }}
                      onClick={() => startEdit(board)}
                    >
                      Renomear
                    </button>
                    <button
                      type="button"
                      className="btn btn-danger"
                      style={{ padding: '4px 8px', fontSize: '0.8rem' }}
                      onClick={() => handleDelete(board.id)}
                      disabled={boards.length <= 1}
                    >
                      Excluir
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
