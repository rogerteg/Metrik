import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MikaSettingsTab } from '../../src/components/Mika/MikaSettingsTab';
import { mikaService } from '../../src/services/ai/mikaService';
import { obfuscateApiKey } from '../../src/utils/mikaSecurity';

describe('MikaSettingsTab', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('deve renderizar o modo heurístico offline como ativo por padrão', () => {
    render(<MikaSettingsTab />);

    expect(screen.getByText(/Mika AI — Copiloto de Fluxo/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Modo Local-First/i)).toBeChecked();
  });

  it('deve permitir alternar para Google Gemini BYOK e salvar uma chave válida', () => {
    const saveSpy = vi.spyOn(mikaService, 'savePreferences');
    render(<MikaSettingsTab />);

    const geminiRadio = screen.getByLabelText(/Google Gemini API/i);
    fireEvent.click(geminiRadio);

    const keyInput = screen.getByPlaceholderText(/Cole sua chave do Google Gemini/i);
    fireEvent.change(keyInput, { target: { value: 'AIzaSyTestKey123456789012345' } });

    const saveBtn = screen.getByRole('button', { name: /Salvar Chave/i });
    fireEvent.click(saveBtn);

    expect(saveSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        provider: 'gemini',
        apiKeyObfuscated: expect.any(String),
      }),
    );
  });

  it('deve exibir a chave mascarada quando já houver chave configurada e permitir desconexão em 1 clique', () => {
    mikaService.savePreferences({
      provider: 'gemini',
      apiKeyObfuscated: obfuscateApiKey('AIzaSyExistingKey1234567890'),
    });

    render(<MikaSettingsTab />);

    expect(screen.getByText(/AIzaSy\.\.\.••••/i)).toBeInTheDocument();

    const disconnectBtn = screen.getByRole('button', { name: /Desconectar e Limpar Chave/i });
    fireEvent.click(disconnectBtn);

    const prefs = mikaService.getPreferences();
    expect(prefs.apiKeyObfuscated).toBe('');
    expect(prefs.provider).toBe('heuristic-offline');
  });
});
