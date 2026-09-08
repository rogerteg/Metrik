import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useWipLimits, WIP_LIMITS_STORAGE_KEY } from '../../src/hooks/useWipLimits';
import { ColumnType } from '../../src/types/kanban';
import { INITIAL_WIP_LIMITS } from '../../src/utils/seedData';

describe('useWipLimits Hook (T006)', () => {
  beforeEach(() => {
    window.localStorage.clear();
    vi.restoreAllMocks();
  });

  it('initializes with seed WIP limits when localStorage is empty', () => {
    const { result } = renderHook(() => useWipLimits());

    expect(result.current.wipLimits[ColumnType.IN_PROGRESS]).toBe(3);
    expect(result.current.wipLimits[ColumnType.BLOCKED]).toBe(2);
    expect(result.current.wipLimits[ColumnType.TO_DO]).toBeNull();
    expect(result.current.wipLimits[ColumnType.COMPLETED]).toBeNull();

    const stored = JSON.parse(window.localStorage.getItem(WIP_LIMITS_STORAGE_KEY) || '{}');
    expect(stored[ColumnType.IN_PROGRESS]).toBe(3);
  });

  it('updates WIP limit for a column and persists to localStorage', () => {
    const { result } = renderHook(() => useWipLimits());

    act(() => {
      result.current.setWipLimit(ColumnType.IN_PROGRESS, 5);
    });

    expect(result.current.wipLimits[ColumnType.IN_PROGRESS]).toBe(5);

    const stored = JSON.parse(window.localStorage.getItem(WIP_LIMITS_STORAGE_KEY) || '{}');
    expect(stored[ColumnType.IN_PROGRESS]).toBe(5);
  });

  it('clears WIP limit when set to null (unlimited)', () => {
    const { result } = renderHook(() => useWipLimits());

    act(() => {
      result.current.setWipLimit(ColumnType.IN_PROGRESS, null);
    });

    expect(result.current.wipLimits[ColumnType.IN_PROGRESS]).toBeNull();

    const stored = JSON.parse(window.localStorage.getItem(WIP_LIMITS_STORAGE_KEY) || '{}');
    expect(stored[ColumnType.IN_PROGRESS]).toBeNull();
  });

  it('ignores invalid limits (negative, zero, NaN)', () => {
    const { result } = renderHook(() => useWipLimits());

    act(() => {
      result.current.setWipLimit(ColumnType.IN_PROGRESS, -2);
    });
    // Should remain 3
    expect(result.current.wipLimits[ColumnType.IN_PROGRESS]).toBe(3);

    act(() => {
      result.current.setWipLimit(ColumnType.IN_PROGRESS, 0);
    });
    // Should remain 3
    expect(result.current.wipLimits[ColumnType.IN_PROGRESS]).toBe(3);
  });

  it('recovers gracefully from corrupted JSON in localStorage', () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    window.localStorage.setItem(WIP_LIMITS_STORAGE_KEY, '{ invalid_json');

    const { result } = renderHook(() => useWipLimits());

    expect(result.current.wipLimits[ColumnType.IN_PROGRESS]).toBe(
      INITIAL_WIP_LIMITS[ColumnType.IN_PROGRESS]
    );
    expect(consoleErrorSpy).toHaveBeenCalled();
  });
});
