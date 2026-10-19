/**
 * MikaInsightCard - Componente de exibição de insights e diagnósticos da Mika (Feature 048)
 * Exibido no topo do AnalyticsDashboard e na gaveta MikaDrawer.
 * Conforme especificações em specs/048-mika-ai-flow-copilot/spec.md (FR-001, FR-008)
 */

import React from 'react';
import { MikaInsight, MikaInsightSeverity } from '../../types/mika';

export interface MikaInsightCardProps {
  insights: MikaInsight[];
  onRefresh?: () => void;
  isLoading?: boolean;
}

const getSeverityBadge = (severity: MikaInsightSeverity) => {
  switch (severity) {
    case 'critical':
      return <span className="mika-badge badge-critical">CRÍTICO</span>;
    case 'warning':
      return <span className="mika-badge badge-warning">ATENÇÃO</span>;
    case 'info':
    default:
      return <span className="mika-badge badge-info">INFO</span>;
  }
};

export const MikaInsightCard: React.FC<MikaInsightCardProps> = ({
  insights,
  onRefresh,
  isLoading = false,
}) => {
  if (!insights || insights.length === 0) {
    return null;
  }

  return (
    <div className="mika-insight-container" aria-label="Diagnósticos de Fluxo da Mika">
      {onRefresh && (
        <div className="mika-insight-toolbar">
          <div className="mika-insight-toolbar-title">
            <div className="mika-avatar-badge" title="Mika AI Flow Copilot">
              M
            </div>
            <span className="mika-copilot-label">Diagnósticos da Mika</span>
          </div>

          <button
            type="button"
            className="mika-refresh-btn"
            onClick={onRefresh}
            disabled={isLoading}
            aria-label="Recalcular diagnósticos"
            title="Recalcular métricas da Mika"
          >
            <span>{isLoading ? '⏳' : '🔄'}</span>
            <span>{isLoading ? 'Analisando...' : 'Recalcular'}</span>
          </button>
        </div>
      )}

      {insights.map((insight) => (
        <article
          key={insight.id}
          className={`mika-insight-card severity-${insight.severity}`}
          data-category={insight.category}
        >
          <header className="mika-insight-header">
            <div className="mika-insight-title-group">
              <h3 className="mika-insight-title">{insight.title}</h3>
              {getSeverityBadge(insight.severity)}
            </div>
          </header>

          <p className="mika-insight-body">{insight.summary}</p>

          {insight.recommendation && (
            <div className="mika-insight-recommendation">
              <strong>Recomendação da Mika:</strong> {insight.recommendation}
            </div>
          )}
        </article>
      ))}
    </div>
  );
};
