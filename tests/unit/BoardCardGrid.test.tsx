import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BoardCardGrid } from '../../src/components/ManageBoards/BoardCardGrid';
import { Board } from '../../src/types/kanban';
import { Team } from '../../src/types/team';

describe('BoardCardGrid Component', () => {
  const mockTeams: Team[] = [
    {
      id: 'team-design',
      name: 'Design Squad',
      color: '#ec4899',
      createdById: 'u1',
      createdAt: '2026-09-01T00:00:00Z',
      members: [],
    },
  ];

  const mockBoards: Board[] = [
    {
      id: 'board-alpha',
      name: 'Alpha Board',
      teamId: 'team-design',
      createdAt: '2026-09-01T00:00:00Z',
      lastAccessed: '2026-09-01T00:00:00Z',
      columns: [
        { id: 'c1', title: 'To Do', category: 'todo', wipLimit: null, colorScheme: 'todo' },
        {
          id: 'c2',
          title: 'Doing',
          category: 'in_progress',
          wipLimit: null,
          colorScheme: 'progress',
        },
      ],
      tasks: {
        c1: [{ id: 't1', title: 'Task 1', column: 'c1', createdAt: '2026-09-01T00:00:00Z' }],
        c2: [{ id: 't2', title: 'Task 2', column: 'c2', createdAt: '2026-09-01T00:00:00Z' }],
      },
    },
    {
      id: 'board-beta',
      name: 'Beta Board',
      createdAt: '2026-09-02T00:00:00Z',
      lastAccessed: '2026-09-02T00:00:00Z',
      columns: [
        { id: 'c3', title: 'Done', category: 'done', wipLimit: null, colorScheme: 'completed' },
      ],
      tasks: {},
    },
  ];

  const defaultProps = {
    boards: mockBoards,
    activeBoardId: 'board-alpha',
    teams: mockTeams,
    onSelectBoard: vi.fn(),
    onRenameBoard: vi.fn(),
    onRequestDeleteBoard: vi.fn(),
    onOpenAnalytics: vi.fn(),
    isGuest: false,
  };

  it('renders board cards, telemetry and active badge', () => {
    render(<BoardCardGrid {...defaultProps} />);

    expect(screen.getByRole('region', { name: /grade de quadros/i })).toBeInTheDocument();
    expect(screen.getByText('Alpha Board')).toBeInTheDocument();
    expect(screen.getByText('Beta Board')).toBeInTheDocument();
    expect(screen.getByText('Quadro Ativo')).toBeInTheDocument();
    expect(screen.getByText('Design Squad')).toBeInTheDocument();
  });

  it('selects board on card click, button click or Enter keypress', () => {
    render(<BoardCardGrid {...defaultProps} />);

    const openBtns = screen.getAllByRole('button', { name: /abrir/i });
    fireEvent.click(openBtns[0]);
    expect(defaultProps.onSelectBoard).toHaveBeenCalledWith('board-alpha');

    const card = screen.getByText('Beta Board').closest('.board-card');
    if (card) {
      fireEvent.click(card);
      expect(defaultProps.onSelectBoard).toHaveBeenCalledWith('board-beta');

      fireEvent.keyDown(card, { key: 'Enter' });
      expect(defaultProps.onSelectBoard).toHaveBeenCalledWith('board-beta');
    }
  });

  it('opens analytics when clicking Analytics button', () => {
    render(<BoardCardGrid {...defaultProps} />);

    const analyticsBtns = screen.getAllByRole('button', { name: /analytics/i });
    fireEvent.click(analyticsBtns[0]);
    expect(defaultProps.onOpenAnalytics).toHaveBeenCalledWith('board-alpha');
  });

  it('handles rename inline with Enter, blur and Escape', () => {
    render(<BoardCardGrid {...defaultProps} />);

    const renameBtns = screen.getAllByRole('button', { name: /renomear/i });
    fireEvent.click(renameBtns[0]);

    const input = screen.getByLabelText(/renomear quadro alpha board/i);
    expect(input).toBeInTheDocument();

    fireEvent.change(input, { target: { value: 'Alpha Renamed' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(defaultProps.onRenameBoard).toHaveBeenCalledWith('board-alpha', 'Alpha Renamed');

    // Test Escape key
    fireEvent.click(renameBtns[0]);
    const inputEsc = screen.getByLabelText(/renomear quadro alpha board/i);
    fireEvent.keyDown(inputEsc, { key: 'Escape' });
    expect(screen.queryByLabelText(/renomear quadro alpha board/i)).not.toBeInTheDocument();
  });

  it('requests board deletion when clicking Excluir', () => {
    render(<BoardCardGrid {...defaultProps} />);

    const deleteBtns = screen.getAllByRole('button', { name: /excluir/i });
    fireEvent.click(deleteBtns[0]);

    expect(defaultProps.onRequestDeleteBoard).toHaveBeenCalledWith('board-alpha', 'Alpha Board');
  });

  it('renders empty message when boards list is empty', () => {
    render(<BoardCardGrid {...defaultProps} boards={[]} />);

    expect(screen.getByText(/nenhum quadro encontrado/i)).toBeInTheDocument();
  });

  it('hides rename and delete action buttons in guest mode', () => {
    render(<BoardCardGrid {...defaultProps} isGuest={true} />);

    expect(screen.queryByRole('button', { name: /renomear/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /excluir/i })).not.toBeInTheDocument();
  });
});
