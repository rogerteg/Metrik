import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BoardSwitcher } from '../../src/components/BoardSwitcher';
import { BoardManagementModal } from '../../src/components/BoardManagementModal';
import { RestrictedBoardFallback } from '../../src/components/RestrictedBoardFallback';
import { BoardModel } from '../../src/types/kanban';
import { Team } from '../../src/types/team';

describe('Board Isolation & Guarding (US3)', () => {
  const mockTeams: Team[] = [
    {
      id: 'team-alfa',
      name: 'Squad Alfa',
      description: 'Time de Frontend',
      createdAt: '2026-01-01T00:00:00.000Z',
      createdById: 'u1',
      members: [
        { id: 'm1', teamId: 'team-alfa', userId: 'u1', role: 'admin', joinedAt: '2026-01-01T00:00:00.000Z' },
      ],
    },
    {
      id: 'team-beta',
      name: 'Squad Beta',
      description: 'Time de Infraestrutura',
      createdAt: '2026-01-02T00:00:00.000Z',
      createdById: 'u2',
      members: [
        { id: 'm2', teamId: 'team-beta', userId: 'u2', role: 'admin', joinedAt: '2026-01-02T00:00:00.000Z' },
      ],
    },
  ];

  const mockBoards: BoardModel[] = [
    {
      id: 'board-1',
      name: 'Quadro Alfa Frontend',
      teamId: 'team-alfa',
      createdAt: '2026-01-01T00:00:00.000Z',
      lastAccessed: '2026-01-01T00:00:00.000Z',
    },
    {
      id: 'board-2',
      name: 'Quadro Beta Infra',
      teamId: 'team-beta',
      createdAt: '2026-01-02T00:00:00.000Z',
      lastAccessed: '2026-01-02T00:00:00.000Z',
    },
  ];

  it('BoardSwitcher filters boards strictly to teams where activeUser is member/guest', () => {
    // User u1 only belongs to team-alfa
    render(
      <BoardSwitcher
        boards={mockBoards}
        activeBoardId="board-1"
        onSwitchBoard={vi.fn()}
        onManageBoards={vi.fn()}
        teams={mockTeams}
        activeUserId="u1"
      />
    );

    // Should display Quadro Alfa Frontend
    expect(screen.getByText('Quadro Alfa Frontend')).toBeDefined();
    // Should NOT display Quadro Beta Infra in the options
    expect(screen.queryByText('Quadro Beta Infra')).toBeNull();
  });

  it('BoardSwitcher groups boards under optgroup labeled with squad name', () => {
    render(
      <BoardSwitcher
        boards={mockBoards}
        activeBoardId="board-1"
        onSwitchBoard={vi.fn()}
        onManageBoards={vi.fn()}
        teams={mockTeams}
        activeUserId="u1"
      />
    );

    const optgroup = document.querySelector('optgroup[label="Squad Alfa"]');
    expect(optgroup).not.toBeNull();
  });

  it('BoardManagementModal requires selecting target squad from user teams when creating a board', () => {
    const onCreateBoard = vi.fn();
    render(
      <BoardManagementModal
        isOpen={true}
        onClose={vi.fn()}
        boards={mockBoards}
        activeBoardId="board-1"
        onCreateBoard={onCreateBoard}
        onRenameBoard={vi.fn()}
        onDeleteBoard={vi.fn()}
        onSwitchBoard={vi.fn()}
        teams={mockTeams}
        activeUserId="u1"
      />
    );

    const nameInput = screen.getByPlaceholderText(/nome do novo quadro/i);
    const teamSelect = screen.getByTestId('board-team-select');
    const submitBtn = screen.getByRole('button', { name: /criar quadro/i });

    fireEvent.change(nameInput, { target: { value: 'Novo Quadro de Testes' } });
    fireEvent.change(teamSelect, { target: { value: 'team-alfa' } });
    fireEvent.click(submitBtn);

    expect(onCreateBoard).toHaveBeenCalledWith('Novo Quadro de Testes', 'team-alfa');
  });

  it('RestrictedBoardFallback renders access restriction warning and triggers redirect', () => {
    const onRedirect = vi.fn();
    const onOpenJoin = vi.fn();

    render(
      <RestrictedBoardFallback
        teamName="Squad Confidencial"
        onRedirectDefault={onRedirect}
        onOpenJoinCode={onOpenJoin}
      />
    );

    expect(screen.getByText(/acesso restrito/i)).toBeDefined();
    expect(screen.getByText(/squad confidencial/i)).toBeDefined();

    const redirectBtn = screen.getByRole('button', { name: /voltar para meu quadro principal/i });
    fireEvent.click(redirectBtn);
    expect(onRedirect).toHaveBeenCalled();

    const joinBtn = screen.getByRole('button', { name: /inserir código de convite/i });
    fireEvent.click(joinBtn);
    expect(onOpenJoin).toHaveBeenCalled();
  });
});
