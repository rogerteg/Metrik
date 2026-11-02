import React, { useEffect } from 'react';
import { FlowReportSnapshot } from '../types/reports';
import { formatDatePtBr } from '../utils/flowReportExporter';
import metrikLogo from '../assets/metrik-logo.png';
import './ExecutiveReportPrintView.css';

export interface ExecutiveReportPrintViewProps {
  snapshot: FlowReportSnapshot;
  onClose: () => void;
  autoPrint?: boolean;
}

export const ExecutiveReportPrintView: React.FC<ExecutiveReportPrintViewProps> = ({
  snapshot,
  onClose,
  autoPrint = false,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    if (autoPrint) {
      const timer = setTimeout(() => {
        window.print();
      }, 400);
      return () => {
        clearTimeout(timer);
        window.removeEventListener('keydown', handleKeyDown);
      };
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [autoPrint, onClose]);

  const handlePrint = () => {
    window.print();
  };

  const { metrics, percentiles, mikaInsights, blockerSummary } = snapshot;

  return (
    <div
      className="executive-print-overlay"
      role="dialog"
      aria-modal="true"
      aria-label="Visualização do Relatório Executivo"
      data-testid="executive-print-view"
    >
      {/* Barra de Ações (Ocultada durante a impressão) */}
      <div className="executive-print-toolbar">
        <div>
          <strong>Visualização de Impressão</strong>
          <span style={{ fontSize: '12px', opacity: 0.8, marginLeft: '8px' }}>
            (Formatado para folha A4 em modo retrato ou paisagem)
          </span>
        </div>
        <div className="executive-print-toolbar-actions">
          <button
            type="button"
            className="btn btn-primary btn-compact"
            onClick={handlePrint}
            data-testid="btn-trigger-print"
          >
            🖨️ Imprimir / Salvar em PDF
          </button>
          <button
            type="button"
            className="btn btn-secondary btn-compact"
            onClick={onClose}
            data-testid="btn-close-print-view"
          >
            Fechar
          </button>
        </div>
      </div>

      {/* Conteúdo Executivo Diagramado para Impressão */}
      <div className="executive-print-container">
        {/* Cabeçalho Institucional */}
        <header className="executive-report-header">
          <div className="executive-report-brand">
            <img src={metrikLogo} alt="Metrik Logo" className="executive-report-logo" />
            <div className="executive-report-title">
              <h1>Metrik — Relatório Executivo de Fluxo</h1>
              <p>Saúde da Entrega, Prazos e Previsibilidade Operacional</p>
            </div>
          </div>
          <div className="executive-report-meta">
            <div>
              <strong>Quadro:</strong> {snapshot.boardTitle}
            </div>
            {snapshot.squadName && (
              <div>
                <strong>Squad/Time:</strong> {snapshot.squadName}
              </div>
            )}
            <div>
              <strong>Emitido em:</strong> {formatDatePtBr(snapshot.generatedAt)}
            </div>
          </div>
        </header>

        {/* Resumo do Escopo e Amostragem */}
        <section className="executive-report-scope" aria-label="Escopo da Amostragem">
          <div className="executive-scope-item">
            <span className="executive-scope-label">Filtro / Período</span>
            <span className="executive-scope-value">{snapshot.filterSummary}</span>
          </div>
          <div className="executive-scope-item">
            <span className="executive-scope-label">Itens no Escopo</span>
            <span className="executive-scope-value">{snapshot.totalTasks} cartões</span>
          </div>
          <div className="executive-scope-item">
            <span className="executive-scope-label">Itens Concluídos</span>
            <span className="executive-scope-value">{snapshot.completedTasks} cartões</span>
          </div>
          <div className="executive-scope-item">
            <span className="executive-scope-label">WIP Ativo</span>
            <span className="executive-scope-value">{snapshot.wipCount} em andamento</span>
          </div>
        </section>

        {/* Indicadores Principais de Fluxo */}
        <section aria-labelledby="section-kpis">
          <h2 id="section-kpis" className="executive-section-heading">
            📊 Indicadores Principais de Fluxo
          </h2>
          <div className="executive-kpi-grid">
            <div className="executive-kpi-card">
              <div className="executive-kpi-title">Vazão (Throughput)</div>
              <div className="executive-kpi-value" data-testid="kpi-throughput">
                {metrics.throughput}
              </div>
              <div className="executive-kpi-detail">Itens concluídos na amostragem</div>
            </div>

            <div className="executive-kpi-card">
              <div className="executive-kpi-title">Lead Time Médio</div>
              <div className="executive-kpi-value" data-testid="kpi-lead-time">
                {metrics.avgLeadTimeDays.toFixed(1).replace('.', ',')}{' '}
                <span style={{ fontSize: '14px', fontWeight: 'normal' }}>dias</span>
              </div>
              <div className="executive-kpi-detail">Da criação até a entrega final</div>
            </div>

            <div className="executive-kpi-card">
              <div className="executive-kpi-title">Cycle Time Médio</div>
              <div className="executive-kpi-value" data-testid="kpi-cycle-time">
                {metrics.avgCycleTimeDays.toFixed(1).replace('.', ',')}{' '}
                <span style={{ fontSize: '14px', fontWeight: 'normal' }}>dias</span>
              </div>
              <div className="executive-kpi-detail">Do início efetivo até a conclusão</div>
            </div>

            <div className="executive-kpi-card">
              <div className="executive-kpi-title">Expectativa de Nível (SLE 85%)</div>
              <div className="executive-kpi-value" data-testid="kpi-sle-p85">
                {metrics.sleP85Days.toFixed(1).replace('.', ',')}{' '}
                <span style={{ fontSize: '14px', fontWeight: 'normal' }}>dias</span>
              </div>
              <div className="executive-kpi-detail">
                {metrics.sleComplianceRate}% de conformidade na janela
              </div>
            </div>

            <div className="executive-kpi-card">
              <div className="executive-kpi-title">Taxa de Impedimentos</div>
              <div className="executive-kpi-value" data-testid="kpi-blocker-rate">
                {metrics.blockerRatePercent.toFixed(1).replace('.', ',')}%
              </div>
              <div className="executive-kpi-detail">
                {metrics.totalBlockedHours.toFixed(1).replace('.', ',')} horas retidas no total
              </div>
            </div>

            <div className="executive-kpi-card">
              <div className="executive-kpi-title">Trabalho em Andamento (WIP)</div>
              <div className="executive-kpi-value" data-testid="kpi-wip">
                {snapshot.wipCount}
              </div>
              <div className="executive-kpi-detail">Itens atualmente em execução</div>
            </div>
          </div>
        </section>

        {/* Distribuição e Percentis de Prazos */}
        <section aria-labelledby="section-distribution">
          <h2 id="section-distribution" className="executive-section-heading">
            🎯 Distribuição de Prazos & Gestão de Impedimentos
          </h2>
          <div className="executive-distribution-grid">
            <div className="executive-panel">
              <h4>Percentis de Tempo de Ciclo (NIST)</h4>
              <div className="executive-percentile-row">
                <span>50% dos itens (Mediana operacional)</span>
                <strong>{percentiles.p50.toFixed(1).replace('.', ',')} dias ou menos</strong>
              </div>
              <div className="executive-percentile-row">
                <span>85% dos itens (Compromisso SLE padrão)</span>
                <strong>{percentiles.p85.toFixed(1).replace('.', ',')} dias ou menos</strong>
              </div>
              <div className="executive-percentile-row">
                <span>95% dos itens (Certeza estatística / Cauda)</span>
                <strong>{percentiles.p95.toFixed(1).replace('.', ',')} dias ou menos</strong>
              </div>
            </div>

            <div className="executive-panel">
              <h4>Resumo de Impedimentos</h4>
              {blockerSummary && blockerSummary.topReasons.length > 0 ? (
                <>
                  <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '8px' }}>
                    Total de {blockerSummary.totalBlockers} tarefas impactadas por bloqueios:
                  </div>
                  {blockerSummary.topReasons.slice(0, 3).map((r, i) => (
                    <div key={i} className="executive-percentile-row">
                      <span>{r.reason}</span>
                      <strong>
                        {r.count}x ({r.impactHours.toFixed(1).replace('.', ',')}h)
                      </strong>
                    </div>
                  ))}
                </>
              ) : (
                <div style={{ fontSize: '13px', color: '#64748b', paddingTop: '10px' }}>
                  Nenhum bloqueio ou impedimento crítico registrado no período avaliado.
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Diagnósticos da Mika AI Flow Copilot (se incluídos) */}
        {mikaInsights && mikaInsights.length > 0 && (
          <section className="executive-mika-block" aria-labelledby="section-mika">
            <h2 id="section-mika" className="executive-section-heading">
              🤖 Diagnósticos & Recomendações — Mika AI Flow Copilot
            </h2>
            {mikaInsights.map((insight) => (
              <div key={insight.id} className={`executive-insight-item ${insight.severity}`}>
                <div className="executive-insight-title">
                  {insight.severity === 'critical'
                    ? '🚨 '
                    : insight.severity === 'warning'
                      ? '⚠️ '
                      : 'ℹ️ '}
                  {insight.title}
                </div>
                <div className="executive-insight-message">{insight.message}</div>
              </div>
            ))}
          </section>
        )}

        {/* Rodapé Institucional */}
        <footer className="executive-report-footer">
          <span>Metrik — Gestão Ágil e Métricas de Fluxo</span>
          <span>Soberania Local-First • Documento gerado 100% no cliente</span>
        </footer>
      </div>
    </div>
  );
};
