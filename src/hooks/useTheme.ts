import { useState, useEffect, useCallback } from 'react';
import { ThemeMode, THEME_STORAGE_KEY, UseThemeReturn } from '../types/theme';

const VALID_THEMES: Record<string, boolean> = {
  light: true,
  dark: true,
  neutral: true,
};

function getInitialTheme(): ThemeMode {
  try {
    const saved = localStorage.getItem(THEME_STORAGE_KEY);
    if (saved && VALID_THEMES[saved]) {
      return saved as ThemeMode;
    }
  } catch (error) {
    // Gracefully handle environments where localStorage is restricted
    console.warn('[Metrik] localStorage is not accessible for theme persistence:', error);
  }
  return 'dark';
}

function applyThemeToDom(theme: ThemeMode) {
  try {
    if (typeof document !== 'undefined' && document.documentElement) {
      document.documentElement.setAttribute('data-theme', theme);
    }
  } catch (error) {
    console.warn('[Metrik] Failed to set data-theme attribute on documentElement:', error);
  }
}

export function useTheme(): UseThemeReturn {
  const [theme, setThemeState] = useState<ThemeMode>(() => {
    const initial = getInitialTheme();
    // Synchronously set data-theme on mount to prevent FOUC
    applyThemeToDom(initial);
    return initial;
  });

  const setTheme = useCallback((newTheme: ThemeMode) => {
    if (!VALID_THEMES[newTheme]) return;
    setThemeState(newTheme);
    applyThemeToDom(newTheme);

    try {
      localStorage.setItem(THEME_STORAGE_KEY, newTheme);
    } catch (error) {
      console.warn('[Metrik] Failed to persist theme to localStorage:', error);
    }
  }, []);

  // Sync with DOM on theme state change and listen for cross-tab storage changes
  useEffect(() => {
    applyThemeToDom(theme);

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === THEME_STORAGE_KEY && e.newValue && VALID_THEMES[e.newValue]) {
        const externalTheme = e.newValue as ThemeMode;
        setThemeState(externalTheme);
        applyThemeToDom(externalTheme);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [theme]);

  return { theme, setTheme };
}
