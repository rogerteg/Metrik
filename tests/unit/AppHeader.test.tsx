import { createRef } from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AppHeader, AppHeaderProps } from '../../src/components/AppHeader';
import { BoardModel } from '../../src/types/kanban';
import { Team, User } from '../../src/types/team';

describe('AppHeader Component (Feature 049 - Modular Decomposition)', () => {
  const sampleBoards: BoardModel[] = [
    {
      id: 'board-1',
      name: 'Quadro Alfa',
      createdAt: '2026-01-01T00:00:00Z',
      lastAccessed: '2026-01-01T00:00:00Z',
    },
    {
      id: 'board-2',
      name: 'Quadro Beta',
      createdAt: '2026-01-02T00:00:00Z',
      lastAccessed: '2026-01-02T00:00:00Z',
    },
  ];

  const sampleTeams: Team[] = [
    {
      id: 'team-1',
      name: 'Time Engenharia',
      createdById: 'user-1',
      createdAt: '2026-01-01T00:00:00Z',
    },
  ];

  const sampleUsers: User[] = [
    {
      id: 'user-1',
      name: 'Dev Tester',
      email: 'dev@metrik.local',
      createdAt: '2026-01-01T00:00:00Z',
    },
  ];

  const createProps = (overrides?: Partial<AppHeaderProps>): AppHeaderProps => {
    const fileRef = createRef<HTMLInputElement>();
    return {
      boards: sampleBoards,
      activeBoardId: 'board-1',
      onSwitchBoard: vi.fn(),
      teams: sampleTeams,
      activeUserId: 'user-1',
      view: 'board',
      onSelectView: vi.fn(),
      theme: 'light',
      onSelectTheme: vi.fn(),
      users: sampleUsers,
      activeUser: sampleUsers[0],
      onSelectUser: vi.fn(),
      onCreateUser: vi.fn(),
      onOpenTeamsModal: vi.fn(),
      fileInputRef: fileRef,
      onFileChange: vi.fn(),
      onImportClick: vi.fn(),
      onExport: vi.fn(),
      onResetDemo: vi.fn(),
      onClearBoard: vi.fn(),
      isGuest: false,
      onOpenMika: vi.fn(),
      isMikaOpen: false,
      hasMikaAlerts: false,
      ...overrides,
    };
  };

  it('renders branding title and logo correctly', () => {
    const props = createProps();
    render(<AppHeader {...props} />);

    expect(screen.getByText('Metrik')).toBeInTheDocument();
    expect(screen.getByText('Métricas para Gestão Ágil')).toBeInTheDocument();
    expect(
      screen.getByRole('img', { name: /Metrik — Métricas para Gestão Ágil/i }),
    ).toBeInTheDocument();
  });

  it('triggers view navigation callbacks on button clicks', () => {
    const onSelectView = vi.fn();
    const props = createProps({ onSelectView });
    render(<AppHeader {...props} />);

    // Click Espaços
    fireEvent.click(screen.getByRole('button', { name: 'Espaços' }));
    expect(onSelectView).toHaveBeenCalledWith('workspaces');

    // Click Quadro
    fireEvent.click(screen.getByRole('button', { name: 'Quadro' }));
    expect(onSelectView).toHaveBeenCalledWith('board');

    // Click Analytics
    fireEvent.click(screen.getByRole('button', { name: 'Analytics' }));
    expect(onSelectView).toHaveBeenCalledWith('analytics');

    // Click Gerenciar
    fireEvent.click(screen.getByRole('button', { name: 'Gerenciar' }));
    expect(onSelectView).toHaveBeenCalledWith('manage');

    // Click Configurações
    fireEvent.click(screen.getByRole('button', { name: /Configurações do Sistema/i }));
    expect(onSelectView).toHaveBeenCalledWith('settings');
  });

  it('triggers board operational actions (import, export, reset demo, clear)', () => {
    const onImportClick = vi.fn();
    const onExport = vi.fn();
    const onResetDemo = vi.fn();
    const onClearBoard = vi.fn();

    const props = createProps({
      onImportClick,
      onExport,
      onResetDemo,
      onClearBoard,
      isGuest: false,
    });
    render(<AppHeader {...props} />);

    fireEvent.click(screen.getByRole('button', { name: 'Importar Quadro' }));
    expect(onImportClick).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole('button', { name: 'Exportar Quadro' }));
    expect(onExport).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole('button', { name: 'Restaurar Demo' }));
    expect(onResetDemo).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole('button', { name: 'Limpar Quadro' }));
    expect(onClearBoard).toHaveBeenCalledTimes(1);
  });

  it('hides destructive and mutation buttons for guest users', () => {
    const props = createProps({ isGuest: true });
    render(<AppHeader {...props} />);

    // Export remains available
    expect(screen.getByRole('button', { name: 'Exportar Quadro' })).toBeInTheDocument();

    // Import, Reset and Clear should be hidden
    expect(screen.queryByRole('button', { name: 'Importar Quadro' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Restaurar Demo' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Limpar Quadro' })).not.toBeInTheDocument();
  });

  it('triggers Mika AI copilot toggle when clicked', () => {
    const onOpenMika = vi.fn();
    const props = createProps({ onOpenMika, isMikaOpen: false, hasMikaAlerts: true });
    render(<AppHeader {...props} />);

    const mikaTrigger = screen.getByRole('button', { name: /Abrir copiloto Mika AI/i });
    expect(mikaTrigger).toBeInTheDocument();

    fireEvent.click(mikaTrigger);
    expect(onOpenMika).toHaveBeenCalledTimes(1);
  });
});
