import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TeamManagementModal } from '../../src/components/TeamManagementModal';
import { Team, User, TeamInvitation } from '../../src/types/team';

describe('TeamManagementModal Component (US2 & US4)', () => {
  const mockUsers: User[] = [
    {
      id: 'u1',
      name: 'Alice Silva',
      email: 'alice@metrik.local',
      createdAt: '2026-01-01T00:00:00.000Z',
    },
    {
      id: 'u2',
      name: 'Bob Santos',
      email: 'bob@metrik.local',
      createdAt: '2026-01-02T00:00:00.000Z',
    },
  ];

  const mockTeams: Team[] = [
    {
      id: 'team-alfa',
      name: 'Squad Alfa',
      description: 'Squad de Frontend e Core',
      createdAt: '2026-01-01T00:00:00.000Z',
      createdById: 'u1',
      members: [
        {
          id: 'm1',
          teamId: 'team-alfa',
          userId: 'u1',
          role: 'admin',
          joinedAt: '2026-01-01T00:00:00.000Z',
        },
        {
          id: 'm2',
          teamId: 'team-alfa',
          userId: 'u2',
          role: 'member',
          joinedAt: '2026-01-02T00:00:00.000Z',
        },
      ],
    },
  ];

  const mockInvitations: TeamInvitation[] = [
    {
      id: 'inv-1',
      teamId: 'team-alfa',
      invitedById: 'u1',
      email: 'carlos@metrik.local',
      inviteeEmail: 'carlos@metrik.local',
      role: 'guest',
      code: 'METRIK-ALFA-7X9K',
      status: 'pending',
      createdAt: '2026-01-03T00:00:00.000Z',
    },
  ];

  it('renders squad list and displays team name and user role', () => {
    render(
      <TeamManagementModal
        isOpen={true}
        onClose={vi.fn()}
        teams={mockTeams}
        users={mockUsers}
        activeUserId="u1"
        invitations={mockInvitations}
        onCreateTeam={vi.fn()}
        onUpdateMemberRole={vi.fn()}
        onRemoveMember={vi.fn()}
        onCreateInvitation={vi.fn()}
        onAcceptInvitation={vi.fn()}
      />
    );

    expect(screen.getByText('Squad Alfa')).toBeDefined();
    expect(screen.getByText('Squad de Frontend e Core')).toBeDefined();
    // Alice is admin on Squad Alfa
    expect(screen.getByText(/admin/i)).toBeDefined();
  });

  it('allows creating a new squad via the Criar Squad tab', () => {
    const onCreateTeam = vi.fn();
    render(
      <TeamManagementModal
        isOpen={true}
        onClose={vi.fn()}
        teams={mockTeams}
        users={mockUsers}
        activeUserId="u1"
        invitations={mockInvitations}
        onCreateTeam={onCreateTeam}
        onUpdateMemberRole={vi.fn()}
        onRemoveMember={vi.fn()}
        onCreateInvitation={vi.fn()}
        onAcceptInvitation={vi.fn()}
      />
    );

    // Click on tab "Criar Squad"
    const tabCreate = screen.getByRole('tab', { name: /criar squad/i });
    fireEvent.click(tabCreate);

    // Fill form
    const nameInput = screen.getByPlaceholderText(/nome da squad/i);
    const descInput = screen.getByPlaceholderText(/descrição/i);
    const submitBtn = screen.getByRole('button', { name: /salvar squad/i });

    fireEvent.change(nameInput, { target: { value: 'Squad Checkout' } });
    fireEvent.change(descInput, { target: { value: 'Time focado em conversão' } });
    fireEvent.click(submitBtn);

    expect(onCreateTeam).toHaveBeenCalledWith('Squad Checkout', 'Time focado em conversão');
  });

  it('displays members of the selected team and allows admin to change roles', () => {
    const onUpdateRole = vi.fn();
    render(
      <TeamManagementModal
        isOpen={true}
        onClose={vi.fn()}
        teams={mockTeams}
        users={mockUsers}
        activeUserId="u1"
        invitations={mockInvitations}
        onCreateTeam={vi.fn()}
        onUpdateMemberRole={onUpdateRole}
        onRemoveMember={vi.fn()}
        onCreateInvitation={vi.fn()}
        onAcceptInvitation={vi.fn()}
        initialTab="members"
      />
    );

    expect(screen.getByText('Alice Silva')).toBeDefined();
    expect(screen.getByText('Bob Santos')).toBeDefined();

    // Find role selector for Bob Santos and change to admin
    const bobRoleSelect = screen.getByTestId('member-role-select-u2');
    fireEvent.change(bobRoleSelect, { target: { value: 'admin' } });

    expect(onUpdateRole).toHaveBeenCalledWith('team-alfa', 'u2', 'admin');
  });

  it('allows creating an invitation for a member or guest', () => {
    const onCreateInvite = vi.fn();
    render(
      <TeamManagementModal
        isOpen={true}
        onClose={vi.fn()}
        teams={mockTeams}
        users={mockUsers}
        activeUserId="u1"
        invitations={mockInvitations}
        onCreateTeam={vi.fn()}
        onUpdateMemberRole={vi.fn()}
        onRemoveMember={vi.fn()}
        onCreateInvitation={onCreateInvite}
        onAcceptInvitation={vi.fn()}
        initialTab="invite"
      />
    );

    const emailInput = screen.getByPlaceholderText(/e-mail do convidado/i);
    const roleSelect = screen.getByTestId('invite-role-select');
    const submitBtn = screen.getByRole('button', { name: /gerar convite/i });

    fireEvent.change(emailInput, { target: { value: 'daniela@metrik.local' } });
    fireEvent.change(roleSelect, { target: { value: 'guest' } });
    fireEvent.click(submitBtn);

    expect(onCreateInvite).toHaveBeenCalledWith('team-alfa', 'daniela@metrik.local', 'guest');
  });

  it('allows entering an invitation code to join a team', () => {
    const onAcceptInvite = vi.fn();
    render(
      <TeamManagementModal
        isOpen={true}
        onClose={vi.fn()}
        teams={mockTeams}
        users={mockUsers}
        activeUserId="u1"
        invitations={mockInvitations}
        onCreateTeam={vi.fn()}
        onUpdateMemberRole={vi.fn()}
        onRemoveMember={vi.fn()}
        onCreateInvitation={vi.fn()}
        onAcceptInvitation={onAcceptInvite}
        initialTab="join-code"
      />
    );

    const codeInput = screen.getByPlaceholderText(/código do convite/i);
    const joinBtn = screen.getByRole('button', { name: /entrar na squad/i });

    fireEvent.change(codeInput, { target: { value: 'METRIK-ALFA-7X9K' } });
    fireEvent.click(joinBtn);

    expect(onAcceptInvite).toHaveBeenCalledWith('METRIK-ALFA-7X9K');
  });
});
