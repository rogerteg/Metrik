import React from 'react';
import { TaskModel } from '../types/kanban';
import { BlockerDynamicsSummary, BlockerViewMode } from '../types/analytics';
import { formatDuration } from '../utils/timeFormatters';

export interface BlockerAnalyticsViewProps {
  tasks: TaskModel[];
  summary: BlockerDynamicsSummary;
  mode: BlockerViewMode;
  onSelectMode: (mode: BlockerViewMode) => void;
}

export const BlockerAnalyticsView: React.FC<BlockerAnalyticsViewProps> = ({
  tasks,
  summary,
  mode,
  onSelectMode,
}) => {
  // Filtrar tarefas que têm histórico de bloqueio
  const blockedTasksList = tasks.filter(
    (t) => t.blocked || (t.totalBlockedMs && t.totalBlockedMs > 0) || Boolean(t.blockedReason)
  );

  return (
    <div className="blocker-analytics-view" data-testid="focused-blockers-view">
      {/* Barra de controle de visualização interna */}
      <div className="blocker-view-controls">
        <div className="blocker-mode-toggle-group">
          <button
            type="button"
            className={`blocker-mode-toggle-btn ${mode === 'clustering' ? 'is-active' : ''}`}
            onClick={() => onSelectMode('clustering')}
          >
            📊 Blocker Clustering
          </button>
          <button
            type="button"
            className={`blocker-mode-toggle-btn ${mode === 'dynamics' ? 'is-active' : ''}`}
            onClick={() => onSelectMode('dynamics')}
          >
            ⏱️ Blocker Dynamics
          </button>
        </div>
      </div>

      {/* MODO 1: CLUSTERING */}
      {mode === 'clustering' && (
        <div className="blocker-clustering-section">
          <div className="blocker-section-header">
            <h2 className="blocker-section-title">Blocker Clustering (Causas de Impedimento)</h2>
            <p className="blocker-section-subtitle">
              Agrupamento de ocorrências por causa raiz para identificação de gargalos sistêmicos recorrentes.
            </p>
          </div>

          {summary.clusters.length === 0 ? (
            <div className="blocker-empty-state">
              Nenhum impedimento registrado no período analisado. Fluxo operando sem bloqueios!
            </div>
          ) : (
            <div className="blocker-clusters-list">
              {summary.clusters.map((cluster) => (
                <div key={cluster.reason} className="blocker-cluster-card">
                  <div className="cluster-card-header">
                    <div className="cluster-reason-name">{cluster.reason}</div>
                    <div className="cluster-percentage-badge">{cluster.percentage}%</div>
                  </div>

                  <div className="cluster-progress-bar-bg">
                    <div
                      className="cluster-progress-bar-fill"
                      style={{ width: `${Math.max(cluster.percentage, 4)}%` }}
                    />
                  </div>

                  <div className="cluster-stats-row">
                    <span>
                      <strong>{cluster.occurrenceCount}</strong> ocorrência(s)
                    </span>
                    <span>•</span>
                    <span>
                      Tempo médio: <strong>{cluster.avgDurationDays}d</strong> por bloqueio
                    </span>
                    <span>•</span>
                    <span>
                      Duração acumulada: <strong>{formatDuration(cluster.totalDurationMs)}</strong>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* MODO 2: DYNAMICS */}
      {mode === 'dynamics' && (
        <div className="blocker-dynamics-section">
          <div className="blocker-section-header">
            <h2 className="blocker-section-title">Blocker Dynamics (Retenção Temporal)</h2>
            <p className="blocker-section-subtitle">
              Mensuração da retenção de fluxo e perda percentual de eficiência no Lead Time total.
            </p>
          </div>

          {/* Cards de Métricas Dinâmicas */}
          <div className="blocker-dynamics-kpis">
            <div className="dynamics-kpi-card">
              <div className="dynamics-kpi-label">Tarefas com Bloqueio</div>
              <div className="dynamics-kpi-value" data-testid="metric-total-blocked">
                {summary.totalBlockedTasks}
              </div>
              <div className="dynamics-kpi-subtext">Itens que sofreram estagnação</div>
            </div>

            <div className="dynamics-kpi-card">
              <div className="dynamics-kpi-label">Tempo Total Bloqueado</div>
              <div className="dynamics-kpi-value">
                {formatDuration(summary.accumulatedBlockedMs)}
              </div>
              <div className="dynamics-kpi-subtext">Soma das retenções no quadro</div>
            </div>

            <div className="dynamics-kpi-card">
              <div className="dynamics-kpi-label">Impacto no Lead Time</div>
              <div
                className={`dynamics-kpi-value ${summary.impactOnLeadTimePercentage > 25 ? 'text-danger' : 'text-warning'}`}
                data-testid="metric-impact-percentage"
              >
                {summary.impactOnLeadTimePercentage}%
              </div>
              <div className="dynamics-kpi-subtext">Fração do Lead Time gasta em espera</div>
            </div>
          </div>

          {/* Tabela de Tarefas com Histórico de Bloqueio */}
          <div className="blocker-tasks-table-card">
            <h3 className="blocker-table-title">Histórico Detalhado de Tarefas Bloqueadas</h3>
            {blockedTasksList.length === 0 ? (
              <div className="blocker-empty-state">
                Nenhum cartão com histórico de bloqueio encontrado.
              </div>
            ) : (
              <div className="blocker-table-wrapper">
                <table className="blocker-table">
                  <thead>
                    <tr>
                      <th>Tarefa</th>
                      <th>Status Atual</th>
                      <th>Causa do Impedimento</th>
                      <th>Tempo Retido</th>
                    </tr>
                  </thead>
                  <tbody>
                    {blockedTasksList.map((task) => (
                      <tr key={task.id}>
                        <td className="task-title-cell">{task.title}</td>
                        <td>
                          <span className={`blocker-pill ${task.blocked ? 'is-active-blocked' : 'is-resolved'}`}>
                            {task.blocked ? '🚫 Bloqueado Agora' : '✓ Resolvido'}
                          </span>
                        </td>
                        <td className="task-reason-cell">
                          {task.blockedReason || 'Motivo não especificado'}
                        </td>
                        <td className="task-duration-cell">
                          {formatDuration(task.totalBlockedMs || 0)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
