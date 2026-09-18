import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { GeneralSettingsTab } from '../../src/components/Settings/GeneralSettingsTab';
import { AppSettings } from '../../src/types/workspace';

describe('GeneralSettingsTab Autosave Switch (US2 - Feature 032)', () => {
  const baseSettings: AppSettings = {
    theme: 'dark',
    density: 'comfortable',
    defaultView: 'board',
    defaultWipLimit: 3,
    enableAnimations: true,
    showWipLimits: true,
    showCycleTimeBadges: true,
    autoSaveComments: true,
    autoSaveDebounceMs: 800,
    updatedAt: '2026-09-18T10:00:00.000Z',
  };

  it('renderiza o interruptor com o estado ativo por padrão e texto descritivo', () => {
    const onUpdateSettings = vi.fn();

    render(
      <GeneralSettingsTab
        settings={baseSettings}
        onUpdateSettings={onUpdateSettings}
      />
    );

    const switchLabel = screen.getByText(/salvar automaticamente comentários e campos de texto/i);
    expect(switchLabel).toBeInTheDocument();

    const checkbox = screen.getByRole('checkbox', {
      name: /salvar automaticamente comentários e campos de texto/i,
    });
    expect(checkbox).toBeChecked();
  });

  it('chama onUpdateSettings com autoSaveComments: false quando o usuário desativa o interruptor', () => {
    const onUpdateSettings = vi.fn();

    render(
      <GeneralSettingsTab
        settings={baseSettings}
        onUpdateSettings={onUpdateSettings}
      />
    );

    const checkbox = screen.getByRole('checkbox', {
      name: /salvar automaticamente comentários e campos de texto/i,
    });

    fireEvent.click(checkbox);

    expect(onUpdateSettings).toHaveBeenCalledWith({
      autoSaveComments: false,
    });
  });

  it('chama onUpdateSettings com autoSaveComments: true quando o usuário reativa o interruptor', () => {
    const onUpdateSettings = vi.fn();

    render(
      <GeneralSettingsTab
        settings={{ ...baseSettings, autoSaveComments: false }}
        onUpdateSettings={onUpdateSettings}
      />
    );

    const checkbox = screen.getByRole('checkbox', {
      name: /salvar automaticamente comentários e campos de texto/i,
    });
    expect(checkbox).not.toBeChecked();

    fireEvent.click(checkbox);

    expect(onUpdateSettings).toHaveBeenCalledWith({
      autoSaveComments: true,
    });
  });
});
