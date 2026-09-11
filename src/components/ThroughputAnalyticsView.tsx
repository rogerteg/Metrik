import React, { useMemo, useState } from 'react';
import { TaskModel } from '../types/kanban';
import {
  extractThroughputSeries,
  calculateThroughputHistogram,
  calculateThroughputSummary,
  ThroughputTimeWindow,
} from '../utils/throughputMetrics';
import { ThroughputHistogramChart } from './charts/ThroughputHistogramChart';
import { ThroughputRunChart } from './charts/ThroughputRunChart';

export interface ThroughputAnalyticsViewProps {
  tasks: TaskModel[];
}

export const ThroughputAnalyticsView: React.FC<ThroughputAnalyticsViewProps> = ({ tasks }) => {
  const [timeWindow, setTimeWindow] = useState<ThroughputTimeWindow>(30);

  // Extrair série histórica diária de vazão
  const dailySeries = useMemo(() => {
    return extractThroughputSeries(tasks, timeWindow);
  }, [tasks, timeWindow]);

  // Construir baldes do histograma
  const { bins, maxFrequency, maxDailyThroughput } = useMemo(() => {
    return calculateThroughputHistogram(dailySeries);
  }, [dailySeries]);

  // Resumo estatístico
  const summary = useMemo(() => {
    return calculateThroughputSummary(dailySeries);
  }, [dailySeries]);

  // Verificar se há dados suficientes
  const hasCompletedTasks = useMemo(() => {
    return tasks.some((t) => Boolean(t.completedAt));
  }, [tasks]);

  if (!hasCompletedTasks) {
    return (
      <div className="throughput-analytics-view empty-guidance-state" data-testid="throughput-empty-state">
        <div className="empty-state-card" style={{ padding: '3rem', textAlign: 'center' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>📊</div>
          <h3>Nenhuma Tarefa Concluída no Período</h3>
          <p style={{ maxWidth: '500px', margin: '0 auto 1.5rem', color: 'var(--color-text-secondary)' }}>
            Para visualizar o Throughput Histogram e a Linha do Tempo diária, complete tarefas no seu quadro Kanban. 
            O gráfico calculará automaticamente a frequência de entregas e os percentis estatísticos de capacidade.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="throughput-analytics-view" data-testid="throughput-analytics-view">
      {/* Barra de Controles e Seletor de Janela Temporal */}
      <div className="throughput-controls-bar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h3 style={{ margin: '0 0 0.25rem 0', fontSize: '1.25rem', fontWeight: 600 }}>
            Throughput — Acelere o desempenho da sua equipe
          </h3>
          <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
            Distribuição de frequência empírica diária e estabilidade cronológica de fluxo
          </p>
        </div>

        <div className="time-window-selector" style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginRight: '0.25rem' }}>Período:</span>
          {([
            { label: '14D', value: 14 },
            { label: '30D', value: 30 },
            { label: '60D', value: 60 },
            { label: '90D', value: 90 },
            { label: 'Tudo', value: 0 },
          ] as const).map((opt) => (
            <button
              key={opt.label}
              type="button"
              className={`btn-time-window ${timeWindow === opt.value ? 'active' : ''}`}
              onClick={() => setTimeWindow(opt.value)}
              style={{
                padding: '4px 10px',
                fontSize: '0.8rem',
                borderRadius: '6px',
                border: '1px solid var(--color-border)',
                background: timeWindow === opt.value ? '#0284c7' : 'var(--color-surface)',
                color: timeWindow === opt.value ? '#ffffff' : 'var(--color-text)',
                cursor: 'pointer',
                fontWeight: timeWindow === opt.value ? 600 : 400,
                transition: 'all 0.15s ease',
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Cartões de Resumo Estatístico Executivo */}
      <div
        className="throughput-summary-cards"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
          gap: '0.75rem',
          marginBottom: '1.5rem',
        }}
      >
        <div className="summary-metric-card" style={{ background: 'var(--color-surface)', padding: '0.85rem', borderRadius: '8px', border: '1px solid var(--color-border)' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Concluído</div>
          <div style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--color-text)', marginTop: '0.25rem' }}>{summary.totalCompleted}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', marginTop: '0.2rem' }}>em {summary.totalDays} dias</div>
        </div>

        <div className="summary-metric-card" style={{ background: 'var(--color-surface)', padding: '0.85rem', borderRadius: '8px', border: '1px solid var(--color-border)' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Média Diária</div>
          <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#0284c7', marginTop: '0.25rem' }}>{summary.averagePerDay}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', marginTop: '0.2rem' }}>itens / dia</div>
        </div>

        <div className="summary-metric-card" style={{ background: 'var(--color-surface)', padding: '0.85rem', borderRadius: '8px', border: '1px solid var(--color-border)' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>50% (Mediana)</div>
          <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#3b82f6', marginTop: '0.25rem' }}>{summary.p50}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', marginTop: '0.2rem' }}>itens ou mais/dia</div>
        </div>

        <div className="summary-metric-card" style={{ background: 'var(--color-surface)', padding: '0.85rem', borderRadius: '8px', border: '1px solid var(--color-border)' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>70%</div>
          <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#06b6d4', marginTop: '0.25rem' }}>{summary.p70}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', marginTop: '0.2rem' }}>itens ou mais/dia</div>
        </div>

        <div className="summary-metric-card" style={{ background: 'var(--color-surface)', padding: '0.85rem', borderRadius: '8px', border: '1px solid var(--color-border)' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>85% (SLE)</div>
          <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#eab308', marginTop: '0.25rem' }}>{summary.p85}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', marginTop: '0.2rem' }}>capacidade acordada</div>
        </div>

        <div className="summary-metric-card" style={{ background: 'var(--color-surface)', padding: '0.85rem', borderRadius: '8px', border: '1px solid var(--color-border)' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>95% (Certeza)</div>
          <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#ef4444', marginTop: '0.25rem' }}>{summary.p95}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', marginTop: '0.2rem' }}>conservador</div>
        </div>

        <div className="summary-metric-card" style={{ background: 'var(--color-surface)', padding: '0.85rem', borderRadius: '8px', border: '1px solid var(--color-border)' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Moda Diária</div>
          <div style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--color-text)', marginTop: '0.25rem' }}>{summary.mode}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', marginTop: '0.2rem' }}>frequência mais comum</div>
        </div>
      </div>

      {/* Composição Gráfica Conjunta Vertical (Inspirada na Imagem de Referência) */}
      <div
        className="throughput-charts-canvas"
        style={{
          background: 'var(--color-surface)',
          padding: '1.5rem',
          borderRadius: '12px',
          border: '1px solid var(--color-border)',
          boxShadow: '0 4px 16px rgba(0,0,0,0.05)',
        }}
      >
        {/* Histograma Superior com Percentis */}
        <ThroughputHistogramChart
          bins={bins}
          maxFrequency={maxFrequency}
          percentiles={{
            p50: summary.p50,
            p70: summary.p70,
            p85: summary.p85,
            p95: summary.p95,
          }}
          height={300}
        />

        {/* Linha Divisória Sutil */}
        <div style={{ margin: '1.5rem 0 0.5rem 0', borderBottom: '1px solid var(--color-border)', opacity: 0.6 }} />

        {/* Linha do Tempo Inferior (Run Chart) */}
        <ThroughputRunChart
          data={dailySeries}
          maxDailyThroughput={maxDailyThroughput}
          height={150}
        />
      </div>
    </div>
  );
};
