import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BoardTableView } from '../../src/components/ManageBoards/BoardTableView';
import { Board } from '../../src/types/kanban';
import { Team } from '../../src/types/team';

describe('BoardTableView Component', () => {
  const mockTeams: Team[] = [
    {
      id: 'team-design',
      name: 'Design Squad',
      color: '#ec4899',
      createdById: 'u1',
      createdAt: '2026-09-01T00:00:00Z',
      members: [],
    },
    {
      id: 'team-eng',
      name: 'Engineering Squad',
      color: '#3b82f6',
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
      teamId: 'team-eng',
      createdAt: '2026-09-02T00:00:00Z',
      lastAccessed: '2026-09-02T00:00:00Z',
      columns: [
        { id: 'c3', title: 'Done', category: 'done', wipLimit: null, colorScheme: 'completed' },
      ],
      tasks: {
        c3: [
          {
            id: 't3',
            title: 'Task 3',
            column: 'c3',
            createdAt: '2026-09-02T00:00:00Z',
            completedAt: '2026-09-03T00:00:00Z',
          },
        ],
      },
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

  it('renders table headers, rows and squad tags', () => {
    render(<BoardTableView {...defaultProps} />);

    expect(screen.getByRole('region', { name: /tabela de quadros/i })).toBeInTheDocument();
    expect(screen.getByText('Alpha Board')).toBeInTheDocument();
    expect(screen.getByText('Beta Board')).toBeInTheDocument();
    expect(screen.getByText('Design Squad')).toBeInTheDocument();
    expect(screen.getByText('Engineering Squad')).toBeInTheDocument();
  });

  it('calls onSelectBoard and onOpenAnalytics on click', () => {
    render(<BoardTableView {...defaultProps} />);

    const openBtns = screen.getAllByRole('button', { name: /abrir/i });
    fireEvent.click(openBtns[0]);
    expect(defaultProps.onSelectBoard).toHaveBeenCalledWith('board-alpha');

    const analyticsBtns = screen.getAllByRole('button', { name: /analytics/i });
    fireEvent.click(analyticsBtns[0]);
    expect(defaultProps.onOpenAnalytics).toHaveBeenCalledWith('board-alpha');
  });

  it('allows sorting by all columns and toggling sort direction', () => {
    render(<BoardTableView {...defaultProps} />);

    const sortableHeaders = [
      /nome do quadro/i,
      /squad \/ time/i,
      /colunas/i,
      /tarefas/i,
      /wip/i,
      /concluídas/i,
    ];

    sortableHeaders.forEach((headerRegex) => {
      const header = screen.getByRole('columnheader', { name: headerRegex });
      fireEvent.click(header); // asc
      fireEvent.click(header); // desc
    });
  });

  it('handles inline rename with Enter and Escape', () => {
    render(<BoardTableView {...defaultProps} />);

    const renameBtns = screen.getAllByRole('button', { name: /renomear/i });
    fireEvent.click(renameBtns[0]);

    const input = screen.getByLabelText(/renomear quadro alpha board/i);
    expect(input).toBeInTheDocument();

    fireEvent.change(input, { target: { value: 'Alpha Board Renamed' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(defaultProps.onRenameBoard).toHaveBeenCalledWith('board-alpha', 'Alpha Board Renamed');

    // Test Escape
    fireEvent.click(renameBtns[0]);
    const inputEsc = screen.getByLabelText(/renomear quadro alpha board/i);
    fireEvent.keyDown(inputEsc, { key: 'Escape' });
    expect(screen.queryByLabelText(/renomear quadro alpha board/i)).not.toBeInTheDocument();
  });

  it('requests board deletion when clicking Excluir', () => {
    render(<BoardTableView {...defaultProps} />);

    const deleteBtns = screen.getAllByRole('button', { name: /excluir/i });
    fireEvent.click(deleteBtns[0]);

    expect(defaultProps.onRequestDeleteBoard).toHaveBeenCalledWith('board-alpha', 'Alpha Board');
  });

  it('renders empty message when boards list is empty', () => {
    render(<BoardTableView {...defaultProps} boards={[]} />);

    expect(screen.getByText(/nenhum quadro encontrado/i)).toBeInTheDocument();
  });

  it('hides rename and delete action buttons in guest mode', () => {
    render(<BoardTableView {...defaultProps} isGuest={true} />);

    expect(screen.queryByRole('button', { name: /renomear/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /excluir/i })).not.toBeInTheDocument();
  });
});
