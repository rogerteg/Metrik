/**
 * MikaDrawer - Gaveta retrátil global do copiloto Mika AI (Feature 048)
 * Apresenta diagnósticos consolidados, alertas em tempo real e explicações de métricas.
 * Conforme especificações em specs/048-mika-ai-flow-copilot/spec.md (FR-001, FR-008, FR-010)
 */

import React, { useEffect } from 'react';
import { MikaInsight } from '../../types/mika';
import { MikaInsightCard } from './MikaInsightCard';

export interface MikaDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  insights: MikaInsight[];
  onRefresh?: () => void;
  isLoading?: boolean;
  providerName?: string;
}

export const MikaDrawer: React.FC<MikaDrawerProps> = ({
  isOpen,
  onClose,
  insights,
  onRefresh,
  isLoading = false,
  providerName = 'Local-First (Offline)',
}) => {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <>
      <div
        className="mika-drawer-backdrop"
        onClick={onClose}
        data-testid="mika-drawer-backdrop"
        aria-hidden="true"
      />

      <aside
        className="mika-drawer"
        role="dialog"
        aria-modal="true"
        aria-label="Painel Lateral da Mika AI"
      >
        <header className="mika-drawer-header">
          <div className="mika-insight-toolbar-title">
            <div className="mika-avatar-badge" title="Mika AI Flow Copilot">
              M
            </div>
            <div>
              <h2
                style={{
                  margin: 0,
                  fontSize: '1.1rem',
                  fontWeight: 700,
                  color: 'var(--color-text, #f8fafc)',
                }}
              >
                Mika Flow Copilot
              </h2>
              <div
                style={{
                  fontSize: '0.75rem',
                  color: 'var(--color-text-muted, #94a3b8)',
                  marginTop: '0.15rem',
                }}
              >
                Inteligência Ativa: <span style={{ color: '#38bdf8' }}>{providerName}</span>
              </div>
            </div>
          </div>

          <button
            type="button"
            className="mika-drawer-close"
            onClick={onClose}
            aria-label="Fechar gaveta da Mika"
            title="Fechar (Esc)"
          >
            ✕
          </button>
        </header>

        <div className="mika-drawer-content">
          <div
            style={{
              padding: '0.75rem 1rem',
              borderRadius: '0.5rem',
              background: 'var(--mika-gradient-subtle)',
              border: '1px solid var(--mika-card-border)',
              fontSize: '0.85rem',
              color: 'var(--color-text-secondary, #cbd5e1)',
              lineHeight: 1.5,
            }}
          >
            👋 <strong>Olá! Sou a Mika</strong>, sua copiloto analítica. Analiso a variabilidade do
            fluxo, estabilidade do WIP e as probabilidades de Monte Carlo para apoiar decisões
            técnicas baseadas em dados.
          </div>

          <MikaInsightCard insights={insights} onRefresh={onRefresh} isLoading={isLoading} />

          {insights.length === 0 && (
            <div
              style={{
                textAlign: 'center',
                padding: '2rem 1rem',
                color: 'var(--color-text-muted, #94a3b8)',
                fontSize: '0.9rem',
              }}
            >
              Nenhum diagnóstico gerado no momento. Adicione ou movimente tarefas para ver
              conclusões analíticas.
            </div>
          )}
        </div>
      </aside>
    </>
  );
};
