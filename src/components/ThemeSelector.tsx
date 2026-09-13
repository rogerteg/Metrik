import React from 'react';
import { ThemeMode, ThemeOption } from '../types/theme';

interface ThemeSelectorProps {
  currentTheme: ThemeMode;
  onSelectTheme: (theme: ThemeMode) => void;
}

const THEME_OPTIONS: ThemeOption[] = [
  {
    id: 'light',
    label: 'Claro',
    icon: '☀️',
    ariaLabel: 'Tema Claro',
  },
  {
    id: 'dark',
    label: 'Escuro',
    icon: '🌙',
    ariaLabel: 'Tema Escuro',
  },
  {
    id: 'neutral',
    label: 'Neutro',
    icon: '⚖️',
    ariaLabel: 'Tema Neutro',
  },
];

export const ThemeSelector: React.FC<ThemeSelectorProps> = ({ currentTheme, onSelectTheme }) => {
  return (
    <div
      className="theme-selector"
      role="group"
      aria-label="Selecionar tema"
    >
      {THEME_OPTIONS.map((option) => {
        const isActive = currentTheme === option.id;
        return (
          <button
            key={option.id}
            type="button"
            className={`theme-option-btn ${isActive ? 'active' : ''}`}
            onClick={() => onSelectTheme(option.id)}
            aria-pressed={isActive}
            aria-label={option.ariaLabel}
            title={option.ariaLabel}
          >
            <span className="theme-option-icon" aria-hidden="true">
              {option.icon}
            </span>
            <span className="theme-option-label">{option.label}</span>
          </button>
        );
      })}
    </div>
  );
};
