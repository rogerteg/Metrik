import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useTeamAccess } from '../../src/hooks/useTeamAccess';
import {
  ACTIVE_USER_STORAGE_KEY,
  DEFAULT_TEAM_ID,
  DEFAULT_USER_ID,
} from '../../src/types/team';

describe('useTeamAccess Hook (Feature 023 - Team Access Control)', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('initializes default user and default team when storage is empty', () => {
    const { result } = renderHook(() => useTeamAccess());

    expect(result.current.users.length).toBeGreaterThanOrEqual(1);
    expect(result.current.activeUser).toBeDefined();
    expect(result.current.activeUser?.id).toBe(DEFAULT_USER_ID);

    expect(result.current.teams.length).toBeGreaterThanOrEqual(1);
    expect(result.current.teams[0].id).toBe(DEFAULT_TEAM_ID);

    // Active user should be admin of default team
    const role = result.current.getUserRoleInTeam(DEFAULT_TEAM_ID, DEFAULT_USER_ID);
    expect(role).toBe('admin');
  });

  it('allows creating a new user and switching active user', () => {
    const { result } = renderHook(() => useTeamAccess());

    let newUser: any;
    act(() => {
      newUser = result.current.createUser('Alice Silva', 'alice@metrik.local');
    });

    expect(newUser).toBeDefined();
    expect(newUser.name).toBe('Alice Silva');
    expect(newUser.email).toBe('alice@metrik.local');

    // Switch active user
    act(() => {
      result.current.setActiveUserId(newUser.id);
    });

    expect(result.current.activeUser?.id).toBe(newUser.id);
    expect(localStorage.getItem(ACTIVE_USER_STORAGE_KEY)).toBe(newUser.id);
  });

  it('rejects creating a user with duplicate email', () => {
    const { result } = renderHook(() => useTeamAccess());

    act(() => {
      result.current.createUser('Alice Silva', 'alice@metrik.local');
    });

    expect(() => {
      act(() => {
        result.current.createUser('Alice Clone', 'alice@metrik.local');
      });
    }).toThrow(/e-mail já cadastrado/i);
  });

  it('allows active user to create a squad and automatically becomes admin', () => {
    const { result } = renderHook(() => useTeamAccess());

    let newSquad: any;
    act(() => {
      newSquad = result.current.createTeam('Squad Checkout', 'Squad de pagamentos e carrinho');
    });

    expect(newSquad).toBeDefined();
    expect(newSquad.name).toBe('Squad Checkout');
    expect(newSquad.createdById).toBe(result.current.activeUser?.id);

    const role = result.current.getUserRoleInTeam(newSquad.id, result.current.activeUser!.id);
    expect(role).toBe('admin');
  });

  it('prevents removing the last admin from a squad', () => {
    const { result } = renderHook(() => useTeamAccess());

    let newSquad: any;
    act(() => {
      newSquad = result.current.createTeam('Squad Growth');
    });

    const adminId = result.current.activeUser!.id;

    expect(() => {
      act(() => {
        result.current.removeMember(newSquad.id, adminId);
      });
    }).toThrow(/não é possível remover o único administrador/i);
  });

  it('handles team invitation lifecycle and acceptance by another user', () => {
    const { result } = renderHook(() => useTeamAccess());

    // 1. Create team
    let squad: any;
    act(() => {
      squad = result.current.createTeam('Squad Alfa');
    });

    // 2. Create invite for Bob
    let invite: any;
    act(() => {
      invite = result.current.createInvitation(squad.id, 'bob@metrik.local', 'member');
    });

    expect(invite.status).toBe('pending');
    expect(invite.code).toBeDefined();
    expect(invite.code.length).toBeGreaterThan(5);

    // 3. Create Bob user and switch to Bob
    let bob: any;
    act(() => {
      bob = result.current.createUser('Bob Builder', 'bob@metrik.local');
      result.current.setActiveUserId(bob.id);
    });

    // Before accepting, Bob has no role in squad
    expect(result.current.getUserRoleInTeam(squad.id, bob.id)).toBeNull();

    // 4. Bob accepts invite with code
    act(() => {
      result.current.acceptInvitation(invite.code, bob.id);
    });

    // After accepting, Bob is member of squad
    expect(result.current.getUserRoleInTeam(squad.id, bob.id)).toBe('member');
  });

  it('correctly resolves board accessibility (isBoardAccessible)', () => {
    const { result } = renderHook(() => useTeamAccess());

    let squadA: any;
    let squadB: any;
    let userB: any;

    act(() => {
      squadA = result.current.createTeam('Squad A');
      userB = result.current.createUser('User B', 'user.b@metrik.local');
    });

    act(() => {
      result.current.setActiveUserId(userB.id);
    });

    act(() => {
      squadB = result.current.createTeam('Squad B');
    });

    // While userB is active:
    // Should have access to squadB's board
    expect(result.current.isBoardAccessible(squadB.id, userB.id)).toBe(true);

    // Should NOT have access to squadA's board
    expect(result.current.isBoardAccessible(squadA.id, userB.id)).toBe(false);

    // Now invite userB as guest to squadA
    let inviteA: any;
    act(() => {
      result.current.setActiveUserId(DEFAULT_USER_ID);
    });

    act(() => {
      inviteA = result.current.createInvitation(squadA.id, 'user.b@metrik.local', 'guest');
    });

    act(() => {
      result.current.setActiveUserId(userB.id);
    });

    act(() => {
      result.current.acceptInvitation(inviteA.code, userB.id);
    });

    // Now userB should have access to squadA as guest
    expect(result.current.isBoardAccessible(squadA.id, userB.id)).toBe(true);
    expect(result.current.getUserRoleInTeam(squadA.id, userB.id)).toBe('guest');
  });
});
