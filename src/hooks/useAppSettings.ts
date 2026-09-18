import { useState, useEffect, useCallback } from 'react';
import { AppSettings } from '../types/workspace';

export const APP_SETTINGS_STORAGE_KEY = 'metrik_app_settings';

export const DEFAULT_APP_SETTINGS: AppSettings = {
  theme: 'dark',
  density: 'comfortable',
  defaultWipLimit: 5,
  enableAnimations: true,
  autoSaveComments: true,
  autoSaveDebounceMs: 800,
  updatedAt: new Date().toISOString(),
};

export function useAppSettings() {
  const [settings, setSettings] = useState<AppSettings>(() => {
    try {
      const stored = localStorage.getItem(APP_SETTINGS_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return { ...DEFAULT_APP_SETTINGS, ...parsed };
      }
    } catch (err) {
      console.warn('[Metrik] Error reading app settings from localStorage:', err);
    }
    return DEFAULT_APP_SETTINGS;
  });

  useEffect(() => {
    try {
      localStorage.setItem(APP_SETTINGS_STORAGE_KEY, JSON.stringify(settings));
    } catch (err) {
      console.error('[Metrik] Failed to persist app settings:', err);
    }
  }, [settings]);

  const updateSettings = useCallback((updates: Partial<AppSettings>) => {
    setSettings((prev) => ({
      ...prev,
      ...updates,
      updatedAt: new Date().toISOString(),
    }));
  }, []);

  const resetSettings = useCallback(() => {
    setSettings({
      ...DEFAULT_APP_SETTINGS,
      updatedAt: new Date().toISOString(),
    });
  }, []);

  return {
    settings,
    updateSettings,
    resetSettings,
  };
}
