import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BoardCardGrid } from '../../src/components/ManageBoards/BoardCardGrid';
import { BoardModel } from '../../src/types/kanban';
import { Team } from '../../src/types/team';

describe('BoardCardGrid Component (Feature 031 - T005)', () => {
  const mockTeams: Team[] = [
    { id: 'team-alpha', name: 'Alpha Squad', color: '#6366f1', createdById: 'u1', createdAt: '2026-09-01T00:00:00Z', members: [] },
    { id: 'team-beta', name: 'Beta Squad', color: '#10b981', createdById: 'u1', createdAt: '2026-09-01T00:00:00Z', members: [] },
  ];

  const mockBoards: BoardModel[] = [
    {
      id: 'board-1',
      name: 'Quadro 1 - Core',
      teamId: 'team-alpha',
      createdAt: '2026-09-01T00:00:00Z',
      lastAccessed: '2026-09-17T00:00:00Z',
    },
    {
      id: 'board-2',
      name: 'Quadro 2 - Mobile',
      teamId: 'team-beta',
      createdAt: '2026-09-02T00:00:00Z',
      lastAccessed: '2026-09-17T00:00:00Z',
    },
  ];

  it('renders a card for each board in the list', () => {
    render(
      <BoardCardGrid
        boards={mockBoards}
        activeBoardId="board-1"
        teams={mockTeams}
        onSelectBoard={vi.fn()}
        onRenameBoard={vi.fn()}
        onRequestDeleteBoard={vi.fn()}
      />
    );

    expect(screen.getByText('Quadro 1 - Core')).toBeInTheDocument();
    expect(screen.getByText('Quadro 2 - Mobile')).toBeInTheDocument();
  });

  it('highlights the active board with active badge and glow styling class', () => {
    const { container } = render(
      <BoardCardGrid
        boards={mockBoards}
        activeBoardId="board-1"
        teams={mockTeams}
        onSelectBoard={vi.fn()}
        onRenameBoard={vi.fn()}
        onRequestDeleteBoard={vi.fn()}
      />
    );

    expect(screen.getByText('Quadro Ativo')).toBeInTheDocument();
    const activeCards = container.querySelectorAll('.board-card-active');
    expect(activeCards.length).toBe(1);
    expect(activeCards[0]).toHaveTextContent('Quadro 1 - Core');
  });

  it('renders squad badges with correct team names and colors', () => {
    render(
      <BoardCardGrid
        boards={mockBoards}
        activeBoardId="board-1"
        teams={mockTeams}
        onSelectBoard={vi.fn()}
        onRenameBoard={vi.fn()}
        onRequestDeleteBoard={vi.fn()}
      />
    );

    expect(screen.getByText('Alpha Squad')).toBeInTheDocument();
    expect(screen.getByText('Beta Squad')).toBeInTheDocument();
  });

  it('triggers onSelectBoard when clicking on a card or Open button', () => {
    const onSelectBoard = vi.fn();
    render(
      <BoardCardGrid
        boards={mockBoards}
        activeBoardId="board-1"
        teams={mockTeams}
        onSelectBoard={onSelectBoard}
        onRenameBoard={vi.fn()}
        onRequestDeleteBoard={vi.fn()}
      />
    );

    const openButtons = screen.getAllByRole('button', { name: /abrir/i });
    fireEvent.click(openButtons[1]); // Clicar no segundo quadro (board-2)

    expect(onSelectBoard).toHaveBeenCalledWith('board-2');
  });

  it('triggers onRequestDeleteBoard when clicking delete button', () => {
    const onRequestDeleteBoard = vi.fn();
    render(
      <BoardCardGrid
        boards={mockBoards}
        activeBoardId="board-1"
        teams={mockTeams}
        onSelectBoard={vi.fn()}
        onRenameBoard={vi.fn()}
        onRequestDeleteBoard={onRequestDeleteBoard}
      />
    );

    const deleteButtons = screen.getAllByRole('button', { name: /excluir/i });
    fireEvent.click(deleteButtons[0]);

    expect(onRequestDeleteBoard).toHaveBeenCalledWith('board-1', 'Quadro 1 - Core');
  });
});
