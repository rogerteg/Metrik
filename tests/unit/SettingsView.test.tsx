import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SettingsView } from '../../src/components/Settings/SettingsView';
import { AppSettings, Workspace } from '../../src/types/workspace';
import { Team, User } from '../../src/types/team';

describe('SettingsView Component (Feature 029 - US2 Separate Settings)', () => {
  const mockSettings: AppSettings = {
    theme: 'dark',
    density: 'comfortable',
    defaultView: 'board',
    defaultWipLimit: 3,
    enableAnimations: true,
    showWipLimits: true,
    showCycleTimeBadges: true,
    updatedAt: '2026-01-01T00:00:00.000Z',
  };

  const mockWorkspaces: Workspace[] = [
    {
      id: 'ws-1',
      name: 'Gestão de Engenharia',
      color: '#38bdf8',
      boardIds: ['b-1'],
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    },
  ];

  const mockTeams: Team[] = [
    {
      id: 'team-1',
      name: 'Squad Core',
      description: 'Time de infraestrutura e produto',
      createdById: 'user-1',
      createdAt: '2026-01-01T00:00:00.000Z',
    },
  ];

  const mockUsers: User[] = [
    {
      id: 'user-1',
      name: 'Rogerio Teixeira',
      email: 'rogerio@metrik.local',
      createdAt: '2026-01-01T00:00:00.000Z',
    },
  ];

  it('renders 2-column layout with category tabs and "← Voltar ao Quadro" button', () => {
    const onBack = vi.fn();
    render(
      <SettingsView
        settings={mockSettings}
        onUpdateSettings={vi.fn()}
        workspaces={mockWorkspaces}
        onUpdateWorkspace={vi.fn()}
        onCreateWorkspace={vi.fn()}
        teams={mockTeams}
        users={mockUsers}
        onBackToBoard={onBack}
        onExportData={vi.fn()}
        onImportData={vi.fn()}
        onClearTasks={vi.fn()}
      />
    );

    expect(screen.getByText('Configurações do Sistema')).toBeDefined();
    expect(screen.getByRole('tab', { name: /geral & aparência/i })).toBeDefined();
    expect(screen.getByRole('tab', { name: /espaços & squads/i })).toBeDefined();
    expect(screen.getByRole('tab', { name: /políticas de fluxo/i })).toBeDefined();
    expect(screen.getByRole('tab', { name: /portabilidade & dados/i })).toBeDefined();

    const backBtn = screen.getByRole('button', { name: /voltar ao quadro/i });
    expect(backBtn).toBeDefined();
    fireEvent.click(backBtn);
    expect(onBack).toHaveBeenCalled();
  });

  it('switches tabs and displays corresponding settings content', () => {
    render(
      <SettingsView
        settings={mockSettings}
        onUpdateSettings={vi.fn()}
        workspaces={mockWorkspaces}
        onUpdateWorkspace={vi.fn()}
        onCreateWorkspace={vi.fn()}
        teams={mockTeams}
        users={mockUsers}
        onBackToBoard={vi.fn()}
        onExportData={vi.fn()}
        onImportData={vi.fn()}
        onClearTasks={vi.fn()}
      />
    );

    // Initial tab is General & Appearance
    expect(screen.getByText('Tema Visual')).toBeDefined();

    // Click on Workspaces & Squads tab
    const wsTabBtn = screen.getByRole('tab', { name: /espaços & squads/i });
    fireEvent.click(wsTabBtn);
    expect(screen.getByText('Gestão de Engenharia')).toBeDefined();

    // Click on Flow Policies tab
    const policiesTabBtn = screen.getByRole('tab', { name: /políticas de fluxo/i });
    fireEvent.click(policiesTabBtn);
    expect(screen.getByText('Limites de Trabalho em Progresso (WIP)')).toBeDefined();

    // Click on Data Portability tab
    const dataTabBtn = screen.getByRole('tab', { name: /portabilidade & dados/i });
    fireEvent.click(dataTabBtn);
    expect(screen.getByText('Exportar Backup JSON')).toBeDefined();
  });

  it('calls onUpdateSettings when toggling preferences in General tab', () => {
    const onUpdateSettings = vi.fn();
    render(
      <SettingsView
        settings={mockSettings}
        onUpdateSettings={onUpdateSettings}
        workspaces={mockWorkspaces}
        onUpdateWorkspace={vi.fn()}
        onCreateWorkspace={vi.fn()}
        teams={mockTeams}
        users={mockUsers}
        onBackToBoard={vi.fn()}
        onExportData={vi.fn()}
        onImportData={vi.fn()}
        onClearTasks={vi.fn()}
      />
    );

    const lightThemeBtn = screen.getByRole('button', { name: /claro/i });
    fireEvent.click(lightThemeBtn);
    expect(onUpdateSettings).toHaveBeenCalledWith(
      expect.objectContaining({ theme: 'light' })
    );
  });
});
