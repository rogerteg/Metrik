import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { WorkspaceHub } from '../../src/components/WorkspaceHub/WorkspaceHub';
import { Workspace } from '../../src/types/workspace';
import { Board } from '../../src/types/kanban';

describe('WorkspaceHub Component (Feature 029 - US1 MVP)', () => {
  const mockWorkspaces: Workspace[] = [
    {
      id: 'ws-gestao',
      name: 'Gestão',
      color: '#eab308',
      boardIds: ['b-gestao-1'],
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    },
    {
      id: 'ws-producao',
      name: 'Produção',
      color: '#f97316',
      boardIds: ['b-prod-1', 'b-prod-2'],
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    },
  ];

  const mockBoards: Board[] = [
    {
      id: 'b-gestao-1',
      name: 'Objetivos Estratégicos',
      columns: [],
      tasks: {},
      createdAt: '2026-01-01T00:00:00.000Z',
      lastAccessed: '2026-01-01T00:00:00.000Z',
    },
    {
      id: 'b-prod-1',
      name: 'Projetos do 4º Trimestre',
      columns: [],
      tasks: {},
      createdAt: '2026-01-01T00:00:00.000Z',
      lastAccessed: '2026-01-01T00:00:00.000Z',
    },
    {
      id: 'b-prod-2',
      name: 'Entregas da Squad',
      columns: [],
      tasks: {},
      createdAt: '2026-01-01T00:00:00.000Z',
      lastAccessed: '2026-01-01T00:00:00.000Z',
    },
  ];

  it('renders sidebar with workspace list, color bullets, and "Todos os espaços" button', () => {
    render(
      <WorkspaceHub
        workspaces={mockWorkspaces}
        activeWorkspaceId="ws-producao"
        onSelectWorkspace={vi.fn()}
        boards={mockBoards}
        favoriteBoardIds={['b-prod-1']}
        onToggleFavorite={vi.fn()}
        onSelectBoard={vi.fn()}
      />
    );

    expect(screen.getByText('Todos os espaços de trabalho')).toBeDefined();
    expect(screen.getByText('Gestão')).toBeDefined();
    expect(screen.getAllByText('Produção').length).toBeGreaterThan(0);
    expect(screen.getByText('+ Novo painel')).toBeDefined();
  });

  it('renders favorites vitrine with favorited boards and triggers board selection', () => {
    const onSelectBoard = vi.fn();
    render(
      <WorkspaceHub
        workspaces={mockWorkspaces}
        activeWorkspaceId="ws-producao"
        onSelectWorkspace={vi.fn()}
        boards={mockBoards}
        favoriteBoardIds={['b-prod-1']}
        onToggleFavorite={vi.fn()}
        onSelectBoard={onSelectBoard}
      />
    );

    expect(screen.getByText('Quadros favoritos')).toBeDefined();
    const favCards = screen.getAllByText('Projetos do 4º Trimestre');
    expect(favCards.length).toBeGreaterThan(0);

    fireEvent.click(favCards[0]);
    expect(onSelectBoard).toHaveBeenCalledWith('b-prod-1');
  });

  it('allows toggling favorite status from board cards in the grid', () => {
    const onToggleFavorite = vi.fn();
    render(
      <WorkspaceHub
        workspaces={mockWorkspaces}
        activeWorkspaceId="ws-producao"
        onSelectWorkspace={vi.fn()}
        boards={mockBoards}
        favoriteBoardIds={[]}
        onToggleFavorite={onToggleFavorite}
        onSelectBoard={vi.fn()}
      />
    );

    // Board b-prod-1 heart button in the grid
    const favBtns = screen.getAllByRole('button', { name: /favorit/i });
    expect(favBtns.length).toBeGreaterThan(0);

    fireEvent.click(favBtns[0]);
    expect(onToggleFavorite).toHaveBeenCalled();
  });

  it('filters boards in real time when typing in search pill', () => {
    render(
      <WorkspaceHub
        workspaces={mockWorkspaces}
        activeWorkspaceId="ws-producao"
        onSelectWorkspace={vi.fn()}
        boards={mockBoards}
        favoriteBoardIds={[]}
        onToggleFavorite={vi.fn()}
        onSelectBoard={vi.fn()}
      />
    );

    const searchInput = screen.getByPlaceholderText(/filtrar/i);
    fireEvent.change(searchInput, { target: { value: 'Entregas' } });

    expect(screen.getByText('Entregas da Squad')).toBeDefined();
    expect(screen.queryByText('Projetos do 4º Trimestre')).toBeNull();
  });
});
