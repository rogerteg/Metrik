import React from 'react';
import { ServiceLevelExpectation } from '../types/analytics';

export interface DashboardSummaryCardsProps {
  /** Expectativa de Nível de Serviço calculada */
  sle: ServiceLevelExpectation;
  /** Quantidade total de itens atualmente em progresso (WIP) */
  totalWip: number;
  /** Quantidade de itens entregues no período recente */
  recentThroughput: number;
  /** Percentual de cartões que sofreram bloqueios na amostra */
  blockedRatePercentage: number;
  /** Callback ao clicar no card de SLE para navegar até a aba detalhada */
  onNavigateToSle?: () => void;
  /** Callback ao clicar no card de WIP para navegar até a aba WIP Aging */
  onNavigateToWip?: () => void;
  /** Callback ao clicar no card de Vazão para navegar até Throughput */
  onNavigateToThroughput?: () => void;
  /** Callback ao clicar no card de Bloqueios para navegar até Blockers */
  onNavigateToBlockers?: () => void;
}

export const DashboardSummaryCards: React.FC<DashboardSummaryCardsProps> = ({
  sle,
  totalWip,
  recentThroughput,
  blockedRatePercentage,
  onNavigateToSle,
  onNavigateToWip,
  onNavigateToThroughput,
  onNavigateToBlockers,
}) => {
  return (
    <div className="dashboard-summary-cards-grid" aria-label="Cartões de Síntese Executiva de Fluxo">
      {/* 1. Card de Expectativa de Nível de Serviço (SLE) */}
      <div
        className="summary-kpi-card is-clickable"
        onClick={onNavigateToSle}
        data-testid="card-sle"
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if ((e.key === 'Enter' || e.key === ' ') && onNavigateToSle) {
            e.preventDefault();
            onNavigateToSle();
          }
        }}
        title="Clique para detalhar Expectativas de Nível de Serviço (SLEs)"
      >
        <div className="summary-card-header">
          <span className="summary-card-icon">⏱️</span>
          <span className="summary-card-tag">SLE P85</span>
        </div>
        <div className="summary-card-body">
          <div className="summary-card-value">
            {sle.sampleSize > 0 ? `${sle.observedDays}d` : '-'}
          </div>
          <div className="summary-card-label">Expectativa de Nível de Serviço</div>
          <div className="summary-card-subtext">
            {sle.sampleSize > 0
              ? `85% em até ${sle.observedDays} dias (${sle.complianceRate}% conformidade)`
              : 'Amostra insuficiente para cálculo'}
          </div>
        </div>
      </div>

      {/* 2. Card de Trabalho em Progresso (WIP Ativo) */}
      <div
        className="summary-kpi-card is-clickable"
        onClick={onNavigateToWip}
        data-testid="card-wip"
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if ((e.key === 'Enter' || e.key === ' ') && onNavigateToWip) {
            e.preventDefault();
            onNavigateToWip();
          }
        }}
        title="Clique para inspecionar o envelhecimento do trabalho em progresso (WIP Aging)"
      >
        <div className="summary-card-header">
          <span className="summary-card-icon">⏳</span>
          <span className="summary-card-tag">WIP Ativo</span>
        </div>
        <div className="summary-card-body">
          <div className="summary-card-value">{totalWip}</div>
          <div className="summary-card-label">Trabalho em Progresso</div>
          <div className="summary-card-subtext">
            {totalWip === 1 ? '1 item ativo no fluxo' : `${totalWip} itens ativos no fluxo`}
          </div>
        </div>
      </div>

      {/* 3. Card de Vazão Recente (Throughput) */}
      <div
        className="summary-kpi-card is-clickable"
        onClick={onNavigateToThroughput}
        data-testid="card-throughput"
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if ((e.key === 'Enter' || e.key === ' ') && onNavigateToThroughput) {
            e.preventDefault();
            onNavigateToThroughput();
          }
        }}
        title="Clique para ver o ritmo de entrega e distribuição de Throughput"
      >
        <div className="summary-card-header">
          <span className="summary-card-icon">📈</span>
          <span className="summary-card-tag">Vazão</span>
        </div>
        <div className="summary-card-body">
          <div className="summary-card-value">{recentThroughput}</div>
          <div className="summary-card-label">Entregas Concluídas</div>
          <div className="summary-card-subtext">Itens entregues no período analisado</div>
        </div>
      </div>

      {/* 4. Card de Taxa de Bloqueios */}
      <div
        className="summary-kpi-card is-clickable"
        onClick={onNavigateToBlockers}
        data-testid="card-blockers"
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if ((e.key === 'Enter' || e.key === ' ') && onNavigateToBlockers) {
            e.preventDefault();
            onNavigateToBlockers();
          }
        }}
        title="Clique para analisar causas de bloqueio e impacto temporal"
      >
        <div className="summary-card-header">
          <span className="summary-card-icon">🚫</span>
          <span className="summary-card-tag">Impedimentos</span>
        </div>
        <div className="summary-card-body">
          <div className="summary-card-value">{blockedRatePercentage}%</div>
          <div className="summary-card-label">Taxa de Bloqueios</div>
          <div className="summary-card-subtext">Proporção de tarefas com retenção</div>
        </div>
      </div>
    </div>
  );
};
