import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useCloudAutoSync, collectBoardsState } from '../../src/hooks/useCloudAutoSync';
import { _setSupabaseEnvForTesting } from '../../src/services/supabase/client';
import { BoardModel } from '../../src/types/kanban';

/** Feature 038+ — sincronização automática (opt-in) com debounce. */
const boards: BoardModel[] = [
  { id: 'b1', name: 'Quadro 1', teamId: 't1', createdAt: '2026-09-01', lastAccessed: '2026-09-01' },
];

const okResult = { ok: true, syncedCount: { workspaces: 0, boards: 0, tasks: 0 } } as const;

describe('useCloudAutoSync', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
    _setSupabaseEnvForTesting({ url: 'https://demo.supabase.co', anonKey: 'test-anon-key' });
    localStorage.setItem('metrik-tasks-b1', JSON.stringify({ columns: [], tasks: { c1: [] } }));
  });

  afterEach(() => {
    vi.useRealTimers();
    _setSupabaseEnvForTesting(null);
  });

  it('collectBoardsState reads tasks from localStorage per board', () => {
    const state = collectBoardsState(boards);
    expect(state.b1).toBeDefined();
    expect(state.b1.tasks.c1).toEqual([]);
  });

  it('does not push on the first mount and pushes after a debounced change', async () => {
    vi.useFakeTimers();
    const push = vi.fn().mockResolvedValue(okResult);

    const { rerender } = renderHook(
      ({ rev }: { rev: number }) =>
        useCloudAutoSync({
          enabled: true,
          workspaces: [],
          boards,
          revision: rev,
          debounceMs: 100,
          push,
        }),
      { initialProps: { rev: 0 } },
    );

    expect(push).not.toHaveBeenCalled();

    await act(async () => {
      rerender({ rev: 1 });
    });
    await act(async () => {
      await vi.advanceTimersByTimeAsync(150);
    });

    expect(push).toHaveBeenCalledTimes(1);
    expect(push.mock.calls[0][0].tasksByBoardId.b1).toBeDefined();
  });

  it('does nothing when disabled', async () => {
    vi.useFakeTimers();
    const push = vi.fn().mockResolvedValue(okResult);

    const { rerender } = renderHook(
      ({ rev }: { rev: number }) =>
        useCloudAutoSync({
          enabled: false,
          workspaces: [],
          boards,
          revision: rev,
          debounceMs: 100,
          push,
        }),
      { initialProps: { rev: 0 } },
    );

    rerender({ rev: 1 });
    await vi.advanceTimersByTimeAsync(300);
    expect(push).not.toHaveBeenCalled();
  });

  it('does nothing when Supabase is not configured', async () => {
    _setSupabaseEnvForTesting({ url: null, anonKey: null });
    vi.useFakeTimers();
    const push = vi.fn().mockResolvedValue(okResult);

    const { rerender } = renderHook(
      ({ rev }: { rev: number }) =>
        useCloudAutoSync({
          enabled: true,
          workspaces: [],
          boards,
          revision: rev,
          debounceMs: 100,
          push,
        }),
      { initialProps: { rev: 0 } },
    );

    rerender({ rev: 1 });
    await vi.advanceTimersByTimeAsync(300);
    expect(push).not.toHaveBeenCalled();
  });
});
