import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import {
  useWorkspaces,
  WORKSPACES_STORAGE_KEY,
  FAVORITES_STORAGE_KEY,
  DEFAULT_WORKSPACE_ID,
} from '../../src/hooks/useWorkspaces';

describe('useWorkspaces Hook (Feature 029)', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('initializes with default workspace and prototype workspaces when localStorage is empty', () => {
    // Seed existing boards in localStorage
    localStorage.setItem('metrik_boards', JSON.stringify([{ id: 'board-1', name: 'Board 1' }]));

    const { result } = renderHook(() => useWorkspaces());

    expect(result.current.isInitialized).toBe(true);
    expect(result.current.workspaces.length).toBeGreaterThanOrEqual(1);

    // Default workspace exists and contains board-1
    const defaultWs = result.current.workspaces.find((w) => w.id === DEFAULT_WORKSPACE_ID);
    expect(defaultWs).toBeDefined();
    expect(defaultWs?.name).toBe('Geral');
    expect(defaultWs?.boardIds).toContain('board-1');

    // Persistence verified
    const savedWorkspaces = JSON.parse(localStorage.getItem(WORKSPACES_STORAGE_KEY) || '[]');
    expect(savedWorkspaces.length).toBe(result.current.workspaces.length);
  });

  it('allows selecting an active workspace or "all"', () => {
    const { result } = renderHook(() => useWorkspaces());

    expect(result.current.activeWorkspaceId).toBe(DEFAULT_WORKSPACE_ID);

    act(() => {
      result.current.selectWorkspace('all');
    });
    expect(result.current.activeWorkspaceId).toBe('all');

    act(() => {
      result.current.selectWorkspace('ws-producao');
    });
    expect(result.current.activeWorkspaceId).toBe('ws-producao');
  });

  it('allows toggling favorite boards and persisting to localStorage', () => {
    const { result } = renderHook(() => useWorkspaces());

    expect(result.current.isBoardFavorite('board-123')).toBe(false);

    act(() => {
      result.current.toggleFavoriteBoard('board-123');
    });
    expect(result.current.isBoardFavorite('board-123')).toBe(true);
    expect(result.current.favoriteBoardIds).toContain('board-123');

    // Persisted to localStorage
    const savedFavorites = JSON.parse(localStorage.getItem(FAVORITES_STORAGE_KEY) || '[]');
    expect(savedFavorites).toContain('board-123');

    // Toggle off
    act(() => {
      result.current.toggleFavoriteBoard('board-123');
    });
    expect(result.current.isBoardFavorite('board-123')).toBe(false);
    expect(result.current.favoriteBoardIds).not.toContain('board-123');
  });

  it('allows creating a new workspace with custom name and color', () => {
    const { result } = renderHook(() => useWorkspaces());
    const initialCount = result.current.workspaces.length;

    let createdId = '';
    act(() => {
      const newWs = result.current.createWorkspace('Engenharia', '#10b981', 'Equipe de Eng');
      createdId = newWs.id;
    });

    expect(result.current.workspaces.length).toBe(initialCount + 1);
    const found = result.current.workspaces.find((w) => w.id === createdId);
    expect(found).toBeDefined();
    expect(found?.name).toBe('Engenharia');
    expect(found?.color).toBe('#10b981');
    expect(found?.description).toBe('Equipe de Eng');
  });

  it('allows updating workspace details (name, color, description)', () => {
    const { result } = renderHook(() => useWorkspaces());

    act(() => {
      result.current.updateWorkspace(DEFAULT_WORKSPACE_ID, {
        name: 'Workspace Central',
        color: '#6366f1',
      });
    });

    const updated = result.current.workspaces.find((w) => w.id === DEFAULT_WORKSPACE_ID);
    expect(updated?.name).toBe('Workspace Central');
    expect(updated?.color).toBe('#6366f1');
  });

  it('prevents deleting the default workspace', () => {
    const { result } = renderHook(() => useWorkspaces());

    expect(() => {
      act(() => {
        result.current.deleteWorkspace(DEFAULT_WORKSPACE_ID);
      });
    }).toThrow(/não pode ser excluído/i);
  });

  it('allows deleting a custom workspace and reallocates its boards to default workspace', () => {
    const { result } = renderHook(() => useWorkspaces());

    let customId = '';
    act(() => {
      const created = result.current.createWorkspace('Temporário', '#f43f5e');
      customId = created.id;
      result.current.addBoardToWorkspace(customId, 'board-temp-1');
    });

    expect(result.current.workspaces.find((w) => w.id === customId)?.boardIds).toContain('board-temp-1');

    act(() => {
      result.current.deleteWorkspace(customId);
    });

    expect(result.current.workspaces.find((w) => w.id === customId)).toBeUndefined();
    // Board reallocated to default
    const defaultWs = result.current.workspaces.find((w) => w.id === DEFAULT_WORKSPACE_ID);
    expect(defaultWs?.boardIds).toContain('board-temp-1');
  });
});
