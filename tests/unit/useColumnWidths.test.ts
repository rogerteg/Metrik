import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useColumnWidths } from '../../src/hooks/useColumnWidths';
import {
  DEFAULT_COLUMN_WIDTH,
  MAX_COLUMN_WIDTH,
  MIN_COLUMN_WIDTH,
} from '../../src/utils/columnGeometry';

/**
 * Feature 026 (US2) — previsibilidade das preferências de largura.
 * Cobre resolução padrão, limites, descarte de valores inválidos e restauração idempotente.
 */
describe('useColumnWidths (US2 — FR-009, FR-010, GC-03, GC-05, GC-09)', () => {
  const BOARD_ID = 'board-geometry';
  const storageKey = `metrik-col-widths-${BOARD_ID}`;

  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('starts empty so every column resolves to the default width', () => {
    const { result } = renderHook(() => useColumnWidths(BOARD_ID));

    expect(result.current.columnWidths).toEqual({});
    expect(DEFAULT_COLUMN_WIDTH).toBeGreaterThan(0);
  });

  it('persists a width and mirrors it in state', () => {
    const { result } = renderHook(() => useColumnWidths(BOARD_ID));

    act(() => {
      result.current.setColumnWidth('todo', 333);
    });

    expect(result.current.columnWidths.todo).toBe(333);
    expect(JSON.parse(localStorage.getItem(storageKey) || '{}')).toEqual({ todo: 333 });
  });

  it('clamps widths to the allowed range (GC-03)', () => {
    const { result } = renderHook(() => useColumnWidths(BOARD_ID));

    act(() => {
      result.current.setColumnWidth('small', MIN_COLUMN_WIDTH - 400);
      result.current.setColumnWidth('large', MAX_COLUMN_WIDTH + 500);
    });

    expect(result.current.columnWidths.small).toBe(MIN_COLUMN_WIDTH);
    expect(result.current.columnWidths.large).toBe(MAX_COLUMN_WIDTH);
  });

  it('always stores integers to avoid subpixel accumulation (NFR-002)', () => {
    const { result } = renderHook(() => useColumnWidths(BOARD_ID));

    act(() => {
      result.current.setColumnWidth('todo', 301.7);
    });

    expect(Number.isInteger(result.current.columnWidths.todo)).toBe(true);
    expect(result.current.columnWidths.todo).toBe(302);
  });

  it('restore clears the preference instead of writing a fixed value (GC-05)', () => {
    const { result } = renderHook(() => useColumnWidths(BOARD_ID));

    act(() => {
      result.current.setColumnWidth('todo', 400);
    });
    expect(result.current.columnWidths.todo).toBe(400);

    act(() => {
      result.current.resetColumnWidth('todo');
    });
    expect(result.current.columnWidths.todo).toBeUndefined();
    expect(JSON.parse(localStorage.getItem(storageKey) || '{}')).toEqual({});

    // Idempotente: restaurar novamente mantém o estado padrão.
    act(() => {
      result.current.resetColumnWidth('todo');
    });
    expect(result.current.columnWidths.todo).toBeUndefined();
  });

  it('keeps valid persisted widths on load', () => {
    localStorage.setItem(storageKey, JSON.stringify({ todo: 350, doing: MIN_COLUMN_WIDTH }));

    const { result } = renderHook(() => useColumnWidths(BOARD_ID));

    expect(result.current.columnWidths).toEqual({ todo: 350, doing: MIN_COLUMN_WIDTH });
  });

  it('discards invalid or out-of-range persisted widths on load (GC-09)', () => {
    localStorage.setItem(
      storageKey,
      JSON.stringify({ todo: 'largo', doing: 99999, done: MIN_COLUMN_WIDTH - 1, review: 300 })
    );

    const { result } = renderHook(() => useColumnWidths(BOARD_ID));

    expect(result.current.columnWidths).toEqual({ review: 300 });
    expect(result.current.columnWidths.todo).toBeUndefined();
    expect(result.current.columnWidths.doing).toBeUndefined();
    expect(result.current.columnWidths.done).toBeUndefined();
  });

  it('reports discarded preferences through the Metrik diagnostic channel (FR-014)', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    localStorage.setItem(storageKey, JSON.stringify({ todo: 99999 }));

    renderHook(() => useColumnWidths(BOARD_ID));

    expect(warn).toHaveBeenCalledTimes(1);
    expect(String(warn.mock.calls[0][0])).toContain('[Metrik Guard]');
  });

  it('survives a corrupted payload without breaking the layout (FR-009)', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    localStorage.setItem(storageKey, '{not-json');

    const { result } = renderHook(() => useColumnWidths(BOARD_ID));

    expect(result.current.columnWidths).toEqual({});
    expect(warn).toHaveBeenCalledTimes(1);
    expect(String(warn.mock.calls[0][0])).toContain('[Metrik Guard]');
  });

  it('reloads preferences when the active board changes', () => {
    localStorage.setItem('metrik-col-widths-board-a', JSON.stringify({ todo: 310 }));
    localStorage.setItem('metrik-col-widths-board-b', JSON.stringify({ todo: 500 }));

    const { result, rerender } = renderHook(
      ({ boardId }: { boardId: string }) => useColumnWidths(boardId),
      { initialProps: { boardId: 'board-a' } }
    );

    expect(result.current.columnWidths.todo).toBe(310);

    rerender({ boardId: 'board-b' });

    expect(result.current.columnWidths.todo).toBe(500);
  });
});
