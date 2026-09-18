import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BoardTableView } from '../../src/components/ManageBoards/BoardTableView';
import { BoardModel } from '../../src/types/kanban';
import { Team } from '../../src/types/team';

describe('BoardTableView Component (Feature 031 - T016)', () => {
  const mockTeams: Team[] = [
    { id: 'team-alpha', name: 'Alpha Squad', color: '#6366f1', createdById: 'u1', createdAt: '2026-09-01T00:00:00Z', members: [] },
    { id: 'team-beta', name: 'Beta Squad', color: '#10b981', createdById: 'u1', createdAt: '2026-09-01T00:00:00Z', members: [] },
  ];

  const mockBoards: BoardModel[] = [
    {
      id: 'board-1',
      name: 'Zeta Board',
      teamId: 'team-beta',
      createdAt: '2026-09-01T00:00:00Z',
      lastAccessed: '2026-09-17T00:00:00Z',
    },
    {
      id: 'board-2',
      name: 'Alpha Board',
      teamId: 'team-alpha',
      createdAt: '2026-09-02T00:00:00Z',
      lastAccessed: '2026-09-17T00:00:00Z',
    },
  ];

  it('renders table headers and board data rows', () => {
    render(
      <BoardTableView
        boards={mockBoards}
        activeBoardId="board-2"
        teams={mockTeams}
        onSelectBoard={vi.fn()}
        onRenameBoard={vi.fn()}
        onRequestDeleteBoard={vi.fn()}
      />
    );

    expect(screen.getByRole('table')).toBeInTheDocument();
    expect(screen.getByText(/nome do quadro/i)).toBeInTheDocument();
    expect(screen.getByText(/squad \/ time/i)).toBeInTheDocument();
    expect(screen.getByText('Zeta Board')).toBeInTheDocument();
    expect(screen.getByText('Alpha Board')).toBeInTheDocument();
  });

  it('identifies the active board with active dot or row class', () => {
    const { container } = render(
      <BoardTableView
        boards={mockBoards}
        activeBoardId="board-2"
        teams={mockTeams}
        onSelectBoard={vi.fn()}
        onRenameBoard={vi.fn()}
        onRequestDeleteBoard={vi.fn()}
      />
    );

    const activeRows = container.querySelectorAll('.manage-table-row-active');
    expect(activeRows.length).toBe(1);
    expect(activeRows[0]).toHaveTextContent('Alpha Board');
  });

  it('sorts rows when clicking on sortable headers', () => {
    const { container } = render(
      <BoardTableView
        boards={mockBoards}
        activeBoardId="board-2"
        teams={mockTeams}
        onSelectBoard={vi.fn()}
        onRenameBoard={vi.fn()}
        onRequestDeleteBoard={vi.fn()}
      />
    );

    const headerName = screen.getByRole('columnheader', { name: /nome do quadro/i });

    // Initial default sort is 'name' asc: Alpha Board, then Zeta Board
    let rows = container.querySelectorAll('tbody tr');
    expect(rows[0]).toHaveTextContent('Alpha Board');
    expect(rows[1]).toHaveTextContent('Zeta Board');

    // Click header to toggle desc: Zeta Board, then Alpha Board
    fireEvent.click(headerName);
    rows = container.querySelectorAll('tbody tr');
    expect(rows[0]).toHaveTextContent('Zeta Board');
    expect(rows[1]).toHaveTextContent('Alpha Board');
  });

  it('triggers onSelectBoard when clicking a board name link or open action', () => {
    const onSelectBoard = vi.fn();
    render(
      <BoardTableView
        boards={mockBoards}
        activeBoardId="board-1"
        teams={mockTeams}
        onSelectBoard={onSelectBoard}
        onRenameBoard={vi.fn()}
        onRequestDeleteBoard={vi.fn()}
      />
    );

    const openBtn = screen.getAllByRole('button', { name: /abrir/i })[0];
    fireEvent.click(openBtn);

    expect(onSelectBoard).toHaveBeenCalled();
  });

  it('triggers onRequestDeleteBoard when clicking delete in actions column', () => {
    const onRequestDeleteBoard = vi.fn();
    render(
      <BoardTableView
        boards={mockBoards}
        activeBoardId="board-1"
        teams={mockTeams}
        onSelectBoard={vi.fn()}
        onRenameBoard={vi.fn()}
        onRequestDeleteBoard={onRequestDeleteBoard}
      />
    );

    const deleteBtns = screen.getAllByRole('button', { name: /excluir/i });
    fireEvent.click(deleteBtns[0]);

    expect(onRequestDeleteBoard).toHaveBeenCalled();
  });
});
