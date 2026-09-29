import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { CloudSyncTab } from '../../src/components/Settings/CloudSyncTab';
import { Workspace } from '../../src/types/workspace';
import { BoardModel, BoardState } from '../../src/types/kanban';
import { Team, TeamMember } from '../../src/types/team';

// Serviços mockados (sem rede).
vi.mock('../../src/services/supabase/syncService', () => ({
  testConnection: vi.fn(),
  pushToSupabase: vi.fn(),
  pullFromSupabase: vi.fn(),
  checkSprintMigration: vi.fn(),
}));
vi.mock('../../src/services/supabase/client', () => ({
  getSupabaseConfigStatus: () => ({
    isConfigured: true,
    url: 'https://demo.supabase.co',
    hasAnonKey: true,
  }),
}));

import {
  testConnection,
  pushToSupabase,
  pullFromSupabase,
  checkSprintMigration,
} from '../../src/services/supabase/syncService';

const mockPush = vi.mocked(pushToSupabase);
const mockPull = vi.mocked(pullFromSupabase);
const mockTest = vi.mocked(testConnection);
const mockMigration = vi.mocked(checkSprintMigration);

const workspaces: Workspace[] = [
  { id: 'ws-1', name: 'Geral', color: '#38bdf8', boardIds: ['b1'], createdAt: 'x', updatedAt: 'x' },
];
const boards: BoardModel[] = [
  { id: 'b1', name: 'Quadro 1', teamId: 't1', createdAt: 'x', lastAccessed: 'x' },
];
const teams: Team[] = [{ id: 't1', name: 'Time A', createdById: 'u1', createdAt: 'x' }];
const teamMembers: TeamMember[] = [
  { id: 'm1', teamId: 't1', userId: 'u1', role: 'admin', joinedAt: 'x' },
];

describe('CloudSyncTab', () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem('metrik-tasks-b1', JSON.stringify({ columns: [], tasks: {} }));
    vi.clearAllMocks();
    mockMigration.mockResolvedValue({ applied: true });
  });

  afterEach(() => vi.restoreAllMocks());

  it('pushes workspaces, boards, tasks, teams and members', async () => {
    mockPush.mockResolvedValue({
      ok: true,
      syncedCount: { workspaces: 1, boards: 1, tasks: 0, teams: 1, teamMembers: 1 },
    });
    const onShowToast = vi.fn();
    render(
      <CloudSyncTab
        workspaces={workspaces}
        boards={boards}
        teams={teams}
        teamMembers={teamMembers}
        onShowToast={onShowToast}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: /Enviar Dados Locais/i }));

    await waitFor(() => expect(mockPush).toHaveBeenCalledTimes(1));
    const payload = mockPush.mock.calls[0][0];
    expect(payload.teams).toHaveLength(1);
    expect(payload.teamMembers).toHaveLength(1);
    expect(payload.tasksByBoardId.b1).toBeDefined();
    expect(onShowToast).toHaveBeenCalledWith(
      expect.stringContaining('Sincronização concluída'),
      'success',
    );
  });

  it('surfaces the migration warning from a successful push', async () => {
    mockPush.mockResolvedValue({
      ok: true,
      syncedCount: { workspaces: 0, boards: 1, tasks: 0 },
      warning: 'Colunas de sprint ainda não existem no Supabase.',
    });
    const onShowToast = vi.fn();
    render(<CloudSyncTab workspaces={workspaces} boards={boards} onShowToast={onShowToast} />);

    fireEvent.click(screen.getByRole('button', { name: /Enviar Dados Locais/i }));

    await waitFor(() =>
      expect(onShowToast).toHaveBeenCalledWith(
        'Colunas de sprint ainda não existem no Supabase.',
        'warning',
      ),
    );
  });

  it('toggles automatic synchronization', () => {
    const onToggleAutoSync = vi.fn();
    render(
      <CloudSyncTab
        workspaces={[]}
        boards={[]}
        autoSyncEnabled={false}
        onToggleAutoSync={onToggleAutoSync}
        isAutoSyncing
        autoSyncLastAt="14:05"
      />,
    );

    expect(screen.getByTestId('cloud-autosync-last')).toHaveTextContent('14:05');

    fireEvent.click(screen.getByTestId('cloud-autosync-toggle'));
    expect(onToggleAutoSync).toHaveBeenCalledWith(true);
  });

  it('shows the migration banner when columns are missing and copies the SQL', async () => {
    mockMigration.mockResolvedValue({ applied: false, error: 'MIGRATION_PENDING' });
    const onShowToast = vi.fn();
    render(<CloudSyncTab workspaces={[]} boards={[]} onShowToast={onShowToast} />);

    expect(await screen.findByTestId('cloud-migration-banner')).toBeInTheDocument();

    fireEvent.click(screen.getByTestId('copy-migration-sql'));
    await waitFor(() =>
      expect(onShowToast).toHaveBeenCalledWith(expect.stringContaining('copiado'), 'success'),
    );
  });

  it('tests the connection and shows the result', async () => {
    mockTest.mockResolvedValue({ ok: true, message: 'Conexão bem-sucedida!', latencyMs: 12 });
    const onShowToast = vi.fn();
    render(<CloudSyncTab workspaces={[]} boards={[]} onShowToast={onShowToast} />);

    fireEvent.click(screen.getByRole('button', { name: /Testar Conexão/i }));

    await waitFor(() =>
      expect(onShowToast).toHaveBeenCalledWith('Conexão bem-sucedida!', 'success'),
    );
    expect(screen.getByText(/Conexão bem-sucedida!/)).toBeInTheDocument();
  });

  it('pulls remote data and persists teams/members to localStorage', async () => {
    const remoteState: BoardState = { columns: [], tasks: {} };
    mockPull.mockResolvedValue({
      ok: true,
      data: {
        workspaces,
        boards,
        tasksByBoardId: { b1: remoteState },
        teams,
        teamMembers,
      },
    });
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    const onApplyRemoteData = vi.fn();
    const onShowToast = vi.fn();

    render(
      <CloudSyncTab
        workspaces={[]}
        boards={[]}
        onApplyRemoteData={onApplyRemoteData}
        onShowToast={onShowToast}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: /Baixar Dados da Nuvem/i }));

    await waitFor(() => expect(mockPull).toHaveBeenCalledTimes(1));
    await waitFor(() =>
      expect(JSON.parse(localStorage.getItem('metrik_teams') || '[]')).toHaveLength(1),
    );
    expect(JSON.parse(localStorage.getItem('metrik_team_members') || '[]')).toHaveLength(1);
    expect(onApplyRemoteData).toHaveBeenCalledWith(expect.objectContaining({ teams, teamMembers }));
  });
});
