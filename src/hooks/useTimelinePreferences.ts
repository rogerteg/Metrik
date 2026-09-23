import { useState, useEffect, useCallback } from 'react';
import { UserTimelinePreferences, TimelineFilter, DensityMode } from '../types/taskActivity';

const STORAGE_KEY = 'metrik-timeline-prefs';

const DEFAULT_PREFERENCES: UserTimelinePreferences = {
  version: 1,
  densityMode: 'detailed',
  activeFilter: 'all',
  searchQuery: '',
};

export function useTimelinePreferences() {
  const [preferences, setPreferences] = useState<UserTimelinePreferences>(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return {
          version: 1,
          densityMode: parsed.densityMode === 'compact' ? 'compact' : 'detailed',
          activeFilter: ['all', 'decisions', 'comments', 'activity'].includes(parsed.activeFilter)
            ? parsed.activeFilter
            : 'all',
          searchQuery: typeof parsed.searchQuery === 'string' ? parsed.searchQuery : '',
        };
      }
    } catch (error) {
      console.warn('[Metrik] Failed to load timeline preferences from localStorage', error);
    }
    return DEFAULT_PREFERENCES;
  });

  // Synchronize state changes to localStorage
  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
    } catch (error) {
      console.warn('[Metrik] Failed to save timeline preferences to localStorage', error);
    }
  }, [preferences]);

  const setDensityMode = useCallback((mode: DensityMode) => {
    setPreferences((prev) => ({ ...prev, densityMode: mode }));
  }, []);

  const setActiveFilter = useCallback((filter: TimelineFilter) => {
    setPreferences((prev) => ({ ...prev, activeFilter: filter }));
  }, []);

  const setSearchQuery = useCallback((query: string) => {
    setPreferences((prev) => ({ ...prev, searchQuery: query }));
  }, []);

  const resetPreferences = useCallback(() => {
    setPreferences(DEFAULT_PREFERENCES);
  }, []);

  return {
    preferences,
    densityMode: preferences.densityMode,
    activeFilter: preferences.activeFilter,
    searchQuery: preferences.searchQuery,
    setDensityMode,
    setActiveFilter,
    setSearchQuery,
    resetPreferences,
  };
}
