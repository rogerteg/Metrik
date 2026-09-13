import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  User,
  Team,
  TeamMember,
  TeamInvitation,
  TeamRole,
  USERS_STORAGE_KEY,
  ACTIVE_USER_STORAGE_KEY,
  TEAMS_STORAGE_KEY,
  TEAM_MEMBERS_STORAGE_KEY,
  TEAM_INVITATIONS_STORAGE_KEY,
  DEFAULT_TEAM_ID,
  DEFAULT_USER_ID,
} from '../types/team';

const DEFAULT_USER: User = {
  id: DEFAULT_USER_ID,
  name: 'Administrador',
  email: 'admin@metrik.local',
  createdAt: '2026-01-01T00:00:00.000Z',
};

const DEFAULT_TEAM: Team = {
  id: DEFAULT_TEAM_ID,
  name: 'Time Principal',
  description: 'Squad padrão corporativa do Metrik',
  createdById: DEFAULT_USER_ID,
  createdAt: '2026-01-01T00:00:00.000Z',
};

const DEFAULT_MEMBER: TeamMember = {
  id: 'member-default-admin',
  teamId: DEFAULT_TEAM_ID,
  userId: DEFAULT_USER_ID,
  role: 'admin',
  joinedAt: '2026-01-01T00:00:00.000Z',
};

function safeGetStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch (err) {
    console.warn(`[Metrik] Failed to read ${key} from storage:`, err);
    return fallback;
  }
}

function safeSetStorage<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (err) {
    console.warn(`[Metrik] Failed to persist ${key} to storage:`, err);
  }
}

export function useTeamAccess() {
  const [users, setUsers] = useState<User[]>(() => {
    const stored = safeGetStorage<User[]>(USERS_STORAGE_KEY, []);
    if (stored.length > 0) return stored;
    return [DEFAULT_USER];
  });

  const [activeUserId, setActiveUserIdState] = useState<string>(() => {
    try {
      const stored = localStorage.getItem(ACTIVE_USER_STORAGE_KEY);
      if (stored) return stored;
    } catch {
      // ignore
    }
    return DEFAULT_USER_ID;
  });

  const [teams, setTeams] = useState<Team[]>(() => {
    const stored = safeGetStorage<Team[]>(TEAMS_STORAGE_KEY, []);
    if (stored.length > 0) return stored;
    return [DEFAULT_TEAM];
  });

  const [teamMembers, setTeamMembers] = useState<TeamMember[]>(() => {
    const stored = safeGetStorage<TeamMember[]>(TEAM_MEMBERS_STORAGE_KEY, []);
    if (stored.length > 0) return stored;
    return [DEFAULT_MEMBER];
  });

  const [invitations, setInvitations] = useState<TeamInvitation[]>(() => {
    return safeGetStorage<TeamInvitation[]>(TEAM_INVITATIONS_STORAGE_KEY, []);
  });

  const [isInitialized, setIsInitialized] = useState(false);

  // Initial persist if first run
  useEffect(() => {
    safeSetStorage(USERS_STORAGE_KEY, users);
    safeSetStorage(TEAMS_STORAGE_KEY, teams);
    safeSetStorage(TEAM_MEMBERS_STORAGE_KEY, teamMembers);
    safeSetStorage(TEAM_INVITATIONS_STORAGE_KEY, invitations);
    try {
      localStorage.setItem(ACTIVE_USER_STORAGE_KEY, activeUserId);
    } catch {
      // ignore
    }
    setIsInitialized(true);
  }, []);

  // Multi-tab storage listener
  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === USERS_STORAGE_KEY && e.newValue) {
        setUsers(JSON.parse(e.newValue));
      }
      if (e.key === ACTIVE_USER_STORAGE_KEY && e.newValue) {
        setActiveUserIdState(e.newValue);
      }
      if (e.key === TEAMS_STORAGE_KEY && e.newValue) {
        setTeams(JSON.parse(e.newValue));
      }
      if (e.key === TEAM_MEMBERS_STORAGE_KEY && e.newValue) {
        setTeamMembers(JSON.parse(e.newValue));
      }
      if (e.key === TEAM_INVITATIONS_STORAGE_KEY && e.newValue) {
        setInvitations(JSON.parse(e.newValue));
      }
    };

    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const activeUser = useMemo(() => {
    return users.find((u) => u.id === activeUserId) || users[0] || null;
  }, [users, activeUserId]);

  const setActiveUserId = useCallback((id: string) => {
    setActiveUserIdState(id);
    try {
      localStorage.setItem(ACTIVE_USER_STORAGE_KEY, id);
    } catch (err) {
      console.warn('[Metrik] Failed to set active user in storage:', err);
    }
  }, []);

  const createUser = useCallback(
    (name: string, email: string, avatarUrl?: string): User => {
      const cleanName = name.trim();
      const cleanEmail = email.trim().toLowerCase();

      if (!cleanName) {
        throw new Error('Nome do usuário é obrigatório.');
      }
      if (!cleanEmail || !cleanEmail.includes('@')) {
        throw new Error('E-mail válido é obrigatório.');
      }

      const duplicate = users.some((u) => u.email.toLowerCase() === cleanEmail);
      if (duplicate) {
        throw new Error(`E-mail já cadastrado: ${cleanEmail}`);
      }

      const newUser: User = {
        id: crypto.randomUUID(),
        name: cleanName,
        email: cleanEmail,
        avatarUrl,
        createdAt: new Date().toISOString(),
      };

      const updated = [...users, newUser];
      setUsers(updated);
      safeSetStorage(USERS_STORAGE_KEY, updated);
      return newUser;
    },
    [users]
  );

  const createTeam = useCallback(
    (name: string, description?: string): Team => {
      const cleanName = name.trim();
      if (!cleanName) {
        throw new Error('Nome do time/squad é obrigatório.');
      }

      const creatorId = activeUserId || (activeUser ? activeUser.id : DEFAULT_USER_ID);

      const newTeam: Team = {
        id: crypto.randomUUID(),
        name: cleanName,
        description: description?.trim() || '',
        createdById: creatorId,
        createdAt: new Date().toISOString(),
      };

      const newMember: TeamMember = {
        id: crypto.randomUUID(),
        teamId: newTeam.id,
        userId: creatorId,
        role: 'admin',
        joinedAt: new Date().toISOString(),
      };

      const updatedTeams = [...teams, newTeam];
      const updatedMembers = [...teamMembers, newMember];

      setTeams(updatedTeams);
      setTeamMembers(updatedMembers);

      safeSetStorage(TEAMS_STORAGE_KEY, updatedTeams);
      safeSetStorage(TEAM_MEMBERS_STORAGE_KEY, updatedMembers);

      return newTeam;
    },
    [activeUserId, activeUser, teams, teamMembers]
  );

  const updateTeam = useCallback(
    (teamId: string, updates: Partial<Pick<Team, 'name' | 'description'>>) => {
      const updatedTeams = teams.map((t) => {
        if (t.id !== teamId) return t;
        return {
          ...t,
          name: updates.name !== undefined ? updates.name.trim() : t.name,
          description: updates.description !== undefined ? updates.description.trim() : t.description,
        };
      });

      setTeams(updatedTeams);
      safeSetStorage(TEAMS_STORAGE_KEY, updatedTeams);
    },
    [teams]
  );

  const getUserRoleInTeam = useCallback(
    (teamId: string, userId?: string): TeamRole | null => {
      const targetUserId = userId || (activeUser ? activeUser.id : null);
      if (!targetUserId) return null;

      const member = teamMembers.find((m) => m.teamId === teamId && m.userId === targetUserId);
      return member ? member.role : null;
    },
    [activeUser, teamMembers]
  );

  const myTeams = useMemo(() => {
    if (!activeUser) return [];
    const myTeamIds = new Set(
      teamMembers.filter((m) => m.userId === activeUser.id).map((m) => m.teamId)
    );
    return teams.filter((t) => myTeamIds.has(t.id));
  }, [teams, teamMembers, activeUser]);

  const getMembersByTeam = useCallback(
    (teamId: string) => {
      const members = teamMembers.filter((m) => m.teamId === teamId);
      return members.map((m) => ({
        ...m,
        user: users.find((u) => u.id === m.userId),
      }));
    },
    [teamMembers, users]
  );

  const addMember = useCallback(
    (teamId: string, userId: string, role: TeamRole = 'member'): TeamMember => {
      const existing = teamMembers.find((m) => m.teamId === teamId && m.userId === userId);
      if (existing) {
        return existing;
      }

      const newMember: TeamMember = {
        id: crypto.randomUUID(),
        teamId,
        userId,
        role,
        joinedAt: new Date().toISOString(),
      };

      const updated = [...teamMembers, newMember];
      setTeamMembers(updated);
      safeSetStorage(TEAM_MEMBERS_STORAGE_KEY, updated);
      return newMember;
    },
    [teamMembers]
  );

  const removeMember = useCallback(
    (teamId: string, userId: string) => {
      const membersOfTeam = teamMembers.filter((m) => m.teamId === teamId);
      const targetMember = membersOfTeam.find((m) => m.userId === userId);

      if (!targetMember) return;

      if (targetMember.role === 'admin') {
        const adminCount = membersOfTeam.filter((m) => m.role === 'admin').length;
        if (adminCount <= 1) {
          throw new Error('Não é possível remover o único administrador da squad.');
        }
      }

      const updated = teamMembers.filter((m) => !(m.teamId === teamId && m.userId === userId));
      setTeamMembers(updated);
      safeSetStorage(TEAM_MEMBERS_STORAGE_KEY, updated);
    },
    [teamMembers]
  );

  const updateMemberRole = useCallback(
    (teamId: string, userId: string, newRole: TeamRole) => {
      const membersOfTeam = teamMembers.filter((m) => m.teamId === teamId);
      const targetMember = membersOfTeam.find((m) => m.userId === userId);

      if (!targetMember) return;

      if (targetMember.role === 'admin' && newRole !== 'admin') {
        const adminCount = membersOfTeam.filter((m) => m.role === 'admin').length;
        if (adminCount <= 1) {
          throw new Error('Não é possível alterar o papel do único administrador da squad.');
        }
      }

      const updated = teamMembers.map((m) => {
        if (m.teamId === teamId && m.userId === userId) {
          return { ...m, role: newRole };
        }
        return m;
      });

      setTeamMembers(updated);
      safeSetStorage(TEAM_MEMBERS_STORAGE_KEY, updated);
    },
    [teamMembers]
  );

  const createInvitation = useCallback(
    (teamId: string, email: string, role: TeamRole = 'member'): TeamInvitation => {
      const cleanEmail = email.trim().toLowerCase();
      if (!cleanEmail || !cleanEmail.includes('@')) {
        throw new Error('E-mail válido é obrigatório para convidar.');
      }

      const inviterId = activeUser ? activeUser.id : DEFAULT_USER_ID;

      // Unique human-readable code, e.g., METRIK-8K9P-2M4X
      const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
      const randomSuffix2 = Math.random().toString(36).substring(2, 6).toUpperCase();
      const code = `METRIK-${randomSuffix}-${randomSuffix2}`;

      const newInvite: TeamInvitation = {
        id: crypto.randomUUID(),
        teamId,
        email: cleanEmail,
        role,
        invitedById: inviterId,
        code,
        status: 'pending',
        createdAt: new Date().toISOString(),
      };

      const updated = [...invitations, newInvite];
      setInvitations(updated);
      safeSetStorage(TEAM_INVITATIONS_STORAGE_KEY, updated);
      return newInvite;
    },
    [activeUser, invitations]
  );

  const acceptInvitation = useCallback(
    (code: string, userId?: string) => {
      const cleanCode = code.trim().toUpperCase();
      const invite = invitations.find((inv) => inv.code.toUpperCase() === cleanCode && inv.status === 'pending');

      if (!invite) {
        throw new Error('Convite inválido ou já utilizado.');
      }

      const targetUserId = userId || (activeUser ? activeUser.id : null);
      if (!targetUserId) {
        throw new Error('Usuário autenticado não encontrado para aceitar o convite.');
      }

      // Add as member
      addMember(invite.teamId, targetUserId, invite.role);

      // Mark invite as accepted
      const updatedInvites = invitations.map((inv) => {
        if (inv.id === invite.id) {
          return {
            ...inv,
            status: 'accepted' as const,
            acceptedAt: new Date().toISOString(),
          };
        }
        return inv;
      });

      setInvitations(updatedInvites);
      safeSetStorage(TEAM_INVITATIONS_STORAGE_KEY, updatedInvites);
    },
    [invitations, activeUser, addMember]
  );

  const revokeInvitation = useCallback(
    (invitationId: string) => {
      const updated = invitations.map((inv) => {
        if (inv.id === invitationId) {
          return { ...inv, status: 'revoked' as const };
        }
        return inv;
      });
      setInvitations(updated);
      safeSetStorage(TEAM_INVITATIONS_STORAGE_KEY, updated);
    },
    [invitations]
  );

  const getPendingInvitationsForUser = useCallback(
    (email?: string) => {
      const targetEmail = email || (activeUser ? activeUser.email : '');
      if (!targetEmail) return [];
      return invitations.filter(
        (inv) => inv.email.toLowerCase() === targetEmail.toLowerCase() && inv.status === 'pending'
      );
    },
    [activeUser, invitations]
  );

  const isBoardAccessible = useCallback(
    (boardTeamId?: string, userId?: string): boolean => {
      // If board has no teamId, fallback to default team
      const effectiveTeamId = boardTeamId || DEFAULT_TEAM_ID;
      const targetUserId = userId || (activeUser ? activeUser.id : null);
      if (!targetUserId) return false;

      const member = teamMembers.find(
        (m) => m.teamId === effectiveTeamId && m.userId === targetUserId
      );

      return !!member;
    },
    [activeUser, teamMembers]
  );

  return {
    users,
    activeUser,
    activeUserId: activeUser ? activeUser.id : DEFAULT_USER_ID,
    setActiveUserId,
    selectUser: setActiveUserId,
    createUser,
    teams,
    myTeams,
    createTeam,
    updateTeam,
    teamMembers,
    getMembersByTeam,
    getUserRoleInTeam,
    addMember,
    removeMember,
    updateMemberRole,
    invitations,
    createInvitation,
    acceptInvitation,
    revokeInvitation,
    getPendingInvitationsForUser,
    isBoardAccessible,
    isInitialized,
  };
}
