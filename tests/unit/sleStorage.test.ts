import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  getSleStorageKey,
  loadSleConfig,
  saveSleConfig,
  resetSleConfig,
} from '../../src/utils/sleStorage';
import { SleConfig } from '../../src/types/sle';

describe('sleStorage Local-First persistence (Feature 054)', () => {
  const boardId = 'board-alpha';
  const storageKey = `metrik_sle_config_${boardId}`;

  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('generates consistent storage keys scoped by boardId', () => {
    expect(getSleStorageKey(boardId)).toBe(storageKey);
  });

  it('returns default config when no configuration is saved in localStorage', () => {
    const config = loadSleConfig(boardId);
    expect(config.boardId).toBe(boardId);
    expect(config.customTargetDays).toBeNull();
    expect(config.enableP50Alert).toBe(true);
    expect(config.enableP95Alert).toBe(true);
  });

  it('saves and reloads custom SLE configuration cleanly', () => {
    const customConfig: SleConfig = {
      boardId,
      customTargetDays: 4.5,
      enableP50Alert: false,
      enableP95Alert: true,
      updatedAt: '2026-11-03T14:00:00.000Z',
    };

    saveSleConfig(customConfig);
    const reloaded = loadSleConfig(boardId);

    expect(reloaded).toEqual(customConfig);
  });

  it('recovers gracefully with default values when localStorage contains corrupted JSON', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    localStorage.setItem(storageKey, 'INVALID_JSON{{{');

    const config = loadSleConfig(boardId);
    expect(config.boardId).toBe(boardId);
    expect(config.customTargetDays).toBeNull();
    expect(config.enableP50Alert).toBe(true);
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining('[Metrik][SLE] Falha ao analisar configuração de SLE'),
      expect.anything(),
    );
  });

  it('recovers gracefully with fallback values when localStorage payload violates schema', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    // Payload with missing/invalid fields
    localStorage.setItem(storageKey, JSON.stringify({ customTargetDays: 'not-a-number' }));

    const config = loadSleConfig(boardId);
    expect(config.boardId).toBe(boardId);
    expect(config.customTargetDays).toBeNull();
    expect(config.enableP50Alert).toBe(true);
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining('[Metrik][SLE] Configuração de SLE inválida para o quadro'),
    );
  });

  it('clears configuration on resetSleConfig', () => {
    saveSleConfig({
      boardId,
      customTargetDays: 7,
      enableP50Alert: true,
      enableP95Alert: false,
      updatedAt: new Date().toISOString(),
    });

    expect(localStorage.getItem(storageKey)).not.toBeNull();
    resetSleConfig(boardId);
    expect(localStorage.getItem(storageKey)).toBeNull();
  });
});
