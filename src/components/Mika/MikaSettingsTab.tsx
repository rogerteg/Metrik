/**
 * MikaSettingsTab - Aba de configurações da Mika AI no menu do sistema (Feature 048)
 * Gerencia preferências de inteligência, chave de API BYOK (Google Gemini) e modo offline.
 * Conforme especificações em specs/048-mika-ai-flow-copilot/spec.md (FR-006, FR-007, FR-010)
 */

import React, { useState } from 'react';
import { mikaService } from '../../services/ai/mikaService';
import { MikaProvider } from '../../types/mika';
import {
  deobfuscateApiKey,
  isValidGeminiApiKey,
  maskApiKey,
  obfuscateApiKey,
} from '../../utils/mikaSecurity';

export interface MikaSettingsTabProps {
  onShowToast?: (message: string, type: 'success' | 'warning' | 'error') => void;
}

export const MikaSettingsTab: React.FC<MikaSettingsTabProps> = ({ onShowToast }) => {
  const [preferences, setPreferences] = useState(() => mikaService.getPreferences());
  const [inputKey, setInputKey] = useState('');
  const [validationError, setValidationError] = useState('');

  const currentDeobfuscatedKey = preferences.apiKeyObfuscated
    ? deobfuscateApiKey(preferences.apiKeyObfuscated)
    : '';

  const handleProviderChange = (provider: MikaProvider) => {
    const updated = mikaService.savePreferences({ provider });
    setPreferences(updated);
    if (onShowToast) {
      onShowToast(
        provider === 'heuristic-offline'
          ? 'Modo Local-First (Offline) ativado.'
          : 'Provedor Google Gemini selecionado.',
        'success',
      );
    }
  };

  const handleSaveApiKey = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError('');

    if (!isValidGeminiApiKey(inputKey)) {
      setValidationError('Por favor, informe uma chave válida da Google Gemini API.');
      return;
    }

    const updated = mikaService.savePreferences({
      provider: 'gemini',
      apiKeyObfuscated: obfuscateApiKey(inputKey),
    });

    setPreferences(updated);
    setInputKey('');
    if (onShowToast) {
      onShowToast('Chave de API do Gemini salva com sucesso!', 'success');
    }
  };

  const handleDisconnectApiKey = () => {
    const updated = mikaService.clearApiKey();
    setPreferences(updated);
    setInputKey('');
    if (onShowToast) {
      onShowToast('Chave removida. Mika operando em modo offline.', 'success');
    }
  };

  const handleToggleAutoDiagnose = () => {
    const nextVal = !preferences.autoDiagnoseOnLoad;
    const updated = mikaService.savePreferences({ autoDiagnoseOnLoad: nextVal });
    setPreferences(updated);
  };

  const handleToneChange = (tone: 'consultative' | 'direct') => {
    const updated = mikaService.savePreferences({ tone });
    setPreferences(updated);
  };

  return (
    <div
      className="settings-tab-panel"
      id="panel-mika"
      role="tabpanel"
      aria-label="Mika AI Copilot"
    >
      <div className="settings-section">
        <div className="settings-section-header">
          <div className="mika-insight-toolbar-title">
            <div className="mika-avatar-badge" title="Mika AI Flow Copilot">
              M
            </div>
            <div>
              <h3 className="settings-section-title" style={{ margin: 0 }}>
                Mika AI — Copiloto de Fluxo & Métricas Ágeis
              </h3>
              <p className="settings-section-desc" style={{ marginTop: '0.25rem' }}>
                Configure a inteligência do seu copiloto. Operação padrão 100% autônoma e offline
                (Local-First), com suporte opcional a Bring Your Own Key (BYOK) para sínteses
                narrativas do Google Gemini.
              </p>
            </div>
          </div>
        </div>

        {/* Escolha do Modo de Operação */}
        <div
          style={{ marginTop: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}
        >
          <label
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.75rem',
              padding: '0.875rem',
              borderRadius: '0.5rem',
              border: '1px solid var(--color-border, #334155)',
              background:
                preferences.provider === 'heuristic-offline'
                  ? 'rgba(var(--mika-primary-rgb), 0.08)'
                  : 'transparent',
              cursor: 'pointer',
            }}
          >
            <input
              type="radio"
              name="mikaProvider"
              value="heuristic-offline"
              checked={preferences.provider === 'heuristic-offline'}
              onChange={() => handleProviderChange('heuristic-offline')}
              style={{ marginTop: '0.2rem' }}
            />
            <div>
              <strong style={{ color: 'var(--color-text, #f8fafc)', fontSize: '0.95rem' }}>
                Modo Local-First (Offline & Soberano) — Recomendado
              </strong>
              <div
                style={{
                  fontSize: '0.85rem',
                  color: 'var(--color-text-secondary, #94a3b8)',
                  marginTop: '0.2rem',
                }}
              >
                Utiliza o motor matemático puro e determinístico no navegador. Zero envio de dados
                externos, latência &lt; 5ms e conformidade máxima com privacidade corporativa.
              </div>
            </div>
          </label>

          <label
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.75rem',
              padding: '0.875rem',
              borderRadius: '0.5rem',
              border: '1px solid var(--color-border, #334155)',
              background:
                preferences.provider === 'gemini'
                  ? 'rgba(var(--mika-primary-rgb), 0.08)'
                  : 'transparent',
              cursor: 'pointer',
            }}
          >
            <input
              type="radio"
              name="mikaProvider"
              value="gemini"
              checked={preferences.provider === 'gemini'}
              onChange={() => handleProviderChange('gemini')}
              style={{ marginTop: '0.2rem' }}
            />
            <div>
              <strong style={{ color: 'var(--color-text, #f8fafc)', fontSize: '0.95rem' }}>
                Google Gemini API (BYOK — Bring Your Own Key)
              </strong>
              <div
                style={{
                  fontSize: '0.85rem',
                  color: 'var(--color-text-secondary, #94a3b8)',
                  marginTop: '0.2rem',
                }}
              >
                Utiliza modelos Gemini 1.5/2.5 Flash via conexão direta do seu navegador para gerar
                sínteses executivas avançadas e decomposição aprofundada de histórias.
              </div>
            </div>
          </label>
        </div>

        {/* Gerenciamento da Chave Gemini se selecionado */}
        {preferences.provider === 'gemini' && (
          <div
            style={{
              marginTop: '1.25rem',
              padding: '1rem',
              borderRadius: '0.5rem',
              border: '1px solid var(--color-border, #334155)',
              background: 'rgba(0,0,0,0.2)',
            }}
          >
            {currentDeobfuscatedKey ? (
              <div>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '0.75rem',
                  }}
                >
                  <div>
                    <span
                      style={{ fontSize: '0.85rem', color: 'var(--color-text-muted, #94a3b8)' }}
                    >
                      Chave configurada:
                    </span>
                    <div
                      style={{
                        fontFamily: 'monospace',
                        fontWeight: 600,
                        color: '#38bdf8',
                        fontSize: '0.95rem',
                        marginTop: '0.25rem',
                      }}
                    >
                      {maskApiKey(currentDeobfuscatedKey)}
                    </div>
                  </div>
                  <button
                    type="button"
                    className="mika-btn-secondary"
                    style={{ borderColor: '#ef4444', color: '#ef4444' }}
                    onClick={handleDisconnectApiKey}
                  >
                    Desconectar e Limpar Chave
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSaveApiKey}>
                <label
                  style={{
                    display: 'block',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    color: 'var(--color-text, #f8fafc)',
                    marginBottom: '0.4rem',
                  }}
                >
                  Chave de API do Google Gemini
                </label>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <input
                    type="password"
                    placeholder="Cole sua chave do Google Gemini (ex: AIzaSy...)"
                    value={inputKey}
                    onChange={(e) => setInputKey(e.target.value)}
                    style={{
                      flex: 1,
                      minWidth: '240px',
                      padding: '0.5rem 0.75rem',
                      borderRadius: '0.375rem',
                      border: '1px solid var(--color-border, #475569)',
                      background: 'var(--color-surface, #0f172a)',
                      color: 'var(--color-text, #ffffff)',
                    }}
                  />
                  <button type="submit" className="mika-btn-primary">
                    Salvar Chave
                  </button>
                </div>
                {validationError && (
                  <div style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '0.35rem' }}>
                    {validationError}
                  </div>
                )}
                <div
                  style={{
                    fontSize: '0.8rem',
                    color: 'var(--color-text-muted, #94a3b8)',
                    marginTop: '0.5rem',
                  }}
                >
                  Sua chave é armazenada com ofuscação exclusivamente no seu navegador. Você pode
                  obter uma chave gratuita no{' '}
                  <a
                    href="https://aistudio.google.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: '#38bdf8', textDecoration: 'underline' }}
                  >
                    Google AI Studio
                  </a>
                  .
                </div>
              </form>
            )}
          </div>
        )}

        {/* Preferências Adicionais */}
        <div
          style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.875rem' }}
        >
          <label
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}
          >
            <input
              type="checkbox"
              checked={preferences.autoDiagnoseOnLoad}
              onChange={handleToggleAutoDiagnose}
              style={{ accentColor: 'var(--mika-primary)' }}
            />
            <span style={{ fontSize: '0.9rem', color: 'var(--color-text, #f8fafc)' }}>
              Gerar diagnósticos automaticamente ao abrir as telas analíticas
            </span>
          </label>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{ fontSize: '0.9rem', color: 'var(--color-text, #f8fafc)' }}>
              Tom da comunicação da Mika:
            </span>
            <select
              value={preferences.tone}
              onChange={(e) => handleToneChange(e.target.value as 'consultative' | 'direct')}
              style={{
                padding: '0.3rem 0.6rem',
                borderRadius: '0.375rem',
                border: '1px solid var(--color-border, #475569)',
                background: 'var(--color-surface, #0f172a)',
                color: 'var(--color-text, #ffffff)',
                fontSize: '0.85rem',
              }}
            >
              <option value="consultative">Consultivo e Educativo (Padrão)</option>
              <option value="direct">Direto e Executivo</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};
