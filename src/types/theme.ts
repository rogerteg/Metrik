export type ThemeMode = 'light' | 'dark' | 'neutral';

export const THEME_STORAGE_KEY = 'metrik_theme_mode';

export interface ThemeOption {
  id: ThemeMode;
  label: string;
  icon: string;
  ariaLabel: string;
}

export interface UseThemeReturn {
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
}
