import React from 'react';
import { BoardModel } from '../types/kanban';
import { Team } from '../types/team';

export interface BoardSwitcherProps {
  boards: BoardModel[];
  activeBoardId: string | null;
  onSwitchBoard: (id: string) => void;
  onManageBoards: () => void;
  teams?: Team[];
  activeUserId?: string;
}

export const BoardSwitcher: React.FC<BoardSwitcherProps> = ({
  boards,
  activeBoardId,
  onSwitchBoard,
  onManageBoards,
  teams,
  activeUserId,
}) => {
  if (boards.length === 0) return null;

  // If teams and activeUserId are passed, filter boards strictly to squads where user belongs
  let accessibleBoards = boards;
  let userTeams: Team[] = [];

  if (teams && activeUserId) {
    userTeams = teams.filter((t) => Array.isArray(t.members) && t.members.some((m: any) => m.userId === activeUserId));
    const userTeamIds = new Set(userTeams.map((t) => t.id));
    accessibleBoards = boards.filter((b) => b.teamId && userTeamIds.has(b.teamId));
  }

  // Group accessible boards by Team
  const groupedBoards: { teamName: string; boards: BoardModel[] }[] = [];

  if (userTeams.length > 0) {
    userTeams.forEach((team) => {
      const teamBoards = accessibleBoards.filter((b) => b.teamId === team.id);
      if (teamBoards.length > 0) {
        groupedBoards.push({
          teamName: team.name,
          boards: teamBoards,
        });
      }
    });
  }

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
          cursor: 'pointer',
        }}
      >
        {groupedBoards.length > 0
          ? groupedBoards.map((group) => (
              <optgroup key={group.teamName} label={group.teamName}>
                {group.boards.map((board) => (
                  <option key={board.id} value={board.id}>
                    {board.name}
                  </option>
                ))}
              </optgroup>
            ))
          : accessibleBoards.map((board) => (
              <option key={board.id} value={board.id}>
                {board.name}
              </option>
            ))}
      </select>
      <button
        type="button"
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
