/**
 * MikaDrawer - Gaveta retrátil global do copiloto Mika AI (Feature 048 & Feature 052)
 * Apresenta navegação por abas ("💬 Chat" e "📊 Diagnósticos"), interface de diálogo interativo,
 * diagnósticos consolidados, alertas em tempo real e explicações de métricas.
 * Conforme especificações em specs/052-mika-ai-chat/spec.md (FR-001, FR-002, FR-007)
 */

import React, { useEffect, useState } from 'react';
import { MikaInsight, MikaBoardTelemetryContext } from '../../types/mika';
import { TaskModel } from '../../types/kanban';
import { MikaInsightCard } from './MikaInsightCard';
import { MikaChatInterface } from './MikaChatInterface';
import { loadDrawerActiveTab, saveDrawerActiveTab } from '../../services/ai/mikaChatStorageManager';

export interface MikaDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  insights: MikaInsight[];
  onRefresh?: () => void;
  isLoading?: boolean;
  providerName?: string;
  boardId?: string;
  boardTitle?: string;
  telemetryContext?: MikaBoardTelemetryContext;
  onOpenTaskDetails?: (taskId: string) => void;
  onNavigateToForecast?: (
    scopeType: 'initiative' | 'sprint' | 'all' | 'tag',
    scopeId?: string,
  ) => void;
  availableTasks?: TaskModel[];
  apiKey?: string;
}

export const MikaDrawer: React.FC<MikaDrawerProps> = ({
  isOpen,
  onClose,
  insights,
  onRefresh,
  isLoading = false,
  providerName = 'Local-First (Offline)',
  boardId = 'default-board',
  boardTitle = 'Quadro Atual',
  telemetryContext,
  onOpenTaskDetails,
  onNavigateToForecast,
  availableTasks = [],
  apiKey,
}) => {
  const [activeTab, setActiveTab] = useState<'chat' | 'insights'>(() => loadDrawerActiveTab());

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

  const handleTabChange = (tab: 'chat' | 'insights') => {
    setActiveTab(tab);
    saveDrawerActiveTab(tab);
  };

  if (!isOpen) return null;

  // Fallback seguro para telemetryContext se não for provido
  const resolvedTelemetry: MikaBoardTelemetryContext = telemetryContext || {
    boardId,
    boardTitle,
    columns: [],
    blockedTasks: [],
    cycleTimeP85Days: null,
    throughputLast14Days: 0,
    totalActiveTasks: 0,
    totalCompletedTasks: 0,
    generatedAt: new Date().toISOString(),
  };

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

        {/* Abas de Navegação no Topo da Gaveta (FR-001) */}
        <nav className="mika-drawer-tabs" role="tablist" aria-label="Seções da Gaveta da Mika">
          <button
            type="button"
            role="tab"
            id="mika-tab-chat"
            aria-selected={activeTab === 'chat'}
            aria-controls="mika-tabpanel-chat"
            className={`mika-tab-button ${activeTab === 'chat' ? 'active' : ''}`}
            onClick={() => handleTabChange('chat')}
            data-testid="mika-tab-chat"
          >
            💬 Chat
          </button>
          <button
            type="button"
            role="tab"
            id="mika-tab-insights"
            aria-selected={activeTab === 'insights'}
            aria-controls="mika-tabpanel-insights"
            className={`mika-tab-button ${activeTab === 'insights' ? 'active' : ''}`}
            onClick={() => handleTabChange('insights')}
            data-testid="mika-tab-insights"
          >
            📊 Diagnósticos
            {insights.length > 0 && (
              <span className="mika-tab-badge" title={`${insights.length} diagnósticos ativos`}>
                {insights.length}
              </span>
            )}
          </button>
        </nav>

        {/* Conteúdo da Aba Ativa */}
        {activeTab === 'chat' ? (
          <div
            id="mika-tabpanel-chat"
            role="tabpanel"
            aria-labelledby="mika-tab-chat"
            style={{
              display: 'flex',
              flexDirection: 'column',
              flex: 1,
              minHeight: 0,
              overflow: 'hidden',
            }}
          >
            <MikaChatInterface
              boardId={boardId}
              boardTitle={boardTitle}
              telemetryContext={resolvedTelemetry}
              onOpenTaskDetails={onOpenTaskDetails}
              onNavigateToForecast={onNavigateToForecast}
              providerName={providerName}
              apiKey={apiKey}
              availableTasks={availableTasks}
            />
          </div>
        ) : (
          <div
            id="mika-tabpanel-insights"
            role="tabpanel"
            aria-labelledby="mika-tab-insights"
            className="mika-drawer-content"
          >
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
              👋 <strong>Olá! Sou a Mika</strong>, sua copiloto analítica. Analiso a variabilidade
              do fluxo, estabilidade do WIP e as probabilidades de Monte Carlo para apoiar decisões
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
        )}
      </aside>
    </>
  );
};
