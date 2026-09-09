import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useBoards, BOARDS_INDEX_KEY, ACTIVE_BOARD_KEY, LEGACY_TASKS_KEY } from '../../src/hooks/useBoards';

describe('useBoards Hook (Feature 010)', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('initializes with a default board if local storage is empty', () => {
    const { result } = renderHook(() => useBoards());
    
    expect(result.current.isInitialized).toBe(true);
    expect(result.current.boards.length).toBe(1);
    expect(result.current.boards[0].name).toBe('Quadro Principal');
    expect(result.current.activeBoardId).toBe(result.current.boards[0].id);
    
    // Verifies persistence
    const savedBoards = JSON.parse(localStorage.getItem(BOARDS_INDEX_KEY) || '[]');
    expect(savedBoards.length).toBe(1);
    expect(localStorage.getItem(ACTIVE_BOARD_KEY)).toBe(result.current.activeBoardId);
  });

  it('migrates legacy metrik-tasks data on first load', () => {
    // Seed legacy data
    const legacyData = JSON.stringify({ "in-progress": [{ id: "task-1", title: "Legacy" }] });
    localStorage.setItem(LEGACY_TASKS_KEY, legacyData);
    
    const { result } = renderHook(() => useBoards());
    
    expect(result.current.isInitialized).toBe(true);
    const boardId = result.current.activeBoardId;
    
    // Expect legacy tasks key to be removed
    expect(localStorage.getItem(LEGACY_TASKS_KEY)).toBeNull();
    // Expect data to be moved to the new board key
    expect(localStorage.getItem(`metrik-tasks-${boardId}`)).toBe(legacyData);
  });

  it('loads existing boards and active board from local storage', () => {
    const fakeId = 'b1-test';
    const fakeBoards = [{ id: fakeId, name: 'Test Board', createdAt: 'date', lastAccessed: 'date' }];
    localStorage.setItem(BOARDS_INDEX_KEY, JSON.stringify(fakeBoards));
    localStorage.setItem(ACTIVE_BOARD_KEY, fakeId);
    
    const { result } = renderHook(() => useBoards());
    
    expect(result.current.boards.length).toBe(1);
    expect(result.current.activeBoardId).toBe(fakeId);
    expect(result.current.activeBoard?.name).toBe('Test Board');
  });

  it('can create a new board and switches to it automatically', () => {
    const { result } = renderHook(() => useBoards());
    const initialId = result.current.activeBoardId;
    
    act(() => {
      result.current.createBoard('Marketing');
    });
    
    expect(result.current.boards.length).toBe(2);
    expect(result.current.activeBoard?.name).toBe('Marketing');
    expect(result.current.activeBoardId).not.toBe(initialId);
    
    const savedBoards = JSON.parse(localStorage.getItem(BOARDS_INDEX_KEY) || '[]');
    expect(savedBoards.length).toBe(2);
  });

  it('can rename a board', () => {
    const { result } = renderHook(() => useBoards());
    const boardId = result.current.activeBoardId as string;
    
    act(() => {
      result.current.renameBoard(boardId, 'Engenharia');
    });
    
    expect(result.current.boards[0].name).toBe('Engenharia');
    const savedBoards = JSON.parse(localStorage.getItem(BOARDS_INDEX_KEY) || '[]');
    expect(savedBoards[0].name).toBe('Engenharia');
  });

  it('can delete a board and switches to another one, cleaning up its tasks', () => {
    const { result } = renderHook(() => useBoards());
    
    act(() => {
      result.current.createBoard('ToDelete');
    });
    
    const boardToDelete = result.current.activeBoardId as string;
    // Simulate some tasks
    localStorage.setItem(`metrik-tasks-${boardToDelete}`, '{"todo": []}');
    
    expect(result.current.boards.length).toBe(2);
    
    act(() => {
      result.current.deleteBoard(boardToDelete);
    });
    
    expect(result.current.boards.length).toBe(1);
    expect(result.current.boards[0].name).toBe('Quadro Principal');
    expect(result.current.activeBoardId).toBe(result.current.boards[0].id);
    
    // Ensure cleanup
    expect(localStorage.getItem(`metrik-tasks-${boardToDelete}`)).toBeNull();
  });

  it('prevents deleting the last remaining board', () => {
    const { result } = renderHook(() => useBoards());
    const boardId = result.current.activeBoardId as string;
    
    act(() => {
      result.current.deleteBoard(boardId);
    });
    
    // Should still have 1 board
    expect(result.current.boards.length).toBe(1);
  });
});
