import { describe, it, expect, vi, afterEach } from 'vitest';
import {
  DEFAULT_COLUMN_WIDTH,
  MIN_COLUMN_WIDTH,
  MAX_COLUMN_WIDTH,
  GEOMETRY_DIAGNOSTIC_PREFIX,
  clampColumnWidth,
  resolveColumnWidth,
  resolveColumnWidthWithDetail,
  resolvePersistedWidthMap,
  reportGeometryDivergence,
} from '../../src/utils/columnGeometry';

describe('columnGeometry — fonte única de geometria (Feature 026)', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('exposes a coherent, ordered range', () => {
    expect(MIN_COLUMN_WIDTH).toBeLessThan(DEFAULT_COLUMN_WIDTH);
    expect(DEFAULT_COLUMN_WIDTH).toBeLessThan(MAX_COLUMN_WIDTH);
    expect(Number.isInteger(DEFAULT_COLUMN_WIDTH)).toBe(true);
    expect(Number.isInteger(MIN_COLUMN_WIDTH)).toBe(true);
    expect(Number.isInteger(MAX_COLUMN_WIDTH)).toBe(true);
  });

  describe('resolveColumnWidth (FR-010, GC-02)', () => {
    it('falls back to the default when there is no preference', () => {
      expect(resolveColumnWidth(undefined)).toBe(DEFAULT_COLUMN_WIDTH);
      expect(resolveColumnWidth(null)).toBe(DEFAULT_COLUMN_WIDTH);
    });

    it('never returns undefined or NaN', () => {
      const inputs = [undefined, null, NaN, Infinity, -Infinity, 'abc', {}, [], true, -10, 0];
      for (const input of inputs) {
        const width = resolveColumnWidth(input);
        expect(Number.isFinite(width)).toBe(true);
        expect(width).toBeGreaterThanOrEqual(MIN_COLUMN_WIDTH);
        expect(width).toBeLessThanOrEqual(MAX_COLUMN_WIDTH);
      }
    });

    it('honours a valid preference exactly (GC-04)', () => {
      expect(resolveColumnWidth(MIN_COLUMN_WIDTH)).toBe(MIN_COLUMN_WIDTH);
      expect(resolveColumnWidth(310)).toBe(310);
      expect(resolveColumnWidth(MAX_COLUMN_WIDTH)).toBe(MAX_COLUMN_WIDTH);
    });

    it('discards out-of-range preferences in favour of an integral layout (FR-009, GC-09)', () => {
      const below = resolveColumnWidthWithDetail(MIN_COLUMN_WIDTH - 1);
      expect(below.width).toBe(DEFAULT_COLUMN_WIDTH);
      expect(below.discarded).toBe(true);
      expect(below.reason).toBe('out-of-range');

      const above = resolveColumnWidthWithDetail(MAX_COLUMN_WIDTH + 1);
      expect(above.width).toBe(DEFAULT_COLUMN_WIDTH);
      expect(above.discarded).toBe(true);
      expect(above.reason).toBe('out-of-range');
    });

    it('discards non-numeric and non-finite preferences (FR-009)', () => {
      for (const input of ['bloqueado', {}, [], true, NaN, Infinity]) {
        const resolution = resolveColumnWidthWithDetail(input);
        expect(resolution.discarded).toBe(true);
        expect(resolution.reason).toBe('invalid');
        expect(resolution.width).toBe(DEFAULT_COLUMN_WIDTH);
      }
    });

    it('reports no discard for an absent preference', () => {
      const resolution = resolveColumnWidthWithDetail(undefined);
      expect(resolution.discarded).toBe(false);
      expect(resolution.reason).toBeNull();
      expect(resolution.preference).toBeNull();
    });
  });

  describe('clampColumnWidth (NFR-002, T018)', () => {
    it('clamps to the allowed range', () => {
      expect(clampColumnWidth(1)).toBe(MIN_COLUMN_WIDTH);
      expect(clampColumnWidth(10000)).toBe(MAX_COLUMN_WIDTH);
      expect(clampColumnWidth(333)).toBe(333);
    });

    it('always produces an integer to avoid subpixel accumulation', () => {
      expect(clampColumnWidth(300.4)).toBe(300);
      expect(clampColumnWidth(300.6)).toBe(301);
      expect(Number.isInteger(clampColumnWidth(333.37))).toBe(true);
    });

    it('falls back to the default for non-finite input', () => {
      expect(clampColumnWidth(NaN)).toBe(DEFAULT_COLUMN_WIDTH);
      expect(clampColumnWidth(Infinity)).toBe(DEFAULT_COLUMN_WIDTH);
    });
  });

  describe('resolvePersistedWidthMap (FR-009)', () => {
    it('keeps valid entries and drops invalid ones', () => {
      const map = resolvePersistedWidthMap(
        { a: 300, b: 'nope', c: 5000, d: MIN_COLUMN_WIDTH, e: null },
        () => {}
      );
      expect(map).toEqual({ a: 300, d: MIN_COLUMN_WIDTH });
    });

    it('returns an empty map for non-object payloads', () => {
      expect(resolvePersistedWidthMap(null, () => {})).toEqual({});
      expect(resolvePersistedWidthMap('json', () => {})).toEqual({});
      expect(resolvePersistedWidthMap([1, 2], () => {})).toEqual({});
      expect(resolvePersistedWidthMap(undefined, () => {})).toEqual({});
    });

    it('reports one divergence per discarded entry with the reason', () => {
      const reports: Array<{ columnId: string; reason: string | null }> = [];
      resolvePersistedWidthMap({ a: 300, b: 'nope', c: 5000 }, (r) =>
        reports.push({ columnId: r.columnId, reason: r.reason })
      );
      expect(reports).toEqual([
        { columnId: 'b', reason: 'invalid' },
        { columnId: 'c', reason: 'out-of-range' },
      ]);
    });
  });

  describe('reportGeometryDivergence (FR-014)', () => {
    it('is silent when there is no divergence', () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
      reportGeometryDivergence({
        columnId: 'todo',
        expected: 300,
        resolved: 300,
        preference: 300,
        reason: null,
      });
      expect(warn).not.toHaveBeenCalled();
    });

    it('emits the stable prefix with the measured values', () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
      reportGeometryDivergence({
        columnId: 'analysis',
        expected: 5000,
        resolved: DEFAULT_COLUMN_WIDTH,
        preference: 5000,
        reason: 'out-of-range',
      });
      expect(warn).toHaveBeenCalledTimes(1);
      const message = String(warn.mock.calls[0][0]);
      expect(message).toContain(GEOMETRY_DIAGNOSTIC_PREFIX);
      expect(message).toContain('columnId=analysis');
      expect(message).toContain('expected=5000');
      expect(message).toContain(`resolved=${DEFAULT_COLUMN_WIDTH}`);
      expect(message).toContain('preference=5000');
      expect(message).toContain('reason=out-of-range');
    });

    it('reports "none" when the preference is unknown', () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
      reportGeometryDivergence({
        columnId: 'todo',
        expected: DEFAULT_COLUMN_WIDTH,
        resolved: DEFAULT_COLUMN_WIDTH + 1,
        preference: null,
        reason: null,
      });
      const message = String(warn.mock.calls[0][0]);
      expect(message).toContain('preference=none');
      expect(message).toContain('reason=none');
    });
  });
});
