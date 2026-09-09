import React from 'react';
import { BoardModel } from '../types/kanban';

export interface BoardSwitcherProps {
  boards: BoardModel[];
  activeBoardId: string | null;
  onSwitchBoard: (id: string) => void;
  onManageBoards: () => void;
}

export const BoardSwitcher: React.FC<BoardSwitcherProps> = ({
  boards,
  activeBoardId,
  onSwitchBoard,
  onManageBoards
}) => {
  if (boards.length === 0) return null;

  return (
    <div className="board-switcher" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginLeft: '24px' }}>
      <select
        value={activeBoardId || ''}
        onChange={(e) => onSwitchBoard(e.target.value)}
        className="board-select"
        style={{
          background: 'var(--bg-elevated)',
          color: 'var(--text-primary)',
          border: '1px solid var(--border-color)',
          padding: '6px 12px',
          borderRadius: '6px',
          fontSize: '0.9rem',
          outline: 'none',
          cursor: 'pointer'
        }}
      >
        {boards.map(board => (
          <option key={board.id} value={board.id}>
            {board.name}
          </option>
        ))}
      </select>
      <button 
        className="btn btn-secondary" 
        onClick={onManageBoards}
        style={{ padding: '6px 12px', fontSize: '0.9rem' }}
        title="Gerenciar Quadros"
      >
        Gerenciar
      </button>
    </div>
  );
};
