import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ManageBoardsView } from '../../src/components/ManageBoards/ManageBoardsView';
import { BoardModel } from '../../src/types/kanban';
import { Team } from '../../src/types/team';

describe('ManageBoardsView Component (Feature 031 - T006)', () => {
  const mockTeams: Team[] = [
    { id: 'team-design', name: 'Design Squad', color: '#ec4899', createdById: 'u1', createdAt: '2026-09-01T00:00:00Z', members: [] },
  ];

  const mockBoards: BoardModel[] = [
    {
      id: 'board-alpha',
      name: 'Quadro Alfa',
      teamId: 'team-design',
      createdAt: '2026-09-01T00:00:00Z',
      lastAccessed: '2026-09-17T00:00:00Z',
    },
    {
      id: 'board-beta',
      name: 'Quadro Beta',
      createdAt: '2026-09-02T00:00:00Z',
      lastAccessed: '2026-09-17T00:00:00Z',
    },
  ];

  it('renders hero title, subtitle and board cards', () => {
    render(
      <ManageBoardsView
        boards={mockBoards}
        activeBoardId="board-alpha"
        teams={mockTeams}
        onSelectBoard={vi.fn()}
        onCreateBoard={vi.fn()}
        onRenameBoard={vi.fn()}
        onDeleteBoard={vi.fn()}
      />
    );

    expect(screen.getByRole('heading', { name: /gerenciar quadros/i })).toBeInTheDocument();
    expect(screen.getByText('Quadro Alfa')).toBeInTheDocument();
    expect(screen.getByText('Quadro Beta')).toBeInTheDocument();
  });

  it('calls onSelectBoard when clicking to open a board', () => {
    const onSelectBoard = vi.fn();
    render(
      <ManageBoardsView
        boards={mockBoards}
        activeBoardId="board-alpha"
        teams={mockTeams}
        onSelectBoard={onSelectBoard}
        onCreateBoard={vi.fn()}
        onRenameBoard={vi.fn()}
        onDeleteBoard={vi.fn()}
      />
    );

    const openButtons = screen.getAllByRole('button', { name: /abrir/i });
    fireEvent.click(openButtons[0]);

    expect(onSelectBoard).toHaveBeenCalledWith('board-alpha');
  });

  it('allows quick creation of a new board', () => {
    const onCreateBoard = vi.fn();
    render(
      <ManageBoardsView
        boards={mockBoards}
        activeBoardId="board-alpha"
        teams={mockTeams}
        onSelectBoard={vi.fn()}
        onCreateBoard={onCreateBoard}
        onRenameBoard={vi.fn()}
        onDeleteBoard={vi.fn()}
      />
    );

    const input = screen.getByPlaceholderText(/nome do novo quadro/i);
    fireEvent.change(input, { target: { value: 'Quadro Gama' } });

    const createBtn = screen.getByRole('button', { name: /criar quadro/i });
    fireEvent.click(createBtn);

    expect(onCreateBoard).toHaveBeenCalledWith('Quadro Gama', undefined);
  });
});
