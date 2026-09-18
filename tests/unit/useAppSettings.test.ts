import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useAppSettings, APP_SETTINGS_STORAGE_KEY } from '../../src/hooks/useAppSettings';

describe('useAppSettings Hook (Feature 029)', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('initializes with default settings when localStorage is empty', () => {
    const { result } = renderHook(() => useAppSettings());

    expect(result.current.settings.theme).toBe('dark');
    expect(result.current.settings.density).toBe('comfortable');
    expect(result.current.settings.defaultWipLimit).toBe(5);
    expect(result.current.settings.enableAnimations).toBe(true);
  });

  it('updates settings and persists to localStorage', () => {
    const { result } = renderHook(() => useAppSettings());

    act(() => {
      result.current.updateSettings({ density: 'compact', defaultWipLimit: 8 });
    });

    expect(result.current.settings.density).toBe('compact');
    expect(result.current.settings.defaultWipLimit).toBe(8);

    const saved = JSON.parse(localStorage.getItem(APP_SETTINGS_STORAGE_KEY) || '{}');
    expect(saved.density).toBe('compact');
    expect(saved.defaultWipLimit).toBe(8);
  });

  it('resets settings to default values', () => {
    const { result } = renderHook(() => useAppSettings());

    act(() => {
      result.current.updateSettings({ density: 'compact', enableAnimations: false });
    });
    expect(result.current.settings.density).toBe('compact');

    act(() => {
      result.current.resetSettings();
    });
    expect(result.current.settings.density).toBe('comfortable');
    expect(result.current.settings.enableAnimations).toBe(true);
  });

  it('supports updating autoSaveComments and autoSaveDebounceMs', () => {
    const { result } = renderHook(() => useAppSettings());

    expect(result.current.settings.autoSaveComments).toBe(true);
    expect(result.current.settings.autoSaveDebounceMs).toBe(800);

    act(() => {
      result.current.updateSettings({ autoSaveComments: false, autoSaveDebounceMs: 1200 });
    });

    expect(result.current.settings.autoSaveComments).toBe(false);
    expect(result.current.settings.autoSaveDebounceMs).toBe(1200);

    const saved = JSON.parse(localStorage.getItem(APP_SETTINGS_STORAGE_KEY) || '{}');
    expect(saved.autoSaveComments).toBe(false);
    expect(saved.autoSaveDebounceMs).toBe(1200);
  });
});
