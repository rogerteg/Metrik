import React, { useState, useMemo } from 'react';
import { TaskModel } from '../types/kanban';
import {
  extractDailyThroughput,
  runMonteCarloHowMany,
  runMonteCarloWhen,
} from '../utils/monteCarlo';
import { MonteCarloHistogramChart } from './charts/MonteCarloHistogramChart';

export type MonteCarloMode = 'how-many' | 'when';

export interface MonteCarloSimulationViewProps {
  tasks: TaskModel[];
  initialBacklogCount?: number;
}

export const MonteCarloSimulationView: React.FC<MonteCarloSimulationViewProps> = ({
  tasks,
  initialBacklogCount,
}) => {
  const [mode, setMode] = useState<MonteCarloMode>('how-many');
  
  // Parâmetros de Simulação
  const [historyDays, setHistoryDays] = useState<number>(30); // 30, 60, 90 ou 0 (tudo)
  const [trials, setTrials] = useState<number>(10000);

  // Parâmetros How Many
  const [targetDays, setTargetDays] = useState<number>(30);

  // Contagem de itens abertos no board atual (não concluídos)
  const openTasksCount = useMemo(() => {
    return tasks.filter((t) => t.column !== 'done' && !t.completedAt).length;
  }, [tasks]);

  // Parâmetros When
  const [itemCount, setItemCount] = useState<number>(
    initialBacklogCount ?? (openTasksCount > 0 ? openTasksCount : 15)
  );

  // Extrair amostras de Throughput diário com base no filtro de histórico selecionado
  const throughputHistory = useMemo(() => {
    const samples = extractDailyThroughput(tasks, historyDays);
    return samples.map((s) => s.count);
  }, [tasks, historyDays]);

  const totalDelivered = useMemo(() => {
    return throughputHistory.reduce((acc, curr) => acc + curr, 0);
  }, [throughputHistory]);

  // Executar simulação How Many
  const howManyResult = useMemo(() => {
    if (throughputHistory.length === 0 || totalDelivered === 0) return null;
    return runMonteCarloHowMany(throughputHistory, targetDays, trials);
  }, [throughputHistory, totalDelivered, targetDays, trials]);

  // Executar simulação When
  const whenResult = useMemo(() => {
    if (throughputHistory.length === 0 || totalDelivered === 0) return null;
    return runMonteCarloWhen(throughputHistory, itemCount, new Date(), trials);
  }, [throughputHistory, totalDelivered, itemCount, trials]);

  // Estado Vazio / Instrutivo se não houver histórico suficiente
  const isHistoryInsufficient = throughputHistory.length < 5 || totalDelivered === 0;

  return (
    <div className="monte-carlo-simulation-view" data-testid="monte-carlo-simulation-view">
      {/* Cabeçalho com Seletor de Modo */}
      <div className="monte-carlo-header-bar">
        <div className="monte-carlo-title-group">
          <h3 className="monte-carlo-main-title">
            <span className="monte-carlo-icon">🎲</span> Previsões de Fluxo com Simulação de Monte Carlo
          </h3>
          <p className="monte-carlo-subtitle">
            Previsões probabilísticas calibradas por re-amostragem empírica de Throughput (Daniel Vacanti / Padrão NIST).
          </p>
        </div>

        <div className="monte-carlo-mode-toggle" role="tablist">
          <button
            type="button"
            className={`mode-toggle-btn ${mode === 'how-many' ? 'is-active' : ''}`}
            onClick={() => setMode('how-many')}
            role="tab"
            aria-selected={mode === 'how-many'}
            data-testid="mode-how-many-btn"
          >
            🎯 Quantos Itens? (How Many)
          </button>
          <button
            type="button"
            className={`mode-toggle-btn ${mode === 'when' ? 'is-active' : ''}`}
            onClick={() => setMode('when')}
            role="tab"
            aria-selected={mode === 'when'}
            data-testid="mode-when-btn"
          >
            📅 Quando Entregaremos? (When)
          </button>
        </div>
      </div>

      {isHistoryInsufficient ? (
        <div className="monte-carlo-guidance-card" data-testid="monte-carlo-guidance">
          <div className="guidance-icon">💡</div>
          <div className="guidance-content">
            <h4>Histórico de Throughput Insuficiente</h4>
            <p>
              A Simulação de Monte Carlo requer tarefas concluídas registradas no board para extrair o ritmo real de entregas diárias.
            </p>
            <ul>
              <li>Mova cartões para a coluna <strong>Concluído</strong> para alimentar o histórico.</li>
              <li>Dias sem entrega são contabilizados como 0 para garantir previsões sem viés de superestimação.</li>
            </ul>
          </div>
        </div>
      ) : (
        <>
          {/* Barra de Controles e Parâmetros */}
          <div className="monte-carlo-controls-panel">
            <div className="controls-row">
              {mode === 'how-many' ? (
                <div className="control-field">
                  <label htmlFor="target-days-input" className="control-label">
                    Prazo Alvo (Dias Corridos):
                  </label>
                  <div className="input-with-addons">
                    <input
                      id="target-days-input"
                      type="number"
                      min={1}
                      max={365}
                      value={targetDays}
                      onChange={(e) => setTargetDays(Math.max(1, parseInt(e.target.value) || 1))}
                      className="form-control-input"
                      data-testid="target-days-input"
                    />
                    <span className="input-addon">dias</span>
                  </div>
                  <div className="quick-presets">
                    <button type="button" onClick={() => setTargetDays(14)}>2 semanas</button>
                    <button type="button" onClick={() => setTargetDays(30)}>1 mês</button>
                    <button type="button" onClick={() => setTargetDays(90)}>1 trimestre</button>
                  </div>
                </div>
              ) : (
                <div className="control-field">
                  <label htmlFor="item-count-input" className="control-label">
                    Quantidade de Itens no Escopo:
                  </label>
                  <div className="input-with-addons">
                    <input
                      id="item-count-input"
                      type="number"
                      min={1}
                      max={1000}
                      value={itemCount}
                      onChange={(e) => setItemCount(Math.max(1, parseInt(e.target.value) || 1))}
                      className="form-control-input"
                      data-testid="item-count-input"
                    />
                    <span className="input-addon">itens</span>
                  </div>
                  {openTasksCount > 0 && (
                    <button
                      type="button"
                      className="quick-fill-btn"
                      onClick={() => setItemCount(openTasksCount)}
                      data-testid="use-open-tasks-btn"
                    >
                      Usar backlog ativo ({openTasksCount} itens em aberto)
                    </button>
                  )}
                </div>
              )}

              {/* Configurações de Amostragem */}
              <div className="control-field">
                <label htmlFor="history-days-select" className="control-label">
                  Janela Histórica de Amostragem:
                </label>
                <select
                  id="history-days-select"
                  value={historyDays}
                  onChange={(e) => setHistoryDays(parseInt(e.target.value))}
                  className="form-control-select"
                  data-testid="history-days-select"
                >
                  <option value={14}>Últimos 14 dias</option>
                  <option value={30}>Últimos 30 dias (Recomendado)</option>
                  <option value={60}>Últimos 60 dias</option>
                  <option value={90}>Últimos 90 dias</option>
                  <option value={0}>Todo o Histórico</option>
                </select>
              </div>

              <div className="control-field">
                <label htmlFor="trials-select" className="control-label">
                  Ensaios Simulados:
                </label>
                <select
                  id="trials-select"
                  value={trials}
                  onChange={(e) => setTrials(parseInt(e.target.value))}
                  className="form-control-select"
                  data-testid="trials-select"
                >
                  <option value={1000}>1.000 ensaios</option>
                  <option value={5000}>5.000 ensaios</option>
                  <option value={10000}>10.000 ensaios (Padrão)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Cards de Resumo dos Percentis de Confiança */}
          {mode === 'how-many' && howManyResult && (
            <div className="monte-carlo-cards-grid" data-testid="how-many-cards">
              <div className="percentile-summary-card card-p50">
                <div className="card-badge">Otimista (Mediana)</div>
                <div className="card-percentile">50% de Certeza</div>
                <div className="card-metric-value">
                  {howManyResult.p50} <span className="metric-unit">itens</span>
                </div>
                <div className="card-description">
                  Em metade dos cenários simulados, pelo menos este volume de tarefas foi entregue.
                </div>
              </div>

              <div className="percentile-summary-card card-p85 is-recommended">
                <div className="card-badge recommended-badge">SLE Recomendado</div>
                <div className="card-percentile">85% de Certeza</div>
                <div className="card-metric-value">
                  {howManyResult.p85} <span className="metric-unit">itens</span>
                </div>
                <div className="card-description">
                  Compromisso com risco equilibrado para metas de release e fechamento de quarter.
                </div>
              </div>

              <div className="percentile-summary-card card-p95">
                <div className="card-badge">Alta Segurança</div>
                <div className="card-percentile">95% de Certeza</div>
                <div className="card-metric-value">
                  {howManyResult.p95} <span className="metric-unit">itens</span>
                </div>
                <div className="card-description">
                  Quase certeza estatística. Adequado para compromissos contratuais rígidos.
                </div>
              </div>
            </div>
          )}

          {mode === 'when' && whenResult && (
            <div className="monte-carlo-cards-grid" data-testid="when-cards">
              <div className="percentile-summary-card card-p50">
                <div className="card-badge">Otimista (Mediana)</div>
                <div className="card-percentile">50% de Certeza</div>
                <div className="card-metric-value">
                  {whenResult.p50.days} <span className="metric-unit">dias</span>
                </div>
                <div className="card-projected-date">📅 {whenResult.p50.projectedDate}</div>
                <div className="card-description">
                  Data estimada na mediana dos ensaios. 50% de chance de concluir antes.
                </div>
              </div>

              <div className="percentile-summary-card card-p85 is-recommended">
                <div className="card-badge recommended-badge">SLE Recomendado</div>
                <div className="card-percentile">85% de Certeza</div>
                <div className="card-metric-value">
                  {whenResult.p85.days} <span className="metric-unit">dias</span>
                </div>
                <div className="card-projected-date">📅 {whenResult.p85.projectedDate}</div>
                <div className="card-description">
                  Prazo recomendado para acordos e estimativas com stakeholders.
                </div>
              </div>

              <div className="percentile-summary-card card-p95">
                <div className="card-badge">Alta Segurança</div>
                <div className="card-percentile">95% de Certeza</div>
                <div className="card-metric-value">
                  {whenResult.p95.days} <span className="metric-unit">dias</span>
                </div>
                <div className="card-projected-date">📅 {whenResult.p95.projectedDate}</div>
                <div className="card-description">
                  Data limite de alta confiança, absorvendo variações da cauda longa de fluxo.
                </div>
              </div>
            </div>
          )}

          {/* Gráfico do Histograma e Curva Cumulativa */}
          <div className="monte-carlo-chart-section">
            {mode === 'how-many' && howManyResult && (
              <MonteCarloHistogramChart
                bins={howManyResult.histogram}
                p50Value={howManyResult.p50}
                p85Value={howManyResult.p85}
                p95Value={howManyResult.p95}
                unitLabel="itens"
                title={`Distribuição de Itens Entregues em ${targetDays} dias (${trials.toLocaleString()} ensaios)`}
                isAscending={false}
              />
            )}

            {mode === 'when' && whenResult && (
              <MonteCarloHistogramChart
                bins={whenResult.histogram}
                p50Value={whenResult.p50.days}
                p85Value={whenResult.p85.days}
                p95Value={whenResult.p95.days}
                unitLabel="dias"
                title={`Distribuição de Dias para Concluir ${itemCount} itens (${trials.toLocaleString()} ensaios)`}
                isAscending={true}
              />
            )}
          </div>
        </>
      )}
    </div>
  );
};
