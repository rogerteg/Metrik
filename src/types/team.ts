export type TeamRole = 'admin' | 'member' | 'guest';

export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  createdAt: string;
}

export interface Team {
  id: string;
  name: string;
  description?: string;
  createdById: string;
  createdAt: string;
  members?: TeamMember[];
}

export interface TeamMember {
  id: string;
  teamId: string;
  userId: string;
  role: TeamRole;
  joinedAt: string;
}

export type InvitationStatus = 'pending' | 'accepted' | 'revoked';

export interface TeamInvitation {
  id: string;
  teamId: string;
  email: string;
  inviteeEmail?: string;
  role: TeamRole;
  invitedById: string;
  code: string;
  status: InvitationStatus;
  createdAt: string;
  acceptedAt?: string;
}

export const USERS_STORAGE_KEY = 'metrik_users';
export const ACTIVE_USER_STORAGE_KEY = 'metrik_active_user_id';
export const TEAMS_STORAGE_KEY = 'metrik_teams';
export const TEAM_MEMBERS_STORAGE_KEY = 'metrik_team_members';
export const TEAM_INVITATIONS_STORAGE_KEY = 'metrik_team_invitations';
export const DEFAULT_TEAM_ID = 'default-team-main';
export const DEFAULT_USER_ID = 'default-user-admin';
