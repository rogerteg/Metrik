import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { WorkspacesSettingsTab } from '../../src/components/Settings/WorkspacesSettingsTab';
import { Workspace } from '../../src/types/workspace';
import { BoardModel } from '../../src/types/kanban';

/** Feature 029 — configuração de espaços de trabalho (aba Espaços). */
const customWs: Workspace = {
  id: 'ws-custom',
  name: 'Produção',
  description: 'Fluxo de entrega',
  color: '#38bdf8',
  boardIds: [],
  createdAt: '2026-09-01T00:00:00.000Z',
  updatedAt: '2026-09-01T00:00:00.000Z',
};

const defaultWs: Workspace = { ...customWs, id: 'workspace-default', name: 'Geral' };

const boards: BoardModel[] = [
  { id: 'b1', name: 'Board 1', teamId: 't1', createdAt: '2026-09-01', lastAccessed: '2026-09-01' },
  { id: 'b2', name: 'Board 2', teamId: 't1', createdAt: '2026-09-01', lastAccessed: '2026-09-01' },
];

const renderTab = (
  workspaces: Workspace[],
  over: Partial<Parameters<typeof WorkspacesSettingsTab>[0]> = {},
) => {
  const handlers = {
    onUpdateWorkspace: vi.fn(),
    onCreateWorkspace: vi.fn(),
    onAddBoardToWorkspace: vi.fn(),
    onRemoveBoardFromWorkspace: vi.fn(),
    onDeleteWorkspace: vi.fn(),
  };
  render(
    <WorkspacesSettingsTab
      workspaces={workspaces}
      boards={boards}
      teams={[]}
      users={[]}
      {...handlers}
      {...over}
    />,
  );
  return handlers;
};

describe('WorkspacesSettingsTab (Feature 029)', () => {
  afterEach(() => vi.restoreAllMocks());

  it('edits name and description and saves', () => {
    const h = renderTab([customWs]);
    fireEvent.click(screen.getByRole('button', { name: 'Editar' }));

    fireEvent.change(screen.getByPlaceholderText('Nome do espaço'), {
      target: { value: 'Produção Nova' },
    });
    fireEvent.change(screen.getByPlaceholderText(/Squad responsável/i), {
      target: { value: 'Nova descrição' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Salvar' }));

    expect(h.onUpdateWorkspace).toHaveBeenCalledWith(
      'ws-custom',
      expect.objectContaining({ name: 'Produção Nova', description: 'Nova descrição' }),
    );
  });

  it('changes the marker color', () => {
    const h = renderTab([customWs]);
    fireEvent.click(screen.getByRole('button', { name: 'Editar' }));
    fireEvent.click(screen.getByRole('button', { name: 'Cor #ef4444' }));
    expect(h.onUpdateWorkspace).toHaveBeenCalledWith('ws-custom', { color: '#ef4444' });
  });

  it('links an unlinked board', () => {
    const h = renderTab([customWs]);
    fireEvent.click(screen.getByRole('button', { name: 'Editar' }));

    fireEvent.click(screen.getByLabelText('Vincular quadro Board 1'));
    expect(h.onAddBoardToWorkspace).toHaveBeenCalledWith('ws-custom', 'b1');
  });

  it('unlinks an already linked board', () => {
    const linkedWs: Workspace = { ...customWs, boardIds: ['b2'] };
    const h = renderTab([linkedWs]);
    fireEvent.click(screen.getByRole('button', { name: 'Editar' }));

    fireEvent.click(screen.getByLabelText('Vincular quadro Board 2'));
    expect(h.onRemoveBoardFromWorkspace).toHaveBeenCalledWith('ws-custom', 'b2');
  });

  it('deletes a non-default workspace after confirmation', () => {
    const h = renderTab([customWs]);
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    fireEvent.click(screen.getByTestId('delete-workspace-ws-custom'));
    expect(h.onDeleteWorkspace).toHaveBeenCalledWith('ws-custom');
  });

  it('does not offer delete for the default workspace', () => {
    renderTab([defaultWs]);
    expect(screen.queryByTestId('delete-workspace-workspace-default')).toBeNull();
  });
});
