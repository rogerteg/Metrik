import React, { useState } from 'react';
import { BoardModel } from '../types/kanban';
import './Modal.css';

export interface BoardManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  boards: BoardModel[];
  activeBoardId: string | null;
  onCreateBoard: (name: string) => void;
  onRenameBoard: (id: string, newName: string) => void;
  onDeleteBoard: (id: string) => void;
  onSwitchBoard: (id: string) => void;
}

export const BoardManagementModal: React.FC<BoardManagementModalProps> = ({
  isOpen,
  onClose,
  boards,
  activeBoardId,
  onCreateBoard,
  onRenameBoard,
  onDeleteBoard,
  onSwitchBoard
}) => {
  const [newBoardName, setNewBoardName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  if (!isOpen) return null;

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (newBoardName.trim()) {
      onCreateBoard(newBoardName.trim());
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
      alert("Você não pode deletar o último quadro.");
      return;
    }
    const confirmed = window.confirm('Tem certeza de que deseja deletar este quadro? Todas as tarefas dele serão perdidas permanentemente.');
    if (confirmed) {
      onDeleteBoard(id);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '500px' }}>
        <div className="modal-header">
          <h2>Gerenciar Quadros</h2>
          <button className="btn-close" onClick={onClose}>×</button>
        </div>
        
        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          <form onSubmit={handleCreate} style={{ display: 'flex', gap: '8px' }}>
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
          </form>

          <div className="boards-list" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <h3 style={{ fontSize: '1rem', marginBottom: '8px' }}>Meus Quadros</h3>
            {boards.map(board => (
              <div 
                key={board.id} 
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '12px',
                  background: board.id === activeBoardId ? 'var(--column-bg)' : 'var(--bg-elevated)',
                  border: board.id === activeBoardId ? '1px solid var(--accent-color)' : '1px solid var(--border-color)',
                  borderRadius: '6px'
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
                    style={{ flex: 1, cursor: 'pointer', fontWeight: board.id === activeBoardId ? '600' : 'normal' }}
                    onClick={() => {
                      if (board.id !== activeBoardId) onSwitchBoard(board.id);
                    }}
                  >
                    {board.name}
                    {board.id === activeBoardId && <span style={{ fontSize: '0.8rem', color: 'var(--accent-color)', marginLeft: '8px' }}>(Ativo)</span>}
                  </div>
                )}

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button 
                    className="btn btn-secondary" 
                    style={{ padding: '4px 8px', fontSize: '0.8rem' }}
                    onClick={() => startEdit(board)}
                  >
                    Renomear
                  </button>
                  <button 
                    className="btn btn-danger" 
                    style={{ padding: '4px 8px', fontSize: '0.8rem' }}
                    onClick={() => handleDelete(board.id)}
                    disabled={boards.length <= 1}
                  >
                    Excluir
                  </button>
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
};
