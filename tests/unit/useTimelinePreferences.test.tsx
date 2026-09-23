import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useTimelinePreferences } from '../../src/hooks/useTimelinePreferences';

describe('useTimelinePreferences Hook', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('initializes with default preferences when localStorage is empty', () => {
    const { result } = renderHook(() => useTimelinePreferences());

    expect(result.current.densityMode).toBe('detailed');
    expect(result.current.activeFilter).toBe('all');
    expect(result.current.searchQuery).toBe('');
  });

  it('persists densityMode changes to localStorage', () => {
    const { result } = renderHook(() => useTimelinePreferences());

    act(() => {
      result.current.setDensityMode('compact');
    });

    expect(result.current.densityMode).toBe('compact');
    const stored = window.localStorage.getItem('metrik-timeline-prefs');
    expect(stored).toContain('"densityMode":"compact"');
  });

  it('persists activeFilter changes to localStorage', () => {
    const { result } = renderHook(() => useTimelinePreferences());

    act(() => {
      result.current.setActiveFilter('decisions');
    });

    expect(result.current.activeFilter).toBe('decisions');
    const stored = window.localStorage.getItem('metrik-timeline-prefs');
    expect(stored).toContain('"activeFilter":"decisions"');
  });

  it('restores stored preferences from localStorage on initialization', () => {
    window.localStorage.setItem(
      'metrik-timeline-prefs',
      JSON.stringify({ version: 1, densityMode: 'compact', activeFilter: 'comments', searchQuery: 'bug' })
    );

    const { result } = renderHook(() => useTimelinePreferences());

    expect(result.current.densityMode).toBe('compact');
    expect(result.current.activeFilter).toBe('comments');
    expect(result.current.searchQuery).toBe('bug');
  });

  it('handles invalid JSON in localStorage gracefully', () => {
    window.localStorage.setItem('metrik-timeline-prefs', 'invalid-json-content');

    const { result } = renderHook(() => useTimelinePreferences());

    expect(result.current.densityMode).toBe('detailed');
    expect(result.current.activeFilter).toBe('all');
  });
});
