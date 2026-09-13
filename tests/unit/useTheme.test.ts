import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useTheme } from '../../src/hooks/useTheme';
import { THEME_STORAGE_KEY } from '../../src/types/theme';

describe('useTheme Hook (Feature 022 - Theme Configuration)', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute('data-theme');
    vi.restoreAllMocks();
  });

  afterEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute('data-theme');
  });

  it('initializes with default "dark" theme when localStorage is empty', () => {
    const { result } = renderHook(() => useTheme());

    expect(result.current.theme).toBe('dark');
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
  });

  it('restores "light" theme from localStorage', () => {
    localStorage.setItem(THEME_STORAGE_KEY, 'light');

    const { result } = renderHook(() => useTheme());

    expect(result.current.theme).toBe('light');
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
  });

  it('restores "neutral" theme from localStorage', () => {
    localStorage.setItem(THEME_STORAGE_KEY, 'neutral');

    const { result } = renderHook(() => useTheme());

    expect(result.current.theme).toBe('neutral');
    expect(document.documentElement.getAttribute('data-theme')).toBe('neutral');
  });

  it('falls back to "dark" if localStorage contains an invalid theme value', () => {
    localStorage.setItem(THEME_STORAGE_KEY, 'invalid-theme-value');

    const { result } = renderHook(() => useTheme());

    expect(result.current.theme).toBe('dark');
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
  });

  it('updates theme, localStorage, and DOM attribute when setTheme is called', () => {
    const { result } = renderHook(() => useTheme());

    expect(result.current.theme).toBe('dark');

    act(() => {
      result.current.setTheme('light');
    });

    expect(result.current.theme).toBe('light');
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('light');
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');

    act(() => {
      result.current.setTheme('neutral');
    });

    expect(result.current.theme).toBe('neutral');
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('neutral');
    expect(document.documentElement.getAttribute('data-theme')).toBe('neutral');
  });

  it('handles localStorage errors gracefully without throwing', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('Access denied to localStorage');
    });
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('Storage full or quota exceeded');
    });

    const { result } = renderHook(() => useTheme());

    // Should fall back safely to 'dark'
    expect(result.current.theme).toBe('dark');
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');

    // Should update state and DOM attribute without crashing
    act(() => {
      result.current.setTheme('light');
    });

    expect(result.current.theme).toBe('light');
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
  });

  it('synchronizes theme when a storage event occurs in another window/tab', () => {
    const { result } = renderHook(() => useTheme());

    expect(result.current.theme).toBe('dark');

    act(() => {
      const storageEvent = new StorageEvent('storage', {
        key: THEME_STORAGE_KEY,
        newValue: 'neutral',
      });
      window.dispatchEvent(storageEvent);
    });

    expect(result.current.theme).toBe('neutral');
    expect(document.documentElement.getAttribute('data-theme')).toBe('neutral');
  });
});
